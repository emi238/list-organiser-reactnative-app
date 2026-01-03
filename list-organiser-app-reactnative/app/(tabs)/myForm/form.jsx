import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createForm } from "../../../services/app";

/**
 * Create form screen component 
 * This screen provides a simple form interface for users to create new form templates
 * by entering a name and description. It handles form validation, submission to the API.
 * 
 * @component
 * @returns {JSX.Element} Form creation interface with input fields and action buttons
 */
export default function CreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Handles form submission and validation
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter a name for your form.");
      return;
    }

    try {
      setLoading(true);

      // Pass the required object
      await createForm({
        name: name.trim(),
        description: description.trim(),
      });

      Alert.alert("Success", "Form saved successfully!");
      router.replace("/(tabs)/myForm");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to save form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background-base p-6">
      <Text className="text-3xl font-dmserif text-center mb-6 text-text-navy">
        Create New Form
      </Text>

      <TextInput
        placeholder="Form Name"
        value={name}
        onChangeText={setName}
        className="bg-white border border-text-tertiary rounded-lg p-3 mb-4"
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        className="bg-white border border-text-tertiary rounded-lg p-3 mb-4 h-32"
      />

      <TouchableOpacity
        disabled={loading}
        className={`py-3 border border-text-navy rounded-lg items-center mt-4 ${
          loading ? "bg-text-lilac/60" : "bg-text-lilac"
        }`}
        onPress={handleSave}
      >
        <Text className="text-white text-lg font-dmsans-medium">
          {loading ? "Saving..." : "Save Form"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="py-3 rounded-lg items-center mt-3"
        onPress={() => router.back()}
      >
        <Text className="text-text-lilac text-lg font-dmsans-medium">
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}