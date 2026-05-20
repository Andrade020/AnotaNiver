import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { requestPermissions } from '../src/notifications';
import { APP_BG, APP_PRIMARY, APP_TEXT } from '../src/colors';

export default function RootLayout() {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: APP_BG },
          headerTintColor: APP_TEXT,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: APP_BG },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="add"
          options={{
            title: 'Adicionar aniversário',
            headerBackTitle: 'Voltar',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="edit/[id]"
          options={{
            title: 'Editar aniversário',
            headerBackTitle: 'Voltar',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
