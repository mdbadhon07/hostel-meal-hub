import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, DailyMeal, Expense, Deposit, MaidPayment, MemberSummary } from '@/types';

const STORAGE_KEY = 'mess-manager-data';

interface StoredData {
  members: Member[];
  meals: DailyMeal[];
  expenses: Expense[];
  deposits: Deposit[];
  maidPayments: MaidPayment[];
}

interface MealContextType {
  members: Member[];
  meals: DailyMeal[];
  expenses: Expense[];
  deposits: Deposit[];
  maidPayments: MaidPayment[];
  addMember: (name: string) => void;
  removeMember: (id: string) => void;
  toggleMemberStatus: (id: string) => void;
  updateMeal: (date: string, memberId: string, type: 'lunch' | 'dinner', value: boolean) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  addDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  removeDeposit: (id: string) => void;
  addMaidPayment: (payment: Omit<MaidPayment, 'id'>) => void;
  removeMaidPayment: (id: string) => void;
  getMealsForDate: (date: string) => DailyMeal[];
  getTodayStats: () => { lunch: number; dinner: number; total: number };
  getMonthlyStats: () => { totalMeals: number; totalExpenses: number; totalDeposits: number; totalMaidPayments: number; mealRate: number };
  getMemberSummaries: () => MemberSummary[];
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  clearAllData: () => void;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

const defaultMembers: Member[] = [
  { id: '1', name: 'রহিম উদ্দিন', isActive: true },
  { id: '2', name: 'করিম হোসেন', isActive: true },
  { id: '3', name: 'জামাল আহমেদ', isActive: true },
  { id: '4', name: 'সাইফুল ইসলাম', isActive: true },
  { id: '5', name: 'মাহমুদ হাসান', isActive: true },
  { id: '6', name: 'আব্দুল্লাহ আল মামুন', isActive: true },
  { id: '7', name: 'তানভীর রহমান', isActive: true },
  { id: '8', name: 'শাহরিয়ার কবির', isActive: true },
];

const loadFromStorage = (): StoredData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return null;
};

