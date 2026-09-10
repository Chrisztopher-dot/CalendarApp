/**
 * Storage Service
 * Implements strict per-user data isolation via localStorage["organizerData_<email>"].
 * Provides simple CRUD functions and export/import capabilities.
 */

import { generateDemoData } from '../data/demoData.js';

export const STORAGE_PREFIX = 'organizerData_';

export function getStorageKey(email) {
  const cleanEmail = (email || 'anonymous').toLowerCase().trim();
  return `${STORAGE_PREFIX}${cleanEmail}`;
}

export function getDefaultUserData(email, name = 'User') {
  return {
    user: {
      email,
      name,
      createdAt: new Date().toISOString()
    },
    events: [],
    moods: [],
    goals: [],
    notes: [],
    media: [],
    settings: {
      theme: 'dark',
      defaultCalendarView: 'month'
    }
  };
}

/**
 * Load all data for a specific user email
 */
export function getUserData(email) {
  if (!email) return null;
  const key = getStorageKey(email);
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error parsing storage key ${key}:`, err);
    return null;
  }
}

/**
 * Save all data for a specific user email
 */
export function saveUserData(email, data) {
  if (!email) return;
  const key = getStorageKey(email);
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch custom event so listeners update reactively
    window.dispatchEvent(new CustomEvent('organizerDataChanged', { detail: { email } }));
  } catch (err) {
    console.error(`Error writing to localStorage for ${key}:`, err);
    throw err;
  }
}

/**
 * Initialize or get user data
 */
export function ensureUserData(email, isDemo = false, name = '') {
  let existing = getUserData(email);
  if (!existing) {
    existing = isDemo ? generateDemoData(email) : getDefaultUserData(email, name || email.split('@')[0]);
    saveUserData(email, existing);
  }
  return existing;
}

/**
 * Generic CRUD: Add item to a collection ('events', 'moods', 'goals', 'notes', 'media')
 */
export function createItem(email, collection, item) {
  const data = getUserData(email) || getDefaultUserData(email);
  if (!data[collection]) {
    data[collection] = [];
  }

  const newItem = {
    ...item,
    id: item.id || `${collection.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data[collection].push(newItem);
  saveUserData(email, data);
  return newItem;
}

/**
 * Generic CRUD: Update item in a collection
 */
export function updateItem(email, collection, id, updates) {
  const data = getUserData(email);
  if (!data || !data[collection]) return null;

  const index = data[collection].findIndex(i => i.id === id);
  if (index === -1) return null;

  const updatedItem = {
    ...data[collection][index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  data[collection][index] = updatedItem;
  saveUserData(email, data);
  return updatedItem;
}

/**
 * Generic CRUD: Delete item from collection
 */
export function deleteItem(email, collection, id) {
  const data = getUserData(email);
  if (!data || !data[collection]) return false;

  const beforeCount = data[collection].length;
  data[collection] = data[collection].filter(i => i.id !== id);
  if (data[collection].length !== beforeCount) {
    saveUserData(email, data);
    return true;
  }
  return false;
}

/**
 * Export data to JSON string or download file
 */
export function exportUserData(email) {
  const data = getUserData(email);
  if (!data) return null;

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calendar_organizer_${email}_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Import data from parsed JSON object
 */
export function importUserData(email, incomingData) {
  if (!incomingData || typeof incomingData !== 'object') {
    throw new Error('Invalid backup file format');
  }

  // Ensure collections exist
  const sanitized = {
    user: {
      email,
      name: incomingData.user?.name || email.split('@')[0],
      updatedAt: new Date().toISOString()
    },
    events: Array.isArray(incomingData.events) ? incomingData.events : [],
    moods: Array.isArray(incomingData.moods) ? incomingData.moods : [],
    goals: Array.isArray(incomingData.goals) ? incomingData.goals : [],
    notes: Array.isArray(incomingData.notes) ? incomingData.notes : [],
    media: Array.isArray(incomingData.media) ? incomingData.media : [],
    settings: incomingData.settings || { theme: 'dark', defaultCalendarView: 'month' }
  };

  saveUserData(email, sanitized);
  return sanitized;
}

/**
 * Reset user data (e.g. for demo mode reset)
 */
export function resetToDemo(email) {
  const demoData = generateDemoData(email);
  saveUserData(email, demoData);
  return demoData;
}
