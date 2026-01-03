import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { DMSerifDisplay_400Regular, DMSerifDisplay_400Regular_Italic } from '@expo-google-fonts/dm-serif-display';
import { Feather } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useFonts } from 'expo-font';
import { router, SplashScreen, usePathname } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Text, View } from "react-native";

// SIDE HAMBURGER NAVIGATION

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Custom drawer content component that renders the navigation menu
 * This component provides a customized drawer with styled navigation items,
 * active state indicators, and proper font handling for the app navigation.
 * 
 * @param {Object} props - React Navigation drawer props
 * @returns {JSX.Element} Custom styled drawer navigation interface
 */
const CustomDrawerContent = (props) => {
  const pathname = usePathname();

  const getDrawerItemStyle = (isActive) => ({
    backgroundColor: isActive ? "#9395D3" : "#FFFFFF",
    marginHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: "#000000",
  });

  const getLabelStyle = (isActive) => ({
    marginLeft: 10,
    fontSize: 16,
    fontFamily: isActive ? "DMSans-Bold" : "DMSans-Medium",
    color: isActive ? "#FFFFFF" : "#000000",
  });

  const getIconColor = (isActive) => (isActive ? "#FFFFFF" : "#000000");

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Header */}
      <View className="px-6 py-8 border-b ">
        <View className="flex justify-center">
          <Text className="text-4xl font-dmserif text-black mb-1">
            FormBase
          </Text>
          <Text className=" text-text-lilac text-xl font-dmsans">
            Form Management App
          </Text>
        </View>
      </View>

      {/* Drawer Items */}
      <View className="pt-4 bg-[#FBF9FF] flex-1">
        <DrawerItem
          icon={({ size }) => (
            <Feather
              name="home"
              size={size}
              color={getIconColor(pathname === "/(tabs)")}
            />
          )}
          label="Home"
          labelStyle={getLabelStyle(pathname === "/(tabs)")}
          style={getDrawerItemStyle(pathname === "/(tabs)")}
          onPress={() => router.push("/(tabs)")}
        />

        <DrawerItem
          icon={({ size }) => (
            <Feather
              name="file-text"
              size={size}
              color={getIconColor(pathname === "/(tabs)/myForm")}
            />
          )}
          label="My Forms"
          labelStyle={getLabelStyle(pathname === "/(tabs)/myForm")}
          style={getDrawerItemStyle(pathname === "/(tabs)/myForm")}
          onPress={() => router.push("/(tabs)/myForm")}
        />

        <DrawerItem
          icon={({ size }) => (
            <Feather
              name="info"
              size={size}
              color={getIconColor(pathname === "/(tabs)/about")}
            />
          )}
          label="About"
          labelStyle={getLabelStyle(pathname === "/(tabs)/about")}
          style={getDrawerItemStyle(pathname === "/(tabs)/about")}
          onPress={() => router.push("/(tabs)/about")}
        />
      </View>
    </DrawerContentScrollView>
  );
};

/**
 * Root layout component that sets up the application structure
 * This component handles font loading, splash screen management, and
 * configures the main drawer navigation for the entire application.
 * 
 * @component
 * @returns {JSX.Element} Main application layout with drawer navigation
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // DM Sans
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
    
    // DM Serif Display
    'DMSerifDisplay-Regular': DMSerifDisplay_400Regular,
    'DMSerifDisplay-Italic': DMSerifDisplay_400Regular_Italic,
  });

  // Wait for fonts to load before showing the app
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Hide splash screen when fonts are loaded
  if (fontsLoaded) {
    SplashScreen.hideAsync();
  }

  return (
    <Drawer 
      drawerContent={(props) => <CustomDrawerContent {...props} />} 
      screenOptions={{ 
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#FBF9FF',
          width: 300,
        },
      }}
    >
      <Drawer.Screen 
        name="index" 
        options={{ 
          drawerItemStyle: { 
            display: 'none',
          }
        }} 
      />
      
      <Drawer.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          drawerItemStyle: { display: 'none' }
        }} 
      />
    </Drawer>
  );
}

