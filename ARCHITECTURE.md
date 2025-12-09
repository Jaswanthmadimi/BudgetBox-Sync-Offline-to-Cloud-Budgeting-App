# BudgetBox Architecture

## System Overview

BudgetBox uses a modern offline-first architecture where the client is the source of truth, and the server acts as a backup/sync mechanism.

```
┌────────────────────────────────────────────────────────────────┐
│                         Browser                                │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    React Application                      │ │
│  │                                                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │    Auth     │  │   Budget    │  │ Dashboard   │     │ │
│  │  │ Components  │  │    Form     │  │ Analytics   │     │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │ │
│  │         │                 │                 │            │ │
│  │         └─────────────────┼─────────────────┘            │ │
│  │                           │                              │ │
│  │         ┌─────────────────▼─────────────────┐           │ │
│  │         │      State Management Layer       │           │ │
│  │         │  ┌──────────────────────────────┐ │           │ │
│  │         │  │   AuthContext (Auth State)   │ │           │ │
│  │         │  └──────────────────────────────┘ │           │ │
│  │         │  ┌──────────────────────────────┐ │           │ │
│  │         │  │  BudgetProvider (Budget)     │ │           │ │
│  │         │  │  - Auto-save logic           │ │           │ │
│  │         │  │  - Sync management           │ │           │ │
│  │         │  │  - Status tracking           │ │           │ │
│  │         │  └──────────────────────────────┘ │           │ │
│  │         └───────────┬──────────────────────┘           │ │
│  │                     │                                    │ │
│  └─────────────────────┼────────────────────────────────────┘ │
│                        │                                      │
│         ┌──────────────┼──────────────┐                      │
│         │              │              │                      │
│         ▼              ▼              ▼                      │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐               │
│  │ IndexedDB  │ │ LocalAPI   │ │Navigator  │               │
│  │            │ │ (Storage)  │ │ .onLine   │               │
│  └────────────┘ └────────────┘ └───────────┘               │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ HTTPS (when online)
                           │
                           ▼
            ┌──────────────────────────────┐
            │     Supabase Platform        │
            │                              │
            │  ┌────────────────────────┐ │
            │  │   Authentication       │ │
            │  │   - JWT tokens         │ │
            │  │   - Session mgmt       │ │
            │  └────────────────────────┘ │
            │                              │
            │  ┌────────────────────────┐ │
            │  │   PostgreSQL           │ │
            │  │   - budgets table      │ │
            │  │   - RLS policies       │ │
            │  │   - Triggers           │ │
            │  └────────────────────────┘ │
            │                              │
            │  ┌────────────────────────┐ │
            │  │   REST API             │ │
            │  │   - Auto-generated     │ │
            │  │   - Row level security │ │
            │  └────────────────────────┘ │
            └──────────────────────────────┘
```

## Component Architecture

### 1. Presentation Layer

#### Components
```typescript
Auth.tsx              // Login/signup UI
BudgetForm.tsx        // Budget input form
Dashboard.tsx         // Analytics display
PieChart.tsx          // Visualization
OfflineIndicator.tsx  // Network status
Layout.tsx            // App wrapper
```

**Responsibilities:**
- Render UI
- Handle user input
- Display data
- No business logic

### 2. State Management Layer

#### Context Providers

**AuthContext**
```typescript
{
  user: User | null,
  loading: boolean,
  signIn: (email, password) => Promise<void>,
  signUp: (email, password) => Promise<void>,
  signOut: () => Promise<void>
}
```

**BudgetProvider**
```typescript
{
  budget: LocalBudget,
  updateBudget: (field, value) => void,
  syncStatus: SyncStatus,
  lastSaved: Date | null,
  sync: () => Promise<void>,
  isSyncing: boolean
}
```

**Responsibilities:**
- Manage application state
- Handle business logic
- Coordinate between storage layers
- Provide data to components

### 3. Data Layer

#### IndexedDB Manager
```typescript
class IndexedDBManager {
  saveBudget(budget): Promise<void>
  getBudget(): Promise<LocalBudget | null>
  clearBudget(): Promise<void>
}
```

**Responsibilities:**
- Local persistence
- Fast read/write
- Data integrity

#### Supabase Client
```typescript
supabase.auth.*        // Authentication
supabase.from('budgets')  // Database operations
```

**Responsibilities:**
- Remote persistence
- Authentication
- Sync coordination

## Data Flow

### Write Path (User Input)

```
User types in input
      ↓
Component onChange handler
      ↓
updateBudget() called
      ↓
Update React state (instant UI update)
      ↓
Save to IndexedDB (< 10ms)
      ↓
Update lastSaved timestamp
      ↓
Set syncStatus to 'sync-pending'
      ↓
[Wait for user to click Sync]
      ↓
sync() function called
      ↓
Upload to Supabase
      ↓
Set syncStatus to 'synced'
```

### Read Path (Page Load)

```
App starts
      ↓
Check authentication
      ↓
Load from IndexedDB (instant)
      ↓
Display cached data
      ↓
[If online] Fetch from Supabase
      ↓
Compare versions
      ↓
Use latest version
      ↓
Update IndexedDB if needed
```

## State Machine

### Sync Status State Machine

