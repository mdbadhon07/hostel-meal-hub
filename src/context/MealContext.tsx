import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Member, DailyMeal, Expense, MemberSummary } from '@/types';

interface MealContextType {
  members: Member[];
  meals: DailyMeal[];
  expenses: Expense[];
  addMember: (name: string) => void;
  removeMember: (id: string) => void;
  toggleMemberStatus: (id: string) => void;
  updateMeal: (date: string, memberId: string, type: 'lunch' | 'dinner', value: boolean) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  getMealsForDate: (date: string) => DailyMeal[];
  getTodayStats: () => { lunch: number; dinner: number; total: number };
  getMonthlyStats: () => { totalMeals: number; totalExpenses: number; mealRate: number };
  getMemberSummaries: () => MemberSummary[];
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

export function MealProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [meals, setMeals] = useState<DailyMeal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', date: '2026-01-01', item: 'চাল', amount: 3500, paidBy: '1' },
    { id: '2', date: '2026-01-01', item: 'মাছ', amount: 1200, paidBy: '2' },
    { id: '3', date: '2026-01-02', item: 'সবজি', amount: 800, paidBy: '3' },
  ]);

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
    const mealRate = totalMeals > 0 ? totalExpenses / totalMeals : 0;

    return { totalMeals, totalExpenses, mealRate };
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

      const memberExpenses = expenses.filter(e => {
        const expDate = new Date(e.date);
        return e.paidBy === member.id && 
               expDate.getMonth() === currentMonth && 
               expDate.getFullYear() === currentYear;
      });

      const totalPaid = memberExpenses.reduce((acc, e) => acc + e.amount, 0);
      const balance = totalPaid - totalCost;

      return {
        memberId: member.id,
        name: member.name,
        totalMeals,
        totalLunch,
        totalDinner,
        totalCost,
        totalPaid,
        balance,
      };
    });
  };

  return (
    <MealContext.Provider value={{
      members,
      meals,
      expenses,
      addMember,
      removeMember,
      toggleMemberStatus,
      updateMeal,
      addExpense,
      removeExpense,
      getMealsForDate,
      getTodayStats,
      getMonthlyStats,
      getMemberSummaries,
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
