import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = 'https://fnmjbdvijyyvvoedlyus.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubWpiZHZpanl5dnZvZWRseXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDQzMTcsImV4cCI6MjA3Nzc4MDMxN30.5nQBptcssiKpeVNlFoBlQvIh2iJutyODEtgo6fm1FfA';
const SUPABASE_STORAGE_URL = 'https://fnmjbdvijyyvvoedlyus.storage.supabase.co/storage/v1/s3';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// S3 Bucket Configuration
export const S3_CONFIG = {
  bucketName: 'paysheets',
  storageUrl: SUPABASE_STORAGE_URL,
  projectRef: 'fnmjbdvijyyvvoedlyus',
};

// Helper function to ensure storage bucket exists and is configured
export const ensureStorageBucket = async () => {
  try {
    console.log('Checking if bucket exists...');
    const { data, error } = await supabase.storage.getBucket(S3_CONFIG.bucketName);
    
    if (error && error.message.includes('not found')) {
      console.log('Creating new bucket...');
      const { error: createError } = await supabase.storage.createBucket(S3_CONFIG.bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf']
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return { success: false, error: createError.message };
      }
      
      console.log('✅ Bucket created successfully');
      return { success: true, message: 'Bucket created successfully' };
    }
    
    if (error) {
      console.error('Error getting bucket:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Bucket already exists');
    return { success: true, message: 'Bucket already exists', data };
  } catch (error: any) {
    console.error('Error in ensureStorageBucket:', error);
    return { success: false, error: error.message };
  }
};

// Get public URL for a file
export const getPublicUrl = (fileName: string): string => {
  const { data } = supabase.storage
    .from(S3_CONFIG.bucketName)
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};

// List all files in bucket
export const listFiles = async () => {
  try {
    const { data, error } = await supabase.storage
      .from(S3_CONFIG.bucketName)
      .list();
    
    if (error) {
      console.error('Error listing files:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, files: data };
  } catch (error: any) {
    console.error('Error in listFiles:', error);
    return { success: false, error: error.message };
  }
};
