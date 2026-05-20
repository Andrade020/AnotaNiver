import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Birthday } from './types';
import { getDayBeforeMonthDay } from './dateUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') return true;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNotificationsForBirthday(
  birthday: Birthday,
): Promise<string[]> {
  const ids: string[] = [];

  const dayBefore = getDayBeforeMonthDay(birthday.month, birthday.day);

  try {
    const dayBeforeId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎂 Amanhã é aniversário!',
        body: `Amanhã é aniversário de ${birthday.name}!`,
        data: { birthdayId: birthday.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        repeats: true,
        month: dayBefore.month,
        day: dayBefore.day,
        hour: 9,
        minute: 0,
      },
    });
    ids.push(dayBeforeId);
  } catch {
    // ignore scheduling errors for day-before
  }

  try {
    const dayOfId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Feliz aniversário!',
        body: `Hoje é aniversário de ${birthday.name}! Não esquece de parabenizar!`,
        data: { birthdayId: birthday.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        repeats: true,
        month: birthday.month,
        day: birthday.day,
        hour: 9,
        minute: 0,
      },
    });
    ids.push(dayOfId);
  } catch {
    // ignore scheduling errors
  }

  return ids;
}

export async function cancelNotificationsForBirthday(ids: string[]): Promise<void> {
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // ignore
    }
  }
}
