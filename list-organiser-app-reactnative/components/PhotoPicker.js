import { Feather } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

/**
 * Photo picker component 
 * Media selection interface with preview and zoom in functionality
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.value - Current media value as JSON string or empty string
 * @param {Function} props.onChange - Callback function triggered when media selection changes
 * @returns {JSX.Element} Media selection interface with preview and gallery access
 */
export default function PhotoPicker({ value, onChange }) {
    const [media, setMedia] = useState(value ? JSON.parse(value) : null);

    // * Handles media selection from device gallery, request eprmisison, opens image picker and processes media
    const handleMediaPick = async () => {
        try {
            // Request gallery permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Photo library permission is required to select media.');
                return;
            }

            // Open gallery to pick media
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedMedia = result.assets[0];
                
                // Simple media data - store URI
                const mediaData = {
                    uri: selectedMedia.uri,
                    timestamp: new Date().toISOString()
                };

                setMedia(mediaData);
                onChange(JSON.stringify(mediaData));
            }
        } catch (error) {
            console.error("Error picking media:", error);
            Alert.alert("Error", "Failed to pick media. Please try again.");
        }
    };

    // Clears currently selected media and resets the picker state
    const handleRemoveMedia = () => {
        setMedia(null);
        onChange("");
    };

    return (
        <View className="mb-4">
            {/* Media Preview */}
            {media ? (
                <View className="mb-3">
                    <View className="border border-text-tertiary rounded-lg p-3 bg-white">
                        {/* Image Preview */}
                        <Image
                            source={{ uri: media.uri }}
                            style={{ width: '100%', height: 200 }}
                            resizeMode="cover"
                            className="rounded-lg"
                        />
                        {/* Remove Media Button */}
                        <View className="flex-row justify-end items-center mt-3">
                            <TouchableOpacity
                                onPress={handleRemoveMedia}
                                className="bg-red-50 px-3 py-1 rounded-full"
                            >
                                <Text className="text-red-600 text-xs font-dmsans">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ) : (
                <View className="border-2 border-dashed border-text-tertiary rounded-lg p-6 bg-gray-50 items-center justify-center mb-3">
                    <Feather name="image" size={32} color="#9395D3" />
                    <Text className="text-text-purple font-dmsans mt-2 text-center">
                        No media selected
                    </Text>
                </View>
            )}

            {/* Gallery Button */}
            <TouchableOpacity
                onPress={handleMediaPick}
                className="bg-text-lilac py-3 rounded-full items-center flex-row justify-center"
            >
                <Feather name="folder" size={16} color="#FFFFFF" />
                <Text className="text-white font-dmsans-bold ml-2">Select from Gallery</Text>
            </TouchableOpacity>
        </View>
    );
}