import { useRealtimeMeals } from '@/hooks/useRealtimeMeals';
import { Check, X, Clock, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RealtimeMealStatus() {
  const { members, meals, stats, getMealForMember, loading, refetch } = useRealtimeMeals();

  const toBengaliNumber = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const numStr = num.toString();
    return numStr.split('').map(d => {
      if (d === '.') return '.';
      const digit = parseInt(d);
      return isNaN(digit) ? d : bengaliDigits[digit];
    }).join('');
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const bdTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  const hours = bdTime.getHours();
  const isBeforeDeadline = hours < 22;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">আজকের মিল স্ট্যাটাস</h2>
            <p className="text-xs text-muted-foreground">
              {isBeforeDeadline ? (
                <span className="text-success flex items-center gap-1">
                  <Clock size={12} /> রাত ১০টার আগে মিল দেওয়া যাবে
                </span>
              ) : (
                <span className="text-destructive flex items-center gap-1">
                  <Clock size={12} /> মিল দেওয়ার সময় শেষ
                </span>
              )}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={refetch}>
          <RefreshCw size={18} />
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50">
        <div className="text-center">
          <p className="text-lg font-bold text-primary">{toBengaliNumber(stats.submittedCount)}</p>
          <p className="text-xs text-muted-foreground">জমা দিয়েছে</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{toBengaliNumber(stats.totalLunch)}</p>
          <p className="text-xs text-muted-foreground">দুপুর</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{toBengaliNumber(stats.totalDinner)}</p>
          <p className="text-xs text-muted-foreground">রাত</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-success">{toBengaliNumber(stats.totalMeals)}</p>
          <p className="text-xs text-muted-foreground">মোট মিল</p>
        </div>
      </div>

      {/* Member Status List */}
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {members.map((member) => {
          const meal = getMealForMember(member.id);
          const hasSubmitted = !!meal;
          const lunchCount = meal?.lunch_count || 0;
          const dinnerCount = meal?.dinner_count || 0;
          const totalMeal = lunchCount * 1 + dinnerCount * 0.5;

          return (
            <div 
              key={member.id} 
              className={`p-3 flex items-center justify-between ${
                hasSubmitted ? 'bg-success/5' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  hasSubmitted ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                }`}>
                  {hasSubmitted ? <Check size={16} /> : <X size={16} />}
                </div>
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  {hasSubmitted && meal?.submitted_at && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(meal.submitted_at).toLocaleTimeString('bn-BD', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {hasSubmitted ? (
                  <>
                    <div className="text-center">
                      <p className="text-sm font-medium">{toBengaliNumber(lunchCount)}</p>
                      <p className="text-xs text-muted-foreground">দুপুর</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{toBengaliNumber(dinnerCount)}</p>
                      <p className="text-xs text-muted-foreground">রাত</p>
                    </div>
                    <div className="text-center bg-primary/10 rounded px-2 py-1">
                      <p className="text-sm font-bold text-primary">{toBengaliNumber(totalMeal)}</p>
                      <p className="text-xs text-muted-foreground">মিল</p>
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                    জমা দেয়নি
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        {members.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            কোনো সক্রিয় সদস্য নেই
          </div>
        )}
      </div>
    </div>
  );
}
