import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LocalBudget, BudgetData, SyncStatus } from '../types/budget';
import { indexedDB } from '../lib/indexedDB';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BudgetContextType {
  budget: LocalBudget;
  updateBudget: (field: keyof BudgetData, value: number) => void;
  syncStatus: SyncStatus;
  lastSaved: Date | null;
  sync: () => Promise<void>;
  isSyncing: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const initialBudget: LocalBudget = {
  id: 'current',
  income: 0,
  bills: 0,
  food: 0,
  transport: 0,
  subscriptions: 0,
  miscellaneous: 0,
  syncStatus: 'local-only',
  isDirty: false,
};

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [budget, setBudget] = useState<LocalBudget>(initialBudget);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      loadBudget();
    }
  }, [user]);

  const loadBudget = async () => {
    try {
      const localBudget = await indexedDB.getBudget();

      if (localBudget) {
        setBudget(localBudget);
      } else {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const loadedBudget: LocalBudget = {
            ...data,
            id: 'current',
            syncStatus: 'synced',
            isDirty: false,
          };
          setBudget(loadedBudget);
          await indexedDB.saveBudget(loadedBudget);
        } else {
          await indexedDB.saveBudget(initialBudget);
        }
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      const localBudget = await indexedDB.getBudget();
      if (localBudget) {
        setBudget(localBudget);
      }
    }
  };

  const updateBudget = useCallback(async (field: keyof BudgetData, value: number) => {
    const updatedBudget: LocalBudget = {
      ...budget,
      [field]: value,
      isDirty: true,
      syncStatus: navigator.onLine ? 'sync-pending' : 'local-only',
    };

    setBudget(updatedBudget);
    setLastSaved(new Date());

    try {
      await indexedDB.saveBudget(updatedBudget);
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  }, [budget]);

  const sync = useCallback(async () => {
    if (!user || !navigator.onLine || isSyncing) return;

    setIsSyncing(true);

    try {
      const { data: existingBudget } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const budgetData: BudgetData = {
        user_id: user.id,
        income: budget.income,
        bills: budget.bills,
        food: budget.food,
        transport: budget.transport,
        subscriptions: budget.subscriptions,
        miscellaneous: budget.miscellaneous,
      };

      let result;
      if (existingBudget) {
        result = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', existingBudget.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('budgets')
          .insert(budgetData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const syncedBudget: LocalBudget = {
        ...budget,
        ...result.data,
        id: 'current',
        syncStatus: 'synced',
        isDirty: false,
        lastSyncedAt: new Date().toISOString(),
      };

      setBudget(syncedBudget);
      await indexedDB.saveBudget(syncedBudget);
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [budget, user, isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      if (budget.isDirty) {
        setBudget(prev => ({ ...prev, syncStatus: 'sync-pending' }));
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [budget.isDirty]);

  return (
    <BudgetContext.Provider value={{
      budget,
      updateBudget,
      syncStatus: budget.syncStatus,
      lastSaved,
      sync,
      isSyncing,
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
