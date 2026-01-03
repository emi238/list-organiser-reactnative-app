import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

/**
 * Welcome card component - Main greeting and action interface for the application
 * This component displays a prominent welcome message with a call-to-action button
 * that allows users to navigate directly to form creation. It features layered
 * card design with visual hierarchy and brand-consistent styling.
 * 
 * @component
 * @returns {JSX.Element} Multi-layered welcome card with title, description, icon, and action button
 */
export default function WelcomeCard() {

  const router = useRouter();

  // To form screen 
  const handleCreateForm = () => {
    router.push("/(tabs)/myForm"); 
  }

 return (
    <View className="bg-background-tertiary rounded-2xl mx-6 my-6 p-4 shadow-md">
      {/* Outer Layer */}
      <View className="bg-background-cardBg rounded-2xl p-6 items-center">
        {/* Title */}
        <Text className="text-text-navy text-3xl font-dmserif text-center mb-3">
          Welcome to FormBase!
        </Text>

        {/* Description */}
        <Text className="text-text-navy font-dmsans text-xl text-center mb-10 px-3 leading-6">
          Start tracking your important tasks with FormBase
        </Text>

        {/* Inner Layer */}
        <View className="bg-white rounded-2xl p-6 shadow-sm items-center">
          {/* Feather icon */}
          <Feather name="file-text" size={95} color="#959CB7" />

          {/* Button */}
          <TouchableOpacity
            className="bg-background-base rounded-lg px-10 py-3 mt-8 shadow-sm"
            onPress={handleCreateForm}
          >
            <Text className="text-text-navy text-xl font-dmsans-medium">
              Create New Form
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}