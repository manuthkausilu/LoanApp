// app/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function StartScreen() {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#1e3a8a', '#2563eb', '#3b82f6']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Animated Background Circles */}
      <View style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
      <View style={{ position: 'absolute', bottom: -150, left: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <Animated.View 
          style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingHorizontal: 24,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }}
        >
          {/* Logo/Icon */}
          <View style={{ 
            width: 120, 
            height: 120, 
            borderRadius: 60, 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: 32,
            borderWidth: 3,
            borderColor: 'rgba(255, 255, 255, 0.4)',
          }}>
            <Ionicons name="wallet" size={60} color="#fff" />
          </View>

          {/* Title */}
          <Text style={{ 
            fontSize: 42, 
            fontWeight: '800', 
            color: '#fff', 
            marginBottom: 12, 
            textAlign: 'center',
            letterSpacing: -1,
          }}>
            Loan System
          </Text>

          {/* Subtitle */}
          <Text style={{ 
            fontSize: 16, 
            color: '#e0f2fe', 
            textAlign: 'center',
            marginBottom: 48,
            lineHeight: 24,
          }}>
            Fast, secure, and hassle-free loan processing{'\n'}Get started in minutes
          </Text>

          {/* Feature Cards */}
          <View style={{ width: '100%', gap: 16 }}>
            {/* Apply Card */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/loan-form')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 8,
              }}
              activeOpacity={0.8}
            >
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: '#2563eb',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}>
                <Ionicons name="document-text" size={28} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e3a8a', marginBottom: 4 }}>
                  Apply for Loan
                </Text>
                <Text style={{ fontSize: 13, color: '#64748b' }}>
                  Quick application process • Get approved fast
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#2563eb" />
            </TouchableOpacity>

            {/* Manager Card */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/(auth)/login')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 8,
              }}
              activeOpacity={0.8}
            >
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: '#1e40af',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}>
                <Ionicons name="shield-checkmark" size={28} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e3a8a', marginBottom: 4 }}>
                  Manager Portal
                </Text>
                <Text style={{ fontSize: 13, color: '#64748b' }}>
                  Manage applications • Review & approve
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#1e40af" />
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={{ 
            marginTop: 48,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            width: '100%',
          }}>
            <View style={{ flexDirection: 'row', gap: 24, justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="flash" size={24} color="#fff" />
                <Text style={{ color: '#e0f2fe', fontSize: 12, marginTop: 4 }}>Fast</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="shield-checkmark" size={24} color="#fff" />
                <Text style={{ color: '#e0f2fe', fontSize: 12, marginTop: 4 }}>Secure</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="people" size={24} color="#fff" />
                <Text style={{ color: '#e0f2fe', fontSize: 12, marginTop: 4 }}>Trusted</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}
