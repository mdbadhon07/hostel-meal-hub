import { useMeal } from '@/context/MealContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function Reports() {
  const { getMonthlyStats, getMemberSummaries } = useMeal();
  const monthlyStats = getMonthlyStats();
  const summaries = getMemberSummaries();

  const today = new Date();
  const bengaliMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
                         'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const currentMonth = bengaliMonths[today.getMonth()];

  const formatTaka = (amount: number) => {
    return `৳${Math.abs(amount).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div>
      <h1 className="page-title">{currentMonth} মাসের রিপোর্ট</h1>

      {/* Monthly Overview */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">মাসিক সারসংক্ষেপ</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">মোট মিল</p>
            <p className="text-2xl font-bold text-foreground">{monthlyStats.totalMeals}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">মোট খরচ</p>
            <p className="text-2xl font-bold text-foreground">{formatTaka(monthlyStats.totalExpenses)}</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 col-span-2">
            <p className="text-sm text-muted-foreground">মিল রেট</p>
            <p className="text-3xl font-bold text-primary">
              {formatTaka(monthlyStats.mealRate)}
              <span className="text-sm font-normal text-muted-foreground ml-2">/ মিল</span>
            </p>
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
        <div className="hidden lg:grid lg:grid-cols-7 gap-2 p-4 bg-muted text-sm font-semibold text-muted-foreground">
          <div className="col-span-2">নাম</div>
          <div className="text-center">দুপুর</div>
          <div className="text-center">রাত</div>
          <div className="text-center">মোট মিল</div>
          <div className="text-right">খরচ</div>
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
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-lg font-bold">{summary.totalLunch}</p>
                      <p className="text-xs text-muted-foreground">দুপুর</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-lg font-bold">{summary.totalDinner}</p>
                      <p className="text-xs text-muted-foreground">রাত</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-2">
                      <p className="text-lg font-bold text-primary">{summary.totalMeals}</p>
                      <p className="text-xs text-muted-foreground">মোট</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-lg font-bold">{formatTaka(summary.totalCost)}</p>
                      <p className="text-xs text-muted-foreground">খরচ</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between text-sm text-muted-foreground">
                    <span>দিয়েছে: {formatTaka(summary.totalPaid)}</span>
                    <span>খরচ: {formatTaka(summary.totalCost)}</span>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-7 gap-2 items-center">
                  <div className="col-span-2 font-medium">{summary.name}</div>
                  <div className="text-center">{summary.totalLunch}</div>
                  <div className="text-center">{summary.totalDinner}</div>
                  <div className="text-center font-semibold text-primary">{summary.totalMeals}</div>
                  <div className="text-right">{formatTaka(summary.totalCost)}</div>
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
