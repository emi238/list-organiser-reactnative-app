import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getFieldsByFormId, getFormById, updateForm } from '../../../../services/app';

/**
 * Edit form screen component
 * Interface for modifying existing form templates
 * 
 * @component
 * @returns {JSX.Element} Form editing interface with input fields and save/cancel actions
 */
export default function EditForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState([]); 

  useEffect(() => {
    if (id) {
      fetchFormData();
    }
  }, [id]);

  // Fetches current form data and fields for editing, loads existing data
  const fetchFormData = async () => {
    try {
      setLoading(true);
      const [formData, formFields] = await Promise.all([
        getFormById(id),
        getFieldsByFormId(id)
      ]);
      
      const currentForm = formData[0];
      setForm(currentForm);
      setFormName(currentForm.name || "");
      setFormDescription(currentForm.description || "");
      setFields(formFields);
    } catch (error) {
      Alert.alert("Error", "Failed to load form details.");
    } finally {
      setLoading(false);
    }
  };

  // Handles form submission with validation and update process
  const handleSaveForm = async () => {
    if (!formName.trim()) {
      Alert.alert("Missing Name", "Please enter a name for your form.");
      return;
    }

    try {
      setSaving(true);
      await updateForm(id, {
        name: formName.trim(),
        description: formDescription.trim(),
      });

      Alert.alert("Success", "Form updated successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update form.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-base justify-center items-center">
        <ActivityIndicator size="large" color="#9395D3" />
        <Text className="text-text-navy mt-4 font-dmsans">Loading form...</Text>
      </View>
    );
  }

  if (!form) {
    return (
      <View className="flex-1 bg-background-base justify-center items-center px-6">
        <Text className="text-text-navy text-xl font-dmserif text-center mb-4">
          Form Not Found
        </Text>
        <TouchableOpacity 
          className="bg-text-lilac px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-dmsans-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-base px-4 py-6">
      {/* Header */}
      <View className="bg-background-tertiary rounded-2xl p-4 mb-4 shadow-md">
        <View className="bg-white border border-background-border rounded-2xl p-4">
          <Text className="text-2xl font-dmserif text-text-navy mb-4 text-center">
            Edit Form
          </Text>

          {/* Form Name */}
          <Text className="text-text-navy font-dmsans-bold mb-2">Form Name</Text>
          <TextInput
            value={formName}
            onChangeText={setFormName}
            className="bg-white border border-text-tertiary rounded-lg p-3 mb-4 font-dmsans"
            placeholder="Enter form name"
          />

          {/* Form Description */}
          <Text className="text-text-navy font-dmsans-bold mb-2">Description</Text>
          <TextInput
            value={formDescription}
            onChangeText={setFormDescription}
            multiline
            className="bg-white border border-text-tertiary rounded-lg p-3 mb-4 h-24 font-dmsans"
            placeholder="Enter form description"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          className="flex-1 bg-white mx-2 py-3 rounded-full items-center border border-text-navy"
          onPress={() => router.back()}
        >
          <Text className="text-text-navy font-dmsans-bold">Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 mx-2 py-3 rounded-full items-center border border-text-navy ${
            saving ? "bg-gray-400" : "bg-text-lilac"
          }`}
          onPress={handleSaveForm}
          disabled={saving}
        >
          <Text className="text-white font-dmsans-bold">
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 