# AGRO-SMART Authentication & Role-Based Access

**User Authentication, Session Management & Role-Based Access Control (RBAC)**

---

## 1. Authentication Overview

AGRO-SMART implements a role-differentiated authentication and session management architecture designed for three agricultural platform personas:
1. **Farmers**
2. **Machinery Owners**
3. **Platform Administrators**

The system provides full account registration, credential verification, salted password hashing, persistent session tokens, protected client-side routing, and dedicated role-specific dashboards.

---

## 2. Authentication Flow

```text
User Registration / Login Input (Email or Mobile + Password)
                      │
                      ▼
Frontend Authentication Form (LoginPage.jsx / RegisterPage.jsx)
                      │
                      ▼
Client Service Layer (src/services/authService.js)
                      │
                      ▼
Flask REST API (/api/auth/register or /api/auth/login)
                      │
                      ▼
Backend Authentication Service (backend/services/auth_service.py)
                      │
                      ▼
Credential Verification & Salted SHA-256 Hash Matching
                      │
                      ▼
Session Token Generation & User Profile Sanitization
                      │
                      ▼
React AuthContext Session Initialization & LocalStorage Persistence
                      │
                      ▼
Role Normalization ('farmer' | 'machine_owner' | 'admin')
                      │
                      ▼
Protected Route Redirection (/dashboard | /owner/dashboard | /admin/dashboard)
```

---

## 3. User Roles & Permissions

The platform enforces three distinct user roles with clear permission boundaries:

| User Role | Normalized Key | Default Route | Permitted Capabilities & Dashboard Features |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer` | `/dashboard` | • Upload leaf images for AI disease analysis<br>• Query crop-specific weather risk forecasts<br>• Browse machinery catalog and submit rental bookings<br>• Access APMC market price analytics & arbitrage calculator<br>• View personal booking history & cancel pending bookings |
| **Machinery Owner** | `machine_owner` | `/owner/dashboard` | • View registered machinery listings & specifications<br>• Receive inbound booking requests from local farmers<br>• Accept or Reject incoming rental reservations<br>• Mark equipment jobs as Completed<br>• Monitor revenue metrics & equipment utilization |
| **System Admin** | `admin` | `/admin/dashboard` | • Platform-wide KPI overview (total users, bookings, revenue)<br>• User Management: Enable / Disable user accounts<br>• Platform-wide bookings audit & status overrides<br>• Equipment catalog moderation |

---

## 4. Registration Flow

1. **User Input Form (`/register`)**:
   - Collects: Full Name, 10-digit Mobile Number, Email Address, Password ($\ge 6$ characters), State, District, and Role Selection (**Farmer** or **Machinery Owner**).
2. **Input Validation**:
   - Client and server validate email format, 10-digit phone structure, and password length.
3. **Admin Registration Prevention (Hard Security Rule)**:
   - Public users **cannot** register as Admin. If a malicious client passes `role: "admin"` in the registration payload, `auth_service.py` automatically normalizes it to `"farmer"`.
4. **Duplicate Prevention**:
   - Checks against existing phone numbers and email addresses in the user store.
5. **Account Creation & Immediate Session**:
   - Generates a unique user ID (`usr-...`), hashes the password with salt, issues a session token, stores user state in `AuthContext`, and redirects to the appropriate role dashboard.

---

## 5. Login Flow

1. **Credential Input (`/login`)**:
   - Farmer, Machinery Owner, or Admin enters their identifier (either **Mobile Number** or **Email Address**) and **Password**.
2. **API Dispatch**:
   - Sends POST request to `/api/auth/login`.
3. **Backend Credential Verification**:
   - Backend hashes the input password with `AUTH_SALT` and compares it against stored records.
   - Verifies account status (rejects disabled accounts).
4. **Session Token Issuance**:
   - Returns sanitized user profile (with password hash stripped) and a unique session token.
5. **Role-Based Redirect**:
   - `Farmer` $\rightarrow$ `/dashboard`
   - `Machinery Owner` $\rightarrow$ `/owner/dashboard`
   - `Admin` $\rightarrow$ `/admin/dashboard`

---

## 6. Role-Based Access Control (RBAC)

Client-side route protection is enforced via `<ProtectedRoute allowedRoles={[...]}>` wrappers in `App.jsx`:

```jsx
// Example RBAC Route Definitions
<Route path="/dashboard" element={
  <ProtectedRoute allowedRoles={['farmer']}>
    <FarmerDashboardPage />
  </ProtectedRoute>
} />

<Route path="/owner/dashboard" element={
  <ProtectedRoute allowedRoles={['machine_owner']}>
    <OwnerDashboardPage />
  </ProtectedRoute>
} />

<Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboardPage />
  </ProtectedRoute>
} />
```

### Unauthorized Access Handling
- **Unauthenticated Visitor**: Redirected to `/login` with return location state.
- **Role Mismatch** (e.g. Farmer attempting to access `/admin/dashboard`): Automatically redirected to their authorized role dashboard without infinite redirection loops or blank screens.

---

## 7. Farmer Authentication Experience

- **Demo Credentials**: `farmer@agro-smart.com` (or `9876543210`) / `Farmer@123`
- **Farmer Dashboard Features**:
  - **Quick Stats**: Active bookings count, recent scans, weather checks.
  - **My Bookings Table**: Displays machine name, scheduled date, estimated hours, total cost, owner contact, and live status (`PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`, `CANCELLED`).
  - **Action Shortcuts**: Direct links to Disease Detection, Weather Risk, Machinery Marketplace, and Market Intelligence.

---

## 8. Machinery Owner Authentication Experience

- **Demo Credentials**: `owner@agro-smart.com` (or `9876543211`) / `Owner@123`
- **Owner Dashboard Features**:
  - **Revenue & Utilization Cards**: Total estimated earnings, active equipment count, and pending requests.
  - **Inbound Booking Requests**: Client farmer name, phone number, service location, scheduled date/time, and projected revenue.
  - **Interactive Action Buttons**: Direct `[Accept Booking]`, `[Reject Booking]`, and `[Mark Completed]` controls.
  - **My Machinery Fleet**: List of owned equipment with hourly rates and availability badges.

---

## 9. Admin Authentication Experience

- **Demo Credentials**: `admin@agro-smart.com` (or `9876500000`) / `Admin@123`
- **Admin Dashboard Features**:
  - **Platform KPI Overview**: Total registered users, total active machinery listings, aggregate bookings, and platform revenue volume.
  - **User Management Tab**: Search and audit all registered farmers and owners, with one-click **Enable / Disable Account** toggles.
  - **Global Bookings Audit**: Inspect and manage booking records across the entire platform.
  - **Fleet Moderation**: View all equipment listings.

---

## 10. Authentication State Management

- **`AuthContext.jsx`**: Central React context managing `user`, `token`, `isLoading`, and `isAuthenticated`.
- **Storage Strategy**:
  - `Remember Me = true`: Persists user profile and token in `localStorage`.
  - `Remember Me = false`: Persists in `sessionStorage`.
- **Sync on Refresh**: `useEffect` in `AuthProvider` validates stored session tokens on page reload to restore state seamlessly without requiring re-login.

---

## 11. Backend Authentication Architecture

- **Endpoints (`backend/routes/auth_routes.py`)**:
  - `POST /api/auth/register`: Creates new user account (Farmers & Owners only).
  - `POST /api/auth/login`: Verifies credentials and returns session token.
  - `GET  /api/auth/me`: Validates session token and returns active profile.
  - `POST /api/auth/logout`: Clears session token from server session store.
- **Service Layer (`backend/services/auth_service.py`)**:
  - `_hash_password(password)`: Salted SHA-256 hash generation.
  - `normalize_role(role)`: Strict string normalization to internal keys.
  - `_sanitize_user(user)`: Removes sensitive hash fields before sending responses.

---

## 12. Demo Mode vs. Production Authentication

- **Current Prototype State**:
  - Pre-seeded with realistic demonstration accounts in `USERS_STORE` and in-memory `SESSIONS_STORE`.
  - Allows complete multi-role testing (Farmer booking $\rightarrow$ Owner accepting $\rightarrow$ Admin auditing) during hackathon evaluations without external database dependencies.
- **Supabase Compatibility**:
  - When Supabase credentials (`SUPABASE_URL`, `SUPABASE_KEY`) are active, user records are mirrored to the PostgreSQL `users` table.

---

## 13. Security Considerations

| Area | Current Hackathon Implementation | Recommended Production Target |
| :--- | :--- | :--- |
| **Password Storage** | Salted SHA-256 hashing | Argon2id or bcrypt with high work factor |
| **Session Tokens** | In-memory unique UUID session tokens | Cryptographically signed JWTs with short-lived access & refresh token rotation |
| **Transport** | Standard HTTP / Localhost | Mandatory TLS 1.3 / HTTPS with Secure, HttpOnly cookies |
| **Admin Provisioning**| Pre-configured system admin account | Enterprise IAM / Multi-Factor Authentication (MFA) |

---

## 14. Future Production Authentication Roadmap

1. **Supabase Auth / OAuth 2.0**: Integrate Google Sign-In and mobile social logins.
2. **Mobile OTP Verification**: SMS-based One-Time Password login via Twilio / Fast2SMS for rural users without email addresses.
3. **JWT Access & Refresh Token Rotation**: Stateless signed token pairs stored in `HttpOnly` cookies.
4. **Self-Service Password Reset**: Email/SMS verification tokens for forgotten passwords.
5. **Rate Limiting & Brute-Force Defense**: Redis-backed login attempt throttling.
6. **Comprehensive Audit Logs**: Immutably record all login timestamps, IP addresses, and admin user state modifications.

---

## 15. Jury Technical Explanation

> *"How does authentication and role-based access work in AGRO-SMART?"*

```text
User Enters Credentials (Email/Mobile + Password)
                     │
                     ▼
POST /api/auth/login (Flask REST Endpoint)
                     │
                     ▼
Salted SHA-256 Password Hash Verification (auth_service.py)
                     │
                     ▼
Session Token & Sanitized Profile Returned
                     │
                     ▼
AuthContext Stores State (LocalStorage / SessionStorage)
                     │
                     ▼
Role Identified ('farmer' | 'machine_owner' | 'admin')
                     │
                     ▼
ProtectedRoute Directs User to Dedicated Role Dashboard
```

---

## 16. Important Technical Limitations

1. Session tokens are currently stored in memory on the Flask backend; restarting the backend process invalidates active demo sessions.
2. Password recovery ("Forgot Password") currently operates as a prototype UI flow without automated email/SMS dispatch.
3. User passwords cannot be changed by the user within the prototype settings interface.
