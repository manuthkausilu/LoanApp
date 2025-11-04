import { useLoan } from '@/context/LoanContext';
import { createLoanApplication } from '@/service/loanService';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoanFormScreen() {
  const router = useRouter();
  const { refreshLoans } = useLoan();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telephone: '',
    occupation: '',
    monthlySalary: '',
  });
  const [pdfFile, setPdfFile] = useState<{ uri: string; name: string; size?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    telephone: '',
    occupation: '',
    monthlySalary: '',
    pdf: '',
  });

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Check file size (max 10MB)
        if (asset.size && asset.size > 10485760) {
          Alert.alert('Error', 'PDF file size must be less than 10MB');
          return;
        }

        setPdfFile({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
        });
        console.log('PDF selected:', asset.name, 'Size:', (asset.size! / 1024 / 1024).toFixed(2), 'MB');
        Alert.alert('Success', `PDF selected: ${asset.name}`);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRemovePDF = () => {
    Alert.alert(
      'Remove PDF',
      'Are you sure you want to remove this PDF?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setPdfFile(null),
        },
      ]
    );
  };

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 3) return 'Name must be at least 3 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters';
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    return '';
  };

  const validateTelephone = (phone: string): string => {
    if (!phone.trim()) return 'Phone number is required';
    
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    
    // Check if it has enough digits
    if (digitsOnly.length < 10) return 'Phone number must be at least 10 digits';
    if (digitsOnly.length > 15) return 'Phone number is too long';
    
    // Sri Lankan phone number validation
    if (phone.startsWith('+94') || phone.startsWith('0094')) {
      // Format: +94771234567 or 0094771234567
      if (digitsOnly.length !== 11) return 'Invalid Sri Lankan phone number (should be 11 digits including country code)';
    } else if (phone.startsWith('0')) {
      // Format: 0771234567
      if (digitsOnly.length !== 10) return 'Invalid Sri Lankan phone number (should be 10 digits)';
      
      // Check if it starts with valid Sri Lankan prefixes
      const prefix = digitsOnly.substring(1, 3);
      const validPrefixes = ['70', '71', '72', '74', '75', '76', '77', '78', '11', '21', '23', '24', '25', '26', '27', '31', '32', '33', '34', '35', '36', '37', '38', '41', '45', '47', '51', '52', '54', '55', '57', '63', '65', '66', '67', '81', '91'];
      if (!validPrefixes.includes(prefix)) {
        return 'Invalid Sri Lankan phone number prefix';
      }
    } else {
      // Must start with country code or 0
      return 'Phone number must start with +94, 0094, or 0';
    }
    
    // Check for valid characters (only digits, spaces, hyphens, parentheses, and + sign)
    const validFormat = /^[0-9+\s\-()]+$/;
    if (!validFormat.test(phone)) return 'Phone number can only contain digits, spaces, hyphens, parentheses, and +';
    
    return '';
  };

  const validateOccupation = (occupation: string): string => {
    if (!occupation.trim()) return 'Occupation is required';
    if (occupation.trim().length < 2) return 'Occupation must be at least 2 characters';
    return '';
  };

  const validateSalary = (salary: string): string => {
    if (!salary.trim()) return 'Monthly salary is required';
    const salaryNum = parseFloat(salary);
    if (isNaN(salaryNum)) return 'Please enter a valid number';
    if (salaryNum <= 0) return 'Salary must be greater than 0';
    if (salaryNum < 10000) return 'Salary seems too low (minimum LKR 10,000)';
    if (salaryNum > 10000000) return 'Salary seems too high (maximum LKR 10,000,000)';
    return '';
  };

  const validatePDF = (): string => {
    if (!pdfFile) return 'Paysheet PDF is required';
    if (pdfFile.size && pdfFile.size > 10485760) return 'PDF must be less than 10MB';
    return '';
  };

  // Real-time validation on blur
  const handleBlur = (field: string) => {
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(formData.name);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'telephone':
        error = validateTelephone(formData.telephone);
        break;
      case 'occupation':
        error = validateOccupation(formData.occupation);
        break;
      case 'monthlySalary':
        error = validateSalary(formData.monthlySalary);
        break;
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = async () => {
    console.log('Starting form validation...');
    
    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const telephoneError = validateTelephone(formData.telephone);
    const occupationError = validateOccupation(formData.occupation);
    const salaryError = validateSalary(formData.monthlySalary);
    const pdfError = validatePDF();

    // Update all errors
    setErrors({
      name: nameError,
      email: emailError,
      telephone: telephoneError,
      occupation: occupationError,
      monthlySalary: salaryError,
      pdf: pdfError,
    });

    // Check if any errors exist
    if (nameError || emailError || telephoneError || occupationError || salaryError || pdfError) {
      Alert.alert(
        'Validation Error',
        'Please fix all errors before submitting',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    console.log('Submitting application with data:', {
      name: formData.name.trim(),
      email: formData.email.trim(),
      telephone: formData.telephone.trim(),
      occupation: formData.occupation.trim(),
      monthlySalary: parseFloat(formData.monthlySalary),
      pdfFile: pdfFile ? pdfFile.name : 'No PDF',
    });

    try {
      const result = await createLoanApplication(
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          telephone: formData.telephone.trim(),
          occupation: formData.occupation.trim(),
          monthlySalary: parseFloat(formData.monthlySalary),
        },
        pdfFile?.uri,
        pdfFile?.name
      );

      console.log('Application result:', result);
      setLoading(false);

      if (result.success) {
        Alert.alert(
          'Success! 🎉',
          'Your loan application has been submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  name: '',
                  email: '',
                  telephone: '',
                  occupation: '',
                  monthlySalary: '',
                });
                setPdfFile(null);
                
                // Refresh loans list
                refreshLoans();
                
                // Navigate back
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit application. Please try again.');
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setLoading(false);
      Alert.alert('Error', error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#1e3a8a', '#1e40af', '#3b82f6']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name="document-text" size={40} color="#fff" />
              </View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
                Loan Application
              </Text>
              <Text style={{ fontSize: 14, color: '#bfdbfe', textAlign: 'center' }}>
                Fill in your details below
              </Text>
            </View>

            {/* Form */}
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 }}>
                Personal Information
              </Text>

              {/* Name with validation */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                Full Name *
              </Text>
              <TextInput
                style={{ 
                  backgroundColor: '#f9fafb', 
                  borderRadius: 10, 
                  paddingHorizontal: 16, 
                  paddingVertical: 12, 
                  fontSize: 15, 
                  marginBottom: errors.name ? 4 : 16, 
                  borderWidth: 1, 
                  borderColor: errors.name ? '#ef4444' : '#d1d5db' 
                }}
                placeholder="John Doe"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                onBlur={() => handleBlur('name')}
                editable={!loading}
              />
              {errors.name ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 12, color: '#ef4444' }}>{errors.name}</Text>
                </View>
              ) : null}

              {/* Email with validation */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                Email Address *
              </Text>
              <TextInput
                style={{ 
                  backgroundColor: '#f9fafb', 
                  borderRadius: 10, 
                  paddingHorizontal: 16, 
                  paddingVertical: 12, 
                  fontSize: 15, 
                  marginBottom: errors.email ? 4 : 16, 
                  borderWidth: 1, 
                  borderColor: errors.email ? '#ef4444' : '#d1d5db' 
                }}
                placeholder="john@example.com"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                onBlur={() => handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              {errors.email ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 12, color: '#ef4444' }}>{errors.email}</Text>
                </View>
              ) : null}

              {/* Telephone with validation */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                Phone Number *
              </Text>
              <View style={{ marginBottom: 4 }}>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 10, 
                    paddingHorizontal: 16, 
                    paddingVertical: 12, 
                    fontSize: 15, 
                    borderWidth: 1, 
                    borderColor: errors.telephone ? '#ef4444' : '#d1d5db' 
                  }}
                  placeholder="+94 77 123 4567 or 0771234567"
                  value={formData.telephone}
                  onChangeText={(text) => {
                    setFormData({ ...formData, telephone: text });
                    if (errors.telephone) setErrors({ ...errors, telephone: '' });
                  }}
                  onBlur={() => handleBlur('telephone')}
                  keyboardType="phone-pad"
                  editable={!loading}
                  maxLength={20}
                />
                <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4, marginLeft: 2 }}>
                  Format: +94771234567 or 0771234567
                </Text>
              </View>
              {errors.telephone ? (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, marginTop: 4 }}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 4, marginTop: 1 }} />
                  <Text style={{ fontSize: 12, color: '#ef4444', flex: 1 }}>{errors.telephone}</Text>
                </View>
              ) : (
                <View style={{ marginBottom: 12 }} />
              )}

              {/* Occupation with validation */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                Occupation *
              </Text>
              <TextInput
                style={{ 
                  backgroundColor: '#f9fafb', 
                  borderRadius: 10, 
                  paddingHorizontal: 16, 
                  paddingVertical: 12, 
                  fontSize: 15, 
                  marginBottom: errors.occupation ? 4 : 20, 
                  borderWidth: 1, 
                  borderColor: errors.occupation ? '#ef4444' : '#d1d5db' 
                }}
                placeholder="Software Engineer"
                value={formData.occupation}
                onChangeText={(text) => {
                  setFormData({ ...formData, occupation: text });
                  if (errors.occupation) setErrors({ ...errors, occupation: '' });
                }}
                onBlur={() => handleBlur('occupation')}
                editable={!loading}
              />
              {errors.occupation ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 12, color: '#ef4444' }}>{errors.occupation}</Text>
                </View>
              ) : null}

              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16, marginTop: 8 }}>
                Financial Information
              </Text>

              {/* Monthly Salary with validation */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                Monthly Salary (LKR) *
              </Text>
              <TextInput
                style={{ 
                  backgroundColor: '#f9fafb', 
                  borderRadius: 10, 
                  paddingHorizontal: 16, 
                  paddingVertical: 12, 
                  fontSize: 15, 
                  marginBottom: errors.monthlySalary ? 4 : 20, 
                  borderWidth: 1, 
                  borderColor: errors.monthlySalary ? '#ef4444' : '#d1d5db' 
                }}
                placeholder="50000"
                value={formData.monthlySalary}
                onChangeText={(text) => {
                  setFormData({ ...formData, monthlySalary: text });
                  if (errors.monthlySalary) setErrors({ ...errors, monthlySalary: '' });
                }}
                onBlur={() => handleBlur('monthlySalary')}
                keyboardType="numeric"
                editable={!loading}
              />
              {errors.monthlySalary ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 12, color: '#ef4444' }}>{errors.monthlySalary}</Text>
                </View>
              ) : null}

              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>
                Documents
              </Text>

              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                Paysheet PDF *
              </Text>
              
              {!pdfFile ? (
                <>
                  <TouchableOpacity
                    onPress={handlePickDocument}
                    disabled={loading}
                    style={{ 
                      backgroundColor: '#f9fafb', 
                      borderRadius: 10, 
                      paddingHorizontal: 16, 
                      paddingVertical: 16, 
                      marginBottom: errors.pdf ? 4 : 24, 
                      borderWidth: 2, 
                      borderStyle: 'dashed', 
                      borderColor: errors.pdf ? '#ef4444' : '#d1d5db', 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Ionicons name="cloud-upload-outline" size={24} color={errors.pdf ? '#ef4444' : '#3b82f6'} style={{ marginRight: 8 }} />
                    <Text style={{ color: errors.pdf ? '#ef4444' : '#6b7280', fontSize: 15, fontWeight: '500' }}>
                      Choose PDF file (Max 10MB)
                    </Text>
                  </TouchableOpacity>
                  {errors.pdf ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                      <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 12, color: '#ef4444' }}>{errors.pdf}</Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <View style={{ backgroundColor: '#eff6ff', borderRadius: 10, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#bfdbfe' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="document-text" size={24} color="#3b82f6" style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }} numberOfLines={1}>
                        {pdfFile.name}
                      </Text>
                      {pdfFile.size && (
                        <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={handleRemovePDF}
                      disabled={loading}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#fee2e2',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="close" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ backgroundColor: '#dbeafe', borderRadius: 8, padding: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={16} color="#3b82f6" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: '600' }}>
                      ✅ PDF ready to upload
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={{ backgroundColor: loading ? '#9ca3af' : '#3b82f6', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center' }}
              >
                {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                disabled={loading}
                style={{ alignItems: 'center', paddingVertical: 8 }}
              >
                <Text style={{ color: '#6b7280', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
