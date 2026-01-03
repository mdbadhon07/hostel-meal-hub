import { useMeal } from '@/context/MealContext';
import StatCard from '@/components/StatCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Moon, Sun, Wallet, PiggyBank, TrendingUp, TrendingDown, HandCoins, Settings, ShoppingBag } from 'lucide-react';

export default function Dashboard() {
  const { getTodayStats, getMonthlyStats, members } = useMeal();
  const todayStats = getTodayStats();
  const monthlyStats = getMonthlyStats();
  const activeMembers = members.filter(m => m.isActive).length;
  const totalAllExpenses = monthlyStats.totalExpenses + monthlyStats.totalExtraExpenses;
  const cashBalance = monthlyStats.totalDeposits - totalAllExpenses - monthlyStats.totalMaidPayments;

  const formatTaka = (amount: number) => {
    return `৳${Math.abs(amount).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}`;
  };

  const today = new Date();
  const bengaliMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
                         'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const currentMonth = bengaliMonths[today.getMonth()];

  return (
    <div>
      <h1 className="page-title">ড্যাশবোর্ড</h1>

      {/* Cash Balance Highlight */}
      <div className={`rounded-xl p-5 mb-6 border-2 ${
        cashBalance >= 0 
          ? 'bg-success/10 border-success/30' 
          : 'bg-destructive/10 border-destructive/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              cashBalance >= 0 ? 'bg-success/20' : 'bg-destructive/20'
            }`}>
              {cashBalance >= 0 ? (
                <TrendingUp size={28} className="text-success" />
              ) : (
                <TrendingDown size={28} className="text-destructive" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ক্যাশ ব্যালেন্স</p>
              <p className={`text-3xl font-bold ${
                cashBalance >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {cashBalance >= 0 ? '+' : '-'}{formatTaka(cashBalance)}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>জমা: <span className="text-success font-medium">{formatTaka(monthlyStats.totalDeposits)}</span></p>
            <p>বাজার: <span className="text-warning font-medium">{formatTaka(monthlyStats.totalExpenses)}</span></p>
            <p>অতিরিক্ত: <span className="text-purple-500 font-medium">{formatTaka(monthlyStats.totalExtraExpenses)}</span></p>
            <p>বুয়া: <span className="text-accent font-medium">{formatTaka(monthlyStats.totalMaidPayments)}</span></p>
          </div>
        </div>
      </div>
      
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
            variant="primary"
          />
          <StatCard 
            value={formatTaka(monthlyStats.totalExpenses)} 
            label="বাজার খরচ" 
            icon={<Wallet size={28} />}
            variant="warning"
          />
          <StatCard 
            value={formatTaka(monthlyStats.totalExtraExpenses)} 
            label="অতিরিক্ত বাজার" 
            icon={<ShoppingBag size={28} />}
            variant="primary"
          />
          <StatCard 
            value={formatTaka(monthlyStats.totalDeposits)} 
            label="মোট জমা" 
            icon={<PiggyBank size={28} />}
            variant="success"
          />
          <StatCard 
            value={formatTaka(monthlyStats.totalMaidPayments)} 
            label="বুয়ার টাকা" 
            icon={<HandCoins size={28} />}
            variant="accent"
          />
          <StatCard 
            value={formatTaka(monthlyStats.mealRate)} 
            label="মিল রেট" 
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
        
        <div className="mt-4 pt-4 border-t border-border">
          <Link to="/settings">
            <Button variant="outline" className="gap-2">
              <Settings size={18} />
              সেটিংস ও ব্যাকআপ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
