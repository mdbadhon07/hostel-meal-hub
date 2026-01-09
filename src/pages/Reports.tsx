import { useMeal } from '@/context/MealContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import MemberMealsChart from '@/components/MemberMealsChart';

export default function Reports() {
  const { getMonthlyStats, getMemberSummaries } = useMeal();
  const monthlyStats = getMonthlyStats();
  const summaries = getMemberSummaries();

  const toBengaliNumber = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return Math.round(num).toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
  };

  const formatTaka = (amount: number) => {
    const absAmount = Math.abs(amount);
    if (absAmount === 0) return '৳০';
    return `৳${toBengaliNumber(absAmount)}`;
  };

  // Calculate total balance
  const totalBalance = monthlyStats.totalDeposits - monthlyStats.totalExpenses - monthlyStats.totalExtraExpenses - monthlyStats.totalMaidPayments;

  // Calculate total positive and negative balances
  const totalPositiveBalance = summaries
    .filter(s => s.balance > 0)
    .reduce((sum, s) => sum + s.balance, 0);
  
  const totalNegativeBalance = summaries
    .filter(s => s.balance < 0)
    .reduce((sum, s) => sum + Math.abs(s.balance), 0);

  return (
    <div>
      <h1 className="page-title">সর্বমোট রিপোর্ট</h1>

      {/* Member Meals Chart */}
      <MemberMealsChart />

      {/* Total Overview */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">সর্বমোট সারসংক্ষেপ</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">মোট মিল</p>
            <p className="text-2xl font-bold text-foreground">{monthlyStats.totalMeals}</p>
          </div>
          <div className="bg-warning/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">বাজার খরচ</p>
            <p className="text-2xl font-bold text-warning">{formatTaka(monthlyStats.totalExpenses)}</p>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">অতিরিক্ত বাজার</p>
            <p className="text-2xl font-bold text-purple-500">{formatTaka(monthlyStats.totalExtraExpenses)}</p>
          </div>
          <div className="bg-accent/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">বুয়ার টাকা</p>
            <p className="text-2xl font-bold text-accent-foreground">{formatTaka(monthlyStats.totalMaidPayments)}</p>
          </div>
          <div className="bg-success/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">মোট জমা</p>
            <p className="text-2xl font-bold text-success">{formatTaka(monthlyStats.totalDeposits)}</p>
          </div>
          <div className={`rounded-lg p-4 ${totalBalance >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <p className="text-sm text-muted-foreground">ক্যাশ ব্যালেন্স</p>
            <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalBalance >= 0 ? '+' : ''}{formatTaka(totalBalance)}
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 col-span-2">
            <p className="text-sm text-muted-foreground">মিল রেট</p>
            <p className="text-3xl font-bold text-primary">
              {formatTaka(monthlyStats.mealRate)}
              <span className="text-sm font-normal text-muted-foreground ml-2">/ মিল</span>
            </p>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">ব্যালেন্স সামারি</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success/10 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <TrendingUp className="text-success" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">মোট পাওনা</p>
                <p className="text-xl font-bold text-success">{formatTaka(totalPositiveBalance)}</p>
              </div>
            </div>
            <div className="bg-destructive/10 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <TrendingDown className="text-destructive" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">মোট বাকি</p>
                <p className="text-xl font-bold text-destructive">{formatTaka(totalNegativeBalance)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Summaries */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">সদস্যভিত্তিক হিসাব</h2>
          <p className="text-sm text-muted-foreground mt-1">প্রতি সদস্যের মিল, খরচ ও ব্যালেন্স</p>
        </div>
        
        {/* Table Header - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-8 gap-2 p-4 bg-muted text-sm font-semibold text-muted-foreground">
          <div className="col-span-2">নাম</div>
          <div className="text-center">মোট মিল</div>
          <div className="text-right">খরচ</div>
          <div className="text-right">জমা</div>
          <div className="text-right">ব্যালেন্স</div>
        </div>

        <div className="divide-y divide-border">
          {summaries.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">কোনো ডাটা নেই</p>
          ) : (
            summaries.map(summary => (
              <div key={summary.memberId} className="p-4">
                {/* Mobile Layout */}
                <div className="lg:hidden">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold text-lg">{summary.name}</p>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      summary.balance > 0 
                        ? 'bg-success/10 text-success' 
                        : summary.balance < 0 
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {summary.balance > 0 ? (
                        <TrendingUp size={14} />
                      ) : summary.balance < 0 ? (
                        <TrendingDown size={14} />
                      ) : (
                        <Minus size={14} />
                      )}
                      {summary.balance > 0 ? 'পাবে' : summary.balance < 0 ? 'দেবে' : 'সমান'}
                      <span className="ml-1">{formatTaka(summary.balance)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <p className="text-lg font-bold text-primary">{summary.totalMeals}</p>
                      <p className="text-xs text-muted-foreground">মোট মিল</p>
                    </div>
                    <div className="bg-warning/10 rounded-lg p-2">
                      <p className="text-lg font-bold text-warning">{formatTaka(summary.totalCost)}</p>
                      <p className="text-xs text-muted-foreground">খরচ</p>
                    </div>
                    <div className="bg-success/10 rounded-lg p-2">
                      <p className="text-lg font-bold text-success">{formatTaka(summary.totalDeposit)}</p>
                      <p className="text-xs text-muted-foreground">জমা</p>
                    </div>
                    <div className={`rounded-lg p-2 ${summary.balance >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                      <p className={`text-lg font-bold ${summary.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {summary.balance >= 0 ? '+' : ''}{formatTaka(summary.balance)}
                      </p>
                      <p className="text-xs text-muted-foreground">ব্যালেন্স</p>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-6 gap-2 items-center">
                  <div className="col-span-2 font-medium">{summary.name}</div>
                  <div className="text-center font-semibold text-primary">{summary.totalMeals}</div>
                  <div className="text-right text-warning">{formatTaka(summary.totalCost)}</div>
                  <div className="text-right text-success">{formatTaka(summary.totalDeposit)}</div>
                  <div className={`text-right font-semibold flex items-center justify-end gap-1 ${
                    summary.balance > 0 
                      ? 'text-success' 
                      : summary.balance < 0 
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                  }`}>
                    {summary.balance > 0 ? (
                      <TrendingUp size={14} />
                    ) : summary.balance < 0 ? (
                      <TrendingDown size={14} />
                    ) : null}
                    {summary.balance > 0 ? '+' : ''}{formatTaka(summary.balance)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="p-4 bg-muted/30 border-t border-border">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-muted-foreground">পাবে (অগ্রিম আছে)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-muted-foreground">দেবে (বাকি আছে)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
