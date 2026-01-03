import { Stack } from "expo-router";
/**
 * My forms layout component - Stack navigator configuration for form management flows
 * This component defines the nested navigation structure for all form-related screens
 * including form listing, creation, editing, field management, and record entry.
 * 
 * @component
 * @returns {Stack} Configured stack navigator for form management navigation hierarchy
 */
export default function MyFormLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FBF9FF" },
        headerTitleStyle: {
          fontFamily: "DMSerifDisplay-Regular",
          fontSize: 25,
          color: "#000000",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "My Forms",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="form"
        options={{
          headerTitle: "Create Form",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="[formId]"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="edit/[id]"
        options={{
          headerTitle: "Edit Form",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="field/[id]"
        options={{
          headerTitle: "Add Field",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="record/[id]"
        options={{
          headerTitle: "Add Record",
          headerShown: false,
        }}
      />
    </Stack>
  );
}