interface StatsCardProps {
  label: string;
  value: number;
  color?: 'primary' | 'success' | 'warning' | 'info';
  delay?: number;
}

const colorMap = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
};

const StatsCard = ({ label, value, color = 'primary', delay = 0 }: StatsCardProps) => {
  return (
    <div
      className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-300 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
        {label}
      </p>
      <p className={`text-4xl font-display font-bold ${colorMap[color]} animate-count-up`}
         style={{ animationDelay: `${delay + 200}ms` }}>
        {value}
      </p>
    </div>
  );
};

export default StatsCard;
