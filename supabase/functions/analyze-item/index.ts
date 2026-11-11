import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI, SchemaType } from "https://esm.sh/@google/generative-ai@0.21.0";

const ITEM_CATEGORIES = [
  "Water Bottle",
  "Charger",
  "Electronic Device",
  "Miscellaneous",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let { imageBase64, mimeType = "image/jpeg" } = await req.json();
    
    // Safety: Remove base64 prefix if present
    if (imageBase64.includes(";base64,")) {
      imageBase64 = imageBase64.split(";base64,").pop();
    }
    
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    console.log("Found: analyze-item API Key present:", !!apiKey);

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in Supabase Secrets");
    }

    // Using stable ESM import for Deno compatibility
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            category: {
              type: SchemaType.STRING,
              description: "The primary category of the lost item.",
              enum: ITEM_CATEGORIES,
            },
            description: {
              type: SchemaType.STRING,
              description: "A sentence to help the owner recognize the item, max 15 words. Describe specific small details.",
            },
          },
          required: ["category", "description"],
        },
      }
    });

    console.log("Found: Calling Gemini 3.8 Flash for image analysis...");
    const result = await model.generateContent([
      { inlineData: { mimeType, data: imageBase64 } },
      { text: "Identify the lost item from this photo. Provide a description focused entirely on the item itself, ignoring background or irrelevant elements." }
    ]);

    const response = await result.response;
    const text = response.text();
    console.log("Found: Gemini raw text response:", text);
    
    let data;
    try {
      data = JSON.parse(text || "{}");
    } catch (parseError) {
      console.error("Found: Failed to parse Gemini response as JSON. Raw text:", text);
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          console.log("Found: Successfully extracted JSON after parse error");
        } catch (e) {
          throw new Error("Could not parse AI response");
        }
      } else {
        throw new Error("AI returned invalid format");
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in analyze-item function:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});