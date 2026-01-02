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
import { Plus, Trash2 } from 'lucide-react';
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
    return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
  };

  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id);
    return member?.name || 'অজানা';
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group expenses by member
  const expensesByMember = activeMembers.map(member => {
    const memberExpenses = expenses.filter(e => e.paidBy === member.id);
    const total = memberExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { member, total };
  }).filter(m => m.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div>
      <h1 className="page-title">খরচ ব্যবস্থাপনা</h1>

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

      {/* Payment Summary */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">কে কত দিয়েছে</h2>
        <div className="space-y-2">
          {expensesByMember.map(({ member, total }) => (
            <div key={member.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="font-medium">{member.name}</span>
              <span className="text-primary font-bold">৳{total.toLocaleString('bn-BD')}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 font-bold text-lg">
            <span>মোট</span>
            <span className="text-success">৳{totalExpenses.toLocaleString('bn-BD')}</span>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b border-border">সাম্প্রতিক খরচ</h2>
        <div className="divide-y divide-border">
          {expenses.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">কোনো খরচ নেই</p>
          ) : (
            [...expenses].reverse().map(expense => (
              <div key={expense.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{expense.item}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getMemberName(expense.paidBy)} দিয়েছে
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">৳{expense.amount.toLocaleString('bn-BD')}</span>
                  <button
                    onClick={() => {
                      removeExpense(expense.id);
                      toast.success('খরচ মুছে ফেলা হয়েছে');
                    }}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