const saveToStorage = (data: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export function MealProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [meals, setMeals] = useState<DailyMeal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', date: '2026-01-01', item: 'চাল', amount: 3500 },
    { id: '2', date: '2026-01-01', item: 'মাছ', amount: 1200 },
    { id: '3', date: '2026-01-02', item: 'সবজি', amount: 800 },
  ]);
  const [deposits, setDeposits] = useState<Deposit[]>([
    { id: '1', date: '2026-01-01', memberId: '1', amount: 2000 },
    { id: '2', date: '2026-01-01', memberId: '2', amount: 1500 },
    { id: '3', date: '2026-01-02', memberId: '3', amount: 2000 },
  ]);
  const [maidPayments, setMaidPayments] = useState<MaidPayment[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setMembers(stored.members?.length > 0 ? stored.members : defaultMembers);
      setMeals(stored.meals || []);
      setExpenses(stored.expenses?.length > 0 ? stored.expenses : [
        { id: '1', date: '2026-01-01', item: 'চাল', amount: 3500 },
        { id: '2', date: '2026-01-01', item: 'মাছ', amount: 1200 },
        { id: '3', date: '2026-01-02', item: 'সবজি', amount: 800 },
      ]);
      setDeposits(stored.deposits?.length > 0 ? stored.deposits : [
        { id: '1', date: '2026-01-01', memberId: '1', amount: 2000 },
        { id: '2', date: '2026-01-01', memberId: '2', amount: 1500 },
        { id: '3', date: '2026-01-02', memberId: '3', amount: 2000 },
      ]);
      setMaidPayments(stored.maidPayments || []);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage({ members, meals, expenses, deposits, maidPayments });
    }
  }, [members, meals, expenses, deposits, maidPayments, isLoaded]);

  const addMember = (name: string) => {
    const newMember: Member = {
      id: Date.now().toString(),
      name,
      isActive: true,
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const toggleMemberStatus = (id: string) => {
    setMembers(members.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const updateMeal = (date: string, memberId: string, type: 'lunch' | 'dinner', value: boolean) => {
    const existingIndex = meals.findIndex(m => m.date === date && m.memberId === memberId);
    
    if (existingIndex >= 0) {
      const updated = [...meals];
      updated[existingIndex] = {
        ...updated[existingIndex],
        [type]: value,
      };
      setMeals(updated);
    } else {
      const newMeal: DailyMeal = {
        date,
        memberId,
        lunch: type === 'lunch' ? value : false,
        dinner: type === 'dinner' ? value : false,
      };
      setMeals([...meals, newMeal]);
    }
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const addDeposit = (deposit: Omit<Deposit, 'id'>) => {
    const newDeposit: Deposit = {
      ...deposit,
      id: Date.now().toString(),
    };
    setDeposits([...deposits, newDeposit]);
  };

  const removeDeposit = (id: string) => {
    setDeposits(deposits.filter(d => d.id !== id));
  };

  const addMaidPayment = (payment: Omit<MaidPayment, 'id'>) => {
    const newPayment: MaidPayment = {
      ...payment,
      id: Date.now().toString(),
    };
    setMaidPayments([...maidPayments, newPayment]);
  };

  const removeMaidPayment = (id: string) => {
    setMaidPayments(maidPayments.filter(p => p.id !== id));
  };

  const getMealsForDate = (date: string): DailyMeal[] => {
    return members.filter(m => m.isActive).map(member => {
      const existing = meals.find(m => m.date === date && m.memberId === member.id);
      return existing || { date, memberId: member.id, lunch: false, dinner: false };
    });
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter(m => m.date === today);
    const lunch = todayMeals.filter(m => m.lunch).length;
    const dinner = todayMeals.filter(m => m.dinner).length;
    return { lunch, dinner, total: lunch + dinner };
  };

  const getMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyMeals = meals.filter(m => {
      const mealDate = new Date(m.date);
      return mealDate.getMonth() === currentMonth && mealDate.getFullYear() === currentYear;
    });

    const totalMeals = monthlyMeals.reduce((acc, m) => {
      return acc + (m.lunch ? 1 : 0) + (m.dinner ? 1 : 0);
    }, 0);

    const monthlyExpenses = expenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    const totalExpenses = monthlyExpenses.reduce((acc, e) => acc + e.amount, 0);

    const monthlyDeposits = deposits.filter(d => {
      const depDate = new Date(d.date);
      return depDate.getMonth() === currentMonth && depDate.getFullYear() === currentYear;
    });

    const totalDeposits = monthlyDeposits.reduce((acc, d) => acc + d.amount, 0);

    const monthlyMaidPayments = maidPayments.filter(p => {
      const payDate = new Date(p.date);
      return payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear;
    });

    const totalMaidPayments = monthlyMaidPayments.reduce((acc, p) => acc + p.amount, 0);

    const mealRate = totalMeals > 0 ? totalExpenses / totalMeals : 0;

    return { totalMeals, totalExpenses, totalDeposits, totalMaidPayments, mealRate };
  };

  const getMemberSummaries = (): MemberSummary[] => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const { mealRate } = getMonthlyStats();

    return members.filter(m => m.isActive).map(member => {
      const memberMeals = meals.filter(m => {
        const mealDate = new Date(m.date);
        return m.memberId === member.id && 
               mealDate.getMonth() === currentMonth && 
               mealDate.getFullYear() === currentYear;
      });

      const totalLunch = memberMeals.filter(m => m.lunch).length;
      const totalDinner = memberMeals.filter(m => m.dinner).length;
      const totalMeals = totalLunch + totalDinner;
      const totalCost = totalMeals * mealRate;

      const memberDeposits = deposits.filter(d => {
        const depDate = new Date(d.date);
        return d.memberId === member.id && 
               depDate.getMonth() === currentMonth && 
               depDate.getFullYear() === currentYear;
      });

      const totalDeposit = memberDeposits.reduce((acc, d) => acc + d.amount, 0);
      const balance = totalDeposit - totalCost;

      return {
        memberId: member.id,
        name: member.name,
        totalMeals,
        totalLunch,
        totalDinner,
        totalCost,
        totalDeposit,
        balance,
      };
    });
  };

  const exportData = (): string => {
    const data: StoredData = {
      members,
      meals,
      expenses,
      deposits,
      maidPayments,
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString) as StoredData;
      if (data.members && data.meals && data.expenses && data.deposits && data.maidPayments) {
        setMembers(data.members);
        setMeals(data.meals);
        setExpenses(data.expenses);
        setDeposits(data.deposits);
        setMaidPayments(data.maidPayments);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  const clearAllData = () => {
    setMembers(defaultMembers);
    setMeals([]);
    setExpenses([]);
    setDeposits([]);
    setMaidPayments([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <MealContext.Provider value={{
      members,
      meals,
      expenses,
      deposits,
      maidPayments,
      addMember,
      removeMember,
      toggleMemberStatus,
      updateMeal,
      addExpense,
      removeExpense,
      addDeposit,
      removeDeposit,
      addMaidPayment,
      removeMaidPayment,
      getMealsForDate,
      getTodayStats,
      getMonthlyStats,
      getMemberSummaries,
      exportData,
      importData,
      clearAllData,
    }}>
      {children}
    </MealContext.Provider>
  );
}

export function useMeal() {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error('useMeal must be used within a MealProvider');
  }
  return context;
}
