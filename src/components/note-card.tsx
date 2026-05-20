import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

type Note = {
  id: string;
  title: string;
  description: string;
  imageUri?: string | null;
  createdAt: string;
};

interface NoteCardProps {
  note: Note;
  index: number;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, index, onDelete }: NoteCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 + index * 100 });
    translateY.value = withSpring(0);
  }, []);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.noteCard, animatedCardStyle]}>
      {note.imageUri && <Image source={{ uri: note.imageUri }} style={styles.noteImage} />}

      <View style={styles.noteBody}>
        <Text style={styles.noteTitle}>{note.title}</Text>
        <Text style={styles.noteDescription}>{note.description}</Text>
        <Text style={styles.date}>{note.createdAt}</Text>

        <Pressable style={styles.deleteButton} onPress={() => onDelete(note.id)}>
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  noteImage: {
    width: '100%',
    height: 180,
  },
  noteBody: {
    padding: 16,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D3557',
  },
  noteDescription: {
    marginTop: 8,
    color: '#444',
  },
  date: {
    marginTop: 10,
    color: '#888',
    fontSize: 12,
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteText: {
    color: '#D62828',
    fontWeight: '700',
  },
});
