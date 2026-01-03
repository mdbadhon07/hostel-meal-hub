export interface Member {
  id: string;
  name: string;
  isActive: boolean;
}

export interface DailyMeal {
  date: string;
  memberId: string;
  lunch: boolean;
  dinner: boolean;
  lunchCount?: number;  // Manual meal count
  dinnerCount?: number; // Manual meal count
}

export interface Expense {
  id: string;
  date: string;
  item: string;
  amount: number;
}

export interface Deposit {
  id: string;
  date: string;
  memberId: string;
  amount: number;
}

export interface MaidPayment {
  id: string;
  date: string;
  amount: number;
  paidBy?: string; // memberId who paid
  note?: string;
}

export interface MemberSummary {
  memberId: string;
  name: string;
  totalMeals: number;
  totalLunch: number;
  totalDinner: number;
  totalCost: number;
  totalDeposit: number;
  balance: number;
}
