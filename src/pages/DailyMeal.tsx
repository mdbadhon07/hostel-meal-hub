import { useState } from 'react';
import { useMeal } from '@/context/MealContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Save, Check, Edit3, ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function DailyMeal() {
  const { members, getMealsForDate, updateMeal, updateMealCount, meals } = useMeal();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isManualMode, setIsManualMode] = useState(false);

  const activeMembers = members.filter(m => m.isActive);
  const dailyMeals = getMealsForDate(selectedDate);

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('bn-BD', options);
  };

  const getMealStatus = (memberId: string, type: 'lunch' | 'dinner') => {
    const meal = dailyMeals.find(m => m.memberId === memberId);
    return meal ? meal[type] : false;
  };

  const getMealCount = (memberId: string, type: 'lunch' | 'dinner') => {
    const meal = dailyMeals.find(m => m.memberId === memberId);
    if (!meal) return 0;
    const countField = type === 'lunch' ? 'lunchCount' : 'dinnerCount';
    return meal[countField] ?? (meal[type] ? 1 : 0);
  };

  const handleMealToggle = (memberId: string, type: 'lunch' | 'dinner') => {
    const currentValue = getMealStatus(memberId, type);
    updateMeal(selectedDate, memberId, type, !currentValue);
  };

  const handleMealCountChange = (memberId: string, type: 'lunch' | 'dinner', value: string) => {
    const count = parseFloat(value) || 0;
    updateMealCount(selectedDate, memberId, type, Math.max(0, count));
  };

  const handleSave = () => {
    toast.success('মিল সংরক্ষণ করা হয়েছে!');
  };

  // Calculate totals for the day (দুপুর = ১ মিল, রাত = ০.৫ মিল)
  const todayMeals = meals.filter(m => m.date === selectedDate);
  const lunchCount = todayMeals.reduce((acc, m) => acc + (m.lunchCount ?? (m.lunch ? 1 : 0)), 0);
  const dinnerCount = todayMeals.reduce((acc, m) => acc + (m.dinnerCount ?? (m.dinner ? 1 : 0)), 0);
  const totalMealValue = (lunchCount * 1) + (dinnerCount * 0.5);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div>
      <h1 className="page-title">দৈনিক মিল এন্ট্রি</h1>

      {/* Date Selector */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">{formatDate(selectedDate)}</p>
            {isToday && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                আজ
              </span>
            )}
          </div>

          <button 
            onClick={() => changeDate(1)}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-card rounded-lg border border-border p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {isManualMode ? 'ম্যানুয়াল ইনপুট মোড' : 'চেকবক্স মোড'}
          </span>
          <Button
            variant={isManualMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsManualMode(!isManualMode)}
            className="gap-2"
          >
            {isManualMode ? <Edit3 size={16} /> : <ToggleLeft size={16} />}
            {isManualMode ? 'ম্যানুয়াল' : 'চেকবক্স'}
          </Button>
        </div>
        {isManualMode && (
          <p className="text-xs text-muted-foreground mt-2">
            সংখ্যা দিয়ে মিল ইনপুট করুন। পুরানো হিসাব তুলতে এই মোড ব্যবহার করুন।
          </p>
        )}
      </div>

      {/* Daily Totals */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-primary/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">{lunchCount}</p>
          <p className="text-sm text-muted-foreground">দুপুর</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">{dinnerCount}</p>
          <p className="text-sm text-muted-foreground">রাত</p>
        </div>
        <div className="bg-success/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-success">{totalMealValue}</p>
          <p className="text-sm text-muted-foreground">মোট মিল</p>
        </div>
      </div>

      {/* Meal Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell text-left">নাম</th>
                <th className="table-cell w-24">দুপুর</th>
                <th className="table-cell w-24">রাত</th>
              </tr>
            </thead>
            <tbody>
              {activeMembers.map((member, index) => (
                <tr 
                  key={member.id} 
                  className={index % 2 === 0 ? 'bg-background' : 'bg-card'}
                >
                  <td className="table-cell text-left font-medium">{member.name}</td>
                  <td className="table-cell">
                    {isManualMode ? (
                      <Input
                        type="number"
                        min="0"
                        value={getMealCount(member.id, 'lunch')}
                        onChange={(e) => handleMealCountChange(member.id, 'lunch', e.target.value)}
                        className="w-16 h-10 text-center"
                      />
                    ) : (
                      <button
                        onClick={() => handleMealToggle(member.id, 'lunch')}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                          getMealStatus(member.id, 'lunch')
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {getMealStatus(member.id, 'lunch') && <Check size={20} />}
                      </button>
                    )}
                  </td>
                  <td className="table-cell">
                    {isManualMode ? (
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={getMealCount(member.id, 'dinner')}
                        onChange={(e) => handleMealCountChange(member.id, 'dinner', e.target.value)}
                        className="w-16 h-10 text-center"
                      />
                    ) : (
                      <button
                        onClick={() => handleMealToggle(member.id, 'dinner')}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                          getMealStatus(member.id, 'dinner')
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {getMealStatus(member.id, 'dinner') && <Check size={20} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full py-6 text-lg" size="lg">
        <Save className="mr-2" size={20} />
        সংরক্ষণ করুন
      </Button>
    </div>
  );
}
