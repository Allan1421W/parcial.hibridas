import NoteCard from '@/components/note-card';
import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';

type Note = {
  id: string;
  title: string;
  description: string;
  imageUri?: string | null;
  createdAt: string;
};

interface NotesListProps {
  notes: Note[];
  onDeleteNote: (id: string) => void;
}

export default function NotesList({ notes, onDeleteNote }: NotesListProps) {
  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <Text style={styles.empty}>Todavía no tienes notas guardadas.</Text>
      }
      renderItem={({ item, index }) => (
        <NoteCard note={item} index={index} onDelete={onDeleteNote} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#777',
  },
});
