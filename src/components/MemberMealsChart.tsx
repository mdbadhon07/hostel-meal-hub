import { useMeal } from '@/context/MealContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function MemberMealsChart() {
  const { getMemberSummaries } = useMeal();
  const summaries = getMemberSummaries();

  const toBengaliNumber = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const numStr = num.toString();
    return numStr.split('').map(d => {
      if (d === '.') return '.';
      if (d === '-') return '-';
      return bengaliDigits[parseInt(d)] || d;
    }).join('');
  };

  const chartData = summaries.map(summary => ({
    name: summary.name.length > 8 ? summary.name.substring(0, 8) + '...' : summary.name,
    fullName: summary.name,
    meals: summary.totalMeals,
    lunch: summary.totalLunch,
    dinner: summary.totalDinner,
  }));

  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(210, 80%, 55%)',
    'hsl(280, 70%, 55%)',
    'hsl(330, 70%, 55%)',
    'hsl(170, 70%, 45%)',
    'hsl(30, 80%, 55%)',
    'hsl(60, 70%, 50%)',
    'hsl(240, 60%, 60%)',
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.fullName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            মোট মিল: <span className="text-primary font-medium">{toBengaliNumber(data.meals)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            দুপুর: {toBengaliNumber(data.lunch)} | রাত: {toBengaliNumber(data.dinner)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (summaries.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">সদস্যদের মিল চার্ট</h2>
        <p className="text-center text-muted-foreground py-8">কোনো ডাটা নেই</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">সদস্যদের মিল চার্ট</h2>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => toBengaliNumber(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="meals" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {chartData.map((item, index) => (
          <div key={item.fullName} className="flex items-center gap-1.5 text-xs">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-muted-foreground">{item.fullName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
