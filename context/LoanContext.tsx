import { getAllLoanApplications } from '@/service/loanService';
import { Loan } from '@/types/Loan';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface LoanContextType {
  loans: Loan[];
  loading: boolean;
  refreshLoans: () => Promise<void>;
}

const LoanContext = createContext<LoanContextType>({
  loans: [],
  loading: true,
  refreshLoans: async () => {},
});

export const LoanProvider = ({ children }: { children: React.ReactNode }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshLoans = async () => {
    if (!user) {
      setLoans([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedLoans = await getAllLoanApplications();
      setLoans(fetchedLoans);
    } catch (error: any) {
      console.error('Error refreshing loans:', error);
      setLoans([]);
      // Don't show alert here as it might be called automatically
      if (error.message !== 'Unauthorized: Please login to view applications') {
        console.error('Unexpected error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshLoans();
    } else {
      setLoans([]);
      setLoading(false);
    }
  }, [user]);

  return (
    <LoanContext.Provider value={{ loans, loading, refreshLoans }}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoan = () => useContext(LoanContext);
