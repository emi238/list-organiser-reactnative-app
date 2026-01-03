import { Feather } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams } from "expo-router";

/**
 * Form tabs layout component 
 * This layout provides a navigation structure that allows users to switch between
 * different perspectives of a single form without losing context. It maintains the form ID state 
 * across multiple related screens.
 * 
 * @component
 * @returns {Tabs} Specialized tab navigator for multi-perspective form management
 */
export default function FormTabsLayout() {
  const params = useLocalSearchParams();
  const formId = params.formId;

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FBF9FF",
        },
        headerTitleStyle: {
          fontFamily: "DMSans-Bold",
          fontSize: 18,
          color: "#000000",
        },
        tabBarStyle: {
          backgroundColor: "#9fa1d3ff", 
          borderTopColor: "#9395D3",
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#E6E4FA",
        tabBarLabelStyle: {
          fontFamily: "DMSans-Medium",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Form",
          tabBarIcon: ({ focused }) => (
            <Feather
              name="file-text"
              size={20}
              color={focused ? "#FFFFFF" : "#E6E4FA"}
            />
          ),
          headerTitle: "View Form",
          headerShown: false,

        }}
        initialParams={{ formId }} 
      />

      <Tabs.Screen
        name="records"
        options={{
          title: "Records",
          tabBarIcon: ({ focused }) => (
            <Feather
              name="database"
              size={20}
              color={focused ? "#FFFFFF" : "#E6E4FA"}
            />
          ),
          headerTitle: "Records",
          headerShown: false,
        }}
        initialParams={{ formId }} 
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ focused }) => (
            <Feather
              name="map"
              size={20}
              color={focused ? "#FFFFFF" : "#E6E4FA"}
            />
          ),
          headerTitle: "Map View",
          headerShown: false,

        }}
        initialParams={{ formId }} 
      />
    </Tabs>
  );
}