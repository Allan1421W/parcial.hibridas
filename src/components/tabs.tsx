import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TabsProps {
  tab: 'create' | 'notes';
  onTabChange: (tab: 'create' | 'notes') => void;
}

export default function Tabs({ tab, onTabChange }: TabsProps) {
  return (
    <View style={styles.tabs}>
      <Pressable
        style={[styles.tab, tab === 'create' && styles.activeTab]}
        onPress={() => onTabChange('create')}
      >
        <Text style={styles.tabText}>Crear nota</Text>
      </Pressable>

      <Pressable
        style={[styles.tab, tab === 'notes' && styles.activeTab]}
        onPress={() => onTabChange('notes')}
      >
        <Text style={styles.tabText}>Mis notas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#DCE6F2',
    borderRadius: 18,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 14,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontWeight: '700',
    color: '#1D3557',
  },
});
