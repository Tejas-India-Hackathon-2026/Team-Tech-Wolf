import { request } from './api';

const SESSION_STORAGE_KEY = 'agro_smart_session';
const USERS_REGISTRY_KEY = 'agro_smart_users';

export const normalizeRole = (roleStr) => {
  const clean = String(roleStr || '').toLowerCase().trim().replace(/[- ]/g, '_');
  if (clean.includes('admin')) return 'admin';
  if (clean.includes('owner') || clean.includes('machine')) return 'machine_owner';
  return 'farmer';
};

export const getRoleDisplayName = (roleStr) => {
  const norm = normalizeRole(roleStr);
  if (norm === 'admin') return 'Admin';
  if (norm === 'machine_owner') return 'Machinery Owner';
  return 'Farmer';
};

// Pre-seeded demo credentials for instant hackathon testing
export const DEMO_CREDENTIALS = {
  farmer: {
    identifier: '9876543210',
    email: 'farmer@agro-smart.com',
    password: 'Farmer@123',
    role: 'farmer',
    user_type: 'Farmer',
    name: 'Rameshwar Patel',
    state: 'Bihar',
    district: 'Patna'
  },
  owner: {
    identifier: '9876543211',
    email: 'owner@agro-smart.com',
    password: 'Owner@123',
    role: 'machine_owner',
    user_type: 'Machinery Owner',
    name: 'Suresh Singh Machinery',
    state: 'Maharashtra',
    district: 'Pune'
  },
  admin: {
    identifier: '9876500000',
    email: 'admin@agro-smart.com',
    password: 'Admin@123',
    role: 'admin',
    user_type: 'Admin',
    name: 'AGRO-SMART System Admin',
    state: 'Maharashtra',
    district: 'Pune'
  }
};

// Simple hash for demo client-side fallback validation (never store plaintext)
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
};

