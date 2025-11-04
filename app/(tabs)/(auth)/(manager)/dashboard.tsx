import { useAuth } from '@/context/AuthContext';
import { useLoan } from '@/context/LoanContext';
import { logout } from '@/service/loginService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { loans, loading, refreshLoans } = useLoan();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Silently redirect if not authenticated
    if (!user) {
      router.replace('/(tabs)/(auth)/login');
      return;
    }
    
    refreshLoans();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [user]);

  const totalApplications = loans.length;

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              router.replace('/(tabs)/(auth)/login'); // Changed from '/'
            } else {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ icon, label, value, color, bgColor }: any) => (
    <View style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
      borderRadius: 20, 
      padding: 20, 
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.1)',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: bgColor,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
              <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748b' }}>
              {label}
            </Text>
          </View>
          <Text style={{ fontSize: 36, fontWeight: '800', color: color }}>
            {value}
          </Text>
        </View>
      </View>
    </View>
  );

  const ActionButton = ({ icon, label, color, bgColor, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.1)',
      }}
      activeOpacity={0.7}
    >
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
      }}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b', flex: 1 }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1e3a8a', '#2563eb', '#3b82f6']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background Decoration */}
      <View style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
      <View style={{ position: 'absolute', bottom: -150, left: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView 
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <View>
                  <Text style={{ fontSize: 14, color: '#bfdbfe', fontWeight: '600', marginBottom: 4 }}>
                    Welcome back 👋
                  </Text>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff' }}>
                    Dashboard
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={handleLogout}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Ionicons name="log-out-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Stats Section */}
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 }}>
                Overview
              </Text>

              <StatCard
                icon="document-text"
                label="Total Applications"
                value={totalApplications}
                color="#2563eb"
                bgColor="#dbeafe"
              />

              {/* Quick Actions */}
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 24, marginBottom: 16 }}>
                Quick Actions
              </Text>

              <ActionButton
                icon="list"
                label="View All Applications"
                color="#2563eb"
                bgColor="#dbeafe"
                onPress={() => router.push('/(tabs)/(auth)/(manager)/loan-list')}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}