import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Loan } from '../types/Loan';
import { deletePdfFromSupabase, uploadPdfToSupabase } from './storageService';

const COLLECTION_NAME = 'loanApplications';

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  return auth.currentUser !== null;
};

export const createLoanApplication = async (
  data: Omit<Loan, 'id' | 'createdAt'>,
  pdfUri?: string,
  pdfFileName?: string
) => {
  try {
    console.log('Creating loan application with data:', data);
    let paysheetUrl = data.paysheetUrl;

    // Upload PDF to Supabase if provided
    if (pdfUri && pdfFileName) {
      console.log('Uploading PDF to Supabase...');
      console.log('PDF URI:', pdfUri);
      console.log('PDF File Name:', pdfFileName);
      
      const uploadResult = await uploadPdfToSupabase(pdfUri, pdfFileName);
      
      if (!uploadResult.success) {
        console.error('PDF upload failed:', uploadResult.error);
        return { 
          success: false, 
          error: uploadResult.error || 'Failed to upload PDF. Please try again.' 
        };
      }

      paysheetUrl = uploadResult.url;
      console.log('PDF uploaded successfully. Supabase URL:', paysheetUrl);
    }

    // Save to Firebase with Supabase URL
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name: data.name,
      email: data.email,
      telephone: data.telephone,
      occupation: data.occupation,
      monthlySalary: data.monthlySalary,
      paysheetUrl: paysheetUrl || null,
      createdAt: new Date(),
    });
    
    console.log('Loan application created with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error creating loan application:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create application' 
    };
  }
};

export const getAllLoanApplications = async (): Promise<Loan[]> => {
  if (!isAuthenticated()) {
    throw new Error('Unauthorized: Please login to view applications');
  }
  
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const loans = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        telephone: data.telephone,
        occupation: data.occupation,
        monthlySalary: data.monthlySalary,
        paysheetUrl: data.paysheetUrl || null,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Loan;
    });
    
    console.log(`Fetched ${loans.length} loan applications from Firebase`);
    return loans;
  } catch (error: any) {
    console.error('Error fetching loan applications:', error);
    throw new Error(error.message || 'Failed to fetch applications');
  }
};

export const updateLoanApplication = async (id: string, data: Partial<Loan>) => {
  if (!isAuthenticated()) {
    return { success: false, error: 'Unauthorized: Please login to update applications' };
  }
  
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
    console.log('Loan application updated:', id);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating loan application:', error);
    return { success: false, error: error.message || 'Failed to update application' };
  }
};

export const deleteLoanApplication = async (id: string) => {
  if (!isAuthenticated()) {
    return { success: false, error: 'Unauthorized: Please login to delete applications' };
  }
  
  try {
    // Get the document to find the PDF URL
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const loanDoc = querySnapshot.docs.find(d => d.id === id);
    
    // Delete PDF from Supabase if it exists
    if (loanDoc && loanDoc.data().paysheetUrl) {
      const paysheetUrl = loanDoc.data().paysheetUrl;
      console.log('Deleting PDF from Supabase:', paysheetUrl);
      await deletePdfFromSupabase(paysheetUrl); // Pass the URL, function will extract filename
    }
    
    // Delete the document from Firebase
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    console.log('Loan application deleted:', id);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting loan application:', error);
    return { success: false, error: error.message || 'Failed to delete application' };
  }
};