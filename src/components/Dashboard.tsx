import { useBudget } from '../hooks/useBudget';
import { TrendingUp, TrendingDown, PiggyBank, AlertTriangle } from 'lucide-react';
import { PieChart } from './PieChart';

export function Dashboard() {
  const { budget } = useBudget();

  const totalExpenses = budget.bills + budget.food + budget.transport + budget.subscriptions + budget.miscellaneous;
  const savings = budget.income - totalExpenses;
  const burnRate = budget.income > 0 ? (totalExpenses / budget.income) * 100 : 0;
  const savingsRate = budget.income > 0 ? (savings / budget.income) * 100 : 0;

  const daysInMonth = 30;
  const today = new Date().getDate();
  const dailyBudget = totalExpenses / daysInMonth;
  const projectedMonthEnd = budget.income - totalExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const warnings = [];

  if (budget.income > 0) {
    if (budget.subscriptions / budget.income > 0.3) {
      warnings.push({
        title: 'High Subscription Costs',
        message: `Subscriptions are ${((budget.subscriptions / budget.income) * 100).toFixed(0)}% of your income (recommended: <30%)`,
      });
    }

    if (budget.food / budget.income > 0.4) {
      warnings.push({
        title: 'High Food Expenses',
        message: `Food costs are ${((budget.food / budget.income) * 100).toFixed(0)}% of your income (recommended: <40%)`,
      });
    }

    if (savings < 0) {
      warnings.push({
        title: 'Expenses Exceed Income',
        message: `You're spending ${formatCurrency(Math.abs(savings))} more than you earn`,
      });
    } else if (savingsRate < 20) {
      warnings.push({
        title: 'Low Savings Rate',
        message: `You're only saving ${savingsRate.toFixed(0)}% of your income (recommended: >20%)`,
      });
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle
  }: {
    title: string;
    value: string;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Burn Rate"
          value={`${burnRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="bg-blue-50 text-blue-600"
          subtitle={`${formatCurrency(totalExpenses)} / ${formatCurrency(budget.income)}`}
        />

        <StatCard
          title="Savings Potential"
          value={formatCurrency(savings)}
          icon={savings >= 0 ? PiggyBank : TrendingDown}
          color={savings >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}
          subtitle={`${savingsRate.toFixed(1)}% of income`}
        />

        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          color="bg-orange-50 text-orange-600"
          subtitle="Monthly spending"
        />

        <StatCard
          title="Month-End Projection"
          value={formatCurrency(projectedMonthEnd)}
          icon={projectedMonthEnd >= 0 ? TrendingUp : TrendingDown}
          color={projectedMonthEnd >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}
          subtitle={`Based on day ${today}/${daysInMonth}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Spending Breakdown</h3>
          <PieChart budget={budget} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800">Insights & Warnings</h3>
          </div>

          {warnings.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-3">
                <PiggyBank className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-slate-600">Looking good! No warnings at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {warnings.map((warning, index) => (
                <div key={index} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-semibold text-amber-900 mb-1">{warning.title}</p>
                  <p className="text-sm text-amber-700">{warning.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
