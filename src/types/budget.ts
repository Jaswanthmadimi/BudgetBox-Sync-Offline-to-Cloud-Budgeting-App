export interface BudgetData {
  id?: string;
  user_id?: string;
  income: number;
  bills: number;
  food: number;
  transport: number;
  subscriptions: number;
  miscellaneous: number;
  updated_at?: string;
  version?: number;
}

export type SyncStatus = 'local-only' | 'sync-pending' | 'synced';

export interface LocalBudget extends BudgetData {
  lastSyncedAt?: string;
  syncStatus: SyncStatus;
  isDirty: boolean;
}
