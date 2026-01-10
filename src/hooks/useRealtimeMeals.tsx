import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { playNotificationSound } from '@/lib/sounds';

export interface DailyMealRecord {
  id: string;
  date: string;
  member_id: string;
  lunch: boolean;
  dinner: boolean;
  lunch_count: number;
  dinner_count: number;
  submitted_by: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberRecord {
  id: string;
  name: string;
  email: string | null;
  user_id: string | null;
  is_active: boolean;
}

export function useRealtimeMeals(date?: string) {
  const [meals, setMeals] = useState<DailyMealRecord[]>([]);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<{ type: string; memberName: string } | null>(null);
  const isInitialLoad = useRef(true);

  const targetDate = date || new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Fetch meals for the date
      const { data: mealsData, error: mealsError } = await supabase
        .from('daily_meals')
        .select('*')
        .eq('date', targetDate);

      if (mealsError) throw mealsError;
      setMeals(mealsData || []);
    } catch (err: any) {
      console.error('Error fetching realtime data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [targetDate]);

  useEffect(() => {
    fetchData().then(() => {
      // Mark initial load as complete after first fetch
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 1000);
    });

    // Subscribe to realtime changes
    const channel: RealtimeChannel = supabase
      .channel('daily_meals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_meals',
          filter: `date=eq.${targetDate}`,
        },
        (payload) => {
          console.log('[Realtime] Meal change:', payload);
          
          // Find member name for the notification
          const getMemberName = (memberId: string) => {
            const member = members.find(m => m.id === memberId);
            return member?.name || 'সদস্য';
          };
          
          if (payload.eventType === 'INSERT') {
            setMeals((prev) => [...prev, payload.new as DailyMealRecord]);
            
            // Play sound only after initial load
            if (!isInitialLoad.current) {
              playNotificationSound();
              const memberName = getMemberName((payload.new as DailyMealRecord).member_id);
              setLastUpdate({ type: 'নতুন মিল জমা', memberName });
            }
          } else if (payload.eventType === 'UPDATE') {
            setMeals((prev) =>
              prev.map((m) =>
                m.id === (payload.new as DailyMealRecord).id
                  ? (payload.new as DailyMealRecord)
                  : m
              )
            );
            
            // Play sound for updates too
            if (!isInitialLoad.current) {
              playNotificationSound();
              const memberName = getMemberName((payload.new as DailyMealRecord).member_id);
              setLastUpdate({ type: 'মিল আপডেট', memberName });
            }
          } else if (payload.eventType === 'DELETE') {
            setMeals((prev) =>
              prev.filter((m) => m.id !== (payload.old as DailyMealRecord).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetDate, fetchData, members]);

  // Calculate stats
  const stats = {
    totalLunch: meals.reduce((sum, m) => sum + m.lunch_count, 0),
    totalDinner: meals.reduce((sum, m) => sum + m.dinner_count, 0),
    totalMeals: meals.reduce(
      (sum, m) => sum + m.lunch_count * 1 + m.dinner_count * 0.5,
      0
    ),
    submittedCount: meals.length,
    totalMembers: members.length,
  };

  // Get meal for a specific member
  const getMealForMember = (memberId: string) => {
    return meals.find((m) => m.member_id === memberId);
  };

  return {
    meals,
    members,
    loading,
    error,
    stats,
    getMealForMember,
    refetch: fetchData,
    lastUpdate,
  };
}
