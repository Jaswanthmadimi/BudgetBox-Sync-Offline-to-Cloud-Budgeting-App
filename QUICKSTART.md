# BudgetBox - Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the App
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 3: Create an Account
1. Click "Sign Up"
2. Enter any email (e.g., `test@example.com`)
3. Enter a password (min 6 characters)
4. Click "Sign Up"

### Step 4: Enter Your Budget
1. Enter your monthly income (e.g., `5000`)
2. Fill in your expenses:
   - Bills: `1200`
   - Food: `600`
   - Transport: `300`
   - Subscriptions: `100`
   - Miscellaneous: `200`

### Step 5: Watch It Auto-Save
- Notice the "Last saved" timestamp updating
- Status shows "Sync Pending"

### Step 6: Sync to Server
1. Click the "Sync" button
2. Status changes to "Synced"
3. Your data is now backed up

## Testing Offline Mode

### Test 1: Refresh While Offline
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Refresh the page (F5)
5. Your data is still there!

### Test 2: Edit While Offline
1. While still offline, change income to `6000`
2. See "Offline" indicator in header
3. Status shows "Local Only"
4. Data still saves locally
5. Close browser completely
6. Reopen and navigate back
7. Changes are preserved!

### Test 3: Sync After Going Online
1. Uncheck "Offline" in DevTools
2. See "Online" indicator appear
3. Status changes to "Sync Pending"
4. Click "Sync"
5. Changes uploaded to server

## Understanding the Dashboard

### Burn Rate
Shows what percentage of your income you're spending.
- **Green** (< 70%): Healthy spending
- **Yellow** (70-90%): Moderate spending
- **Red** (> 90%): High spending

### Savings Potential
Calculated as: `Income - Total Expenses`
- **Positive**: You're saving money
- **Negative**: You're overspending

### Spending Breakdown
Pie chart showing where your money goes.
- Hover over sections for details
- Colors match category labels

### Warnings
Smart alerts based on your budget:
- Subscriptions > 30% of income
- Food > 40% of income
- Negative savings
- Low savings rate (< 20%)

## Common Questions

### Q: Do I need internet to use this?
**A:** No! The app works completely offline.

### Q: Will I lose my data if I close the browser?
**A:** No! All data is saved to IndexedDB automatically.

### Q: What happens if I edit on two devices?
**A:** The last device to sync will overwrite. Sync one device at a time.

### Q: Is my data secure?
**A:** Yes! Each user can only see their own data (Row Level Security).

### Q: Can I use this on mobile?
**A:** Yes! The app is fully responsive.

### Q: What if sync fails?
**A:** Your data stays safe locally. Try syncing again when online.

## Pro Tips

1. **Sync Regularly**: Click sync when online to backup your data
2. **Check Warnings**: Review insights to improve your budget
3. **Use Real Numbers**: Enter actual amounts for accurate analytics
4. **Update Monthly**: Adjust your budget as expenses change
5. **Modern Browser**: Use latest Chrome, Firefox, or Safari

## Keyboard Shortcuts

- `Tab`: Move between input fields
- `Enter`: Submit login form
- `Ctrl/Cmd + R`: Refresh (data persists!)
- `F12`: Open DevTools for offline testing

## Demo Account

Want to see a pre-filled example?

```
Email: hire-me@anshumat.org
Password: HireMe@2025!
```

## Next Steps

- Read [OFFLINE_MODE.md](./OFFLINE_MODE.md) for deep dive
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Read [README.md](./README.md) for full documentation

## Troubleshooting

### Problem: App won't load
**Solution:** Clear browser cache, reload page

### Problem: Data not saving
**Solution:** Check if in private/incognito mode (won't work there)

### Problem: Sync button disabled
**Solution:** Check internet connection, ensure you're online

### Problem: "Authentication error"
**Solution:** Sign out and sign back in

### Problem: Old data showing
**Solution:** Click sync to get latest from server

## Build for Production

```bash
npm run build
```

Files will be in `dist/` folder, ready for deployment.

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow prompts, and your app will be live!

---

**Enjoy using BudgetBox!** Report issues or suggestions to the development team.