export const authService = {
  /**
   * Primary Login: POST /api/auth/login with local demo fallback.
   */
  async login(identifier, password, rememberMe = true) {
    const cleanId = String(identifier || '').trim().toLowerCase();
    if (!cleanId) throw new Error('Please enter your mobile number or email.');
    if (!password) throw new Error('Please enter your password.');

    // 1. Try Backend API
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: cleanId, password })
      });

      if (data && data.user) {
        const normUser = this._normalizeUser(data.user);
        this.saveSession(normUser, data.token, rememberMe);
        return { user: normUser, token: data.token, is_demo_session: true };
      }
    } catch (err) {
      console.warn('[AuthService] Backend login error (using local fallback):', err.message);
      if (err.message && err.message.includes('account has been disabled')) {
        throw err;
      }
    }

    // 2. Client-side Demo Fallback
    let matched = null;
    if (cleanId === DEMO_CREDENTIALS.farmer.identifier || cleanId === DEMO_CREDENTIALS.farmer.email) {
      if (password === DEMO_CREDENTIALS.farmer.password) {
        matched = {
          id: 'usr-demo-farmer-01',
          name: DEMO_CREDENTIALS.farmer.name,
          email: DEMO_CREDENTIALS.farmer.email,
          phone: DEMO_CREDENTIALS.farmer.identifier,
          role: 'farmer',
          user_type: 'Farmer',
          state: DEMO_CREDENTIALS.farmer.state,
          district: DEMO_CREDENTIALS.farmer.district,
          avatar: '👨‍🌾',
          status: 'Active'
        };
      } else {
        throw new Error('Invalid email/mobile or password.');
      }
    } else if (cleanId === DEMO_CREDENTIALS.owner.identifier || cleanId === DEMO_CREDENTIALS.owner.email) {
      if (password === DEMO_CREDENTIALS.owner.password) {
        matched = {
          id: 'usr-demo-owner-02',
          name: DEMO_CREDENTIALS.owner.name,
          email: DEMO_CREDENTIALS.owner.email,
          phone: DEMO_CREDENTIALS.owner.identifier,
          role: 'machine_owner',
          user_type: 'Machinery Owner',
          state: DEMO_CREDENTIALS.owner.state,
          district: DEMO_CREDENTIALS.owner.district,
          avatar: '🚜',
          status: 'Active'
        };
      } else {
        throw new Error('Invalid email/mobile or password.');
      }
    } else if (cleanId === DEMO_CREDENTIALS.admin.identifier || cleanId === DEMO_CREDENTIALS.admin.email) {
      if (password === DEMO_CREDENTIALS.admin.password) {
        matched = {
          id: 'usr-demo-admin-00',
          name: DEMO_CREDENTIALS.admin.name,
          email: DEMO_CREDENTIALS.admin.email,
          phone: DEMO_CREDENTIALS.admin.identifier,
          role: 'admin',
          user_type: 'Admin',
          state: DEMO_CREDENTIALS.admin.state,
          district: DEMO_CREDENTIALS.admin.district,
          avatar: '🛡️',
          status: 'Active'
        };
      } else {
        throw new Error('Invalid email/mobile or password.');
      }
    } else {
      // Check registered users in local storage
      const registered = this.getRegisteredDemoUsers();
      const found = registered.find(u => u.email.toLowerCase() === cleanId || u.phone === cleanId);
      if (found) {
        if (found.status === 'Disabled') {
          throw new Error('This account has been disabled by the administrator.');
        }
        if (found.passwordHash === simpleHash(password)) {
          matched = this._normalizeUser(found);
        } else {
          throw new Error('Invalid email/mobile or password.');
        }
      }
    }

    if (matched) {
      const token = `demo-tok-${Date.now()}`;
      this.saveSession(matched, token, rememberMe);
      return { user: matched, token, is_demo_session: true };
    }

    throw new Error('Account not found.');
  },

  /**
   * Primary Register: POST /api/auth/register with local demo fallback.
   */
  async register(formData) {
    const rawRole = formData.role || formData.user_type || 'farmer';
    let normRole = normalizeRole(rawRole);
    if (normRole === 'admin') normRole = 'farmer'; // No public admin registration

    const cleanData = {
      name: (formData.name || formData.fullName || '').trim(),
      phone: (formData.phone || formData.mobileNumber || '').trim(),
      email: (formData.email || '').trim().toLowerCase(),
      password: formData.password || '',
      role: normRole,
      user_type: getRoleDisplayName(normRole),
      state: formData.state || 'Maharashtra',
      district: formData.district || 'Pune'
    };

    // 1. Try Backend API
    try {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(cleanData)
      });
      if (res && res.user) {
        const normUser = this._normalizeUser(res.user);
        this.saveSession(normUser, res.token, true);
        return { user: normUser, token: res.token, is_demo_session: true };
      }
    } catch (err) {
      console.warn('[AuthService] Backend register error (using local fallback):', err.message);
      if (err.message && err.message.includes('already exists')) {
        throw err;
      }
    }

    // 2. Client-side Demo Fallback
    const registered = this.getRegisteredDemoUsers();
    if (registered.some(u => u.email === cleanData.email)) {
      throw new Error('An account with this email address already exists. Please log in.');
    }
    if (registered.some(u => u.phone === cleanData.phone)) {
      throw new Error('An account with this mobile number already exists. Please log in.');
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: cleanData.name,
      email: cleanData.email,
      phone: cleanData.phone,
      passwordHash: simpleHash(cleanData.password),
      role: cleanData.role,
      user_type: cleanData.user_type,
      state: cleanData.state,
      district: cleanData.district,
      avatar: cleanData.role === 'machine_owner' ? '🚜' : '👨‍🌾',
      status: 'Active',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    registered.push(newUser);
    this.saveRegisteredDemoUsers(registered);

    const safeUser = this._normalizeUser(newUser);
    const token = `demo-tok-${Date.now()}`;
    this.saveSession(safeUser, token, true);
    return { user: safeUser, token, is_demo_session: true };
  },

  /**
   * Save session safely to localStorage or sessionStorage.
   * NEVER stores raw password.
   */
  saveSession(user, token, rememberMe = true) {
    if (!user) return;
    const safeSession = {
      user: this._normalizeUser(user),
      token: token || `demo-tok-${Date.now()}`,
      savedAt: Date.now(),
      is_demo_session: true
    };
    const jsonStr = JSON.stringify(safeSession);
    try {
      if (rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, jsonStr);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, jsonStr);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('[AuthService] Storage save error:', err);
    }
  },

  /**
   * Restore safe session with fallback recovery.
   */
  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user) {
        parsed.user = this._normalizeUser(parsed.user);
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn('[AuthService] Session parse error:', err);
      return null;
    }
  },

  /**
   * Clears session storage on logout.
   */
  async logout() {
    try {
      const session = this.getSession();
      if (session && session.token) {
        await request('/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.token}` }
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },

  getRegisteredDemoUsers() {
    try {
      const raw = localStorage.getItem(USERS_REGISTRY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveRegisteredDemoUsers(users) {
    try {
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
    } catch (err) {
      console.warn('[AuthService] User registry save error:', err);
    }
  },

  _normalizeUser(user) {
    if (!user) return null;
    const normRole = normalizeRole(user.role || user.user_type);
    return {
      id: user.id || `usr-${Date.now()}`,
      name: user.name || 'User',
      email: user.email || '',
      phone: user.phone || '',
      role: normRole,
      user_type: getRoleDisplayName(normRole),
      state: user.state || 'Maharashtra',
      district: user.district || 'Pune',
      avatar: user.avatar || (normRole === 'admin' ? '🛡️' : (normRole === 'machine_owner' ? '🚜' : '👨‍🌾')),
      status: user.status || 'Active',
      created_at: user.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
  }
};
