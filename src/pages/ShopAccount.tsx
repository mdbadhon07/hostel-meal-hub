import { useState } from 'react';
import { useMeal } from '@/context/MealContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Trash2, Store, Banknote, ShoppingCart, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export default function ShopAccount() {
  const { shopTransactions, addShopTransaction, removeShopTransaction, getShopBalance } = useMeal();
  
  // Purchase form states
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseNote, setPurchaseNote] = useState('');
  
  // Payment form states
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!purchaseAmount) {
      toast.error('টাকার পরিমাণ দিন');
      return;
    }

    addShopTransaction({
      date: purchaseDate,
      type: 'purchase',
      amount: parseFloat(purchaseAmount),
      note: purchaseNote || undefined,
    });

    setPurchaseAmount('');
    setPurchaseNote('');
    toast.success('বাজার যোগ করা হয়েছে!');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentAmount) {
      toast.error('টাকার পরিমাণ দিন');
      return;
    }

    addShopTransaction({
      date: paymentDate,
      type: 'payment',
      amount: parseFloat(paymentAmount),
      note: paymentNote || undefined,
    });

    setPaymentAmount('');
    setPaymentNote('');
    toast.success('জমা যোগ করা হয়েছে!');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bn-BD', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long'
    });
  };

  // Group transactions by date
  const transactionsByDate = shopTransactions.reduce((acc, transaction) => {
    if (!acc[transaction.date]) {
      acc[transaction.date] = [];
    }
    acc[transaction.date].push(transaction);
    return acc;
  }, {} as Record<string, typeof shopTransactions>);

  // Sort dates in descending order
  const sortedDates = Object.keys(transactionsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const { totalPurchase, totalPayment, balance } = getShopBalance();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Store size={28} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">বাবু মদি স্টোর</h1>
          <p className="text-sm text-muted-foreground">দোকানের হিসাব</p>
        </div>
      </div>

      {/* Balance Summary */}
      <div className={`rounded-xl p-5 mb-6 border-2 ${
        balance <= 0 
          ? 'bg-success/10 border-success/30' 
          : 'bg-destructive/10 border-destructive/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              balance <= 0 ? 'bg-success/20' : 'bg-destructive/20'
            }`}>
              <Receipt size={28} className={balance <= 0 ? 'text-success' : 'text-destructive'} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {balance <= 0 ? 'অগ্রিম আছে' : 'বাকি আছে'}
              </p>
              <p className={`text-3xl font-bold ${
                balance <= 0 ? 'text-success' : 'text-destructive'
              }`}>
                ৳{Math.abs(balance).toLocaleString('bn-BD')}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>মোট বাজার: <span className="text-warning font-medium">৳{totalPurchase.toLocaleString('bn-BD')}</span></p>
            <p>মোট জমা: <span className="text-success font-medium">৳{totalPayment.toLocaleString('bn-BD')}</span></p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="purchase" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="purchase" className="flex items-center gap-2">
            <ShoppingCart size={18} />
            বাজার এন্ট্রি
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <Banknote size={18} />
            জমা এন্ট্রি
          </TabsTrigger>
        </TabsList>

        {/* Purchase Entry Tab */}
        <TabsContent value="purchase">
          <div className="bg-card rounded-lg border border-border p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">বাজার যোগ করুন</h2>
            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">তারিখ</label>
                  <Input 
                    type="date" 
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="form-label">বাজারের টাকা</label>
                  <Input 
                    type="number" 
                    placeholder="০" 
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">নোট (ঐচ্ছিক)</label>
                <Textarea 
                  placeholder="বাজারের বিবরণ লিখুন..." 
                  value={purchaseNote}
                  onChange={(e) => setPurchaseNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg bg-warning hover:bg-warning/90">
                <Plus className="mr-2" size={20} />
                বাজার যোগ করুন
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Payment Entry Tab */}
        <TabsContent value="payment">
          <div className="bg-card rounded-lg border border-border p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">জমা দিন</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">তারিখ</label>
                  <Input 
                    type="date" 
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="form-label">জমার টাকা</label>
                  <Input 
                    type="number" 
                    placeholder="০" 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">নোট (ঐচ্ছিক)</label>
                <Textarea 
                  placeholder="যেমন: স্লিপ নম্বর, কে দিলো ইত্যাদি..." 
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg bg-success hover:bg-success/90 text-success-foreground">
                <Plus className="mr-2" size={20} />
                জমা দিন
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction History */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">লেনদেনের ইতিহাস</h2>
        </div>

        <div className="divide-y divide-border">
          {sortedDates.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">কোনো লেনদেন নেই</p>
          ) : (
            sortedDates.map(dateKey => {
              const dayTransactions = transactionsByDate[dateKey];
              const dayPurchase = dayTransactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0);
              const dayPayment = dayTransactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
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
                          {dayTransactions.length}টি লেনদেন
                          {isToday && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">আজ</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {dayPurchase > 0 && <p className="text-sm text-warning">বাজার: ৳{dayPurchase.toLocaleString('bn-BD')}</p>}
                      {dayPayment > 0 && <p className="text-sm text-success">জমা: ৳{dayPayment.toLocaleString('bn-BD')}</p>}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
                        {dayTransactions.map(transaction => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                transaction.type === 'purchase' ? 'bg-warning/20' : 'bg-success/20'
                              }`}>
                                {transaction.type === 'purchase' 
                                  ? <ShoppingCart size={16} className="text-warning" />
                                  : <Banknote size={16} className="text-success" />
                                }
                              </div>
                              <div>
                                <span className="font-medium">
                                  {transaction.type === 'purchase' ? 'বাজার' : 'জমা'}
                                </span>
                                {transaction.note && (
                                  <p className="text-sm text-muted-foreground">{transaction.note}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${
                                transaction.type === 'purchase' ? 'text-warning' : 'text-success'
                              }`}>
                                {transaction.type === 'purchase' ? '-' : '+'}৳{transaction.amount.toLocaleString('bn-BD')}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeShopTransaction(transaction.id);
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
