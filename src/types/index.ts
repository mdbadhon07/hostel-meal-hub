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
