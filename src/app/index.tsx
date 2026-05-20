import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import CameraModal from '@/components/camera-modal';
import CompassSensor from '@/components/compass-sensor';
import CreateNoteForm from '@/components/create-note-form';
import Header from '@/components/header';
import { useNotes } from '@/hooks/use-notes';

type Note = {
  id: string;
  title: string;
  description: string;
  imageUri?: string | null;
  createdAt: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function CreateNoteScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const { notes, persistNotes, magnetometerData, compassAvailable } = useNotes();

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const buttonScale = useSharedValue(1);
  const savedOpacity = useSharedValue(0);
  const scrollY = useSharedValue(0);

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert('Permiso requerido', 'Debes permitir el uso de la cámara.');
        return;
      }
    }

    setCameraVisible(true);
  };

  const flipCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });

    setImageUri(photo.uri);
    setCameraVisible(false);
  };

  const saveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Falta información', 'Escribe un título para la nota.');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title,
      description,
      imageUri,
      createdAt: new Date().toLocaleString(),
    };

    await persistNotes([newNote, ...notes]);

    setTitle('');
    setDescription('');
    setImageUri(null);

    savedOpacity.value = 1;
    savedOpacity.value = withTiming(0, { duration: 1200 });

    Alert.alert('Guardado', 'La nota fue guardada localmente.');
  };


  const createReminder = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hora de estudiar',
        body: 'Recuerda revisar tus apuntes guardados.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10,
      },
    });

    Alert.alert('Recordatorio creado', 'Recibirás una notificación en 10 segundos.');
  };

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);


  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      <Header scrollY={scrollY} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={styles.content}
        >
          <CreateNoteForm
            title={title}
            description={description}
            imageUri={imageUri}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onImageUriChange={setImageUri}
            onOpenCamera={openCamera}
            onSaveNote={saveNote}
            onCreateReminder={createReminder}
            buttonScale={buttonScale}
            savedOpacity={savedOpacity}
          />
          <CompassSensor
            magnetometerData={magnetometerData}
            compassAvailable={compassAvailable}
          />
        </Animated.ScrollView>
      </SafeAreaView>

      <CameraModal
        visible={cameraVisible}
        cameraRef={cameraRef}
        onClose={() => setCameraVisible(false)}
        onTakePhoto={takePhoto}
        facing={facing}
        onFlipCamera={flipCamera}
      />
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});