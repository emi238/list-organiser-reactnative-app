import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { deleteForm, getAllForms } from '../../../services/app';

/**
 * Forms screen component - Main interface for managing and viewing all user forms
 * This screen displays a list of all created forms with options to view, edit, or delete them.
 * 
 * @component
 * @returns {JSX.Element} Forms management interface with list view and action controls
 */
export default function FormsScreen() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchForms();
  }, []);

  // Fetches all forms from the backend service and updates the local state
  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await getAllForms();
      setForms(data);
    } catch (error) {
      console.error("Error fetching forms:", error);
      Alert.alert("Error", "Failed to load forms. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handles manual refreshes of the page
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchForms();
  };

  // Displays confirmation dialog before deleting a form
  const handleDeleteForm = async (formId, formName) => {
    Alert.alert(
      "Delete Form",
      `Are you sure you want to delete "${formName}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => performDelete(formId)
        }
      ]
    );
  };

  // Performs form deletion 
  const performDelete = async (formId) => {
    try {
      setDeletingId(formId);
      await deleteForm(formId);
      
      // Remove the form from local state
      setForms(forms.filter(form => form.id !== formId));
      
      Alert.alert("Success", "Form deleted successfully!");
    } catch (error) {
      console.error("Error deleting form:", error);
      Alert.alert("Error", error.message || "Failed to delete form. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View className="flex-1 bg-background-base px-4 py-6">
      {/* Header with Refresh Button */}
      <View className="flex-row justify-between items-center mb-6">
        {/* Line */}
        <View className="w-10" />
        
        {/* Title */}
        <Text className="text-3xl font-dmserif text-text-navy text-center flex-1">
          My Forms
        </Text>
        
        {/* Refresh Button */}
        <TouchableOpacity 
          onPress={handleRefresh}
          disabled={refreshing}
          className="bg-[#E0E3FA] p-3 rounded-full"
        >
          <Feather 
            name="refresh-cw" 
            size={20} 
            color={refreshing ? "#C3C5F4" : "#6B6ECC"} 
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9395D3" className="mt-10" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Map all forms */}
          {forms.map((form, index) => (
            <View
              key={form.id || index}
              className="bg-background-tertiary rounded-2xl p-4 mb-4 shadow-md"
            >
              <View className="bg-white border border-background-border rounded-2xl p-4">
                {/* Title */}
                <Text className="text-text-navy font-dmsans-bold text-lg mb-2">
                  {form.name || form.title || "Untitled Form"}
                </Text>

                {/* Description */}
                <Text className="text-text-purple font-dmsans mb-4">
                  {form.description || "No description available"}
                </Text>

                {/* Action Buttons */}
                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className="flex-row items-center bg-[#E0E3FA] px-3 py-2 rounded-full"
                    onPress={() => router.push(`/(tabs)/myForm/${form.id}`)}
                  >
                    <Feather name="eye" size={16} color="#6B6ECC" />
                    <Text className="ml-2 text-text-navy font-dmsans">View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center bg-[#D8F5D1] px-3 py-2 rounded-full"
                    onPress={() => router.push(`/(tabs)/myForm/edit/${form.id}`)}
                  >
                    <Feather name="edit" size={16} color="#4E8B36" />
                    <Text className="ml-2 text-text-navy font-dmsans">Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-row items-center px-3 py-2 rounded-full ${
                      deletingId === form.id ? "bg-gray-400" : "bg-[#FADADA]"
                    }`}
                    onPress={() => handleDeleteForm(form.id, form.name || "Untitled Form")}
                    disabled={deletingId === form.id}
                  >
                    {deletingId === form.id ? (
                      <ActivityIndicator size="small" color="#bb3f3f" />
                    ) : (
                      <Feather name="trash-2" size={16} color="#bb3f3f" />
                    )}
                    <Text className="ml-2 text-text-navy font-dmsans">
                      {deletingId === form.id ? "Deleting..." : "Delete"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* Show message when no forms exist */}
          {forms.length === 0 && !loading && (
            <View className="bg-background-tertiary rounded-2xl p-6 items-center mt-4 shadow-md">
              <View className="bg-white border border-background-border rounded-2xl p-6 items-center">
                <Feather name="inbox" size={48} color="#C3C5F4" />
                <Text className="text-text-navy font-dmsans text-lg mb-2 mt-4">
                  No Forms Created Yet
                </Text>
                <Text className="text-text-purple font-dmsans text-center">
                  Create your first form by clicking the "Add Form" button below.
                </Text>
              </View>
            </View>
          )}

          {/* Add Form Button */}
          <TouchableOpacity
            className="bg-text-lilac mt-6 py-2 rounded-2xl items-center border border-text-navy"
            onPress={() => router.push("/(tabs)/myForm/form")}
          >
            <Text className="text-white text-xl font-dmsans-medium">
              + Add Form
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}