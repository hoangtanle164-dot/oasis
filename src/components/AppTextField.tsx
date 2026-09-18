import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '../store/ThemeContext';
import { Radius, Spacing } from '../utils/theme';

interface Props {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  error?: string;
}

export default function AppTextField({ label, value, onChangeText, placeholder, keyboardType, multiline, error }: Props) {
  const { colors, dark } = useAppTheme();

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          multiline && styles.inputWrapMultiline,
          { backgroundColor: dark ? '#2C2C2E' : '#F2F2F7' },
          error ? { borderColor: colors.danger, borderWidth: 1 } : null,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          multiline={multiline}
          style={[styles.input, multiline && styles.inputMultiline, { color: colors.text }]}
        />
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrap: {
    borderRadius: Radius.md,
    justifyContent: 'center',
  },
  inputWrapMultiline: {
    minHeight: 90,
  },
  input: {
    fontSize: 15,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 90,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
