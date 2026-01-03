import { useState } from 'react';
import { useMeal } from '@/context/MealContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const expenseItems = [
  'চাল', 'ডাল', 'মাছ', 'মুরগি', 'গরুর মাংস', 'সবজি', 
  'তেল', 'মশলা', 'গ্যাস', 'লবণ', 'পেঁয়াজ', 'রসুন', 
  'আলু', 'ডিম', 'অন্যান্য'
];

export default function Expenses() {
  const { expenses, extraExpenses, addExpense, removeExpense, addExtraExpense, removeExtraExpense } = useMeal();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Extra expense states
  const [extraDate, setExtraDate] = useState(new Date().toISOString().split('T')[0]);
  const [extraItem, setExtraItem] = useState('');
  const [extraAmount, setExtraAmount] = useState('');
  const [extraNote, setExtraNote] = useState('');
  const [expandedExtraDate, setExpandedExtraDate] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item || !amount) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }

    addExpense({
      date,
      item,
      amount: parseFloat(amount),
    });

    setItem('');
    setAmount('');
    toast.success('খরচ যোগ করা হয়েছে!');
  };

  const handleExtraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!extraItem || !extraAmount) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }

    addExtraExpense({
      date: extraDate,
      item: extraItem,
      amount: parseFloat(extraAmount),
      note: extraNote || undefined,
    });

    setExtraItem('');
    setExtraAmount('');
    setExtraNote('');
    toast.success('অতিরিক্ত বাজার যোগ করা হয়েছে!');
  };

  const toBengaliNumber = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return Math.round(num).toString().split('').map(d => {
      if (d === '-') return '-';
      if (d === '.') return '.';
      return bengaliDigits[parseInt(d)] || d;
    }).join('');
  };

  const formatTaka = (amount: number) => {
    if (amount === 0) return '৳০';
    return `৳${toBengaliNumber(amount)}`;
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('bn-BD', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long'
    });
  };

  // Group expenses by date
  const expensesByDate = expenses.reduce((acc, expense) => {
    if (!acc[expense.date]) {
      acc[expense.date] = [];
    }
    acc[expense.date].push(expense);
    return acc;
  }, {} as Record<string, typeof expenses>);

  // Sort dates in descending order
  const sortedDates = Object.keys(expensesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Group extra expenses by date
  const extraExpensesByDate = extraExpenses.reduce((acc, expense) => {
    if (!acc[expense.date]) {
      acc[expense.date] = [];
    }
    acc[expense.date].push(expense);
    return acc;
  }, {} as Record<string, typeof extraExpenses>);

  // Sort extra expense dates in descending order
  const sortedExtraDates = Object.keys(extraExpensesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // সব খরচের মোট (মাস ফিল্টার ছাড়া)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExtraExpenses = extraExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <h1 className="page-title">দৈনিক খরচ</h1>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <ShoppingCart size={18} />
            দৈনিক বাজার
          </TabsTrigger>
          <TabsTrigger value="extra" className="flex items-center gap-2">
            <ShoppingBag size={18} />
            অতিরিক্ত বাজার
          </TabsTrigger>
        </TabsList>

        {/* Daily Expenses Tab */}
        <TabsContent value="daily">
          {/* Add Expense Form */}
          <div className="bg-card rounded-lg border border-border p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">নতুন খরচ যোগ করুন</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">তারিখ</label>
                  <Input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="form-label">টাকার পরিমাণ</label>
                  <Input 
                    type="number" 
                    placeholder="০" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">আইটেম</label>
                <Select value={item} onValueChange={setItem}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="আইটেম নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseItems.map(i => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full h-12 text-lg">
                <Plus className="mr-2" size={20} />
                খরচ যোগ করুন
              </Button>
            </form>
          </div>

          {/* Total Summary */}
          <div className="bg-warning/10 rounded-lg border border-warning/20 p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">এই মাসের মোট বাজার খরচ</span>
              <span className="text-2xl font-bold text-warning">{formatTaka(totalExpenses)}</span>
            </div>
          </div>

          {/* Daily Expense List */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">তারিখভিত্তিক খরচ</h2>
            </div>

            <div className="divide-y divide-border">
              {sortedDates.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">কোনো খরচ নেই</p>
              ) : (
                sortedDates.map(dateKey => {
                  const dayExpenses = expensesByDate[dateKey];
                  const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                  const isExpanded = expandedDate === dateKey;
                  const isToday = dateKey === new Date().toISOString().split('T')[0];

                  return (
                    <div key={dateKey}>
                      {/* Date Row - Clickable */}
                      <button
                        onClick={() => setExpandedDate(isExpanded ? null : dateKey)}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Calendar size={24} className="text-warning" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold">{formatDate(dateKey)}</p>
                            <p className="text-sm text-muted-foreground">
                              {dayExpenses.length}টি আইটেম
                              {isToday && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">আজ</span>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-warning">{formatTaka(dayTotal)}</p>
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
                            {dayExpenses.map(expense => (
                              <div key={expense.id} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                                <span className="font-medium">{expense.item}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{formatTaka(expense.amount)}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeExpense(expense.id);
                                      toast.success('মুছে ফেলা হয়েছে');
                                    }}
                                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        {/* Extra Expenses Tab */}
        <TabsContent value="extra">
          {/* Add Extra Expense Form */}
          <div className="bg-card rounded-lg border border-border p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">অতিরিক্ত বাজার যোগ করুন</h2>
            <form onSubmit={handleExtraSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">তারিখ</label>
                  <Input 
                    type="date" 
                    value={extraDate}
                    onChange={(e) => setExtraDate(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="form-label">টাকার পরিমাণ</label>
                  <Input 
                    type="number" 
                    placeholder="০" 
                    value={extraAmount}
                    onChange={(e) => setExtraAmount(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">আইটেমের নাম</label>
                <Input 
                  type="text" 
                  placeholder="যেমন: বাড়তি চাল, বিশেষ মাছ ইত্যাদি" 
                  value={extraItem}
                  onChange={(e) => setExtraItem(e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label className="form-label">নোট (ঐচ্ছিক)</label>
                <Textarea 
                  placeholder="অতিরিক্ত তথ্য লিখুন..." 
                  value={extraNote}
                  onChange={(e) => setExtraNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg">
                <Plus className="mr-2" size={20} />
                অতিরিক্ত বাজার যোগ করুন
              </Button>
            </form>
          </div>

          {/* Extra Expense Total Summary */}
          <div className="bg-accent/10 rounded-lg border border-accent/20 p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">এই মাসের মোট অতিরিক্ত বাজার</span>
              <span className="text-2xl font-bold text-accent-foreground">{formatTaka(totalExtraExpenses)}</span>
            </div>
          </div>

          {/* Extra Expense List */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">তারিখভিত্তিক অতিরিক্ত বাজার</h2>
            </div>

            <div className="divide-y divide-border">
              {sortedExtraDates.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">কোনো অতিরিক্ত বাজার নেই</p>
              ) : (
                sortedExtraDates.map(dateKey => {
                  const dayExpenses = extraExpensesByDate[dateKey];
                  const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                  const isExpanded = expandedExtraDate === dateKey;
                  const isToday = dateKey === new Date().toISOString().split('T')[0];

                  return (
                    <div key={dateKey}>
                      {/* Date Row - Clickable */}
                      <button
                        onClick={() => setExpandedExtraDate(isExpanded ? null : dateKey)}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                            <ShoppingBag size={24} className="text-accent-foreground" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold">{formatDate(dateKey)}</p>
                            <p className="text-sm text-muted-foreground">
                              {dayExpenses.length}টি আইটেম
                              {isToday && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">আজ</span>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-accent-foreground">{formatTaka(dayTotal)}</p>
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
                            {dayExpenses.map(expense => (
                              <div key={expense.id} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                                <div>
                                  <span className="font-medium">{expense.item}</span>
                                  {expense.note && (
                                    <p className="text-sm text-muted-foreground mt-1">{expense.note}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{formatTaka(expense.amount)}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeExtraExpense(expense.id);
                                      toast.success('মুছে ফেলা হয়েছে');
                                    }}
                                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
