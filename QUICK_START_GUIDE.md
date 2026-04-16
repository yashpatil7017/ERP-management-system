## 🚀 Quick Start Guide - Full Setup

### Step 1: Start the Backend Server

```bash
cd backend
npm install          # (if not done yet)
npm run dev          # Starts backend on http://localhost:5000
```

Expected output:
```
Server is running on port 5000
```

### Step 2: Start the Frontend Dev Server

Open a new terminal:

```bash
cd frontend
npm install          # (if not done yet)
npm run dev          # Starts frontend on http://localhost:5174
```

Expected output:
```
VITE v8.0.8  ready in 826 ms
➜  Local:   http://localhost:5174/
```

### Step 3: Test the Application

1. **Open browser**: http://localhost:5174/login
2. **You should see**: A professional login form with:
   - Email input field
   - Password input field
   - Show/Hide password toggle
   - "Sign In" button
   - "Create Account" link
   - "Forgot?" password link

3. **Try logging in**:
   - Use credentials from your backend database
   - Or create a test user via `/register`

### Common Issues & Solutions

#### Issue: Blank White Page on /login

**Solution Steps:**
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab - see if requests are being made
4. Verify backend is running on port 5000
5. Verify database is connected

**If you see errors like:**
```
Failed to fetch resource from http://localhost:5000
```
→ Backend is not running. Start it first!

```
TypeError: Cannot read property 'email' of undefined
```
→ API response format is wrong. Check backend returns `{ token, user }`

#### Issue: API Calls Failing with 404

**Causes:**
- Backend server not running
- Wrong base URL (should be `http://localhost:5000`)
- Endpoints not matching (`/api/auth/login` should exist)

**Verify with curl:**
```bash
curl http://localhost:5000/
# Should return: "Hello from the backend!"
```

#### Issue: CORS Errors in Console

**Solution:**
- Backend already has CORS enabled in server.js
- If still getting errors, check backend error logs

### Testing Authentication Flow

#### Test 1: Register New User
```
1. Navigate to http://localhost:5174/register
2. Fill in:
   - Full Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Confirm Password: password123
   - Role: sales (or any role)
3. Click "Create Account"
4. Should redirect to /dashboard
```

#### Test 2: Login with Existing User
```
1. Navigate to http://localhost:5174/login
2. Enter credentials
3. Click "Sign In"
4. Should redirect to /dashboard
```

#### Test 3: Protected Routes
```
1. Login successfully
2. Try accessing:
   - http://localhost:5174/products (requires admin/sales role)
   - http://localhost:5174/customers (requires admin/sales role)
   - http://localhost:5174/admin (requires admin role only)
3. Should see content or redirect to /unauthorized
```

#### Test 4: Logout & Auto-redirect
```
1. Login successfully
2. Manually clear localStorage:
   - Open DevTools → Application → Local Storage
   - Delete "token" and "user" entries
3. Refresh page
4. Should redirect to /login automatically
```

### Browser DevTools Debugging

**To see API requests:**
1. Open DevTools (F12)
2. Go to Network tab
3. Perform login
4. Should see:
   - POST request to `http://localhost:5000/api/auth/login`
   - Response: `{ token: "...", user: {...} }`

**To check stored data:**
1. Open DevTools (F12)
2. Go to Application tab
3. Click Local Storage
4. Click `http://localhost:5174`
5. Should see `token` and `user` keys after login

**To test role-based access:**
1. After login, check DevTools → Application → Local Storage → `user`
2. Should show user object with `role` property
3. Different roles should have access to different pages

### Project Structure Reference

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js              # API client with interceptors
│   ├── components/
│   │   └── Loader.jsx            # Loading spinner
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state management
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx         # Login page
│   │   │   └── Register.jsx      # Registration page
│   │   ├── Dashboard/
│   │   ├── Products/
│   │   ├── Customers/
│   │   ├── Suppliers/
│   │   ├── SalesOrders/
│   │   ├── PurchaseOrders/
│   │   ├── GRN/
│   │   ├── Invoices/
│   │   └── Admin/
│   ├── routes/
│   │   └── ProtectedRoute.jsx    # Route protection wrapper
│   ├── App.jsx                   # Main routing
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles with TailwindCSS
├── package.json
└── vite.config.js

backend/
├── server.js                     # Express server setup
├── config/
│   └── db.js                     # MongoDB connection
├── controllers/
│   └── authController.js         # Login/Register logic
├── models/
│   └── user.js                   # User schema
├── routes/
│   └── authroutes.js             # Auth endpoints
├── middleware/
│   └── authmiddleware.js         # JWT verification
└── package.json
```

### Environment Setup (Optional)

If you want to use environment variables:

**Create `frontend/.env`:**
```
VITE_API_URL=http://localhost:5000
```

Then update `src/api/axios.js`:
```javascript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
```

### Useful npm Commands

**Frontend:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

**Backend:**
```bash
npm run dev      # Start dev server with nodemon
npm start        # Start production server
```

### Next Steps After Setup

1. ✅ Verify login works
2. ✅ Verify role-based access control
3. ✅ Test all protected routes
4. ⏳ Build dashboard components
5. ⏳ Implement CRUD operations for each module
6. ⏳ Add error handling and notifications
7. ⏳ Set up production deployment

---

**Ready to build your ERP system! 🎉**
