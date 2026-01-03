import { View } from 'react-native';
import AboutCard from "../../components/aboutCard";

/**
 * About screen component - Application information and details page
 * This screen displays information about the FormBase application, including features and tech stack  
 * through a about card component.
 * 
 * @component
 * @returns {JSX.Element} Centered about interface with application information card
 */
export default function AboutScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-background-base">
      <AboutCard />
    </View>
  );
}