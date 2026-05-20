import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BirthdayCard from '../components/BirthdayCard';
import EmptyState from '../components/EmptyState';
import { Birthday } from '../src/types';
import { loadBirthdays } from '../src/storage';
import { sortByUpcoming } from '../src/dateUtils';
import { APP_BG, APP_PRIMARY, APP_TEXT, APP_TEXT_SECONDARY } from '../src/colors';

export default function HomeScreen() {
  const router = useRouter();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadBirthdays().then((data) => {
        setBirthdays([...data].sort(sortByUpcoming));
      });
    }, []),
  );

  const nextBirthday = birthdays.length > 0 ? birthdays[0] : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>AnotaNiver</Text>
          <Text style={styles.appSubtitle}>
            {birthdays.length === 0
              ? 'Seus aniversários'
              : `${birthdays.length} aniversário${birthdays.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <Text style={styles.headerEmoji}>🎂</Text>
      </View>

      {nextBirthday && (
        <View style={styles.nextSection}>
          <Text style={styles.nextLabel}>Próximo</Text>
          <BirthdayCard
            birthday={nextBirthday}
            onPress={() => router.push(`/edit/${nextBirthday.id}`)}
          />
        </View>
      )}

      {birthdays.length > 1 && (
        <View style={styles.listSection}>
          <Text style={styles.sectionLabel}>Todos</Text>
          <FlatList
            data={birthdays.slice(1)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BirthdayCard
                birthday={item}
                onPress={() => router.push(`/edit/${item.id}`)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {birthdays.length === 0 && <EmptyState />}

      <Pressable
        style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}
        onPress={() => router.push('/add')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: APP_TEXT,
    letterSpacing: -1,
  },
  appSubtitle: {
    fontSize: 14,
    color: APP_TEXT_SECONDARY,
    marginTop: 2,
  },
  headerEmoji: {
    fontSize: 36,
  },
  nextSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  nextLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_TEXT_SECONDARY,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_TEXT_SECONDARY,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: APP_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APP_PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 38,
  },
});
