import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI, SchemaType } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { ticketDescription, potentialMatches } = await req.json();
    console.log("Found: match-items input - ticketDescription:", ticketDescription);
    console.log("Found: match-items input - potentialMatches count:", potentialMatches?.length);
    console.log("Found: match-items input - potentialMatches sample:", JSON.stringify(potentialMatches?.slice(0, 2)));

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    if (!potentialMatches || potentialMatches.length === 0) {
      return new Response(JSON.stringify({ matchingIds: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
            matchingIds: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.NUMBER },
              description: "List of IDs of matching items",
            },
          },
          required: ["matchingIds"],
        },
      }
    });

    const prompt = `
      You are an expert at matching lost items with found items. Your goal is to identify ALL potential matches, even if they are only partially similar.
      
      User's Lost Item Description: "${ticketDescription}"
      
      Potential Found Items:
      ${potentialMatches.map((item: any) => `ID ${item.id}: ${item.description}`).join('\n')}
      
      Task:
      Compare the lost item description against each potential found item. 
      Be VERY LENIENT. You are looking for REASONABLE POSSIBILITIES, not exact matches.
      
      Examples of when to include an ID:
      - Lost: "Blue water bottle" | Found: "Blue Hydroflask" -> MATCH
      - Lost: "iPhone with clear case" | Found: "Smartphone" -> MATCH
      - Lost: "Keys with a red lanyard" | Found: "Set of keys" -> MATCH
      - Lost: "Black backpack" | Found: "Dark colored bag" -> MATCH
      
      It is much better to show the user extra items than to miss a single item that might be theirs.
      Include the ID if the category matches or if the description has any overlapping keywords or themes.
      
      Return the IDs of all likely and possible matches in a JSON object with a "matchingIds" array.
    `;

    console.log("Found: Calling Gemini 3.6 Flash for semantic matching...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Found: Gemini raw text response:", text);
    
    let data;
    try {
      // Clean up the text in case it has markdown blocks
      let cleanText = text;
      if (text.includes("```")) {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) cleanText = match[1];
      }
      data = JSON.parse(cleanText || "{}");
    } catch (parseError) {
      console.error("Found: Failed to parse Gemini response. Text:", text);
      data = { matchingIds: [] };
    }

    console.log("Found: Final matching IDs to return:", JSON.stringify(data.matchingIds || []));

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in match-items function:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});