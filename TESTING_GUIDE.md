## 🧪 Testing Your ERP System

Now that the frontend is working, here's how to test everything:

### Quick Test Checklist

#### 1. **Frontend Display Test** ✅
```
Visit: http://localhost:5174/login
Expected: Professional login form with styling
```

#### 2. **Navigation Test**
```
From Login page:
- Click "Create Account" → Should go to /register
- Click "Forgot?" → Should navigate (or show error if not implemented)
```

#### 3. **Start Backend Server**
```bash
cd backend
npm run dev
# Wait for: "Server is running on port 5000"
```

#### 4. **Database Test**
```bash
# MongoDB should be running
# Check if user collection exists
mongo
use erp_db
db.users.find()
```

#### 5. **Registration Test**
```
1. Go to http://localhost:5174/register
2. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
   - Role: sales (or admin for full access)
3. Click "Create Account"
4. Should redirect to /dashboard
5. Check localStorage (DevTools → Application → Local Storage)
   - Should have "token" and "user" entries
```

#### 6. **Login Test**
```
1. Logout (clear localStorage)
2. Go to http://localhost:5174/login
3. Enter credentials from registration
4. Click "Sign In"
5. Should redirect to /dashboard
```

#### 7. **Protected Routes Test**
```
Authenticated as "sales" user, try:
- /products → Should work
- /customers → Should work
- /admin → Should redirect to /unauthorized
- /invoices → Should redirect to /unauthorized

Authenticated as "admin" user:
- All routes should work
```

#### 8. **Auto-logout Test**
```
1. Login successfully
2. Open DevTools (F12)
3. Go to Application → Local Storage
4. Delete "token" entry
5. Refresh page
6. Should redirect to /login
```

### Browser DevTools Debugging

**Console Tab:**
- Look for any red errors
- React errors usually appear here
- API errors will be logged

**Network Tab:**
- Check API calls:
  - `/api/auth/login` → Should return token and user
  - `/api/auth/register` → Should return token and user
- Check status codes (200, 401, 404, 500)
- Check response format

**Application Tab → Local Storage:**
- After login, should see:
  ```
  token: "eyJhbGc..."
  user: '{"id":"...","email":"...","role":"..."}'
  ```

**Network Tab Response Examples:**

**Successful Login:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "role": "sales"
  }
}
```

**Failed Login:**
```json
{
  "message": "Invalid credentials"
}
```

### Common Test Scenarios

#### Scenario 1: Happy Path (Registration → Login → Dashboard)
1. Register new user
2. See redirect to dashboard
3. Log out (clear localStorage)
4. Login with same credentials
5. See redirect to dashboard

#### Scenario 2: Role-Based Access
1. Register user with "sales" role
2. Try accessing /admin → Should redirect to /unauthorized
3. Register user with "admin" role
4. Try accessing /admin → Should show page

#### Scenario 3: Token Expiration
1. Login successfully
2. Modify token in localStorage to invalid value
3. Make any API call
4. Should get 401 error
5. Should redirect to /login

#### Scenario 4: Session Persistence
1. Login successfully
2. Close browser tab (not entire browser)
3. Open new tab and go to http://localhost:5174/dashboard
4. Should still be logged in (token persists in localStorage)

### API Endpoint Testing with cURL

**Test Backend Connection:**
```bash
curl http://localhost:5000/
# Response: "Hello from the backend!"
```

**Test Register Endpoint:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "sales"
  }'
```

**Test Login Endpoint:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Performance Testing

- **Login Form Load Time**: Should load in <1s
- **Network Request Time**: Should complete in <2s
- **Dashboard Load Time**: Should render in <2s

### Responsive Design Testing

Test on different screen sizes:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Check if:**
- Text is readable
- Buttons are clickable
- Forms are properly formatted
- No horizontal scrolling

### Security Testing

1. **Token Exposure**: 
   - Verify token is in localStorage, not in URL
   - Verify token is sent in Authorization header

2. **CORS**: 
   - Should allow requests from localhost:5174
   - Should reject requests from other origins

3. **Password Handling**:
   - Passwords should not be logged
   - Passwords should not be shown in Network tab

4. **Unauthorized Access**:
   - Direct URL access without token → redirect to /login
   - Token with insufficient role → redirect to /unauthorized

---

## 📊 Test Results Template

```
Date: ___________
Frontend Version: ___________
Backend Version: ___________

✅ = Pass | ❌ = Fail | ⏳ = Pending

Display Test:           ___
Navigation Test:        ___
Registration Test:      ___
Login Test:            ___
Protected Routes:      ___
Auto-logout:           ___
Session Persistence:   ___
Role-based Access:     ___
API Responses:         ___
Performance:           ___
Responsive Design:     ___

Notes:
_________________________________
_________________________________
```

---

**Happy Testing! 🎉**
