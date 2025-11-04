import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function PDFViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { url, name } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pdfUrl = Array.isArray(url) ? url[0] : url || '';
  const pdfName = Array.isArray(name) ? name[0] : name || 'Document';

  const getViewerUrl = () => {
    if (!pdfUrl) return '';
    
    console.log('🔍 Processing PDF URL:', pdfUrl);
    
    let finalUrl = pdfUrl;
    
    // Ensure URL has protocol
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }
    
    console.log('🌐 Final URL:', finalUrl);
    
    // Try direct URL first for Supabase
    if (finalUrl.includes('supabase.co')) {
      console.log('✅ Using Supabase URL directly');
      return finalUrl; // Try direct access first
    }
    
    // Use Google Docs Viewer as fallback
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(finalUrl)}&embedded=true`;
    console.log('📄 Using Google Docs Viewer:', viewerUrl);
    return viewerUrl;
  };

  const viewerUrl = getViewerUrl();

  const handleOpenInBrowser = async () => {
    try {
      if (!pdfUrl) {
        Alert.alert('Error', 'No PDF URL available');
        return;
      }

      let finalUrl = pdfUrl;
      
      // Handle Supabase URLs (they work directly)
      if (finalUrl.includes('supabase.co/storage')) {
        // Supabase URLs are already public and accessible
      } else if (finalUrl.includes('cloudinary.com')) {
        // Fix Cloudinary URL format
        if (finalUrl.includes('/image/upload/')) {
          finalUrl = finalUrl.replace('/image/upload/', '/raw/upload/');
        }
      }

      const supported = await Linking.canOpenURL(finalUrl);
      if (supported) {
        await Linking.openURL(finalUrl);
      } else {
        Alert.alert('Error', 'Cannot open this PDF link');
      }
    } catch (err) {
      console.error('Error opening PDF in browser:', err);
      Alert.alert('Error', 'Failed to open PDF in browser');
    }
  };

  if (!viewerUrl) {
    return (
      <LinearGradient colors={['#1e3a8a', '#2563eb', '#3b82f6']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Ionicons name="alert-circle-outline" size={64} color="#fff" />
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 16, marginBottom: 8 }}>
              No PDF URL Provided
            </Text>
            <Text style={{ fontSize: 14, color: '#bfdbfe', textAlign: 'center', marginBottom: 24 }}>
              Unable to load the PDF document
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1e3a8a', '#2563eb', '#3b82f6']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={{ 
          paddingHorizontal: 24, 
          paddingVertical: 16, 
          flexDirection: 'row', 
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#bfdbfe', marginBottom: 2 }}>
              Viewing Document
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }} numberOfLines={1}>
              {pdfName}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleOpenInBrowser}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="open-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* PDF Viewer */}
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {loading && !error && (
            <View style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              zIndex: 10,
            }}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ marginTop: 16, fontSize: 14, color: '#64748b' }}>
                Loading PDF...
              </Text>
              <Text style={{ marginTop: 8, fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 32 }}>
                This may take a moment for large files
              </Text>
            </View>
          )}

          {error ? (
            <View style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: 24,
              backgroundColor: '#f8fafc',
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#fee2e2',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name="alert-circle" size={40} color="#ef4444" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 8 }}>
                Failed to Load PDF
              </Text>
              <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
                The PDF could not be loaded. Try opening it in your browser.
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    backgroundColor: '#f1f5f9',
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: '#64748b', fontSize: 15, fontWeight: '600' }}>
                    Go Back
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleOpenInBrowser}
                  style={{
                    backgroundColor: '#3b82f6',
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                    Open in Browser
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <WebView
              source={{ uri: viewerUrl }}
              style={{ flex: 1, backgroundColor: '#fff' }}
              onLoad={() => {
                console.log('✅ PDF loaded successfully');
                setLoading(false);
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('❌ WebView error:', nativeEvent);
                setError(true);
                setLoading(false);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('❌ HTTP error:', nativeEvent.statusCode);
                if (nativeEvent.statusCode >= 400) {
                  setError(true);
                }
              }}
              startInLoadingState={true}
              scalesPageToFit={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              allowFileAccessFromFileURLs={true}
              mixedContentMode="always"
              originWhitelist={['*']}
              onShouldStartLoadWithRequest={() => true}
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
