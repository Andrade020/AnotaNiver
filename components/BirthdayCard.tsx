import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Birthday } from '../src/types';
import { DARK_TEXT_COLORS, APP_TEXT } from '../src/colors';
import { daysUntilBirthday, formatBirthdayDate, getAge } from '../src/dateUtils';

interface Props {
  birthday: Birthday;
  onPress: () => void;
}

export default function BirthdayCard({ birthday, onPress }: Props) {
  const days = daysUntilBirthday(birthday.day, birthday.month);
  const isDark = DARK_TEXT_COLORS.includes(birthday.color);
  const textColor = isDark ? APP_TEXT : '#FFFFFF';

  const countdownText =
    days === 0
      ? 'Hoje! 🎉'
      : days === 1
        ? 'Amanhã! 🎂'
        : `${days} dias`;

  const age =
    birthday.year ? getAge(birthday.year, birthday.month, birthday.day) + (days === 0 ? 0 : 1) : null;
  const ageLabel = age !== null ? (days === 0 ? `${age} anos hoje!` : `fará ${age} anos`) : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: birthday.color, opacity: pressed ? 0.88 : 1 }]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
          {birthday.name}
        </Text>
        <Text style={[styles.date, { color: textColor, opacity: 0.85 }]}>
          {formatBirthdayDate(birthday.day, birthday.month, birthday.year)}
        </Text>
        {ageLabel && (
          <Text style={[styles.age, { color: textColor, opacity: 0.75 }]}>{ageLabel}</Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={[styles.countdown, { color: textColor }]}>{countdownText}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
  },
  age: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  countdown: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
});
