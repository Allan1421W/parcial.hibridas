import { CameraView } from 'expo-camera';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface CameraModalProps {
  visible: boolean;
  cameraRef: React.RefObject<CameraView | null>;
  onClose: () => void;
  onTakePhoto: () => void;
  facing: 'front' | 'back';
  onFlipCamera: () => void;
}

export default function CameraModal({ visible, cameraRef, onClose, onTakePhoto, facing, onFlipCamera }: CameraModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

        <View style={styles.cameraButtons}>
          <Pressable style={styles.closeCameraButton} onPress={onClose}>
            <Text style={styles.cameraButtonText}>Cerrar</Text>
          </Pressable>

          <Pressable style={styles.flipCameraButton} onPress={onFlipCamera}>
            <Text style={styles.cameraButtonText}>Voltear</Text>
          </Pressable>

          <Pressable style={styles.takePhotoButton} onPress={onTakePhoto}>
            <Text style={styles.cameraButtonText}>Tomar foto</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  flipCameraButton: {
    backgroundColor: '#457B9D',
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
});
