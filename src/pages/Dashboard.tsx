import { useState } from 'react';
import { useMeal } from '@/context/MealContext';
import StatCard from '@/components/StatCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UtensilsCrossed, Moon, Sun, Wallet, PiggyBank, TrendingUp, TrendingDown, HandCoins, Settings, ShoppingBag, Store, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { getTodayStats, getMonthlyStats, getShopBalance, members } = useMeal();
  const todayStats = getTodayStats();
  const shopBalance = getShopBalance();
  const activeMembers = members.filter(m => m.isActive).length;

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const monthlyStats = getMonthlyStats(selectedMonth, selectedYear);
  const totalAllExpenses = monthlyStats.totalExpenses + monthlyStats.totalExtraExpenses;
  const cashBalance = monthlyStats.totalDeposits - totalAllExpenses - monthlyStats.totalMaidPayments;

  const bengaliMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
                         'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  const toBengaliNumber = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return Math.round(num).toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
  };

  const formatTaka = (amount: number) => {
    const absAmount = Math.abs(amount);
    if (absAmount === 0) return '৳০';
    return `৳${toBengaliNumber(absAmount)}`;
  };

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear();

  // Generate year options (current year and previous 2 years)
  const yearOptions = [today.getFullYear(), today.getFullYear() - 1, today.getFullYear() - 2];

  return (
    <div>
      <h1 className="page-title">ড্যাশবোর্ড</h1>

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-2 mb-6 bg-card rounded-lg border border-border p-3">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft size={20} />
        </Button>
        
        <div className="flex items-center gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bengaliMonths.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>{toBengaliNumber(year)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight size={20} />
        </Button>
        
        {!isCurrentMonth && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedMonth(today.getMonth());
              setSelectedYear(today.getFullYear());
            }}
            className="ml-2"
          >
            এই মাস
          </Button>
        )}
      </div>

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
              <p className="text-sm text-muted-foreground">ক্যাশ ব্যালেন্স ({bengaliMonths[selectedMonth]})</p>
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

      {/* Shop Balance - বাবু মদি স্টোর */}
      <Link to="/shop-account">
        <div className={`rounded-xl p-4 mb-6 border-2 cursor-pointer hover:opacity-90 transition-opacity ${
          shopBalance.balance > 0 
            ? 'bg-destructive/10 border-destructive/30' 
            : 'bg-success/10 border-success/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                shopBalance.balance > 0 ? 'bg-destructive/20' : 'bg-success/20'
              }`}>
                <Store size={22} className={shopBalance.balance > 0 ? 'text-destructive' : 'text-success'} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">বাবু মদি স্টোর</p>
                <p className={`text-xl font-bold ${
                  shopBalance.balance > 0 ? 'text-destructive' : 'text-success'
                }`}>
                  {shopBalance.balance > 0 ? 'বাকি: ' : shopBalance.balance < 0 ? 'অগ্রিম: ' : ''}{formatTaka(shopBalance.balance)}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>বাজার: {formatTaka(shopBalance.totalPurchase)}</p>
              <p>জমা: {formatTaka(shopBalance.totalPayment)}</p>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Today's Stats - only show for current month */}
      {isCurrentMonth && (
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
      )}

      {/* Monthly Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">{bengaliMonths[selectedMonth]} {toBengaliNumber(selectedYear)} মাসের হিসাব</h2>
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
          <p>• {bengaliMonths[selectedMonth]} মাসের মিল রেট: <span className="text-foreground font-medium">{formatTaka(monthlyStats.mealRate)}</span></p>
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