export interface Loan {
  id?: string;
  name: string;
  email: string;
  telephone: string;
  occupation: string;
  monthlySalary: number;
  paysheetUrl?: string; // Supabase URL or Cloudinary URL
  createdAt?: Date;
}

export class LoanApplication implements Loan {
  id?: string;
  name: string;
  email: string;
  telephone: string;
  occupation: string;
  monthlySalary: number;
  paysheetUrl?: string;
  createdAt: Date;

  constructor(data: Omit<Loan, 'id' | 'createdAt'>) {
    this.name = data.name;
    this.email = data.email;
    this.telephone = data.telephone;
    this.occupation = data.occupation;
    this.monthlySalary = data.monthlySalary;
    this.paysheetUrl = data.paysheetUrl;
    this.createdAt = new Date();
  }
}
