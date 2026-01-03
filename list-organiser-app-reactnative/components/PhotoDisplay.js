import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Photo display component using WebView. 
 * This component provides a photo display that handles various image formats
 * and URI structures within a WebView container. 
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {string|Object} props.photoData - Photo data containing URI or structured photo object
 * @returns {JSX.Element} WebView-based photo display with fallback and loading states
 */
export default function PhotoDisplay({ photoData }) {
    // Handle null or undefined photo data
    if (!photoData) {
        return (
            <View className="bg-gray-100 rounded-lg items-center justify-center p-8">
                <Text className="text-text-purple font-dmsans">No photo available</Text>
            </View>
        );
    }

    // Parse photo data to extract URI from various input formats
    let photoUri;
    try {
        const parsedData = typeof photoData === 'string' ? JSON.parse(photoData) : photoData;
        photoUri = parsedData.uri;
    } catch (e) {
        photoUri = photoData;
    }

    // HTML content for WebView with responsive image display
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
                background: transparent;
            }
            .photo-container {
                max-width: 100%;
                text-align: center;
            }
            .photo {
                max-width: 100%;
                max-height: 100vh;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .fallback {
                padding: 40px;
                color: #666;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            }
        </style>
    </head>
    <body>
        <div class="photo-container">
            ${photoUri ? 
                `<img src="${photoUri}" alt="Record Photo" class="photo" onerror="this.style.display='none'; document.getElementById('fallback').style.display='block';" />` 
                : ''
            }
            <div id="fallback" class="fallback" style="display: ${photoUri ? 'none' : 'block'}">
                <div style="font-size: 48px;">📷</div>
                <div style="margin-top: 16px; font-size: 16px;">Photo not available</div>
            </div>
        </div>
    </body>
    </html>
    `;

    return (
        <View style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}>
            <WebView
                style={{ flex: 1 }}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                startInLoadingState={true}
                renderLoading={() => (
                    <View className="flex-1 justify-center items-center bg-gray-50">
                        <ActivityIndicator size="large" color="#9395D3" />
                        <Text className="text-text-navy mt-4 font-dmsans">Loading photo...</Text>
                    </View>
                )}
                onError={(error) => console.error('WebView error:', error)}
            />
        </View>
    );
}