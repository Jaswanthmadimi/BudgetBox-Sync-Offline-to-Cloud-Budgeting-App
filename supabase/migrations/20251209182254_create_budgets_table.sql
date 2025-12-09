/*
  # BudgetBox Database Schema

  ## Overview
  Creates the core database structure for BudgetBox, an offline-first budgeting application.
  
  ## 1. New Tables
  
  ### `budgets`
  Stores user budget data with income and expense categories.
  
  - `id` (uuid, primary key) - Unique identifier for each budget entry
  - `user_id` (uuid, foreign key) - References auth.users, identifies budget owner
  - `income` (numeric) - Monthly income amount
  - `bills` (numeric) - Monthly bills expense
  - `food` (numeric) - Food expense
  - `transport` (numeric) - Transport expense
  - `subscriptions` (numeric) - Subscriptions expense
  - `miscellaneous` (numeric) - Miscellaneous expenses
  - `created_at` (timestamptz) - When the budget was first created
  - `updated_at` (timestamptz) - Last modification timestamp for sync tracking
  - `version` (integer) - Version number for conflict resolution
  
  ## 2. Security
  
  - Enable Row Level Security (RLS) on budgets table
  - Users can only read their own budget data
  - Users can only insert their own budget data
  - Users can only update their own budget data
  - Users can only delete their own budget data
  
  ## 3. Indexes
  
  - Index on user_id for fast budget lookups
  - Index on updated_at for sync operations
  
  ## 4. Important Notes
  
  - All numeric fields default to 0 to prevent null issues
  - updated_at automatically updates on modifications
  - version field enables optimistic locking for conflict resolution
*/

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  income numeric DEFAULT 0 NOT NULL,
  bills numeric DEFAULT 0 NOT NULL,
  food numeric DEFAULT 0 NOT NULL,
  transport numeric DEFAULT 0 NOT NULL,
  subscriptions numeric DEFAULT 0 NOT NULL,
  miscellaneous numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  version integer DEFAULT 1 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_updated_at ON budgets(updated_at);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own budget"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();