import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/header';
import NotesList from '@/components/notes-list';
import { useNotes } from '@/hooks/use-notes';

export default function NotesScreen() {
  const { notes, deleteNote } = useNotes();

  return (
    <View style={styles.container}>
      <Header scrollY={{ value: 0 }} />

      <SafeAreaView style={styles.safeArea}>
        <NotesList notes={notes} onDeleteNote={deleteNote} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  safeArea: {
    flex: 1,
  },
});
