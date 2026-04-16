# 🔧 Troubleshooting Guide

## ❓ Still No CSS Styling?

### Step 1: Clear Cache and Refresh
```
1. Open DevTools (F12)
2. Right-click Refresh button
3. Select "Empty cache and hard refresh"
```

### Step 2: Check Browser Console
```
F12 → Console Tab
Look for errors like:
- Tailwind CSS errors
- Module import errors
- API errors
```

### Step 3: Check Terminal Output
```
Look for errors like:
- [postcss] errors
- [vite] errors
- Build errors
```

### Step 4: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 5: Clear node_modules
```bash
# If still having issues
rm -r node_modules
npm install
npm run dev
```

---

## ❓ Dev Server Won't Start

### Error: "Port already in use"
```
Solution: The port is in use by another process
Check which ports are in use:
- 5173, 5174, 5175, 5176, 5177 might all be in use

Kill the old process:
Windows: 
  taskkill /PID <PID> /F

Or just wait for Vite to find next available port
```

### Error: "Cannot find module"
```
Solution: Missing dependencies

Run:
npm install

Then restart:
npm run dev
```

---

## ❓ API Errors (401, 404, etc.)

### Check Backend is Running
```bash
# Terminal 2
cd backend
npm run dev

# Should show:
# Server is running on port 5000
```

### Test Backend Connection
```bash
# In another terminal
curl http://localhost:5000/

# Should return:
# "Hello from the backend!"
```

### Check API Configuration
```javascript
// File: src/api/axios.js

// Should have:
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'

// NOT:
baseURL: process.env.REACT_APP_API_URL || ...
```

---

## ❓ Form Validation Errors

### "Please fill in all fields"
```
Solution: Enter both email and password
- Email format: something@example.com
- Password: at least 1 character (no validation on length currently)
```

### "Please enter a valid email address"
```
Solution: Use proper email format
✅ test@example.com
✅ user@domain.co.uk
❌ test@domain
❌ @domain.com
❌ testdomain.com
```

---

## ❓ Login/Register Not Working

### Step 1: Check Network Tab
```
DevTools → Network Tab
Perform login/register
Check requests:
- POST /api/auth/login
- POST /api/auth/register

Expected status: 200 (success) or 400/401 (error)
```

### Step 2: Check Response
```
In Network Tab:
Click on the request
Go to "Response" tab
Should see:
{
  "token": "...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "..."
  }
}
```

### Step 3: Check Backend Logs
```
Look at backend terminal output
Should show API request logs
Check for errors in backend console
```

### Step 4: Check Database
```bash
# Connect to MongoDB
mongo
use erp_db
db.users.find()

# Should show users you registered
```

---

## ❓ localStorage Issues

### Check localStorage
```
DevTools → Application → Local Storage
Click: http://localhost:5177

Should see after login:
- token: eyJhbGc...
- user: {"id":"...", "email":"...", "role":"..."}
```

### Clear localStorage
```
DevTools → Application → Local Storage
Right-click → Clear All

Then refresh page
Should redirect to /login
```

---

## ❓ Tailwind CSS Not Working

### Check if Config Files Exist
```bash
# Should exist:
✅ tailwind.config.js
✅ postcss.config.js
✅ src/index.css (with @tailwind directives)
```

### Check if Packages Installed
```bash
npm list tailwindcss @tailwindcss/postcss @tailwindcss/vite

Should show:
✅ tailwindcss@4.2.2
✅ @tailwindcss/postcss@4.x.x
✅ @tailwindcss/vite@4.x.x
```

### Check index.css
```css
/* Should have at top: */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## ❓ Performance Issues

### Slow Page Load?
```
Check:
1. Network tab → see if requests are slow
2. DevTools → Performance tab
3. Check if backend is responding
4. Try refreshing
```

### Slow API Calls?
```
Check:
1. Backend server performance
2. Database query performance
3. Network latency (ping localhost:5000)
```

---

## ✅ Verification Checklist

Before troubleshooting, verify:

- [x] Frontend dev server is running
  ```bash
  npm run dev
  # Should show: ➜ Local: http://localhost:XXXX/
  ```

- [x] You're visiting correct URL
  ```
  Check terminal for actual port
  Visit: http://localhost:XXXX/login
  ```

- [x] Browser cache is cleared
  ```
  F12 → Right-click Refresh → Empty cache and hard refresh
  ```

- [x] Console has no red errors
  ```
  F12 → Console tab
  Should be clean with no red errors
  ```

- [x] All config files exist
  ```
  ✅ tailwind.config.js
  ✅ postcss.config.js
  ✅ vite.config.js
  ✅ src/index.css
  ```

---

## 🆘 Still Having Issues?

### Option 1: Kill All Ports
```bash
# Windows PowerShell
taskkill /F /IM node.exe

# Then restart
npm run dev
```

### Option 2: Fresh Install
```bash
# Remove all
rm -r node_modules
rm package-lock.json

# Reinstall
npm install

# Start
npm run dev
```

### Option 3: Check Logs
```bash
# Look for actual error messages in terminal
# Copy error message
# Try searching in browser console

Common issues:
- Missing @tailwind directives
- Wrong import.meta.env variable
- Missing config files
- Missing packages
```

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| No styling | Clear cache, hard refresh (Ctrl+Shift+R) |
| Port in use | Vite will auto-increment, check terminal |
| API 404 | Start backend server in new terminal |
| API 401 | Token issue, clear localStorage |
| Form won't submit | Check console for validation errors |
| Page blank | Check console (F12) for errors |
| Slow performance | Check Network tab for slow requests |

---

## 🎯 Common Fixes

**Fix 1: CSS Not Loading**
```
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check if @tailwind in index.css
4. Restart dev server
```

**Fix 2: API Not Working**
```
1. Start backend server
2. Check Network tab
3. Look at response in DevTools
4. Check backend console for errors
```

**Fix 3: Can't Login**
```
1. Register new user first
2. Check if user exists in database
3. Verify password is correct
4. Check backend logs
```

**Fix 4: Page Won't Load**
```
1. Check terminal for current port
2. Check console (F12) for JS errors
3. Clear localStorage
4. Restart dev server
```

---

## 📊 Debug Info to Share

If asking for help, provide:
```
1. Error message (screenshot or copy-paste)
2. Browser console errors (F12 → Console)
3. Network request (F12 → Network)
4. Terminal output (full error)
5. File contents (if relevant)
6. Steps to reproduce
```

---

**Remember: Most issues can be fixed by:**
1. Clearing cache and hard refresh
2. Restarting the dev server
3. Checking the console for errors
4. Verifying config files exist

Good luck! 🚀
