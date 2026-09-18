import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '../store/ThemeContext';
import { cardShadow, Radius, Spacing } from '../utils/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, style }: Props) {
  const { colors, dark } = useAppTheme();

  return (
    <View style={[styles.card, cardShadow(dark), { backgroundColor: colors.card }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
});
