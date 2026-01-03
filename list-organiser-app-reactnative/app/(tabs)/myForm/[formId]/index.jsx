import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getFieldsByFormId, getFormById, getRecordsByFormId } from '../../../../services/app';

/**
 * Form detail screen component 
 * This screen displays detailed information about a specific form including its structure,
 * fields configuration and add fields and records.
 * 
 * @component
 * @returns {JSX.Element} Detailed form interface with fields, records, and management actions
 */
export default function FormDetail() {
  const { formId } = useLocalSearchParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (formId) {
      fetchFormData();
    }
  }, [formId]);

  // Fetches form data including form details, fields, and records. Promise.all for parallel fetching
  const fetchFormData = async () => {
    try {
      setLoading(true);
      const [formData, formFields, formRecords] = await Promise.all([
        getFormById(formId),
        getFieldsByFormId(formId),
        getRecordsByFormId(formId)
      ]);
      
      setForm(formData[0]);
      setFields(formFields);
      setRecords(formRecords);
    } catch (error) {
      Alert.alert("Error", "Failed to load form details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handles manual refresh of form data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFormData();
  };

  // Renders field values with display for photo objects, otherwise display as text
  const renderFieldValue = (value) => {
    try {
      const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      
      if (parsedValue && parsedValue.uri) {
        return (
          <View className="mt-2">
            <Image
              source={{ uri: parsedValue.uri }}
              style={{ 
                width: 100, 
                height: 100, 
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          </View>
        );
      }
    } catch (e) {
      // fall to regular text display
    }

    return (
      <Text className="text-text-navy text-sm font-dmsans">
        {String(value)}
      </Text>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-base justify-center items-center">
        <ActivityIndicator size="large" color="#9395D3" />
        <Text className="text-text-navy mt-4 font-dmsans">Loading form details...</Text>
      </View>
    );
  }

  if (!form) {
    return (
      <View className="flex-1 bg-background-base justify-center items-center px-6">
        <Text className="text-text-navy text-xl font-dmserif text-center mb-4">
          Form Not Found
        </Text>
        <Text className="text-text-purple font-dmsans text-center mb-6">
          The form doesn't exist or has been deleted.
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
    <View className="flex-1 bg-background-base px-4 py-4">
      {/* Header ith number of records and fields */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-background-border">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-xl font-dmserif text-text-navy mb-1">
              {form.name}
            </Text>
            <Text className="text-text-purple font-dmsans text-sm">
              {form.description || "No description provided"}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleRefresh}
            disabled={refreshing}
            className="p-2 -mt-1 -mr-1"
          >
            <Feather 
              name="refresh-cw" 
              size={18} 
              color={refreshing ? "#C3C5F4" : "#9395D3"} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Stats */}
        <View className="flex-row justify-between items-center border-t border-background-border pt-3">
          <View className="flex-row items-center space-x-2 gap-3">
            <View className="bg-[#E0E3FA] p-2 rounded-full">
              <Feather name="list" size={16} color="#6B6ECC" />
            </View>
            <View>
              <Text className="text-text-navy font-dmsans-bold text-base">{fields.length}</Text>
              <Text className="text-text-purple text-xs">Fields</Text>
            </View>
          </View>
          
          <View className="flex-row items-center space-x-2 gap-3">
            <View className="bg-[#D8F5D1] p-2 rounded-full">
              <Feather name="database" size={16} color="#4E8B36" />
            </View>
            <View>
              <Text className="text-text-navy font-dmsans-bold text-base">{records.length}</Text>
              <Text className="text-text-purple text-xs">Records</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Fields Section */}
        <View className="bg-background-tertiary rounded-2xl p-4 mb-4 shadow-md">
          <View className="bg-white border border-background-border rounded-2xl p-4">
            <Text className="text-xl font-dmsans-bold text-text-navy mb-3">Form Fields</Text>
            {fields.length === 0 ? (
              <View className="items-center py-4">
                <Feather name="inbox" size={40} color="#C3C5F4" />
                <Text className="text-text-purple font-dmsans mt-2 text-center mb-4">No fields defined yet</Text>
                <TouchableOpacity
                  className="bg-text-lilac px-6 py-3 rounded-full items-center flex-row"
                  onPress={() => router.push(`/(tabs)/myForm/field/${formId}`)}
                >
                  <Feather name="plus" size={16} color="#FFFFFF" />
                  <Text className="text-white font-dmsans-bold px-2 ml-2">Add Field</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {fields.map((field, index) => (
                  <View key={field.id} className="bg-background-tertiary p-3 rounded-lg mb-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-text-navy font-dmsans-bold">{field.name}</Text>
                      <View className="flex-row items-center">
                        {field.required && (
                          <Text className="text-red-500 text-xs font-dmsans bg-red-50 px-2 py-1 rounded-full mr-2">
                            Required
                          </Text>
                        )}
                        <Text className="text-text-purple text-xs font-dmsans bg-[#E0E3FA] px-2 py-1 rounded-full">
                          {field.field_type}
                        </Text>
                      </View>
                    </View>
                    {field.options && (
                      <Text className="text-text-purple text-sm mt-1 font-dmsans">
                        Options: {JSON.stringify(field.options)}
                      </Text>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  className="bg-text-lilac mt-4 py-3 rounded-full items-center flex-row justify-center"
                  onPress={() => router.push(`/(tabs)/myForm/field/${formId}`)}
                >
                  <Feather name="plus" size={16} color="#FFFFFF" />
                  <Text className="text-white font-dmsans-bold px-2 ml-2">Add Another Field</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Records Section */}
        <View className="bg-background-tertiary rounded-2xl p-4 mb-4 shadow-md">
          <View className="bg-white border border-background-border rounded-2xl p-4">
            <Text className="text-xl font-dmsans-bold text-text-navy mb-3">Form Records</Text>
            {records.length === 0 ? (
              <View className="items-center py-4">
                <Feather name="file-text" size={40} color="#C3C5F4" />
                <Text className="text-text-purple font-dmsans mt-2 text-center mb-4">No records submitted yet</Text>
                <TouchableOpacity
                  className="bg-text-lilac px-6 py-3 rounded-full items-center flex-row"
                  onPress={() => router.push(`/(tabs)/myForm/record/${formId}`)}
                >
                  <Feather name="plus" size={16} color="#FFFFFF" />
                  <Text className="text-white font-dmsans-bold ml-2 px-2">Add Record</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {records.map((record, index) => (
                  <View key={record.id} className="bg-background-tertiary p-4 rounded-lg mb-3">
                    <Text className="text-text-navy font-dmsans-bold mb-3">Record #{index + 1}</Text>
                    {Object.entries(record.values || {}).map(([key, value]) => (
                      <View key={key} className="mb-2">
                        <Text className="text-text-purple text-sm font-dmsans-medium">
                          {key}:
                        </Text>
                        {renderFieldValue(value)}
                      </View>
                    ))}
                  </View>
                ))}
                {/* Add Record Button, only when records exist already */}
                <TouchableOpacity
                  className="bg-text-lilac mt-4 py-3 rounded-full items-center flex-row justify-center"
                  onPress={() => router.push(`/(tabs)/myForm/record/${formId}`)}
                >
                  <Feather name="plus" size={16} color="#FFFFFF" />
                  <Text className="text-white font-dmsans-bold px-2 ml-2">Add Another Record</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Back to List Button */}
      <TouchableOpacity
        className="mt-5 rounded-full items-center"
        onPress={() => router.push("/(tabs)/myForm")}
      >
        <Text className="text-text-navy font-dmsans-bold">← Back to Forms List</Text>
      </TouchableOpacity>
    </View>
  );
}