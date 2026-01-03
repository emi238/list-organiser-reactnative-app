import { Redirect } from 'expo-router';
import "./global.css";

/**
 * Root index component that handles initial app routing
 * Entry point of the application and automatically redirects users to the main tabs interface on app launch.
 * 
 * @component
 * @returns {Redirect} Redirects to the main tabs navigation interface
 */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}