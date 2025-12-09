import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { BudgetProvider } from './hooks/useBudget';
import { BudgetForm } from './components/BudgetForm';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <BudgetProvider>
      <Layout>
        <div className="space-y-8">
          <BudgetForm />
          <Dashboard />
        </div>
      </Layout>
    </BudgetProvider>
  );
}

export default App;
