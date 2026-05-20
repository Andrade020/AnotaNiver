import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { APP_TEXT, APP_TEXT_SECONDARY } from '../src/colors';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎂</Text>
      <Text style={styles.title}>Nenhum aniversário ainda</Text>
      <Text style={styles.subtitle}>
        Toque no botão + para adicionar o{'\n'}primeiro aniversário!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: APP_TEXT,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: APP_TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
});
