import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface HeaderProps {
  scrollY: any;
}

export default function Header({ scrollY }: HeaderProps) {
  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, 120], [170, 95], Extrapolation.CLAMP),
    opacity: interpolate(scrollY.value, [0, 120], [1, 0.7], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[styles.header, headerStyle]}>
      <Text style={styles.headerTitle}>Study Journal</Text>
      <Text style={styles.headerSubtitle}>
        Cámara, almacenamiento interno, galería, notificaciones y animaciones.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1D3557',
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#DDE8F5',
    marginTop: 8,
    fontSize: 14,
  },
});
