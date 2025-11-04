import { loginWithEmail } from '@/service/loginService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    const result = await loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Login successful!');
      router.replace('/(tabs)/(auth)/(manager)/dashboard');
    } else {
      Alert.alert('Error', result.error || 'Invalid email or password');
    }
  };

  return (
    <LinearGradient
      colors={['#1e3a8a', '#1e40af', '#3b82f6']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Ionicons name="shield-checkmark" size={64} color="#fff" />
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 16 }}>
              Manager Login
            </Text>
            <Text style={{ fontSize: 16, color: '#bfdbfe', marginTop: 8 }}>
              Access the management portal
            </Text>
          </View>

          {/* Form */}
          <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Email Address
            </Text>
            <TextInput
              style={{ backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#d1d5db' }}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Password
            </Text>
            <TextInput
              style={{ backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: '#d1d5db' }}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{ backgroundColor: loading ? '#9ca3af' : '#3b82f6', borderRadius: 8, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#6b7280', fontSize: 14 }}>Back to Home</Text>
            </TouchableOpacity>
          </View>

          {/* Demo Credentials */}
          <View style={{ marginTop: 24, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 8, padding: 16 }}>
            <Text style={{ color: '#bfdbfe', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
              🔒 Authorized Personnel Only
            </Text>
            <Text style={{ color: '#e0f2fe', fontSize: 11, textAlign: 'center', marginTop: 4, opacity: 0.8 }}>
              This portal is restricted to verified staff members.{'\n'}
              Unauthorized access is prohibited and monitored.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
