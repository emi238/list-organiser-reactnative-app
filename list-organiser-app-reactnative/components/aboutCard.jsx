import { Text, View } from "react-native";

/**
 * About card component
 * This component displays information about the FormBase application,
 * including its key features and technology stack.
 * 
 * @component
 * @returns {JSX.Element} Informational card with application details and features
 */
export default function AboutCard() {
  return (
    <View className="bg-background-tertiary rounded-2xl mx-4 my-6 p-4 shadow-md">
      {/* Outer Layer */}
      <View className="bg-background-cardBg rounded-2xl p-4">
        {/* Title */}
        <Text className="text-text-navy text-3xl font-dmserif text-center mt-2 mb-3">
          About FormBase
        </Text>

        {/* Subtitle */}
        <Text className="text-text-navy text-lg font-dmsans-medium text-center mb-6">
          Build, Collect & Explore!
        </Text>

        {/* Inner Layer */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          {/* Features Section */}
          <View className="border border-background-border rounded-xl p-4 mb-4">
            <Text className="text-text-navy font-dmsans-bold text-lg mb-2">
              Features:
            </Text>
            <View className="ml-3">
              <Text className="text-text-purple font-dmsans mb-1">• Create forms with a variety of fields</Text>
              <Text className="text-text-purple font-dmsans mb-1">• Collect records on your phone</Text>
              <Text className="text-text-purple font-dmsans mb-1">• Search & filter with flexible conditions</Text>
              <Text className="text-text-purple font-dmsans">• Visualise location data on a map</Text>
            </View>
          </View>

          {/* Powered By Section */}
          <View className="border border-background-border rounded-xl p-4">
            <Text className="text-text-navy font-dmsans-bold text-lg mb-2">
              Powered By:
            </Text>
            <View className="ml-3">
              <Text className="text-text-purple font-dmsans mb-1">• Expo + React Native</Text>
              <Text className="text-text-purple font-dmsans mb-1">• PostREST API backend</Text>
              <Text className="text-text-purple font-dmsans mb-1">• React Native Maps & Moti animators</Text>
              <Text className="text-text-purple font-dmsans">• Modern mobile UI design</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
