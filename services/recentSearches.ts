/**
 * Recent Searches Service
 * Stores up to 20 recent searches in AsyncStorage (local, no cloud needed)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@easydict_recent_searches';
const MAX = 20;

export async function addRecentSearch(word: string): Promise<void> {
  try {
    const existing = await getRecentSearches();
    const filtered = existing.filter((w) => w.toLowerCase() !== word.toLowerCase());
    const updated = [word, ...filtered].slice(0, MAX);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // Silently fail – recent searches are non-critical
  }
}

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
