import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface CreateNoteFormProps {
  title: string;
  description: string;
  imageUri: string | null;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onImageUriChange: (uri: string | null) => void;
  onOpenCamera: () => void;
  onSaveNote: () => void;
  onCreateReminder: () => void;
  buttonScale: any;
  savedOpacity: any;
}

export default function CreateNoteForm({
  title,
  description,
  imageUri,
  onTitleChange,
  onDescriptionChange,
  onImageUriChange,
  onOpenCamera,
  onSaveNote,
  onCreateReminder,
  buttonScale,
  savedOpacity,
}: CreateNoteFormProps) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      onImageUriChange(result.assets[0].uri);
    }
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const savedStyle = useAnimatedStyle(() => ({
    opacity: savedOpacity.value,
    transform: [{ scale: interpolate(savedOpacity.value, [0, 1], [0.7, 1.1]) }],
  }));

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Apuntes de inglés"
          value={title}
          onChangeText={onTitleChange}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Escribe una descripción..."
          value={description}
          onChangeText={onDescriptionChange}
          multiline
        />

        {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

        <View style={styles.row}>
          <Pressable style={styles.secondaryButton} onPress={onOpenCamera}>
            <Text style={styles.secondaryText}>Abrir cámara</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={pickImage}>
            <Text style={styles.secondaryText}>Galería</Text>
          </Pressable>
        </View>

        <Animated.View style={buttonStyle}>
          <Pressable
            style={styles.mainButton}
            onPressIn={() => {
              buttonScale.value = withSpring(0.94);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1);
            }}
            onPress={onSaveNote}
          >
            <Text style={styles.mainButtonText}>Guardar nota</Text>
          </Pressable>
        </Animated.View>

        <Pressable style={styles.outlineButton} onPress={onCreateReminder}>
          <Text style={styles.outlineText}>Crear recordatorio</Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.savedBadge, savedStyle]}>
        <Text style={styles.savedText}>Guardado</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  label: {
    fontWeight: '700',
    marginBottom: 8,
    color: '#1D3557',
  },
  input: {
    backgroundColor: '#F1F4F8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  preview: {
    width: '100%',
    height: 210,
    borderRadius: 18,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E7EEF8',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#1D3557',
    fontWeight: '700',
  },
  mainButton: {
    backgroundColor: '#457B9D',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 14,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  outlineButton: {
    marginTop: 12,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#457B9D',
    alignItems: 'center',
  },
  outlineText: {
    color: '#457B9D',
    fontWeight: '700',
  },
  savedBadge: {
    alignSelf: 'center',
    backgroundColor: '#2A9D8F',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 100,
    marginTop: 20,
  },
  savedText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
