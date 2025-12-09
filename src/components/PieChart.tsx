import { LocalBudget } from '../types/budget';

interface PieChartProps {
  budget: LocalBudget;
}

export function PieChart({ budget }: PieChartProps) {
  const categories = [
    { name: 'Bills', value: budget.bills, color: '#3b82f6' },
    { name: 'Food', value: budget.food, color: '#10b981' },
    { name: 'Transport', value: budget.transport, color: '#f59e0b' },
    { name: 'Subscriptions', value: budget.subscriptions, color: '#8b5cf6' },
    { name: 'Miscellaneous', value: budget.miscellaneous, color: '#ec4899' },
  ].filter(cat => cat.value > 0);

  const total = categories.reduce((sum, cat) => sum + cat.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <p>No expenses yet</p>
      </div>
    );
  }

  let currentAngle = 0;
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', centerX, centerY,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="w-64 h-64">
        {categories.map((category, index) => {
          const percentage = (category.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const path = createArc(currentAngle, currentAngle + angle);
          currentAngle += angle;

          return (
            <g key={index}>
              <path
                d={path}
                fill={category.color}
                className="transition-all hover:opacity-80 cursor-pointer"
              />
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-2 gap-3 w-full mt-6">
        {categories.map((category, index) => {
          const percentage = ((category.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">{category.name}</p>
                <p className="text-xs text-slate-500">{percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
