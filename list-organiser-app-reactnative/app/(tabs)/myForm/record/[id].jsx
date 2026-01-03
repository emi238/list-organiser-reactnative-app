import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import PhotoPicker from '../../../../components/PhotoPicker';
import { getFieldsByFormId, getFormById, insertRecord } from '../../../../services/app';

/**
 * Submit record screen component 
 * This screen provides a dynamic form interface that renders appropriate input controls
 * based on field types including text, dropdowns, location capture, media upload, and multiline inputs.
 * 
 * @component
 * @returns {JSX.Element} Dynamic form submission interface with type-specific input controls
 */
export default function SubmitRecord() {
  const { id: formId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [recordData, setRecordData] = useState({});
  const [capturedLocations, setCapturedLocations] = useState({});
  const [locationNames, setLocationNames] = useState({});

  useEffect(() => {
    fetchFormAndFields();
  }, [formId]);

  // Fetches form structure and field definitions to build the form interface
  const fetchFormAndFields = async () => {
    try {
      const [formData, formFields] = await Promise.all([
        getFormById(formId),
        getFieldsByFormId(formId)
      ]);
      
      setForm(formData[0]);
      // Sort fields by order_index
      const sortedFields = formFields.sort((a, b) => a.order_index - b.order_index);
      setFields(sortedFields);

      // Initialize record data with field names and default values
      const initialData = {};
      sortedFields.forEach(field => {
        if (field.field_type === 'dropdown' && field.options) {
          // Set first option as default for dropdowns
          const options = Object.values(field.options)[0] || [];
          initialData[field.name] = options[0] || "";
        } else {
          initialData[field.name] = "";
        }
      });
      setRecordData(initialData);
    } catch (error) {
      Alert.alert("Error", "Failed to load form fields.");
    }
  };

  // Updates form data state when users input values
  const handleInputChange = (fieldName, value) => {
    setRecordData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Handles custom naming for captured locations
  const handleLocationNameChange = (locationFieldName, locationName) => {
    setLocationNames(prev => ({
      ...prev,
      [locationFieldName]: locationName
    }));
    
    // Also store in record data for submission
    const locationNameField = `${locationFieldName} Name`;
    handleInputChange(locationNameField, locationName);
  };

  // Captures current GPS location for location-type fields
  const handleLocationSelection = async (fieldName) => {
    try {      
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Create location object with coordinates
      const locationData = {
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6))
      };

      // Store for display
      setCapturedLocations(prev => ({
        ...prev,
        [fieldName]: locationData
      }));

      // Initialize empty location name
      handleLocationNameChange(fieldName, "");

      // Store in record data as JSON string
      handleInputChange(fieldName, JSON.stringify(locationData));
            
    } catch (error) {
      Alert.alert("Error", "Failed to get location. Please try again.");
    }
  };

  // Renders input control based on field type
  const renderFieldInput = (field) => {
    const value = recordData[field.name]?.toString() || "";

    switch (field.field_type) {
      case 'dropdown':
        return renderDropdownField(field, value);
      
      case 'location':
        return renderLocationField(field, value);
      
      case 'multiline':
        return renderMultilineField(field, value);

      case 'photo/video':
        return renderMediaField(field, value);

      case 'text':
      default:
        return renderTextField(field, value);
    }
  };

  // Renders dropdown selector with predefined options
  const renderDropdownField = (field, value) => {
    const options = field.options ? Object.values(field.options)[0] || [] : [];
    
    return (
      <View className="border border-text-tertiary rounded-lg bg-white">
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => handleInputChange(field.name, itemValue)}
          style={{ fontFamily: 'DMSans_400Regular' }}
        >
          {options.map((option, index) => (
            <Picker.Item key={index} label={option} value={option} />
          ))}
        </Picker>
      </View>
    );
  };

  // Renders location capture button with GPS coord display
  const renderLocationField = (field, value) => {
    const capturedLocation = capturedLocations[field.name];
    const locationName = locationNames[field.name] || "";
    
    let displayText = "Set Location";
    let coordinatesText = "";
    
    if (capturedLocation) {
      const { latitude, longitude } = capturedLocation;
      displayText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      coordinatesText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
    } else if (value) {
      try {
        const locationData = JSON.parse(value);
        const { latitude, longitude } = locationData;
        displayText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        coordinatesText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      } catch (e) {
        displayText = value;
      }
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => handleLocationSelection(field.name)}
          className={`border rounded-lg p-3 mb-2 ${
            capturedLocation ? "bg-green-50 border-green-200" : "bg-white border-text-tertiary"
          }`}
        >
          <Text className={`font-dmsans ${capturedLocation ? 'text-green-800' : 'text-text-navy'}`}>
            {displayText}
          </Text>
        </TouchableOpacity>
        
        {!coordinatesText ? (
          <Text className="text-text-purple text-xs font-dmsans mt-1">
            Tap to Set Location
          </Text>
        ) : (
          <Text className="text-green-600 text-xs font-dmsans mt-1">
            Location Recorded
          </Text>
        )}

        {/* Location Name Input, only show when location is selected */}
        {capturedLocation && (
          <View className="mt-3">
            <Text className="text-text-navy font-dmsans-bold mb-2">
              Location Name?
            </Text>
            <TextInput
              value={locationName}
              onChangeText={(text) => handleLocationNameChange(field.name, text)}
              placeholder="Enter a name for this location (e.g., Home, Office, Park)"
              className="bg-white border border-text-tertiary rounded-lg p-3 font-dmsans"
            />
          </View>
        )}
      </View>
    );
  };

  // Renders multiline text input for longer text 
  const renderMultilineField = (field, value) => {
    return (
      <TextInput
        value={value}
        onChangeText={(text) => handleInputChange(field.name, text)}
        placeholder={`Enter ${field.name}`}
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
        className="bg-white border border-text-tertiary rounded-lg p-3 font-dmsans"
      />
    );
  };

  // Renders media capture interface using PhotoPicker component
  const renderMediaField = (field, value) => {
      return (
          <PhotoPicker
              value={value}
              onChange={(mediaValue) => handleInputChange(field.name, mediaValue)}
              fieldName={field.name}
          />
      );
  };

  // Renders standard text input with numeric keyboard support
  const renderTextField = (field, value) => {
    return (
      <TextInput
        value={value}
        onChangeText={(text) => handleInputChange(field.name, text)}
        placeholder={`Enter ${field.name}`}
        keyboardType={field.is_num ? "numeric" : "default"}
        className="bg-white border border-text-tertiary rounded-lg p-3 font-dmsans"
      />
    );
  };
  
  // Handles form submission 
  const handleSubmitRecord = async () => {
    const missingFields = fields
        .filter(field => field.required && !recordData[field.name]?.toString().trim())
        .map(field => field.name);

    if (missingFields.length > 0) {
        Alert.alert(
        "Missing Required Fields", 
        `Please fill in: ${missingFields.join(", ")}`
        );
        return;
    }

    try {
        setLoading(true);

        const processedValues = {};
        fields.forEach(field => {
        let value = recordData[field.name];
        
        // For numeric fields, convert to number
        if (field.is_num && value) {
            value = parseFloat(value) || 0;
        }

        // For media fields, store as JSON string
        if (fields.field_type === 'photo/video' && value) {
        }

        processedValues[field.name] = value;
        });

        // Add location name fields to the processed values
        Object.keys(locationNames).forEach(locationFieldName => {
          const locationNameField = `${locationFieldName} Name`;
          processedValues[locationNameField] = locationNames[locationFieldName];
        });

        // Send structure to API 
        await insertRecord(parseInt(formId), {
        values: processedValues
        });

        Alert.alert("Success", "Record submitted successfully!");
        router.back();
    } catch (error) {
        Alert.alert("Error", error.message || "Failed to submit record.");
    } finally {
        setLoading(false);
    }
  };

  if (!form) {
    return (
      <View className="flex-1 bg-background-base justify-center items-center">
        <Text className="text-text-navy font-dmsans">Loading form...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-base px-4 py-6">
      {/* Header */}
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Form Fields */}
        <View className="bg-background-tertiary rounded-2xl p-4 mb-4 shadow-md">
          <View className="bg-white border border-background-border rounded-2xl p-4">
            <Text className="text-xl font-dmsans-bold text-text-navy mb-3">
              Fill Form Data
            </Text>

            {fields.length === 0 ? (
              <View className="items-center py-4">
                <Text className="text-text-purple font-dmsans text-center">
                  No fields defined for this form yet.
                </Text>
              </View>
            ) : (
              fields.map((field) => (
                <View key={field.id} className="mb-4">
                  <Text className="text-text-navy font-dmsans-bold mb-2">
                    {field.name}
                    {field.required && <Text className="text-red-500"> *</Text>}
                  </Text>
                  
                  {renderFieldInput(field)}
                  
                  <Text className="text-text-purple text-xs mt-1 font-dmsans">
                    Expected Type: {field.field_type} {field.is_num && "• Numeric"} {field.required && "• Required"}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          className="flex-1 bg-white mx-1 py-3 rounded-full items-center"
          onPress={() => router.back()}
        >
          <Text className="text-text-navy font-dmsans-bold">Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 mx-2 py-3 rounded-full items-center ${
            loading ? "bg-gray-400" : "bg-text-lilac"
          }`}
          onPress={handleSubmitRecord}
          disabled={loading || fields.length === 0}
        >
          <Text className="text-white font-dmsans-bold">
            {loading ? "Submitting..." : "Submit Record"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}