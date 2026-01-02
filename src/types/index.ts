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
  paidBy: string;
}

export interface MemberSummary {
  memberId: string;
  name: string;
  totalMeals: number;
  totalLunch: number;
  totalDinner: number;
  totalCost: number;
  totalPaid: number;
  balance: number;
}
