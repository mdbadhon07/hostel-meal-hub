import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Check, Clock, Save, Utensils, LogOut, AlertTriangle } from 'lucide-react';

interface MemberData {
  id: string;
  name: string;
}

interface MealData {
  id?: string;
  lunch: boolean;
  dinner: boolean;
  lunch_count: number;
  dinner_count: number;
}

export default function MemberMealInput() {
  const { user, signOut } = useAuth();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mealData, setMealData] = useState<MealData>({
    lunch: false,
    dinner: false,
    lunch_count: 0,
    dinner_count: 0,
  });
  const [isBeforeDeadline, setIsBeforeDeadline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const today = new Date().toISOString().split('T')[0];

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check if before 10 PM Bangladesh time
      const bdTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
      const hours = bdTime.getHours();
      setIsBeforeDeadline(hours < 22);
    }, 60000);

    // Initial check
    const now = new Date();
    const bdTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    const hours = bdTime.getHours();
    setIsBeforeDeadline(hours < 22);

    return () => clearInterval(timer);
  }, []);

  // Fetch member data
  useEffect(() => {
    async function fetchMemberData() {
      if (!user) return;

      try {
        // Get member linked to this user
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('id, name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) throw memberError;

        if (memberData) {
          setMember(memberData);

          // Get today's meal
          const { data: mealDataDb, error: mealError } = await supabase
            .from('daily_meals')
            .select('*')
            .eq('member_id', memberData.id)
            .eq('date', today)
            .maybeSingle();

          if (mealError) throw mealError;

          if (mealDataDb) {
            setMealData({
              id: mealDataDb.id,
              lunch: mealDataDb.lunch,
              dinner: mealDataDb.dinner,
              lunch_count: mealDataDb.lunch_count,
              dinner_count: mealDataDb.dinner_count,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('ডেটা লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    }

    fetchMemberData();
  }, [user, today]);

  const handleMealToggle = (type: 'lunch' | 'dinner') => {
    if (!isBeforeDeadline) {
      toast.error('রাত ১০টার পরে মিল পরিবর্তন করা যাবে না');
      return;
    }

    setMealData(prev => {
      const newValue = !prev[type];
      const countField = type === 'lunch' ? 'lunch_count' : 'dinner_count';
      return {
        ...prev,
        [type]: newValue,
        [countField]: newValue ? 1 : 0,
      };
    });
  };

  const handleMealCountChange = (type: 'lunch' | 'dinner', value: string) => {
    if (!isBeforeDeadline) {
      toast.error('রাত ১০টার পরে মিল পরিবর্তন করা যাবে না');
      return;
    }

    const count = parseInt(value) || 0;
    const countField = type === 'lunch' ? 'lunch_count' : 'dinner_count';
    
    setMealData(prev => ({
      ...prev,
      [type]: count > 0,
      [countField]: Math.max(0, count),
    }));
  };

  const handleSave = async () => {
    if (!member || !isBeforeDeadline) {
      toast.error('রাত ১০টার পরে মিল সংরক্ষণ করা যাবে না');
      return;
    }

    setSaving(true);
    try {
      const mealPayload = {
        date: today,
        member_id: member.id,
        lunch: mealData.lunch,
        dinner: mealData.dinner,
        lunch_count: mealData.lunch_count,
        dinner_count: mealData.dinner_count,
        submitted_by: user?.id,
        submitted_at: new Date().toISOString(),
      };

      if (mealData.id) {
        // Update existing
        const { error } = await supabase
          .from('daily_meals')
          .update(mealPayload)
          .eq('id', mealData.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('daily_meals')
          .insert(mealPayload)
          .select()
          .single();

        if (error) throw error;
        
        setMealData(prev => ({ ...prev, id: data.id }));
      }

      toast.success('মিল সংরক্ষণ করা হয়েছে!');
    } catch (error: any) {
      console.error('Error saving meal:', error);
      if (error.message?.includes('row-level security')) {
        toast.error('রাত ১০টার পরে মিল সংরক্ষণ করা যাবে না');
      } else {
        toast.error('মিল সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const formatBanglaDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bn-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatBanglaTime = () => {
    return currentTime.toLocaleTimeString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-border p-6 text-center max-w-md w-full">
          <AlertTriangle className="mx-auto text-warning mb-4" size={48} />
          <h1 className="text-xl font-bold text-foreground mb-2">সদস্য অ্যাকাউন্ট নেই</h1>
          <p className="text-muted-foreground mb-4">
            আপনার অ্যাকাউন্ট এখনও কোনো সদস্যের সাথে সংযুক্ত করা হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="mr-2" size={18} />
            লগআউট
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-card rounded-lg border border-border p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Utensils className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-foreground">{member.name}</h1>
                <p className="text-sm text-muted-foreground">মেস ম্যানেজার</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="icon">
              <LogOut size={20} />
            </Button>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-card rounded-lg border border-border p-4 mb-4">
          <p className="text-lg font-semibold text-foreground text-center">
            {formatBanglaDate(today)}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">{formatBanglaTime()}</span>
          </div>
        </div>

        {/* Deadline Warning */}
        {!isBeforeDeadline && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-destructive" size={24} />
              <div>
                <p className="font-semibold text-destructive">সময় শেষ!</p>
                <p className="text-sm text-muted-foreground">
                  রাত ১০টার পরে মিল পরিবর্তন করা যাবে না
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meal Input */}
        <div className="bg-card rounded-lg border border-border p-4 mb-4">
          <h2 className="font-semibold text-foreground mb-4">আজকের মিল</h2>
          
          <div className="space-y-4">
            {/* Lunch */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">দুপুরের খাবার</p>
                <p className="text-sm text-muted-foreground">১ মিল</p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  value={mealData.lunch_count}
                  onChange={(e) => handleMealCountChange('lunch', e.target.value)}
                  className="w-16 h-12 text-center text-lg"
                  disabled={!isBeforeDeadline}
                />
                <button
                  onClick={() => handleMealToggle('lunch')}
                  disabled={!isBeforeDeadline}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                    mealData.lunch
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  } ${!isBeforeDeadline ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {mealData.lunch && <Check size={24} />}
                </button>
              </div>
            </div>

            {/* Dinner */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">রাতের খাবার</p>
                <p className="text-sm text-muted-foreground">০.৫ মিল</p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  value={mealData.dinner_count}
                  onChange={(e) => handleMealCountChange('dinner', e.target.value)}
                  className="w-16 h-12 text-center text-lg"
                  disabled={!isBeforeDeadline}
                />
                <button
                  onClick={() => handleMealToggle('dinner')}
                  disabled={!isBeforeDeadline}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                    mealData.dinner
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  } ${!isBeforeDeadline ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {mealData.dinner && <Check size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-primary/10 rounded-lg p-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">আজকের মোট মিল</p>
            <p className="text-3xl font-bold text-primary">
              {(mealData.lunch_count * 1) + (mealData.dinner_count * 0.5)}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          className="w-full py-6 text-lg" 
          size="lg"
          disabled={saving || !isBeforeDeadline}
        >
          {saving ? (
            'সংরক্ষণ হচ্ছে...'
          ) : (
            <>
              <Save className="mr-2" size={20} />
              সংরক্ষণ করুন
            </>
          )}
        </Button>

        {/* Info */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          প্রতিদিন রাত ১০টার মধ্যে মিল ইনপুট করুন
        </p>
      </div>
    </div>
  );
}
