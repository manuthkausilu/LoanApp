import { useAuth } from '@/context/AuthContext';
import { useLoan } from '@/context/LoanContext';
import { deleteLoanApplication, updateLoanApplication } from '@/service/loanService';
import { downloadPdfFromSupabase } from '@/service/storageService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoanListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { loans, loading, refreshLoans } = useLoan();
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState<any>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    telephone: '',
    occupation: '',
    monthlySalary: '',
  });

  useEffect(() => {
    if (!user) {
      router.replace('/(tabs)/(auth)/login');
      return;
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [user]);

  const handleViewDetails = (loan: any) => {
    if (!user) {
      Alert.alert('Unauthorized', 'Please login to view details');
      return;
    }
    setExpandedLoanId(prev => (prev === loan.id ? null : loan.id));
  };

  const handleEdit = (loan: any) => {
    if (!user) {
      Alert.alert('Unauthorized', 'Please login to edit applications');
      return;
    }
    setEditingLoan(loan);
    setEditForm({
      name: loan.name,
      email: loan.email,
      telephone: loan.telephone,
      occupation: loan.occupation,
      monthlySalary: loan.monthlySalary.toString(),
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingLoan) return;

    // Validation
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!editForm.email.trim()) {
      Alert.alert('Error', 'Please enter an email');
      return;
    }
    if (!editForm.telephone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    if (!editForm.occupation.trim()) {
      Alert.alert('Error', 'Please enter an occupation');
      return;
    }
    if (!editForm.monthlySalary.trim()) {
      Alert.alert('Error', 'Please enter a monthly salary');
      return;
    }

    const salary = parseFloat(editForm.monthlySalary);
    if (isNaN(salary) || salary <= 0) {
      Alert.alert('Error', 'Please enter a valid salary amount');
      return;
    }

    setSavingEdit(true);
    const result = await updateLoanApplication(editingLoan.id, {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      telephone: editForm.telephone.trim(),
      occupation: editForm.occupation.trim(),
      monthlySalary: salary,
    });

    setSavingEdit(false);

    if (result.success) {
      Alert.alert('Success', 'Application updated successfully');
      setEditModalVisible(false);
      setEditingLoan(null);
      refreshLoans();
    } else {
      Alert.alert('Error', result.error || 'Failed to update application');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!user) {
      Alert.alert('Unauthorized', 'Please login to delete applications');
      return;
    }
    Alert.alert(
      'Delete Application',
      `Are you sure you want to delete the application for "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteLoanApplication(id);
            if (result.success) {
              Alert.alert('Success', 'Application deleted successfully');
              setExpandedLoanId(null);
              refreshLoans();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete application');
            }
          },
        },
      ]
    );
  };

  const handleApprove = async (id: string) => {
    // Remove this function or keep for future use
    Alert.alert('Info', 'Status management has been removed');
  };

  const handleReject = async (id: string) => {
    // Remove this function or keep for future use
    Alert.alert('Info', 'Status management has been removed');
  };

  const getStatusColor = (status?: string) => {
    return '#3b82f6'; // Default color
  };

  const getStatusBgColor = (status?: string) => {
    return '#dbeafe'; // Default background
  };

  const handleViewPDF = async (url: string, name: string) => {
    if (!url) {
      Alert.alert('Error', 'No PDF URL available');
      return;
    }

    console.log('📱 Opening PDF viewer for:', name);
    console.log('🔗 URL:', url);

    try {
      // Ensure URL has protocol
      let finalUrl = url;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }

      console.log('✅ Navigating to PDF viewer with URL:', finalUrl);

      router.push({
        pathname: '/(tabs)/(auth)/(manager)/pdf-viewer',
        params: { url: finalUrl, name }
      });
    } catch (error) {
      console.error('❌ Error opening PDF viewer:', error);
      Alert.alert('Error', 'Failed to open PDF viewer');
    }
  };

  const handleDownloadPDF = async (url: string, loanName: string) => {
    if (!url) {
      Alert.alert('Error', 'No PDF URL available');
      return;
    }

    try {
      setDownloadingPdf(true);
      
      // Ensure URL has protocol
      let finalUrl = url;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }
      
      const fileName = `paysheet_${loanName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      
      console.log('📥 Downloading PDF...');
      console.log('🔗 URL:', finalUrl);
      console.log('💾 Filename:', fileName);

      const result = await downloadPdfFromSupabase(finalUrl, fileName);

      if (!result.success) {
        throw new Error(result.error || 'Download failed');
      }

      setDownloadingPdf(false);

      console.log('✅ Download successful:', result.uri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(result.uri!, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save or Share Paysheet',
          UTI: 'com.adobe.pdf'
        });
        Alert.alert('Success! 🎉', 'Paysheet downloaded successfully');
      } else {
        Alert.alert(
          'Success! 🎉', 
          'PDF downloaded to your device',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Download error:', error);
      setDownloadingPdf(false);
      Alert.alert('Download Error', error.message || 'Failed to download PDF');
    }
  };

  const toggleMenu = (loanId: string) => {
    setMenuVisible(prev => prev === loanId ? null : loanId);
  };

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
          <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 14, color: '#bfdbfe', fontWeight: '600', marginBottom: 4 }}>
                  Applications Management
                </Text>
                <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff' }}>
                  {loans.length} Applications
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.back()}
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
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshLoans} tintColor="#fff" />}
            showsVerticalScrollIndicator={false}
            onScroll={() => {
              // Close menu when scrolling
              if (menuVisible) setMenuVisible(null);
            }}
            scrollEventThrottle={16}
          >
            {loans.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 80 }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <Ionicons name="document-text-outline" size={40} color="#fff" />
                </View>
                <Text style={{ color: '#e0f2fe', fontSize: 18, fontWeight: '600' }}>No applications yet</Text>
                <Text style={{ color: '#bfdbfe', fontSize: 14, marginTop: 4 }}>Applications will appear here</Text>
              </View>
            ) : (
              loans.map((loan) => (
                <View key={loan.id} style={{ marginBottom: 16, zIndex: menuVisible === loan.id ? 1000 : 1 }}>
                  {/* Summary Card */}
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      borderRadius: expandedLoanId === loan.id ? 16 : 16,
                      borderBottomLeftRadius: expandedLoanId === loan.id ? 0 : 16,
                      borderBottomRightRadius: expandedLoanId === loan.id ? 0 : 16,
                      padding: 18,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      elevation: menuVisible === loan.id ? 10 : 5,
                      borderWidth: 1,
                      borderColor: expandedLoanId === loan.id ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 4 }}>
                          {loan.name}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748b' }}>{loan.occupation}</Text>
                      </View>
                      {/* Remove status badge */}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="mail-outline" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                      <Text style={{ color: '#64748b', fontSize: 13 }} numberOfLines={1}>{loan.email}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <Ionicons name="call-outline" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                      <Text style={{ color: '#64748b', fontSize: 13 }}>{loan.telephone}</Text>
                    </View>

                    <View style={{
                      backgroundColor: '#f1f5f9',
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 12,
                    }}>
                      <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Monthly Salary</Text>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: '#2563eb' }}>
                        LKR {loan.monthlySalary.toLocaleString()}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <TouchableOpacity 
                        onPress={() => handleViewDetails(loan)}
                        style={{ 
                          flex: 1,
                          backgroundColor: expandedLoanId === loan.id ? '#1e40af' : '#3b82f6', 
                          paddingVertical: 12, 
                          borderRadius: 8, 
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <Ionicons name={expandedLoanId === loan.id ? "chevron-up" : "eye-outline"} size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
                          {expandedLoanId === loan.id ? 'Hide' : 'View'}
                        </Text>
                      </TouchableOpacity>

                      {/* Three-dot menu button - FIXED */}
                      <View>
                        <TouchableOpacity 
                          onPress={() => toggleMenu(loan.id!)}
                          style={{ 
                            backgroundColor: menuVisible === loan.id ? '#475569' : '#64748b', 
                            paddingVertical: 12, 
                            paddingHorizontal: 16, 
                            borderRadius: 8, 
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Ionicons name="ellipsis-vertical" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Dropdown Menu - Outside the card, positioned below */}
                  {menuVisible === loan.id && (
                    <>
                      {/* Backdrop - Full screen overlay */}
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setMenuVisible(null)}
                        style={{
                          position: 'absolute',
                          top: -1000,
                          left: -1000,
                          right: -1000,
                          bottom: -1000,
                          zIndex: 999,
                        }}
                      />
                      
                      {/* Menu positioned below the card */}
                      <View style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 8,
                        backgroundColor: '#fff',
                        borderRadius: 14,
                        minWidth: 200,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.25,
                        shadowRadius: 20,
                        elevation: 20,
                        zIndex: 1000,
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                        overflow: 'hidden',
                      }}>
                        {/* Edit Option - Blue */}
                        <TouchableOpacity
                          onPress={() => {
                            setMenuVisible(null);
                            handleEdit(loan);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f1f5f9',
                            backgroundColor: 'transparent',
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: '#dbeafe',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                          }}>
                            <Ionicons name="create-outline" size={20} color="#3b82f6" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>
                              Edit
                            </Text>
                            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                              Modify application details
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* Delete Option - Red */}
                        <TouchableOpacity
                          onPress={() => {
                            setMenuVisible(null);
                            handleDelete(loan.id!, loan.name);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 16,
                            backgroundColor: 'transparent',
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: '#fee2e2',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                          }}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#dc2626' }}>
                              Delete
                            </Text>
                            <Text style={{ fontSize: 11, color: '#f87171', marginTop: 2 }}>
                              Remove permanently
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Expanded Detail Card */}
                  {expandedLoanId === loan.id && (
                    <View style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                      padding: 20,
                      borderWidth: 1,
                      borderTopWidth: 0,
                      borderColor: '#3b82f6',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      elevation: 5,
                    }}>
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        marginBottom: 20,
                        paddingBottom: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: '#e2e8f0',
                      }}>
                        <Ionicons name="information-circle" size={24} color="#3b82f6" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b' }}>
                          Full Details
                        </Text>
                      </View>

                      {/* Details Grid */}
                      {[
                        { icon: 'person-outline', label: 'Full Name', value: loan.name },
                        { icon: 'mail-outline', label: 'Email Address', value: loan.email },
                        { icon: 'call-outline', label: 'Phone Number', value: loan.telephone },
                        { icon: 'briefcase-outline', label: 'Occupation', value: loan.occupation },
                        { icon: 'cash-outline', label: 'Monthly Salary', value: `LKR ${loan.monthlySalary.toLocaleString()}` },
                      ].map(({ icon, label, value }, index) => (
                        <View key={index} style={{ marginBottom: 16 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                            <Ionicons name={icon as any} size={16} color="#64748b" style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {label}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 15, color: '#1e293b', fontWeight: '600', paddingLeft: 22 }}>
                            {value}
                          </Text>
                        </View>
                      ))}

                      {/* PDF Section */}
                      <View style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                          <Ionicons name="document-attach" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }}>
                            Paysheet Document
                          </Text>
                        </View>

                        {loan.paysheetUrl ? (
                          <>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                              <TouchableOpacity
                                onPress={() => handleViewPDF(loan.paysheetUrl, loan.name)}
                                style={{ 
                                  flex: 1,
                                  backgroundColor: '#3b82f6', 
                                  paddingVertical: 14, 
                                  borderRadius: 10, 
                                  alignItems: 'center',
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  gap: 8,
                                }}
                              >
                                <Ionicons name="eye" size={20} color="#fff" />
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>View PDF</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() => handleDownloadPDF(loan.paysheetUrl, loan.name)}
                                disabled={downloadingPdf}
                                style={{ 
                                  flex: 1,
                                  backgroundColor: downloadingPdf ? '#94a3b8' : '#1e40af', 
                                  paddingVertical: 14, 
                                  borderRadius: 10, 
                                  alignItems: 'center',
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  gap: 8,
                                }}
                              >
                                {downloadingPdf ? (
                                  <>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Downloading...</Text>
                                  </>
                                ) : (
                                  <>
                                    <Ionicons name="download" size={20} color="#fff" />
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Download</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            </View>

                            <View style={{
                              backgroundColor: '#eff6ff',
                              borderRadius: 8,
                              padding: 10,
                              borderWidth: 1,
                              borderColor: '#bfdbfe',
                            }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="checkmark-circle" size={16} color="#3b82f6" style={{ marginRight: 6 }} />
                                <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: '600', flex: 1 }}>
                                  PDF Document Available
                                </Text>
                              </View>
                            </View>
                          </>
                        ) : (
                          <View style={{ 
                            backgroundColor: '#fef2f2',
                            borderRadius: 10,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: '#fecaca',
                            alignItems: 'center',
                          }}>
                            <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#dc2626', marginTop: 8 }}>
                              No Paysheet Available
                            </Text>
                            <Text style={{ fontSize: 12, color: '#f87171', marginTop: 4, textAlign: 'center' }}>
                              This application doesn't have a paysheet document
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)', justifyContent: 'flex-end' }}>
            <View style={{ 
              backgroundColor: '#fff', 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24, 
              padding: 24, 
              maxHeight: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 20,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#1e293b' }}>
                  Edit Application
                </Text>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#f1f5f9',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="close" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Name */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
                    Full Name
                  </Text>
                  <TextInput
                    value={editForm.name}
                    onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      color: '#1e293b',
                    }}
                    placeholder="Enter full name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Email */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
                    Email Address
                  </Text>
                  <TextInput
                    value={editForm.email}
                    onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      color: '#1e293b',
                    }}
                    placeholder="Enter email"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Telephone */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
                    Phone Number
                  </Text>
                  <TextInput
                    value={editForm.telephone}
                    onChangeText={(text) => setEditForm({ ...editForm, telephone: text })}
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      color: '#1e293b',
                    }}
                    placeholder="Enter phone number"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Occupation */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
                    Occupation
                  </Text>
                  <TextInput
                    value={editForm.occupation}
                    onChangeText={(text) => setEditForm({ ...editForm, occupation: text })}
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      color: '#1e293b',
                    }}
                    placeholder="Enter occupation"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Monthly Salary */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
                    Monthly Salary (LKR)
                  </Text>
                  <TextInput
                    value={editForm.monthlySalary}
                    onChangeText={(text) => setEditForm({ ...editForm, monthlySalary: text })}
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      color: '#1e293b',
                    }}
                    placeholder="Enter monthly salary"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                  <TouchableOpacity
                    onPress={() => setEditModalVisible(false)}
                    disabled={savingEdit}
                    style={{
                      flex: 1,
                      backgroundColor: '#f1f5f9',
                      paddingVertical: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 15 }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveEdit}
                    disabled={savingEdit}
                    style={{
                      flex: 1,
                      backgroundColor: savingEdit ? '#94a3b8' : '#3b82f6',
                      paddingVertical: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {savingEdit && <ActivityIndicator size="small" color="#fff" />}
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}
