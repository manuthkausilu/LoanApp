import * as FileSystem from 'expo-file-system/legacy';
import { S3_CONFIG, supabase } from './superbase';

const BUCKET_NAME = S3_CONFIG.bucketName;

/**
 * Upload PDF to Supabase S3 Storage
 * @param fileUri - Local file URI
 * @param fileName - Original file name
 * @returns Success status and public URL
 */
export const uploadPdfToSupabase = async (fileUri: string, fileName: string) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 Starting PDF Upload to Supabase S3');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📂 File URI:', fileUri);
    console.log('📝 File Name:', fileName);

    // Read file as base64
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('✅ File read successfully, length:', fileBase64.length);

    // Convert base64 to Uint8Array
    const binaryString = atob(fileBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;

    console.log('📝 Uploading as:', uniqueFileName);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFileName, bytes, {
        contentType: 'application/pdf',
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw new Error(error.message);
    }

    // Get public URL - Important: Use correct path
    const publicUrl = `${S3_CONFIG.projectRef}.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${uniqueFileName}`;
    const fullUrl = `https://${publicUrl}`;
    
    console.log('✅ Upload successful!');
    console.log('🔗 Public URL:', fullUrl);

    return {
      success: true,
      url: fullUrl,
      fileName: uniqueFileName,
      path: data.path,
    };
  } catch (error: any) {
    console.error('❌ Upload failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload PDF'
    };
  }
};

/**
 * Delete PDF from Supabase S3 Storage
 * @param paysheetUrl - Full URL or filename
 * @returns Success status
 */
export const deletePdfFromSupabase = async (paysheetUrl: string) => {
  try {
    console.log('🗑️  Deleting PDF from Supabase S3...');
    console.log('URL:', paysheetUrl);
    
    // Extract filename from URL
    const urlParts = paysheetUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    console.log('📝 Extracted filename:', fileName);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('❌ Delete error:', error);
      throw new Error(error.message);
    }

    console.log('✅ PDF deleted successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error deleting PDF:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete PDF'
    };
  }
};

/**
 * Download PDF from Supabase S3 Storage
 * @param url - Public URL of the PDF
 * @param fileName - Name to save the file as
 * @returns Success status and local file URI
 */
export const downloadPdfFromSupabase = async (url: string, fileName: string) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 Starting PDF Download from Supabase S3');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 URL:', url);
    console.log('📝 Filename:', fileName);
    
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    console.log('💾 Local path:', fileUri);
    
    console.log('\n🔄 Downloading...');
    const downloadResult = await FileSystem.downloadAsync(url, fileUri);

    if (downloadResult.status !== 200) {
      throw new Error(`Download failed with status: ${downloadResult.status}`);
    }

    console.log('✅ Download successful!');
    console.log('📂 Saved to:', downloadResult.uri);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      uri: downloadResult.uri
    };
  } catch (error: any) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Download Failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return {
      success: false,
      error: error.message || 'Failed to download PDF'
    };
  }
};

/**
 * Get file info from Supabase S3
 * @param fileName - Name of the file
 * @returns File information
 */
export const getFileInfo = async (fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        search: fileName
      });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, info: data };
  } catch (error: any) {
    console.error('Error getting file info:', error);
    return {
      success: false,
      error: error.message || 'Failed to get file info'
    };
  }
};

/**
 * Check if file exists in Supabase S3
 * @param fileName - Name of the file
 * @returns Boolean indicating if file exists
 */
export const fileExists = async (fileName: string): Promise<boolean> => {
  try {
    const { data } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        search: fileName
      });

    return data ? data.length > 0 : false;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};