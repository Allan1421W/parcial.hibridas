import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { Magnetometer } from 'expo-sensors';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { NOTES_FILE } from '@/utils/notes-storage';

type Note = {
  id: string;
  title: string;
  description: string;
  imageUri?: string | null;
  createdAt: string;
};

interface NotesContextType {
  notes: Note[];
  loadNotes: () => Promise<void>;
  persistNotes: (newNotes: Note[]) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  magnetometerData: { x: number; y: number; z: number };
  compassAvailable: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [magnetometerData, setMagnetometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [compassAvailable, setCompassAvailable] = useState(true);

  useEffect(() => {
    loadNotes();
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startMagnetometer = async () => {
      const available = await Magnetometer.isAvailableAsync();
      setCompassAvailable(available);

      if (!available) return;

      Magnetometer.setUpdateInterval(500);

      subscription = Magnetometer.addListener((data) => {
        setMagnetometerData(data);
      });
    };

    startMagnetometer();

    return () => {
      subscription?.remove();
    };
  }, []);

  const loadNotes = async () => {
    try {
      if (NOTES_FILE === 'localStorage') {
        // Web: use localStorage
        const stored = localStorage.getItem('study_journal_notes');
        if (stored) {
          setNotes(JSON.parse(stored));
        } else {
          setNotes([]);
        }
        return;
      }

      // Mobile: use FileSystem
      const fileInfo = await FileSystem.getInfoAsync(NOTES_FILE);

      if (!fileInfo.exists) {
        await FileSystem.writeAsStringAsync(NOTES_FILE, JSON.stringify([]));
        setNotes([]);
        return;
      }

      const content = await FileSystem.readAsStringAsync(NOTES_FILE);
      setNotes(JSON.parse(content));
    } catch (error) {
      console.log('Error loading notes:', error);
      setNotes([]);
    }
  };

  const persistNotes = async (newNotes: Note[]) => {
    try {
      setNotes(newNotes);

      if (NOTES_FILE === 'localStorage') {
        // Web: use localStorage
        localStorage.setItem('study_journal_notes', JSON.stringify(newNotes));
        return;
      }

      // Mobile: use FileSystem
      await FileSystem.writeAsStringAsync(NOTES_FILE, JSON.stringify(newNotes));
    } catch (error) {
      console.log('Error saving notes:', error);
      Alert.alert('Error', 'No se pudieron guardar las notas.');
    }
  };

  const deleteNote = async (id: string) => {
    await persistNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        loadNotes,
        persistNotes,
        deleteNote,
        magnetometerData,
        compassAvailable,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
