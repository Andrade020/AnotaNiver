import AsyncStorage from '@react-native-async-storage/async-storage';
import { Birthday } from './types';
import { CARD_COLORS } from './colors';

const STORAGE_KEY = '@anotaniver:birthdays';

export async function loadBirthdays(): Promise<Birthday[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveBirthdays(birthdays: Birthday[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(birthdays));
}

export function pickColor(index: number): string {
  return CARD_COLORS[index % CARD_COLORS.length];
}
