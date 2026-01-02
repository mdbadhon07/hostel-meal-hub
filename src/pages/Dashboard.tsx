import { useMeal } from '@/context/MealContext';
import StatCard from '@/components/StatCard';
import { UtensilsCrossed, Moon, Sun, Wallet } from 'lucide-react';

export default function Dashboard() {
  const { getTodayStats, getMonthlyStats, members, expenses } = useMeal();
  const todayStats = getTodayStats();
  const monthlyStats = getMonthlyStats();
  const activeMembers = members.filter(m => m.isActive).length;

  const formatTaka = (amount: number) => {
    return `৳${amount.toLocaleString('bn-BD', { maximumFractionDigits: 2 })}`;
  };

  const today = new Date();
  const bengaliMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
                         'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const currentMonth = bengaliMonths[today.getMonth()];

  return (
    <div>
      <h1 className="page-title">ড্যাশবোর্ড</h1>
      
      {/* Today's Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">আজকের মিল</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            value={todayStats.lunch} 
            label="দুপুরের খাবার" 
            icon={<Sun size={28} />}
            variant="primary"
          />
          <StatCard 
            value={todayStats.dinner} 
            label="রাতের খাবার" 
            icon={<Moon size={28} />}
            variant="primary"
          />
          <StatCard 
            value={todayStats.total} 
            label="মোট মিল" 
            icon={<UtensilsCrossed size={28} />}
          />
          <StatCard 
            value={activeMembers} 
            label="সক্রিয় সদস্য" 
          />
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">{currentMonth} মাসের হিসাব</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            value={monthlyStats.totalMeals} 
            label="মোট মিল" 
            icon={<UtensilsCrossed size={28} />}
            variant="success"
          />
          <StatCard 
            value={formatTaka(monthlyStats.totalExpenses)} 
            label="মোট খরচ" 
            icon={<Wallet size={28} />}
            variant="warning"
          />
          <StatCard 
            value={formatTaka(monthlyStats.mealRate)} 
            label="মিল রেট" 
          />
          <StatCard 
            value={expenses.length} 
            label="মোট এন্ট্রি" 
          />
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">দ্রুত তথ্য</h2>
        <div className="space-y-3 text-muted-foreground">
          <p>• মোট সদস্য সংখ্যা: <span className="text-foreground font-medium">{members.length} জন</span></p>
          <p>• সক্রিয় সদস্য: <span className="text-foreground font-medium">{activeMembers} জন</span></p>
          <p>• এই মাসের মিল রেট: <span className="text-foreground font-medium">{formatTaka(monthlyStats.mealRate)}</span></p>
          <p>• প্রতি সদস্যের গড় মিল: <span className="text-foreground font-medium">
            {activeMembers > 0 ? (monthlyStats.totalMeals / activeMembers).toFixed(1) : 0}
          </span></p>
        </div>
      </div>
    </div>
  );
}
