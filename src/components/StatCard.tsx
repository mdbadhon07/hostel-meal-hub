import { ReactNode } from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
}

export default function StatCard({ value, label, icon, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card',
    primary: 'bg-primary/10 border-primary/20',
    success: 'bg-success/10 border-success/20',
    warning: 'bg-warning/10 border-warning/20',
    accent: 'bg-accent/10 border-accent/20',
  };

  return (
    <div className={`stat-card ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-value">{value}</p>
          <p className="stat-label">{label}</p>
        </div>
        {icon && (
          <div className="text-primary opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
