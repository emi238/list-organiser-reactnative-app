import { View } from "react-native";
import WelcomeCard from "../../components/welcomeCard";

/**
 * Home screen component - Main landing page of the application
 * This screen serves as the primary entry point for users, displaying a welcome interface
 * that provides introduction, navigation, and overview of the form management application.
 * 
 * @component
 * @returns {JSX.Element} Centered welcome interface with greeting card component
 */
export default function HomeScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-background-base">
      <WelcomeCard />
    </View>
  );
}