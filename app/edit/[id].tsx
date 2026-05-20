import React, { useEffect, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { loadBirthdays, saveBirthdays } from '../../src/storage';
import {
  cancelNotificationsForBirthday,
  scheduleNotificationsForBirthday,
} from '../../src/notifications';
import { Birthday } from '../../src/types';
import { getDaysInMonth } from '../../src/dateUtils';
import { MONTH_NAMES, APP_BG, APP_PRIMARY, APP_TEXT, APP_TEXT_SECONDARY, APP_SURFACE } from '../../src/colors';

function buildDayItems(month: number) {
  const total = getDaysInMonth(month);
  return Array.from({ length: total }, (_, i) => i + 1);
}

export default function EditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState('');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [yearText, setYearText] = useState('');
  const [original, setOriginal] = useState<Birthday | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBirthdays().then((all) => {
      const found = all.find((b) => b.id === id);
      if (found) {
        setOriginal(found);
        setName(found.name);
        setDay(found.day);
        setMonth(found.month);
        setYearText(found.year ? String(found.year) : '');
      }
    });
  }, [id]);

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

    if (!original) return;
    setSaving(true);

    try {
      await cancelNotificationsForBirthday(original.notificationIds);

      const updated: Birthday = {
        ...original,
        name: trimmed,
        day: safeDay,
        month,
        year,
        notificationIds: [],
      };

      const notifIds = await scheduleNotificationsForBirthday(updated);
      updated.notificationIds = notifIds;

      const all = await loadBirthdays();
      await saveBirthdays(all.map((b) => (b.id === id ? updated : b)));

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Remover aniversário',
      `Remover o aniversário de ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            if (!original) return;
            await cancelNotificationsForBirthday(original.notificationIds);
            const all = await loadBirthdays();
            await saveBirthdays(all.filter((b) => b.id !== id));
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          },
        },
      ],
    );
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
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Remover aniversário</Text>
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
  deleteButton: {
    marginTop: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
