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
import { Plus, Trash2, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';
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
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

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
    return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
  };

  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id);
    return member?.name || 'অজানা';
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Get detailed payment history per member
  const getMemberPaymentDetails = (memberId: string) => {
    return expenses
      .filter(e => e.paidBy === memberId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Group expenses by member with totals
  const memberPaymentSummaries = activeMembers.map(member => {
    const memberExpenses = expenses.filter(e => e.paidBy === member.id);
    const total = memberExpenses.reduce((sum, e) => sum + e.amount, 0);
    const paymentCount = memberExpenses.length;
    return { member, total, paymentCount, expenses: memberExpenses };
  }).sort((a, b) => b.total - a.total);

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

      {/* Member Payment Details - NEW SECTION */}
      <div className="bg-card rounded-lg border border-border overflow-hidden mb-6">
        <div className="p-4 border-b border-border bg-primary/5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User size={20} className="text-primary" />
            সদস্যভিত্তিক জমার বিবরণ
          </h2>
          <p className="text-sm text-muted-foreground mt-1">কোন সদস্য কবে কত টাকা দিয়েছে</p>
        </div>

        <div className="divide-y divide-border">
          {memberPaymentSummaries.map(({ member, total, paymentCount }) => {
            const isExpanded = expandedMember === member.id;
            const payments = getMemberPaymentDetails(member.id);

            return (
              <div key={member.id} className="bg-background">
                {/* Member Header - Clickable */}
                <button
                  onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {paymentCount > 0 ? `${paymentCount}টি জমা` : 'কোনো জমা নেই'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        ৳{total.toLocaleString('bn-BD')}
                      </p>
                      <p className="text-xs text-muted-foreground">মোট জমা</p>
                    </div>
                    {paymentCount > 0 && (
                      isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Payment History */}
                {isExpanded && payments.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
                      <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-xs font-semibold text-muted-foreground">
                        <div className="col-span-4">তারিখ</div>
                        <div className="col-span-5">আইটেম</div>
                        <div className="col-span-3 text-right">টাকা</div>
                      </div>
                      <div className="divide-y divide-border">
                        {payments.map((payment, index) => {
                          // Calculate running total
                          const runningTotal = payments
                            .slice(index)
                            .reduce((sum, p) => sum + p.amount, 0);
                          
                          return (
                            <div key={payment.id} className="grid grid-cols-12 gap-2 p-3 items-center text-sm">
                              <div className="col-span-4 flex items-center gap-1 text-muted-foreground">
                                <Calendar size={12} />
                                {formatShortDate(payment.date)}
                              </div>
                              <div className="col-span-5 font-medium">{payment.item}</div>
                              <div className="col-span-3 text-right font-semibold text-primary">
                                ৳{payment.amount.toLocaleString('bn-BD')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Total Row */}
                      <div className="grid grid-cols-12 gap-2 p-3 bg-primary/10 font-semibold">
                        <div className="col-span-9">মোট জমা</div>
                        <div className="col-span-3 text-right text-primary">
                          ৳{total.toLocaleString('bn-BD')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <div className="p-4 bg-success/10 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="font-semibold">সর্বমোট জমা</span>
            <span className="text-2xl font-bold text-success">৳{totalExpenses.toLocaleString('bn-BD')}</span>
          </div>
        </div>
      </div>

      {/* Recent Expense List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b border-border">সাম্প্রতিক খরচ</h2>
        <div className="divide-y divide-border">
          {expenses.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">কোনো খরচ নেই</p>
          ) : (
            [...expenses].reverse().slice(0, 10).map(expense => (
              <div key={expense.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{expense.item}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {formatShortDate(expense.date)}
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
