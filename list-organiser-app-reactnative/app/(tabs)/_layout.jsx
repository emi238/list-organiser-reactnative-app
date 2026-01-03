import { Feather } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Tabs } from 'expo-router';

/**
 * Tab layout component - Main bottom navigation configuration for the application
 * This component defines the bottom tab navigator structure with three main sections:
 * Home, My Forms, and About. It configures tab icons, labels, styling, and integrates
 * with the drawer navigation through a toggle button in the header.
 * 
 * @component
 * @returns {Tabs} Configured bottom tab navigator with three main application sections
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerLeft: () => <DrawerToggleButton tintColor="#9395D3" />,
        tabBarStyle: {
          backgroundColor: '#FBF9FF',
          borderTopColor: '#D1D5DB',
          padding: 0,
          bottom: 0,
        },
        tabBarItemStyle: {
          alignItems: 'center',
        },
        tabBarActiveTintColor: '#9395D3',
        tabBarInactiveTintColor: '#868CA2',
        tabBarLabelStyle: {
          fontFamily: 'DMSans-Regular',
          fontSize: 13,
        },
        headerStyle: {
          backgroundColor: '#FBF9FF',
        },
        headerTitleStyle: {
          fontFamily: 'DMSerifDisplay-Regular',
          fontSize: 25,
          color: '#000000',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Feather
              name="home"
              size={24}
              color={focused ? '#9395D3' : '#868CA2'}
            />
          ),
          tabBarLabel: 'Home',
          headerTitle: 'FormBase',
        }}
      />

      <Tabs.Screen
        name="myForm"
        options={{
          tabBarIcon: ({ focused }) => (
            <Feather
              name="file-text"
              size={24}
              color={focused ? '#9395D3' : '#868CA2'}
            />
          ),
          tabBarLabel: 'My Forms',
          headerTitle: 'FormBase',
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          tabBarIcon: ({ focused }) => (
            <Feather
              name="info"
              size={24}
              color={focused ? '#9395D3' : '#868CA2'}
            />
          ),
          tabBarLabel: 'About',
          headerTitle: 'About',
        }}
      />
    </Tabs>
  );
}
