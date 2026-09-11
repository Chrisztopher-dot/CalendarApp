/**
 * Authentication Service
 * Manages user accounts, sessions, and Demo Mode in localStorage.
 */

import { ensureUserData, resetToDemo } from './storage.js';

const SESSION_KEY = 'organizer_active_user';
const USERS_REGISTRY_KEY = 'organizer_users_registry';

export const DEMO_USER = {
  email: 'demo@organizer.app',
  name: 'Demo Explorer',
  isDemo: true
};

export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new CustomEvent('organizerAuthChanged', { detail: { user } }));
}

/**
 * Register a new user
 */
export function registerUser(name, email, password) {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }

  const users = getRegisteredUsers();
  if (users.find(u => u.email === cleanEmail)) {
    throw new Error('An account with this email already exists. Please log in.');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    passwordHash: btoa(password), // simple client hash
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));

  // Initialize their isolated storage
  const userSession = {
    email: newUser.email,
    name: newUser.name,
    isDemo: false
  };
  ensureUserData(newUser.email, false, newUser.name);
  setCurrentUser(userSession);
  return userSession;
}

/**
 * Log in an existing user
 */
export function loginUser(email, password) {
  const cleanEmail = email.toLowerCase().trim();
  const users = getRegisteredUsers();
  const found = users.find(u => u.email === cleanEmail);

  if (!found) {
    throw new Error('No user found with this email. Please sign up or try Demo Mode.');
  }

  if (found.passwordHash !== btoa(password)) {
    throw new Error('Incorrect password. Please try again.');
  }

  const userSession = {
    email: found.email,
    name: found.name,
    isDemo: false
  };
  ensureUserData(found.email, false, found.name);
  setCurrentUser(userSession);
  return userSession;
}

/**
 * One-click Demo Mode login
 */
export function loginAsDemo() {
  ensureUserData(DEMO_USER.email, true, DEMO_USER.name);
  setCurrentUser(DEMO_USER);
  return DEMO_USER;
}

/**
 * Reset Demo Data to initial state
 */
export function resetDemoData() {
  resetToDemo(DEMO_USER.email);
  window.dispatchEvent(new CustomEvent('organizerDataChanged', { detail: { email: DEMO_USER.email } }));
}

/**
 * Log out
 */
export function logoutUser() {
  setCurrentUser(null);
}

/**
 * Check if an account exists for the given email
 */
export function checkUserExists(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail) return false;
  if (cleanEmail === DEMO_USER.email.toLowerCase()) return true;
  const users = getRegisteredUsers();
  return !!users.find(u => u.email === cleanEmail);
}

/**
 * Reset password for a registered account
 */
export function resetUserPassword(email, newPassword) {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }
  if (!newPassword || newPassword.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }

  // Demo user password reset is simulated
  if (cleanEmail === DEMO_USER.email.toLowerCase()) {
    return true;
  }

  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.email === cleanEmail);
  if (index === -1) {
    throw new Error('No user found with this email. Please verify the email address.');
  }

  users[index].passwordHash = btoa(newPassword);
  users[index].updatedAt = new Date().toISOString();
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  return true;
}
