import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { loadBirthdays, pickColor, saveBirthdays } from '../src/storage';
import { scheduleNotificationsForBirthday } from '../src/notifications';
import { Birthday } from '../src/types';
import { getDaysInMonth } from '../src/dateUtils';
import { MONTH_NAMES, APP_BG, APP_PRIMARY, APP_TEXT, APP_TEXT_SECONDARY, APP_SURFACE } from '../src/colors';

function buildDayItems(month: number) {
  const total = getDaysInMonth(month);
  return Array.from({ length: total }, (_, i) => i + 1);
}

export default function AddScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [yearText, setYearText] = useState('');
  const [saving, setSaving] = useState(false);

  const maxDay = getDaysInMonth(month);
  const safeDay = day > maxDay ? maxDay : day;

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Nome obrigatório', 'Por favor, insira o nome da pessoa.');
      return;
    }

    let year: number | undefined;
    if (yearText.trim()) {
      const parsed = parseInt(yearText.trim(), 10);
      if (isNaN(parsed) || parsed < 1900 || parsed > new Date().getFullYear()) {
        Alert.alert('Ano inválido', 'Use um ano entre 1900 e o ano atual.');
        return;
      }
      year = parsed;
    }

    setSaving(true);
    try {
      const existing = await loadBirthdays();
      const newBirthday: Birthday = {
        id: Date.now().toString(),
        name: trimmed,
        day: safeDay,
        month,
        year,
        color: pickColor(existing.length),
        notificationIds: [],
      };

      const notifIds = await scheduleNotificationsForBirthday(newBirthday);
      newBirthday.notificationIds = notifIds;

      await saveBirthdays([...existing, newBirthday]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: APP_BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Maria, João, Mãe..."
            placeholderTextColor={APP_TEXT_SECONDARY}
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Data de aniversário</Text>
          <View style={styles.pickerRow}>
            <View style={[styles.pickerWrap, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.pickerLabel}>Dia</Text>
              <Picker
                selectedValue={safeDay}
                onValueChange={(v) => setDay(v)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {buildDayItems(month).map((d) => (
                  <Picker.Item key={d} label={String(d)} value={d} />
                ))}
              </Picker>
            </View>

            <View style={[styles.pickerWrap, { flex: 2 }]}>
              <Text style={styles.pickerLabel}>Mês</Text>
              <Picker
                selectedValue={month}
                onValueChange={(v) => setMonth(v)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {MONTH_NAMES.map((m, i) => (
                  <Picker.Item key={i} label={m} value={i + 1} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Ano de nascimento{' '}
            <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 1990"
            placeholderTextColor={APP_TEXT_SECONDARY}
            value={yearText}
            onChangeText={setYearText}
            keyboardType="numeric"
            maxLength={4}
            returnKeyType="done"
          />
          <Text style={styles.hint}>Se informado, o app mostrará a idade.</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { opacity: pressed || saving ? 0.8 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Salvando...' : 'Salvar aniversário 🎉'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: APP_TEXT,
    marginBottom: 10,
  },
  optional: {
    fontWeight: '400',
    color: APP_TEXT_SECONDARY,
  },
  input: {
    backgroundColor: APP_SURFACE,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    color: APP_TEXT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  hint: {
    fontSize: 12,
    color: APP_TEXT_SECONDARY,
    marginTop: 6,
    marginLeft: 4,
  },
  pickerRow: {
    flexDirection: 'row',
  },
  pickerWrap: {
    backgroundColor: APP_SURFACE,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_TEXT_SECONDARY,
    textAlign: 'center',
    paddingTop: 10,
  },
  picker: {
    color: APP_TEXT,
  },
  pickerItem: {
    fontSize: 20,
    color: APP_TEXT,
  },
  saveButton: {
    backgroundColor: APP_PRIMARY,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: APP_PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
