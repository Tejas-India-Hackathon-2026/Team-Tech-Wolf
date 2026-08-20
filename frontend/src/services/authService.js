import { request } from './api';

const SESSION_STORAGE_KEY = 'agro_smart_demo_session';

// Pre-seeded demo credentials for instant hackathon testing
export const DEMO_CREDENTIALS = {
  farmer: {
    identifier: '9876543210',
    email: 'farmer@agro-smart.com',
    password: 'Farmer@123',
    role: 'Farmer',
    name: 'Rameshwar Patel',
    state: 'Bihar',
    district: 'Patna'
  },
  owner: {
    identifier: '9876543211',
    email: 'owner@agro-smart.com',
    password: 'Owner@123',
    role: 'Machinery Owner',
    name: 'Suresh Singh Machinery',
    state: 'Maharashtra',
    district: 'Pune'
  },
  admin: {
    identifier: '9876500000',
    email: 'admin@agro-smart.com',
    password: 'Admin@123',
    role: 'Admin',
    name: 'AGRO-SMART System Admin',
    state: 'Maharashtra',
    district: 'Pune'
  }
};

export const authService = {
  /**
   * Primary Login: POST /api/auth/login
   * Returns user profile and session token.
   */
  async login(identifier, password, rememberMe = true) {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      if (data && data.user) {
        this.saveSession(data.user, data.token, rememberMe);
        return data;
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      console.warn('[AuthService] Backend login fallback:', err.message);

      // Client-side demo fallback
      const cleanId = String(identifier || '').trim().toLowerCase();
      
      let matched = null;
      if (cleanId === DEMO_CREDENTIALS.farmer.identifier || cleanId === DEMO_CREDENTIALS.farmer.email) {
        if (password === DEMO_CREDENTIALS.farmer.password) {
          matched = {
            id: 'usr-demo-farmer-01',
            name: DEMO_CREDENTIALS.farmer.name,
            email: DEMO_CREDENTIALS.farmer.email,
            phone: DEMO_CREDENTIALS.farmer.identifier,
            user_type: DEMO_CREDENTIALS.farmer.role,
            state: DEMO_CREDENTIALS.farmer.state,
            district: DEMO_CREDENTIALS.farmer.district,
            avatar: '👨‍🌾',
            status: 'Active'
          };
        } else {
          throw new Error('Invalid password. Please try again.');
        }
      } else if (cleanId === DEMO_CREDENTIALS.owner.identifier || cleanId === DEMO_CREDENTIALS.owner.email) {
        if (password === DEMO_CREDENTIALS.owner.password) {
          matched = {
            id: 'usr-demo-owner-02',
            name: DEMO_CREDENTIALS.owner.name,
            email: DEMO_CREDENTIALS.owner.email,
            phone: DEMO_CREDENTIALS.owner.identifier,
            user_type: DEMO_CREDENTIALS.owner.role,
            state: DEMO_CREDENTIALS.owner.state,
            district: DEMO_CREDENTIALS.owner.district,
            avatar: '🚜',
            status: 'Active'
          };
        } else {
          throw new Error('Invalid password. Please try again.');
        }
      } else if (cleanId === DEMO_CREDENTIALS.admin.identifier || cleanId === DEMO_CREDENTIALS.admin.email) {
        if (password === DEMO_CREDENTIALS.admin.password) {
          matched = {
            id: 'usr-demo-admin-00',
            name: DEMO_CREDENTIALS.admin.name,
            email: DEMO_CREDENTIALS.admin.email,
            phone: DEMO_CREDENTIALS.admin.identifier,
            user_type: 'Admin',
            state: DEMO_CREDENTIALS.admin.state,
            district: DEMO_CREDENTIALS.admin.district,
            avatar: '🛡️',
            status: 'Active'
          };
        } else {
          throw new Error('Invalid password. Please try again.');
        }
      } else {
        // Check registered demo users stored in localStorage registry
        const registeredUsers = this.getRegisteredDemoUsers();
        const found = registeredUsers.find(
          u => u.email.toLowerCase() === cleanId || u.phone === cleanId
        );
        if (found) {
          if (found.passwordHash === simpleHash(password)) {
            matched = {
              id: found.id,
              name: found.name,
              email: found.email,
              phone: found.phone,
              user_type: found.user_type,
              state: found.state,
              district: found.district,
              avatar: found.avatar || '👨‍🌾'
            };
          } else {
            throw new Error('Invalid password. Please try again.');
          }
        }
      }

      if (matched) {
        const token = `demo-tok-${Date.now()}`;
        this.saveSession(matched, token, rememberMe);
        return { user: matched, token, is_demo_session: true };
      }

      throw new Error(err.message || 'No account found with these credentials. Please check or register.');
    }
  },

  /**
   * Primary Register: POST /api/auth/register
   */
  async register(formData) {
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (data && data.user) {
        this.saveSession(data.user, data.token, true);
        return data;
      }
      throw new Error('Invalid registration response');
    } catch (err) {
      console.warn('[AuthService] Backend register fallback:', err.message);

      // Client-side demo fallback registration
      const newUser = {
        id: `usr-demo-${Date.now()}`,
        name: formData.name || formData.fullName,
        email: (formData.email || '').toLowerCase(),
        phone: formData.phone || formData.mobileNumber,
        user_type: formData.user_type || formData.userType || 'Farmer',
        state: formData.state || 'Maharashtra',
        district: formData.district || 'Pune',
        avatar: (formData.user_type || formData.userType) === 'Machinery Owner' ? '🚜' : '👨‍🌾',
        passwordHash: simpleHash(formData.password)
      };

      // Save to local registry
      const registered = this.getRegisteredDemoUsers();
      registered.push(newUser);
      localStorage.setItem('agro_smart_registered_users', JSON.stringify(registered));

      const token = `demo-tok-${Date.now()}`;
      const publicProfile = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        user_type: newUser.user_type,
        state: newUser.state,
        district: newUser.district,
        avatar: newUser.avatar
      };

      this.saveSession(publicProfile, token, true);
      return { user: publicProfile, token, is_demo_session: true };
    }
  },

  /**
   * Logout: Clears demo session
   */
  async logout() {
    try {
      const session = this.getSession();
      if (session && session.token) {
        await request('/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.token}` },
        });
      }
    } catch (err) {
      console.warn('[AuthService] Logout backend call notice:', err.message);
    } finally {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },

  /**
   * Save session data (Never stores plaintext passwords)
   */
  saveSession(user, token, persistent = true) {
    const sessionPayload = {
      user,
      token,
      timestamp: Date.now(),
      is_demo_session: true
    };
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));
    if (persistent) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },

  /**
   * Get active user session
   */
  getSession() {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser() {
    const session = this.getSession();
    return session ? session.user : null;
  },

  /**
   * Updates current user profile in session storage
   */
  updateSessionUser(updates) {
    const session = this.getSession();
    if (!session) return null;
    session.user = { ...session.user, ...updates };
    const isPersistent = !!localStorage.getItem(SESSION_STORAGE_KEY);
    this.saveSession(session.user, session.token, isPersistent);
    return session.user;
  },

  getRegisteredDemoUsers() {
    try {
      const list = localStorage.getItem('agro_smart_registered_users');
      return list ? JSON.parse(list) : [];
    } catch {
      return [];
    }
  }
};

/**
 * Fast client hash for demo comparison (no plaintext stored)
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}
