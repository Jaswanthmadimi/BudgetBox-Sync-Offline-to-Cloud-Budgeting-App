# BudgetBox

An offline-first personal budgeting application that works like Google Docs offline mode - every keystroke auto-saves locally, works with zero internet connectivity, and syncs to the server when the network returns.

## Features

### Core Functionality
- **Offline-First Architecture**: All data is stored locally in IndexedDB and works without internet
- **Auto-Save on Every Keystroke**: Never lose your budget data, even during crashes or browser reloads
- **Smart Sync System**: Automatically syncs to Supabase when online with conflict resolution
- **Real-Time Sync Status**: Visual indicators show whether data is local-only, sync-pending, or synced
- **Network Detection**: Real-time online/offline indicator in the header

### Budget Management
- **Monthly Income Tracking**: Track your monthly income
- **Expense Categories**:
  - Monthly Bills
  - Food
  - Transport
  - Subscriptions
  - Miscellaneous

### Analytics Dashboard
- **Burn Rate**: Percentage of income spent
- **Savings Potential**: Calculate how much you can save
- **Month-End Projection**: Predict financial status at month-end
- **Visual Spending Breakdown**: Interactive pie chart showing expense distribution

### Intelligent Warnings
- High subscription costs (>30% of income)
- High food expenses (>40% of income)
- Expenses exceeding income
- Low savings rate (<20% of income)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **TailwindCSS** for styling
- **IndexedDB** for offline storage
- **Lucide React** for icons

### Backend
- **Supabase** (PostgreSQL)
  - Authentication (email/password)
  - Row Level Security (RLS)
  - Real-time sync capabilities

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                                                             │
│  ┌──────────────┐        ┌──────────────┐                 │
│  │   React UI   │───────▶│  IndexedDB   │                 │
│  │  Components  │◀───────│   (Local)    │                 │
│  └──────────────┘        └──────────────┘                 │
│         │                       │                          │
│         │                       │                          │
│         │              Auto-save on keystroke             │
│         │                       │                          │
│         ▼                       ▼                          │
│  ┌──────────────────────────────────────┐                 │
│  │      Budget Context/Provider          │                 │
│  │  - State Management                   │                 │
│  │  - Sync Logic                         │                 │
│  │  - Offline Detection                  │                 │
│  └──────────────────────────────────────┘                 │
│         │                                                   │
│         │ (When online)                                    │
│         ▼                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │
          │ HTTPS
          │
          ▼
┌──────────────────────────────────────────────────────────┐
│                    Supabase Backend                       │
│                                                           │
│  ┌─────────────┐      ┌──────────────┐                  │
│  │   Auth      │      │  PostgreSQL  │                  │
│  │  System     │──────│   Database   │                  │
│  └─────────────┘      └──────────────┘                  │
│                              │                            │
│                       Row Level Security                  │
│                       Version Control                     │
│                       Auto-timestamps                     │
└──────────────────────────────────────────────────────────┘
```

## Offline-First Behavior

### How It Works

1. **Initial Load**
   - App checks for existing data in IndexedDB
   - If found, displays immediately (instant load)
   - Attempts to sync with Supabase in background

2. **Data Entry**
   - Every keystroke saves to IndexedDB instantly
   - Status changes to "Sync Pending" if online
   - Data persists through page reloads and crashes

3. **Offline Mode**
   - Continues working normally without internet
   - Status shows "Local Only"
   - All data safely stored in browser

4. **Coming Back Online**
   - Automatic network detection
   - Status changes to "Sync Pending"
   - User can click "Sync" button to push changes
   - Conflict resolution using version numbers

5. **Sync Process**
   - Compares local version with server version
   - Uploads local changes to Supabase
   - Updates sync status to "Synced"
   - Stores server timestamp for future comparisons

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd budgetbox
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Testing Offline Functionality

### Scenario 1: First-Time User Offline
1. Turn off WiFi/disconnect from internet
2. Open the app and create an account
3. Enter budget data
4. Observe "Offline" indicator and "Local Only" status
5. Refresh the page - data persists
6. Turn WiFi back on
7. Click "Sync" button
8. Data successfully syncs to server

### Scenario 2: Existing User Goes Offline
1. Log in with internet connection
2. Enter some budget data and sync
3. Turn off WiFi
4. Modify budget data
5. Notice "Sync Pending" becomes "Local Only"
6. Close browser completely
7. Reopen browser (still offline)
8. All changes are preserved
9. Turn WiFi back on
10. Click "Sync" - changes push to server

### Scenario 3: Multiple Devices
1. Enter data on Device A and sync
2. Open app on Device B
3. Data loads from server
4. Go offline on both devices
5. Make different changes on each
6. Come back online
7. Last sync wins (version-based resolution)

## Database Schema

### Budgets Table
```sql
CREATE TABLE budgets (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  income numeric DEFAULT 0,
  bills numeric DEFAULT 0,
  food numeric DEFAULT 0,
  transport numeric DEFAULT 0,
  subscriptions numeric DEFAULT 0,
  miscellaneous numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  version integer DEFAULT 1
);
```

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Policies for SELECT, INSERT, UPDATE, DELETE

## Project Structure

```
src/
├── components/           # React components
│   ├── Auth.tsx         # Login/signup
│   ├── BudgetForm.tsx   # Budget entry form
│   ├── Dashboard.tsx    # Analytics dashboard
│   ├── Layout.tsx       # App layout
│   ├── OfflineIndicator.tsx  # Network status
│   └── PieChart.tsx     # Expense visualization
├── contexts/
│   └── AuthContext.tsx  # Authentication state
├── hooks/
│   └── useBudget.tsx    # Budget state & sync logic
├── lib/
│   ├── indexedDB.ts     # IndexedDB wrapper
│   └── supabase.ts      # Supabase client
├── types/
│   └── budget.ts        # TypeScript types
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Key Implementation Details

### Auto-Save
- Uses React Context for state management
- `useCallback` to optimize update functions
- Debouncing not needed - IndexedDB is fast enough

### Sync Status
- **Local Only**: No network, all data local
- **Sync Pending**: Online but changes not synced
- **Synced**: All changes saved to server

### Conflict Resolution
- Version numbers track changes
- Timestamp-based resolution
- Last write wins (can be enhanced)

### Data Persistence
- IndexedDB stores complete budget object
- Survives browser restarts
- Isolated per user

## Future Enhancements

- [ ] Multiple budget periods (monthly history)
- [ ] Budget goals and targets
- [ ] Recurring expense tracking
- [ ] Export to CSV/PDF
- [ ] Mobile PWA installation
- [ ] Push notifications for warnings
- [ ] Category customization
- [ ] Multi-currency support

## Demo Credentials

```
Email: hire-me@anshumat.org
Password: HireMe@2025!
```

## License

MIT

## Author

Built as a demonstration of offline-first application architecture with React, TypeScript, and Supabase.
