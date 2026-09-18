import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DataProvider, useData } from './src/store/DataContext';
import { ThemeProvider, useAppTheme } from './src/store/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { BrandColors } from './src/utils/theme';

function LoadingGate({ children }: { children: React.ReactNode }) {
  const { loading } = useData();
  const { colors } = useAppTheme();

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

function AppContent() {
  const { dark } = useAppTheme();
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <LoadingGate>
        <AppNavigator />
      </LoadingGate>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </DataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
