import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { getRecordsByFormId } from '../services/app';

/**
 * Displays recorded locations from form submissions
 * This component provides an interactive map interface that visualizes location data
 * extracted from form records, with support for photos, custom names, and user interactions.
 * 
 * @component
 * @returns {JSX.Element} Interactive map interface with location visualization
 */
export default function MapScreen() {
    const { formId } = useLocalSearchParams();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationsAtSameCoordinate, setLocationsAtSameCoordinate] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    
    // Add ref for map and zoom state
    const mapRef = useRef(null);
    const region = useRef(null);
    const cardScrollRef = useRef(null);

    /**
     * Processes form records to extract location data and associated photos
     * This function takes raw form records and transforms them into structured location objects
     * that can be displayed on the map with proper metadata and photos.
     * 
     * @param {Array} records - Array of form record objects from the database
     * @returns {Array} Processed location objects ready for map display
     */
    const extractLocationsFromRecords = (records) => {
        const extractedLocations = [];
      
        records.forEach(record => {
            // Object to store discovered location coordinates keyed by field name
            const locationFields = {};
            let photoUri = null;
            
            Object.entries(record.values || {}).forEach(([fieldName, value]) => {
                if (!value) return;
                
                // Check for photo fields (convert to object)
                try {
                    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
                    if (parsedValue && parsedValue.uri) {
                        photoUri = parsedValue.uri; 
                        return; 
                    }
                } catch (e) {
                    // If not a not a photo field, continue. 
                }
                
                // Check for location fields (convert to object)
                if (typeof value === 'string') {
                    try {
                        const locationData = JSON.parse(value);
                        
                        // Validate that location object has numeric coordinates
                        if (locationData && 
                            typeof locationData.latitude === 'number' && 
                            typeof locationData.longitude === 'number') {
                            
                            // Store the location coordinates in locationFields object and use fieldName as keys to match later
                            locationFields[fieldName] = {
                                coordinates: {
                                    latitude: locationData.latitude,
                                    longitude: locationData.longitude
                                }
                            };
                        }
                    } catch (e) {
                        // If not a location field, continue
                    }
                }
            });

            //Process all discovered location fields and create final location objects
            Object.entries(locationFields).forEach(([fieldName, locationData]) => {
                // Check if there's a custom name for this location field where if "Location" is a field, "Location Name" contains its name
                const customName = record.values?.[`${fieldName} Name`];
                // Create location object with all metadata (id, location name, coord, recordID fieldName, photoURL)
                extractedLocations.push({
                    id: `record-${record.id}-${fieldName}`,
                    location: customName || `Record ${record.id}`, // use recordID if no custom name
                    coordinates: locationData.coordinates,
                    recordId: record.id,
                    fieldName: fieldName,
                    hasCustomName: !!customName, 
                    photoUri: photoUri
                });
            });
        });
        
        return extractedLocations;
    };

    // Calculate map region based on locations
    const calculateMapRegion = (locations) => {
        if (locations.length === 0) {
            return {
                latitude: -27.49763309197018,
                longitude: 153.01291742634757,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
        }

        // Calculate bounds for multiple locations 
        const latitudes = locations.map(loc => loc.coordinates.latitude);
        const longitudes = locations.map(loc => loc.coordinates.longitude);
        
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        
        const latitudeDelta = (maxLat - minLat) * 1.1; // 10% padding for tighter view
        const longitudeDelta = (maxLng - minLng) * 1.1;
        
        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max(latitudeDelta, 0.007), 
            longitudeDelta: Math.max(longitudeDelta, 0.008),
        };
    };

    // Fetch records and extract locations
    const fetchRecordsAndLocations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!formId) {
                throw new Error("No formID avaliable");
            }

            const records = await getRecordsByFormId(formId);
            
            if (!records || !Array.isArray(records)) {
                throw new Error("Invalid response from server");
            }

            const extractedLocations = extractLocationsFromRecords(records);
            setLocations(extractedLocations);
            
            // Set initial region
            const initialRegion = calculateMapRegion(extractedLocations);
            region.current = initialRegion;
            
        } catch (error) {
            console.error("Error fetching records for map:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (formId) {
            fetchRecordsAndLocations();
        } else {
            setError("No formID avaliable");
            setLoading(false);
        }
    }, [formId]);

    const handleRefresh = () => {
        if (formId) {
            fetchRecordsAndLocations();
        }
    };

    const handleMarkerPress = (location) => {
        setSelectedLocation(location);
        
        // Find all locations with the same coordinates (within small tolerance)
        const sameCoordinateLocations = locations.filter(loc => 
            Math.abs(loc.coordinates.latitude - location.coordinates.latitude) < 0.0001 &&
            Math.abs(loc.coordinates.longitude - location.coordinates.longitude) < 0.0001
        );
        
        setLocationsAtSameCoordinate(sameCoordinateLocations);
        setCurrentCardIndex(sameCoordinateLocations.findIndex(loc => loc.id === location.id));
    };

    // Zoom functions
    const handleZoomIn = () => {
        if (mapRef.current && region.current) {
            const newRegion = {
                ...region.current,
                latitudeDelta: region.current.latitudeDelta / 2,
                longitudeDelta: region.current.longitudeDelta / 2
            };
            region.current = newRegion;
            mapRef.current.animateToRegion(newRegion, 350);
        }
    };

    const handleZoomOut = () => {
        if (mapRef.current && region.current) {
            const newRegion = {
                ...region.current,
                latitudeDelta: region.current.latitudeDelta * 2,
                longitudeDelta: region.current.longitudeDelta * 2
            };
            region.current = newRegion;
            mapRef.current.animateToRegion(newRegion, 350);
        }
    };

    // Handle region change to keep state in sync
    const handleRegionChange = (newRegion) => {
        region.current = newRegion;
    };

    // Handle card scroll
    const handleCardScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const cardWidth = event.nativeEvent.layoutMeasurement.width;
        const newIndex = Math.round(contentOffsetX / cardWidth);
        setCurrentCardIndex(newIndex);
        setSelectedLocation(locationsAtSameCoordinate[newIndex]);
    };

    const handleNextCard = () => {
        if (currentCardIndex < locationsAtSameCoordinate.length - 1) {
            const newIndex = currentCardIndex + 1;
            setCurrentCardIndex(newIndex);
            setSelectedLocation(locationsAtSameCoordinate[newIndex]);
            cardScrollRef.current?.scrollTo({ x: newIndex * 320, animated: true });
        }
    };

    const handlePrevCard = () => {
        if (currentCardIndex > 0) {
            const newIndex = currentCardIndex - 1;
            setCurrentCardIndex(newIndex);
            setSelectedLocation(locationsAtSameCoordinate[newIndex]);
            cardScrollRef.current?.scrollTo({ x: newIndex * 320, animated: true });
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background-base justify-center items-center">
                <ActivityIndicator size="large" color="#9395D3" />
                <Text className="text-text-navy mt-4 font-dmsans">Loading map data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 bg-background-base justify-center items-center px-5">
                <Text className="text-text-navy text-lg font-dmsans-bold mb-2 text-center">Error Loading Map</Text>
                <Text className="text-text-purple font-dmsans text-center mb-4">{error}</Text>
                <TouchableOpacity
                    className="bg-text-lilac px-6 py-3 rounded-full"
                    onPress={handleRefresh}
                >
                    <Text className="text-white font-dmsans-bold">Reload</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const hasLocations = locations.length > 0;
    const initialMapRegion = calculateMapRegion(locations);
    const hasMultipleRecords = locationsAtSameCoordinate.length > 1;

    return (
        <View className="flex-1 bg-background-base">
            <MapView
                ref={mapRef}
                style={{ flex: 1 }} 
                region={region.current || initialMapRegion}
                onRegionChangeComplete={handleRegionChange}
                showsCompass={true}
                zoomEnabled={true}
                zoomControlEnabled={true}
            >
                {hasLocations && locations.map(location => (
                    <Circle
                        key={location.id}
                        center={location.coordinates}
                        radius={200}
                        strokeWidth={2}
                        strokeColor="#FF6B6B"
                        fillColor="rgba(255, 107, 107, 0.3)"
                    />
                ))}
                
                {hasLocations && locations.map(location => (
                    <Marker
                        key={location.id}
                        coordinate={location.coordinates}
                        pinColor="#FF6B6B"
                        onPress={() => handleMarkerPress(location)}
                    />
                ))}
            </MapView>

            {/* Custom Zoom Controls */}
            <View className="absolute right-3 bottom-48 bg-white/90 rounded-xl shadow-lg border border-background-border">
                <TouchableOpacity
                    onPress={handleZoomIn}
                    className="px-4 py-3 border-b border-background-border items-center justify-center"
                >
                    <Text className="text-text-navy text-xl font-dmsans-bold">+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleZoomOut}
                    className="px-4 py-3 items-center justify-center"
                >
                    <Text className="text-text-navy text-xl font-dmsans-bold">-</Text>
                </TouchableOpacity>
            </View>

            {/* Selected Location Info Panel with Card Scroll */}
            {selectedLocation && (
                <View className="absolute bottom-5 left-3 right-3 bg-transparent">
                    {/* Scrollable Cards */}
                    <ScrollView
                        ref={cardScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={handleCardScroll}
                        contentContainerStyle={{ paddingHorizontal: 8 }}
                        decelerationRate="fast"
                        snapToInterval={320}
                        snapToAlignment="center"
                    >
                        {locationsAtSameCoordinate.map((location, index) => (
                            <View 
                                key={location.id} 
                                className="bg-white/95 p-4 rounded-xl shadow-lg border border-background-border mr-4"
                                style={{ width: 304 }}
                            >
                                <View className="flex-col">
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-1 mr-3">
                                            <Text className="text-text-navy font-dmsans-bold text-base mb-2">
                                                {location.location}
                                            </Text>
                                            <Text className="text-text-purple text-xs font-dmsans mb-1">
                                                Lat: {location.coordinates.latitude.toFixed(8)}
                                            </Text>
                                            <Text className="text-text-purple text-xs font-dmsans">
                                                Lng: {location.coordinates.longitude.toFixed(8)}
                                            </Text>
                                            {hasMultipleRecords && (
                                                <Text className="text-text-lilac text-xs font-dmsans-bold mt-1">
                                                    Record {index + 1} of {locationsAtSameCoordinate.length}
                                                </Text>
                                            )}
                                        </View>
                                        
                                        {location.photoUri && (
                                            <View className="ml-3">
                                                <Image
                                                    source={{ uri: location.photoUri }}
                                                    style={{ width: 80, height: 80, borderRadius: 4 }}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                        )}
                                    </View>
                                    
                                    <TouchableOpacity 
                                        onPress={() => {
                                            setSelectedLocation(null);
                                            setLocationsAtSameCoordinate([]);
                                            setCurrentCardIndex(0);
                                        }}
                                        className="py-2 bg-text-lilac rounded-lg items-center justify-center"
                                    >
                                        <Text className="text-white text-xs font-dmsans-bold">
                                            Close
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Header Info Panel */}
            <View className="absolute top-12 left-3 right-3 bg-white/95 p-4 rounded-xl shadow-lg border border-background-border">
                <Text className="text-text-navy text-base font-dmsans-bold mb-1">
                    {hasLocations ? 'Recorded Locations' : 'No Locations Recorded Yet'}
                </Text>
                <Text className="text-text-purple text-xs font-dmsans">
                    {hasLocations 
                        ? `${locations.length} Location${locations.length !== 1 ? 's' : ''} Recorded`
                        : 'Submit records with location fields to see them here'
                    }
                </Text>
                
                <View className="flex-row space-x-2 mt-2">
                    <TouchableOpacity 
                        onPress={handleRefresh}
                        className="flex-1 py-2 bg-background-secondary rounded-lg items-center justify-center"
                    >
                        <Text className="text-white text-xs font-dmsans-bold">
                            Refresh
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Overlay message when no locations */}
            {!hasLocations && !loading && (
                <View className="absolute top-2/5 left-5 right-5 bg-white/90 p-5 rounded-xl items-center shadow-lg border border-background-border">
                    <Text className="text-text-navy text-lg font-dmsans-bold mb-2 text-center">
                        No Locations Data Recorded Yet
                    </Text>
                    <Text className="text-text-purple font-dmsans text-center">
                        Submit records with location fields to see them here.
                    </Text>
                </View>
            )}
        </View>
    );
}