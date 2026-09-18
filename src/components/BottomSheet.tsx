import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../store/ThemeContext';
import { Radius, Spacing } from '../utils/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeightRatio?: number;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function BottomSheet({ visible, onClose, title, children, maxHeightRatio = 0.9 }: Props) {
  const { colors } = useAppTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
      overlayOpacity.setValue(0);
    }
  }, [visible, translateY, overlayOpacity]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              { backgroundColor: colors.card, maxHeight: SCREEN_HEIGHT * maxHeightRatio, transform: [{ translateY }] },
            ]}
          >
            <View style={styles.handle} />
            <SafeAreaView edges={['bottom']} style={styles.safeArea}>
              {title ? (
                <View style={styles.header}>
                  <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                  <TouchableOpacity onPress={onClose} hitSlop={10}>
                    <Ionicons name="close-circle" size={26} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              ) : null}
              <View style={styles.content}>{children}</View>
            </SafeAreaView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  kav: {
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(150,150,150,0.5)',
    alignSelf: 'center',
    marginTop: 8,
  },
  safeArea: {
    flexShrink: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});
