import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        title: "Found",
        headerTransparent: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Michigan Found",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="client"
        options={{
          title: "Report Lost Item",
          headerShown: true,
          headerTransparent: false,
          headerBackTitle: "Michigan Found",
        }}
      />
    </Stack>
  );
}