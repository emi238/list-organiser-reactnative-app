import { Feather } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { deleteRecord, getFieldsByFormId, getRecordsByFormId } from '../../../../services/app';

/**
 * Records screen component and filtering between records
 * This screen provides comprehensive record viewing, filtering, copy and deletion capabilities.
 * 
 * @component
 * @returns {JSX.Element} Advanced records management interface with filtering and data operations
 */
export default function RecordsScreen() {
  const { formId } = useLocalSearchParams();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [filters, setFilters] = useState([]);
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({
    fieldType: '',
    operator: '',
    value: '',
    logic: 'and'
  });

  // Group fields by type and detect data types, determines which fields contain text vs numeric data 
  const getFieldCategories = () => {
    const categories = {
      text: { label: 'Text Fields', hasText: false, hasNumeric: false },
      multiline: { label: 'Multiline Fields', hasText: false, hasNumeric: false },
      dropdown: { label: 'Dropdown Fields', hasText: false, hasNumeric: false }
    };

    // Checking for field definitions for numeric setting, change hasNumeric
    fields.forEach(field => {
      if (field.field_type === 'text' || field.field_type === 'multiline' || field.field_type === 'dropdown') {
        if (field.is_num) {
          categories[field.field_type].hasNumeric = true;
        } else {
          categories[field.field_type].hasText = true;
        }
      }
    });

    // Checking record data to detect mixed types
    records.forEach(record => {
      Object.entries(record.values || {}).forEach(([fieldName, value]) => {
        const field = fields.find(f => f.name === fieldName);
        if (field && categories[field.field_type]) {
          // Check if the value is numeric
          if (value && !isNaN(parseFloat(value)) && isFinite(value)) {
            categories[field.field_type].hasNumeric = true;
          } else if (value && typeof value === 'string' && value.trim() !== '') {
            categories[field.field_type].hasText = true;
          }
        }
      });
    });

    return categories;
  };

  const fieldCategories = getFieldCategories();

  // Determines available filter operators based on detected data types in a field category
  const getOperatorsForFieldType = (fieldType) => {
    const category = fieldCategories[fieldType];
    if (!category) return [];
    
    const numericOperators = [
      { value: 'gt', label: 'Greater Than' },
      { value: 'lt', label: 'Less Than' },
      { value: 'gte', label: 'Greater or Equal' },
      { value: 'lte', label: 'Less or Equal' }
    ];
    
    const stringOperators = [
      { value: 'ilike', label: 'Contains' },
      { value: 'like', label: 'Starts With' }
    ];

    // Always include equals as it works for both text and numbers
    const equalsOperator = { value: 'eq', label: 'Equals' };

    if (category.hasNumeric && category.hasText) {
      // Both numeric and text data present 
      return [equalsOperator, ...numericOperators, ...stringOperators];
    } else if (category.hasNumeric) {
      // Only numeric data
      return [equalsOperator, ...numericOperators];
    } else {
      // Only text data (default)
      return [equalsOperator, ...stringOperators];
    }
  };

  // Provides descriptive text about the data types available for filtering in each field category
  const getDataTypeDescription = (fieldType) => {
    const category = fieldCategories[fieldType];
    if (!category) return '';
    
    if (category.hasNumeric && category.hasText) {
      return 'Filter by Text & Numbers';
    } else if (category.hasNumeric) {
      return 'Filter by Numbers';
    } else {
      return 'Filter by Text';
    }
  };

  // Fetches records from the backend, handles applying active filters too
  const fetchRecords = async (appliedFilters = []) => {
    try {
      setLoading(true);
      
      let recordsData;
      if (appliedFilters.length > 0) {
        recordsData = await applyFilters(appliedFilters);
      } else {
        recordsData = await getRecordsByFormId(formId);
      }
      
      setRecords(recordsData);
      
    } catch (error) {
      Alert.alert("Error", "Failed to load records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetches form field 
  const fetchFormFields = async () => {
    try {
      const formFields = await getFieldsByFormId(formId);
      setFields(formFields);
    } catch (error) {
      Alert.alert("Error", "Failed to load fields.");
    }
  };

  useEffect(() => {
    if (formId) {
      fetchRecords();
      fetchFormFields();
    } else {
      setLoading(false);
    }
  }, [formId]);

  // Handles manual refresh of records data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
  };

  // Main logic to apply filters to record data
  const applyFilters = async (filtersToApply = filters) => {
    if (filtersToApply.length === 0) {
      return await getRecordsByFormId(formId);
    }

    try {
      // For category-based filtering (client-side)
      const allRecords = await getRecordsByFormId(formId);
      
      const filteredRecords = allRecords.filter(record => {
        return filtersToApply.every((filter) => {
          // Find all fields of this type in the record
          const matchingFields = Object.entries(record.values || {}).filter(([fieldName]) => {
            const field = fields.find(f => f.name === fieldName);
            return field && field.field_type === filter.fieldType;
          });

          // Check if any of the matching fields meet the criteria
          return matchingFields.some(([fieldName, fieldValue]) => {
            const stringValue = fieldValue?.toString() || '';
            const filterValue = filter.value.toLowerCase();
            const currentValue = stringValue.toLowerCase();

            const category = fieldCategories[filter.fieldType];
            const hasNumeric = category?.hasNumeric;
            const hasText = category?.hasText;
            
            // Try numeric comparison first if both types are possible in user input
            if (hasNumeric && !isNaN(parseFloat(stringValue)) && isFinite(stringValue)) {
              const numValue = parseFloat(stringValue);
              const numFilter = parseFloat(filter.value);
              
              switch (filter.operator) {
                case 'eq': return numValue === numFilter;
                case 'gt': return numValue > numFilter;
                case 'lt': return numValue < numFilter;
                case 'gte': return numValue >= numFilter;
                case 'lte': return numValue <= numFilter;
                // Fall through to string comparison
              }
            }
            
            // String comparison 
            if (hasText) {
              switch (filter.operator) {
                case 'eq': return currentValue === filterValue;
                case 'ilike': return currentValue.includes(filterValue);
                case 'like': return currentValue.startsWith(filterValue);
                // For numeric operators on text data, try to parse
                case 'gt': 
                case 'lt': 
                case 'gte': 
                case 'lte':
                  if (!isNaN(parseFloat(stringValue)) && isFinite(stringValue)) {
                    const numValue = parseFloat(stringValue);
                    const numFilter = parseFloat(filter.value);
                    switch (filter.operator) {
                      case 'gt': return numValue > numFilter;
                      case 'lt': return numValue < numFilter;
                      case 'gte': return numValue >= numFilter;
                      case 'lte': return numValue <= numFilter;
                    }
                  }
                  return false;
                default: return false;
              }
            }
            
            return false;
          });
        });
      });

      return filteredRecords;
    } catch (error) {
      Alert.alert("Error applying fields");
      throw error;
    }
  };

  // Applies currently configured filters to the records dataset
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const filteredRecords = await applyFilters(filters);
      setRecords(filteredRecords);
    } catch (error) {
      Alert.alert("Error", "Failed to apply filters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clears all active filters and resets to show all records
  const handleClearFilters = async () => {
    setFilters([]);
    await fetchRecords();
  };

  // Copies record data to clipboard as formatted JSON
  const handleCopyRecord = async (record) => {
    try {
      const valuesJson = JSON.stringify(record.values, null, 2);
      await Clipboard.setStringAsync(valuesJson);
      Alert.alert("Copied!");
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  // Handles record deletion 
  const handleDeleteRecord = async (record) => {
    Alert.alert(
      "Delete Record",
      `Are you sure you want to delete record #${record.id}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecord(record.id);
              Alert.alert("Success", "Record deleted successfully");
              fetchRecords(filters);
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to delete record.");
            }
          }
        }
      ]
    );
  };

  // Function to check if a value is a photo object and render it
  const renderFieldValue = (value) => {
    try {
      const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      
      if (parsedValue && parsedValue.uri) {
        return (
          <View className="mt-2">
            <Image
              source={{ uri: parsedValue.uri }}
              style={{ width: 300, height: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
          </View>
        );
      }
    } catch (e) {
      // fall through to text display
    }

    // For location data, display coordinates nice
    try {
      const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsedValue && typeof parsedValue === 'object' && 'latitude' in parsedValue && 'longitude' in parsedValue) {
        return (
          <Text className="text-text-navy text-sm font-dmsans mt-1">
            {parsedValue.latitude.toFixed(6)}, {parsedValue.longitude.toFixed(6)}
          </Text>
        );
      }
    } catch (e) {
      // If not location data, fall through
    }

    // Display as string (Default)
    return (
      <Text 
        className="text-text-navy text-sm font-dmsans mt-1 flex-1"
        numberOfLines={0} 
        ellipsizeMode="tail" 
      >
        {String(value)}
      </Text>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-base justify-center items-center">
        <ActivityIndicator size="large" color="#9395D3" />
        <Text className="text-text-navy mt-4 font-dmsans">Loading records...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-base">
      {/* Header */}
      <View className="bg-white rounded-2xl p-4 mx-4 mt-4 mb-4 shadow-sm border border-background-border">
        <View className="flex-row justify-between items-center">
          <Text className="text-xl font-dmserif text-text-navy flex-1">
            Form Records
          </Text>
          <TouchableOpacity 
            onPress={handleRefresh}
            disabled={refreshing}
            className="p-2 -mr-2"
          >
            <Feather 
              name="refresh-cw" 
              size={18} 
              color={refreshing ? "#C3C5F4" : "#9395D3"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Builder Modal */}
      <Modal
        visible={showFilterBuilder}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <View className="flex-1 bg-background-base">
          <View className="flex-row justify-between items-center p-4 border-b border-background-border">
            <Text className="mt-5 text-3xl font-dmserif text-text-navy">Add Filter</Text>
            <TouchableOpacity onPress={() => setShowFilterBuilder(false)}>
              <Feather name="x" size={24} color="#9395D3" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
            {/* Field Type Selection */}
            <View className="mb-6">
              <Text className="text-text-navy font-dmsans-bold mb-3 text-lg">Field Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {Object.entries(fieldCategories).map(([type, category]) => (
                  category.hasText || category.hasNumeric ? (
                    <TouchableOpacity
                      key={type}
                      className={`px-4 py-3 rounded-full border ${
                        currentFilter.fieldType === type 
                          ? 'bg-text-lilac border-text-lilac' 
                          : 'bg-white border-text-tertiary'
                      }`}
                      onPress={() => {
                        setCurrentFilter(prev => ({
                          ...prev,
                          fieldType: type,
                          operator: '',
                          value: ''
                        }));
                      }}
                    >
                      <Text className={`font-dmsans-bold ${
                        currentFilter.fieldType === type 
                          ? 'text-white' 
                          : 'text-text-navy'
                      }`}>
                        {category.label}
                      </Text>
                      <Text className={`text-xs mt-1 ${
                        currentFilter.fieldType === type 
                          ? 'text-white' 
                          : 'text-text-purple'
                      }`}>
                        {getDataTypeDescription(type)}
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ))}
              </View>
            </View>

            {/* Operator Selection, only show after field type is selected */}
            {currentFilter.fieldType && (
              <View className="mb-6">
                <Text className="text-text-navy font-dmsans-bold mb-3 text-lg">Operator</Text>
                <View className="flex-row flex-wrap gap-2">
                  {getOperatorsForFieldType(currentFilter.fieldType).map(operator => (
                    <TouchableOpacity
                      key={operator.value}
                      className={`px-4 py-3 rounded-full border ${
                        currentFilter.operator === operator.value 
                          ? 'bg-[#6B6ECC] border-[#6B6ECC]' 
                          : 'bg-gray-100 border-[#E0E3FA]'
                      }`}
                      onPress={() => {
                        setCurrentFilter(prev => ({
                          ...prev,
                          operator: operator.value
                        }));
                      }}
                    >
                      <Text className={`font-dmsans-bold ${
                        currentFilter.operator === operator.value 
                          ? 'text-white' 
                          : 'text-[#6B6ECC]'
                      }`}>
                        {operator.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Value Input, show after operator is selected */}
            {currentFilter.operator && (
              <View className="mb-6">
                <Text className="text-text-navy font-dmsans-bold mb-3 text-lg">Value</Text>
                <TextInput
                  value={currentFilter.value}
                  onChangeText={(value) => setCurrentFilter(prev => ({ ...prev, value }))}
                  placeholder={`Enter value`}
                  className="bg-white border border-text-tertiary rounded-xl p-4 font-dmsans text-lg"
                  keyboardType="default" 
                  autoFocus={true}
                />
              </View>
            )}

            {/* Logic Selection for multiple filters for user to choose AND / OR */}
            {filters.length > 0 && (
              <View className="mb-6">
                <Text className="text-text-navy font-dmsans-bold mb-3 text-lg">Logic</Text>
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-xl items-center ${
                      currentFilter.logic === 'and' 
                        ? 'bg-[#6B6ECC] border-[#6B6ECC]' 
                        : 'bg-[#E0E3FA] border-[#E0E3FA]'
                    }`}
                    onPress={() => setCurrentFilter(prev => ({ ...prev, logic: 'and' }))}
                  >
                    <Text className={`font-dmsans-bold text-lg ${
                      currentFilter.logic === 'and' ? 'text-white' : 'text-[#6B6ECC]'
                    }`}>
                      AND
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-xl items-center ${
                      currentFilter.logic === 'or' 
                        ? 'bg-[#6B6ECC] border-[#6B6ECC]' 
                        : 'bg-[#E0E3FA] border-[#E0E3FA]'
                    }`}
                    onPress={() => setCurrentFilter(prev => ({ ...prev, logic: 'or' }))}
                  >
                    <Text className={`font-dmsans-bold text-lg ${
                      currentFilter.logic === 'or' ? 'text-white' : 'text-[#6B6ECC]'
                    }`}>
                      OR
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row justify-between space-x-3 mb-4">
              <TouchableOpacity
                className="flex-1 py-2 rounded-xl items-center"
                onPress={() => {
                  setCurrentFilter({ fieldType: '', operator: '', value: '', logic: 'and' });
                  setShowFilterBuilder(false);
                }}
              >
                <Text className="text-text-lilac text-lg font-dmsans-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 py-2 rounded-xl items-center ${
                  !currentFilter.fieldType || !currentFilter.operator || !currentFilter.value 
                    ? 'bg-gray-300' 
                    : 'bg-text-lilac border border-gray-100'
                }`}
                onPress={() => {
                  if (currentFilter.fieldType && currentFilter.operator && currentFilter.value) {
                    setFilters(prev => [...prev, { ...currentFilter, id: Date.now() }]);
                    setCurrentFilter({ fieldType: '', operator: '', value: '', logic: 'and' });
                    setShowFilterBuilder(false);
                  }
                }}
                disabled={!currentFilter.fieldType || !currentFilter.operator || !currentFilter.value}
              >
                <Text className="text-white text-lg">Add Filter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Active Filters Display */}
      {filters.length > 0 && (
        <View className="bg-white rounded-2xl p-4 mx-4 mb-4 shadow-sm border border-background-border">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-dmsans-bold text-text-navy">Active Filters</Text>
            <TouchableOpacity 
              onPress={handleClearFilters}
              className="bg-[#FFE5E5] p-1.5 rounded-full"
            >
              <Feather name="trash-2" size={14} color="#E53E3E" />
            </TouchableOpacity>
          </View>
          
          {filters.map((filter, index) => (
            <View key={filter.id} className="flex-row justify-between items-center bg-gray-50 p-2 rounded-lg mb-2">
              <View className="flex-1 mr-2">
                <Text className="text-text-navy font-dmsans text-sm">
                  {index > 0 && `${filter.logic.toUpperCase()} `}
                  {fieldCategories[filter.fieldType]?.label} {getOperatorsForFieldType(filter.fieldType)
                    .find(op => op.value === filter.operator)?.label} "{filter.value}"
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setFilters(prev => prev.filter(f => f.id !== filter.id))}
                className="bg-[#FFE5E5] p-1.5 rounded-full"
              >
                <Feather name="x" size={12} color="#E53E3E" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity
            className="bg-text-lilac mt-2 py-2 rounded-full items-center"
            onPress={handleApplyFilters}
          >
            <Text className="text-white font-dmsans-bold text-sm">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Records List */}
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="bg-background-tertiary rounded-2xl p-4 mb-4 shadow-md">
          <View className="bg-white border border-background-border rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-dmsans-bold text-text-navy">Records</Text>
              <View className="flex-row items-center">
                <Text className="text-text-purple font-dmsans mr-3">{records.length} records</Text>
                <TouchableOpacity
                  onPress={() => setShowFilterBuilder(true)}
                  className="bg-[#E0E3FA] p-2 rounded-full"
                >
                  <Feather name="filter" size={16} color="#6B6ECC" />
                </TouchableOpacity>
              </View>
            </View>
            
            {records.length === 0 ? (
              <View className="items-center py-8">
                <Feather name="file-text" size={48} color="#C3C5F4" />
                <Text className="text-text-purple font-dmsans mt-4 text-center mb-2 text-lg">
                  {filters.length > 0 ? 'No records match your filters' : 'No records found for this form'}
                </Text>
                <Text className="text-text-purple font-dmsans text-center">
                  {filters.length > 0 ? 'Try adjusting your filters' : 'Submit records through the form to see them here'}
                </Text>
                {filters.length > 0 ? (
                  <TouchableOpacity
                    className="bg-text-lilac px-6 py-3 rounded-full items-center flex-row mt-4"
                    onPress={handleClearFilters}
                  >
                    <Feather name="x" size={16} color="#FFFFFF" />
                    <Text className="text-white font-dmsans-bold ml-2 px-2">Clear Filters</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="bg-text-lilac px-6 py-3 rounded-full items-center flex-row mt-4"
                    onPress={() => router.push(`/(tabs)/myForm/record/${formId}`)}
                  >
                    <Feather name="plus" size={16} color="#FFFFFF" />
                    <Text className="text-white font-dmsans-bold ml-2 px-2">Add First Record</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                {records.map((record) => (
                  <View key={record.id} className="bg-background-tertiary rounded-lg mb-3">
                    {/* Record Values */}
                    <View className="mt-3">
                      {Object.entries(record.values || {}).map(([key, value]) => (
                        <View key={key} className="py-2 border-b border-background-border last:border-b-0">
                          <View className="flex-row justify-between">
                            <Text className="text-text-purple text-sm font-dmsans-medium flex-1">
                              {key}:
                            </Text>
                          </View>
                          {renderFieldValue(value)}
                        </View>
                      ))}
                    </View>
                    
                    {/* Action Buttons */}
                    <View className="flex-row justify-end mt-4">             
                      <View className="flex-row space-x-2">
                        <TouchableOpacity
                          onPress={() => handleCopyRecord(record)}
                          className="bg-[#E0E3FA] p-3 rounded-full"
                        >
                          <Feather name="copy" size={16} color="#6B6ECC" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteRecord(record)}
                          className="bg-[#FFE5E5] p-3 rounded-full"
                        >
                          <Feather name="trash-2" size={16} color="#E53E3E" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
                
                {/* Add Another Record Button */}
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
    </View>
  );
}