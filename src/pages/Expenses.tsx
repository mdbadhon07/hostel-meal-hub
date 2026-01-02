import { useState } from 'react';
import { useMeal } from '@/context/MealContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const expenseItems = [
  'চাল', 'ডাল', 'মাছ', 'মুরগি', 'গরুর মাংস', 'সবজি', 
  'তেল', 'মশলা', 'গ্যাস', 'লবণ', 'পেঁয়াজ', 'রসুন', 
  'আলু', 'ডিম', 'অন্যান্য'
];

export default function Expenses() {
  const { members, expenses, addExpense, removeExpense } = useMeal();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const activeMembers = members.filter(m => m.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item || !amount || !paidBy) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }

    addExpense({
      date,
      item,
      amount: parseFloat(amount),
      paidBy,
    });

    setItem('');
    setAmount('');
    setPaidBy('');
    toast.success('খরচ যোগ করা হয়েছে!');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bn-BD', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id);
    return member?.name || 'অজানা';
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

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <h1 className="page-title">দৈনিক খরচ</h1>

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

          <div>
            <label className="form-label">কে দিয়েছে</label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="সদস্য নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {activeMembers.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
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
      <div className="bg-success/10 rounded-lg border border-success/20 p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">এই মাসের মোট খরচ</span>
          <span className="text-2xl font-bold text-success">৳{totalExpenses.toLocaleString('bn-BD')}</span>
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
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar size={24} className="text-primary" />
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
                      <p className="text-2xl font-bold text-primary">৳{dayTotal.toLocaleString('bn-BD')}</p>
                      <p className="text-xs text-muted-foreground">মোট খরচ</p>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
                        {dayExpenses.map(expense => (
                          <div key={expense.id} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                            <div>
                              <p className="font-medium">{expense.item}</p>
                              <p className="text-xs text-muted-foreground">{getMemberName(expense.paidBy)} দিয়েছে</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">৳{expense.amount.toLocaleString('bn-BD')}</span>
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
    </div>
  );
}