```
                    ┌──────────────┐
                    │ Initial Load │
                    └───────┬──────┘
                            │
                    ┌───────▼────────┐
            ┌───────│  Local Only    │◄──────┐
            │       └───────┬────────┘       │
            │               │                │
   Network  │       ┌───────▼────────┐      │  Network
   Goes     │       │  Sync Pending  │      │  Lost
   Down     │       └───────┬────────┘      │
            │               │                │
            │        Sync   │                │
            │       Button  │                │
            │       Clicked │                │
            │               │                │
            │       ┌───────▼────────┐      │
            └──────►│    Syncing     │──────┘
                    └───────┬────────┘
                            │
                    Success │
                            │
                    ┌───────▼────────┐
                    │     Synced     │
                    └────────────────┘
                            │
                    User    │
                    Edits   │
                            │
                    ┌───────▼────────┐
                    │  Sync Pending  │
                    └────────────────┘
```

## Security Architecture

### Authentication Flow

```
1. User enters email/password
2. Supabase validates credentials
3. JWT token issued
4. Token stored in localStorage (by Supabase)
5. Token included in all API requests
6. Server validates token
7. RLS policies enforce access control
```

### Row Level Security (RLS)

```sql
-- Users can only see their own budgets
CREATE POLICY "Users can read own budget"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only modify their own budgets
CREATE POLICY "Users can update own budget"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Data Isolation

- Each user's data stored separately
- No cross-user data access
- Server-side enforcement
- Client-side filtering

## Performance Optimizations

### 1. Instant UI Updates

```typescript
// Update UI immediately, save in background
setBudget(newBudget);  // React state update (< 1ms)
indexedDB.save(newBudget);  // Async, doesn't block UI
```

### 2. Efficient Re-renders

```typescript
// Use React.memo and useCallback
const updateBudget = useCallback((field, value) => {
  // ...
}, [budget]);
```

### 3. Lazy Loading

```typescript
// Load budget data only when needed
useEffect(() => {
  if (user) {
    loadBudget();
  }
}, [user]);
```

### 4. Debouncing (Not Used)

We deliberately don't debounce because:
- IndexedDB is fast enough (< 10ms writes)
- Users expect instant saves (Google Docs behavior)
- No network calls on every keystroke

## Error Handling

### Network Errors

```typescript
try {
  await sync();
} catch (error) {
  // Show error message
  // Keep local data intact
  // Retry later
}
```

### Authentication Errors

```typescript
try {
  await supabase.auth.signIn(email, password);
} catch (error) {
  // Show user-friendly error
  // Don't expose technical details
}
```

### Storage Errors

```typescript
try {
  await indexedDB.save(budget);
} catch (error) {
  // Fallback to localStorage
  // Or show warning to user
}
```

## Scalability Considerations

### Client-Side

- **Memory**: Minimal (single budget object)
- **Storage**: < 1KB per user
- **Performance**: O(1) operations

### Server-Side

- **Database**: PostgreSQL scales to millions of rows
- **API**: Supabase handles 100+ requests/second
- **Connections**: Connection pooling enabled

### Growth Path

1. **1-1000 users**: Current architecture sufficient
2. **1000-10000 users**: Add caching layer (Redis)
3. **10000+ users**: Horizontal scaling, CDN

## Technology Choices

### Why React?
- Component-based architecture
- Rich ecosystem
- Great developer experience
- Strong TypeScript support

### Why IndexedDB?
- Persistent local storage
- Fast operations
- Large capacity
- Browser standard

### Why Supabase?
- PostgreSQL (reliable, powerful)
- Built-in authentication
- Row Level Security
- Real-time capabilities
- Easy to use

### Why TypeScript?
- Type safety
- Better IDE support
- Fewer runtime errors
- Self-documenting code

### Why TailwindCSS?
- Rapid prototyping
- Consistent design
- Small bundle size
- No CSS conflicts

## Deployment Architecture

```
Developer
    ↓
  Git Push
    ↓
GitHub Repository
    ↓
Vercel (CI/CD)
    ↓
Build & Deploy
    ↓
┌─────────────────────┐
│  Vercel Edge CDN    │
│  (Static Assets)    │
└──────────┬──────────┘
           │
    User Request
           │
           ├──────→ HTML/CSS/JS (CDN)
           │
           └──────→ API Requests
                        ↓
              ┌─────────────────┐
              │    Supabase     │
              │   (Database)    │
              └─────────────────┘
```

## Monitoring & Debugging

### Browser DevTools

- **Console**: Log sync events
- **Network**: Monitor API calls
- **Application**: Inspect IndexedDB
- **Performance**: Profile React renders

### Error Tracking (Future)

- Sentry for error reporting
- PostHog for analytics
- LogRocket for session replay

## Testing Strategy

### Unit Tests (Future)
- Component rendering
- State management logic
- Utility functions

### Integration Tests (Future)
- Auth flow
- Sync logic
- Offline scenarios

### E2E Tests (Future)
- Complete user journeys
- Offline/online transitions
- Multi-device scenarios

## Future Architecture Improvements

1. **Service Worker**: Full PWA support
2. **WebSocket**: Real-time sync
3. **Optimistic Locking**: Better conflict resolution
4. **Background Sync**: Automatic syncing
5. **Compression**: Reduce data size
6. **Encryption**: Client-side encryption
