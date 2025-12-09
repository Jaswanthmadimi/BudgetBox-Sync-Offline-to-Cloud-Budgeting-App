import { useBudget } from '../hooks/useBudget';
import { Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function BudgetForm() {
  const { budget, updateBudget, syncStatus, lastSaved, sync, isSyncing } = useBudget();
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncError(null);
    try {
      await sync();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'sync-pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synced';
      case 'sync-pending':
        return 'Sync Pending';
      default:
        return 'Local Only';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Monthly Budget</h2>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getSyncStatusColor()}`}>
            {getSyncStatusText()}
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing || !navigator.onLine}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {lastSaved && (
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Save className="w-4 h-4" />
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {syncError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {syncError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Monthly Income
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
              ₹
            </span>
            <input
              type="number"
              value={budget.income || ''}
              onChange={(e) => updateBudget('income', Number(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-lg font-medium"
              placeholder="0"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {formatCurrency(budget.income)}
          </p>
        </div>

        <div className="border-t-2 border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
            Monthly Expenses
          </h3>

          <div className="space-y-3">
            {[
              { field: 'bills' as const, label: 'Bills' },
              { field: 'food' as const, label: 'Food' },
              { field: 'transport' as const, label: 'Transport' },
              { field: 'subscriptions' as const, label: 'Subscriptions' },
              { field: 'miscellaneous' as const, label: 'Miscellaneous' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={budget[field] || ''}
                    onChange={(e) => updateBudget(field, Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
