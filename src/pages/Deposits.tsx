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
import { Plus, Trash2, ChevronDown, ChevronUp, User, Calendar, Wallet, HandCoins } from 'lucide-react';
import { toast } from 'sonner';

export default function Deposits() {
  const { members, deposits, maidPayments, addDeposit, removeDeposit, addMaidPayment, removeMaidPayment } = useMeal();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  // Maid payment states
  const [maidDate, setMaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [maidAmount, setMaidAmount] = useState('');
  const [maidPaidBy, setMaidPaidBy] = useState('');
  const [maidNote, setMaidNote] = useState('');

  const activeMembers = members.filter(m => m.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberId || !amount) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }

    addDeposit({
      date,
      memberId,
      amount: parseFloat(amount),
    });

    setMemberId('');
    setAmount('');
    toast.success('জমা যোগ করা হয়েছে!');
  };

  const handleMaidPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!maidAmount) {
      toast.error('টাকার পরিমাণ দিন');
      return;
    }

    addMaidPayment({
      date: maidDate,
      amount: parseFloat(maidAmount),
      paidBy: maidPaidBy || undefined,
      note: maidNote || undefined,
    });

    setMaidAmount('');
    setMaidPaidBy('');
    setMaidNote('');
    toast.success('বুয়ার টাকা যোগ করা হয়েছে!');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bn-BD', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id);
    return member?.name || 'অজানা';
  };

  // Get deposits for a member
  const getMemberDeposits = (memberId: string) => {
    return deposits
      .filter(d => d.memberId === memberId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Member deposit summaries
  const memberDepositSummaries = activeMembers.map(member => {
    const memberDeposits = deposits.filter(d => d.memberId === member.id);
    const total = memberDeposits.reduce((sum, d) => sum + d.amount, 0);
    return { member, total, count: memberDeposits.length };
  }).sort((a, b) => b.total - a.total);

  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalMaidPayments = maidPayments.reduce((sum, p) => sum + p.amount, 0);
  const sortedMaidPayments = [...maidPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <h1 className="page-title">টাকা জমা</h1>

      {/* Add Deposit Form */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">নতুন জমা যোগ করুন</h2>
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
            <label className="form-label">সদস্যের নাম</label>
            <Select value={memberId} onValueChange={setMemberId}>
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
            জমা যোগ করুন
          </Button>
        </form>
      </div>

      {/* Total Summary */}
      <div className="bg-success/10 rounded-lg border border-success/20 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="text-success" size={24} />
            <span className="font-medium text-foreground">মোট জমা</span>
          </div>
          <span className="text-2xl font-bold text-success">৳{totalDeposits.toLocaleString('bn-BD')}</span>
        </div>
      </div>

      {/* Member Deposit Details */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-primary/5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User size={20} className="text-primary" />
            সদস্যভিত্তিক জমার বিবরণ
          </h2>
          <p className="text-sm text-muted-foreground mt-1">কোন সদস্য কবে কত টাকা জমা দিয়েছে</p>
        </div>

        <div className="divide-y divide-border">
          {memberDepositSummaries.map(({ member, total, count }) => {
            const isExpanded = expandedMember === member.id;
            const memberDeposits = getMemberDeposits(member.id);

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
                        {count > 0 ? `${count}বার জমা দিয়েছে` : 'কোনো জমা নেই'}
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
                    {count > 0 && (
                      isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Deposit History */}
                {isExpanded && memberDeposits.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
                      <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-xs font-semibold text-muted-foreground">
                        <div className="col-span-6">তারিখ</div>
                        <div className="col-span-6 text-right">টাকা</div>
                      </div>
                      <div className="divide-y divide-border">
                        {memberDeposits.map((deposit) => (
                          <div key={deposit.id} className="grid grid-cols-12 gap-2 p-3 items-center text-sm">
                            <div className="col-span-6 flex items-center gap-2 text-muted-foreground">
                              <Calendar size={14} />
                              {formatDate(deposit.date)}
                            </div>
                            <div className="col-span-6 flex items-center justify-end gap-2">
                              <span className="font-semibold text-primary">
                                ৳{deposit.amount.toLocaleString('bn-BD')}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeDeposit(deposit.id);
                                  toast.success('মুছে ফেলা হয়েছে');
                                }}
                                className="p-1 text-destructive hover:bg-destructive/10 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Total Row */}
                      <div className="grid grid-cols-12 gap-2 p-3 bg-primary/10 font-semibold">
                        <div className="col-span-6">মোট</div>
                        <div className="col-span-6 text-right text-primary">
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
      </div>

      {/* Maid Payment Section */}
      <div className="mt-8">
        <h1 className="page-title">বুয়ার টাকা</h1>

        {/* Add Maid Payment Form */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <HandCoins size={20} className="text-accent" />
            বুয়ার টাকা যোগ করুন
          </h2>
          <form onSubmit={handleMaidPaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">তারিখ</label>
                <Input 
                  type="date" 
                  value={maidDate}
                  onChange={(e) => setMaidDate(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="form-label">টাকার পরিমাণ</label>
                <Input 
                  type="number" 
                  placeholder="০" 
                  value={maidAmount}
                  onChange={(e) => setMaidAmount(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <label className="form-label">কে দিল (ঐচ্ছিক)</label>
              <Select value={maidPaidBy} onValueChange={setMaidPaidBy}>
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

            <div>
              <label className="form-label">নোট (ঐচ্ছিক)</label>
              <Input 
                type="text" 
                placeholder="যেমন: মাসিক বেতন, বোনাস ইত্যাদি" 
                value={maidNote}
                onChange={(e) => setMaidNote(e.target.value)}
                className="h-12"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-lg" variant="secondary">
              <Plus className="mr-2" size={20} />
              বুয়ার টাকা যোগ করুন
            </Button>
          </form>
        </div>

        {/* Total Maid Payment Summary */}
        <div className="bg-accent/10 rounded-lg border border-accent/20 p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HandCoins className="text-accent" size={24} />
              <span className="font-medium text-foreground">মোট বুয়ার টাকা</span>
            </div>
            <span className="text-2xl font-bold text-accent">৳{totalMaidPayments.toLocaleString('bn-BD')}</span>
          </div>
        </div>

        {/* Maid Payment History */}
        {sortedMaidPayments.length > 0 && (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-accent/5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar size={20} className="text-accent" />
                বুয়ার টাকার তালিকা
              </h2>
            </div>

            <div className="divide-y divide-border">
              {sortedMaidPayments.map((payment) => (
                <div key={payment.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formatDate(payment.date)}</p>
                    {payment.paidBy && (
                      <p className="text-sm text-primary">
                        দিয়েছেন: {getMemberName(payment.paidBy)}
                      </p>
                    )}
                    {payment.note && (
                      <p className="text-sm text-muted-foreground">{payment.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-accent">
                      ৳{payment.amount.toLocaleString('bn-BD')}
                    </span>
                    <button
                      onClick={() => {
                        removeMaidPayment(payment.id);
                        toast.success('মুছে ফেলা হয়েছে');
                      }}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded"
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
    </div>
  );
}
