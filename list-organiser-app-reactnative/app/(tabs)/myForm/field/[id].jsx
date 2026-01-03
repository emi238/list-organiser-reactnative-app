import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getFormById, insertField } from '../../../../services/app';

/**
 * Add field screen component 
 * Interface for creating new form fields with configurations
 * 
 * @component
 * @returns {JSX.Element} Field creation interface with type selection and configuration options
 */
export default function AddField() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  
  // Field state
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [required, setRequired] = useState(false);
  const [isNumeric, setIsNumeric] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState("");
  const [showDropdownOptions, setShowDropdownOptions] = useState(false);
  const [showLocationButton, setShowLocationButton] = useState(false);

  useEffect(() => {
    fetchFormDetails();
  }, [id]);

  // Fetches form details to display context information
  const fetchFormDetails = async () => {
    try {
      const formData = await getFormById(id);
      setForm(formData[0]);
    } catch (error) {
      Alert.alert("Error", "Failed to load form details.");
    }
  };

  // Show/hide options based on field type
  useEffect(() => {
    setShowDropdownOptions(fieldType === "dropdown");
    setShowLocationButton(fieldType === "location");
  }, [fieldType]);

  // Handles field creation with validation and type-specific processing
  const handleAddField = async () => {
    if (!fieldName.trim()) {
      Alert.alert("Missing Field Name", "Please enter a name for the field.");
      return;
    }

    // Validate dropdown options if dropdown is selected
    if (fieldType === "dropdown" && !dropdownOptions.trim()) {
      Alert.alert("Missing Dropdown Options", "Please enter options for the dropdown field.");
      return;
    }

    try {
      setLoading(true);

      // Prepare field data
      const fieldData = {
        name: fieldName.trim(),
        field_type: fieldType,
        required,
        is_num: isNumeric,
        order_index: 0,
      };

      // Add dropdown options if field type is dropdown
      if (fieldType === "dropdown" && dropdownOptions.trim()) {
        const optionsArray = dropdownOptions.split(',').map(opt => opt.trim()).filter(opt => opt);
        fieldData.options = {
          choices: optionsArray
        };
      }

      // For non-numeric field types, ensure is_num is disabled
      if (fieldType === "photo/video" || fieldType === "location" || fieldType === "dropdown") {
        fieldData.is_num = false;
      }

      await insertField(parseInt(id), fieldData);

      Alert.alert("Success", "Field added successfully!");
      router.back(); 
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add field. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Available field types with their display labels
  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "multiline", label: "Multiline Text" },
    { value: "dropdown", label: "Dropdown" },
    { value: "location", label: "Location" },
    { value: "photo/video", label: "Photo/Video" },
  ];

  return (
    <View className="flex-1 bg-background-base px-4 py-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Form Header */}
        {form && (
          <View className="bg-background-tertiary rounded-2xl p-4 mb-4 shadow-md">
            <View className="bg-white border border-background-border rounded-2xl p-4">
              <Text className="text-2xl font-dmserif text-text-navy mb-2 text-center">
                {form.name}
              </Text>
              <Text className="text-text-purple font-dmsans text-center mb-2">
                {form.description || "No description provided"}
              </Text>
            </View>
          </View>
        )}

        {/* Add Field Card */}
        <View className="bg-background-tertiary rounded-2xl p-4 mb-4 shadow-md">
          <View className="bg-white border border-background-border rounded-2xl p-4">
            <Text className="text-xl font-dmsans-bold text-text-navy mb-4 text-center">
              Field Configuration
            </Text>

            {/* Field Name */}
            <Text className="text-text-navy font-dmsans-bold mb-2">Field Name *</Text>
            <TextInput
              value={fieldName}
              onChangeText={setFieldName}
              multiline
              placeholder="Enter field name"
              className="bg-white border border-text-tertiary rounded-lg p-3 mb-4 font-dmsans"
            />

            {/* Field Type Dropdown */}
            <Text className="text-text-navy font-dmsans-bold mb-2">Field Type</Text>
            <View className="border border-text-tertiary rounded-lg mb-4 bg-white">
              {fieldTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  className={`px-4 py-3 border-b border-gray-100 ${
                    fieldType === type.value ? "bg-text-lilac" : "bg-white"
                  } ${type.value === fieldTypes[fieldTypes.length - 1].value ? "border-b-0" : ""}`}
                  onPress={() => setFieldType(type.value)}
                >
                  <Text className={`font-dmsans ${
                    fieldType === type.value ? "text-white" : "text-text-navy"
                  }`}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Dropdown Options */}
            {showDropdownOptions && (
              <View className="mb-4">
                <Text className="text-text-navy font-dmsans-bold mb-2">
                  Dropdown Options *
                </Text>
                <Text className="text-text-purple text-sm mb-2 font-dmsans">
                  Enter options separated by commas (e.g., "Option 1, Option 2, Option 3")
                </Text>
                <TextInput
                  value={dropdownOptions}
                  onChangeText={setDropdownOptions}
                  placeholder="Option 1, Option 2, Option 3"
                  multiline
                  className="bg-white border border-text-tertiary rounded-lg p-3 font-dmsans"
                />
              </View>
            )}

            {/* Toggle Switches */}
            <View className="space-y-4 gap-2">
              {/* Required Toggle */}
              <View className="flex-row justify-between items-center">
                <Text className="text-text-navy font-dmsans-bold">Required Field</Text>
                <Switch
                  value={required}
                  onValueChange={setRequired}
                  trackColor={{ false: "#E0E3FA", true: "#9395D3" }}
                  thumbColor={required ? "#FFFFFF" : "#FFFFFF"}
                />
              </View>

              {/* Numeric Toggle - Disabled for non-numeric field types */}
              <View className="flex-row justify-between items-center">
                <Text className="text-text-navy font-dmsans-bold">Stores Numeric Values</Text>
                <Switch
                  value={isNumeric}
                  onValueChange={setIsNumeric}
                  trackColor={{ false: "#E0E3FA", true: "#9395D3" }}
                  thumbColor={isNumeric ? "#FFFFFF" : "#FFFFFF"}
                  disabled={fieldType === "photo/video" || fieldType === "location" || fieldType === "dropdown"}
                />
              </View>
              {(fieldType === "photo/video" || fieldType === "location" || fieldType === "dropdown") && (
                <Text className="text-text-purple text-xs font-dmsans text-center">
                  Numeric values disabled for {fieldType === "photo/video" ? "Photo/Video" : fieldType === "location" ? "Location" : "Dropdown"} fields
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          className="flex-1 bg-white mx-2 py-3 rounded-full items-center"
          onPress={() => router.push(`/(tabs)/myForm/${id}`)}
        >
          <Text className="text-text-navy font-dmsans-bold">Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 mx-2 py-3 rounded-full items-center ${
            loading ? "bg-gray-400" : "bg-text-lilac"
          }`}
          onPress={handleAddField}
          disabled={loading}
        >
          <Text className="text-white font-dmsans-bold">
            {loading ? "Adding..." : "Add Field"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}