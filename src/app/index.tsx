import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Magnetometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type Note = {
  id: string;
  title: string;
  description: string;
  imageUri?: string | null;
  createdAt: string;
};

const STORAGE_KEY = '@study_journal_notes';
const NOTES_FILE = FileSystem.Paths.document.uri + 'notes.json';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [tab, setTab] = useState<'create' | 'notes'>('create');

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [magnetometerData, setMagnetometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [compassAvailable, setCompassAvailable] = useState(true);

  const buttonScale = useSharedValue(1);
  const savedOpacity = useSharedValue(0);
  const scrollY = useSharedValue(0);

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
      await FileSystem.writeAsStringAsync(NOTES_FILE, JSON.stringify(newNotes));
    } catch (error) {
      console.log('Error saving notes:', error);
      Alert.alert('Error', 'No se pudieron guardar las notas.');
    }
  };

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

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });

    setImageUri(photo.uri);
    setCameraVisible(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
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

  const deleteNote = async (id: string) => {
    await persistNotes(notes.filter((note) => note.id !== id));
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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, 120], [170, 95], Extrapolation.CLAMP),
    opacity: interpolate(scrollY.value, [0, 120], [1, 0.7], Extrapolation.CLAMP),
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const savedStyle = useAnimatedStyle(() => ({
    opacity: savedOpacity.value,
    transform: [{ scale: interpolate(savedOpacity.value, [0, 1], [0.7, 1.1]) }],
  }));

  const getCompassDirection = () => {
    const { x, y } = magnetometerData;
    let angle = Math.atan2(y, x) * (180 / Math.PI);

    if (angle < 0) {
      angle += 360;
    }

    if (angle >= 315 || angle < 45) return 'Norte';
    if (angle >= 45 && angle < 135) return 'Este';
    if (angle >= 135 && angle < 225) return 'Sur';
    return 'Oeste';
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={styles.headerTitle}>Study Journal</Text>
        <Text style={styles.headerSubtitle}>
          Cámara, almacenamiento interno, galería, notificaciones y animaciones.
        </Text>
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, tab === 'create' && styles.activeTab]}
            onPress={() => setTab('create')}
          >
            <Text style={styles.tabText}>Crear nota</Text>
          </Pressable>

          <Pressable
            style={[styles.tab, tab === 'notes' && styles.activeTab]}
            onPress={() => setTab('notes')}
          >
            <Text style={styles.tabText}>Mis notas</Text>
          </Pressable>
        </View>

        {tab === 'create' ? (
          <Animated.ScrollView
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={styles.content}
          >
            <View style={styles.card}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Apuntes de inglés"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Escribe una descripción..."
                value={description}
                onChangeText={setDescription}
                multiline
              />

              {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

              <View style={styles.row}>
                <Pressable style={styles.secondaryButton} onPress={openCamera}>
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
                  onPress={saveNote}
                >
                  <Text style={styles.mainButtonText}>Guardar nota</Text>
                </Pressable>
              </Animated.View>

              <Pressable style={styles.outlineButton} onPress={createReminder}>
                <Text style={styles.outlineText}>Crear recordatorio</Text>
              </Pressable>
              <View style={styles.sensorBox}>
                <Text style={styles.sensorTitle}>Sensor nativo: brújula</Text>

                {compassAvailable ? (
                  <>
                    <Text style={styles.sensorDirection}>{getCompassDirection()}</Text>
                    <Text style={styles.sensorText}>
                      X: {magnetometerData.x.toFixed(2)} | Y: {magnetometerData.y.toFixed(2)} | Z:{' '}
                      {magnetometerData.z.toFixed(2)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.sensorText}>
                    Este dispositivo no tiene magnetómetro disponible.
                  </Text>
                )}
              </View>
            </View>

            <Animated.View style={[styles.savedBadge, savedStyle]}>
              <Text style={styles.savedText}>Guardado</Text>
            </Animated.View>
          </Animated.ScrollView>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.content}
            ListEmptyComponent={
              <Text style={styles.empty}>Todavía no tienes notas guardadas.</Text>
            }
            renderItem={({ item, index }) => (
              <NoteCard note={item} index={index} onDelete={deleteNote} />
            )}
          />
        )}
      </SafeAreaView>

      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />

          <View style={styles.cameraButtons}>
            <Pressable style={styles.closeCameraButton} onPress={() => setCameraVisible(false)}>
              <Text style={styles.cameraButtonText}>Cerrar</Text>
            </Pressable>

            <Pressable style={styles.takePhotoButton} onPress={takePhoto}>
              <Text style={styles.cameraButtonText}>Tomar foto</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function NoteCard({
  note,
  index,
  onDelete,
}: {
  note: Note;
  index: number;
  onDelete: (id: string) => void;
}) {
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
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  safeArea: {
    flex: 1,
  },
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
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
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#777',
  },
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraButtons: {
    position: 'absolute',
    bottom: 45,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  closeCameraButton: {
    backgroundColor: '#D62828',
    padding: 16,
    borderRadius: 18,
  },
  takePhotoButton: {
    backgroundColor: '#2A9D8F',
    padding: 16,
    borderRadius: 18,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sensorBox: {
    marginTop: 16,
    backgroundColor: '#F1F4F8',
    borderRadius: 18,
    padding: 16,
  },
  sensorTitle: {
    fontWeight: '800',
    color: '#1D3557',
    marginBottom: 8,
  },
  sensorDirection: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2A9D8F',
  },
  sensorText: {
    marginTop: 6,
    color: '#444',
    fontSize: 13,
  },
});