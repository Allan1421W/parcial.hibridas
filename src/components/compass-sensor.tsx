import { Magnetometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CompassSensorProps {
  magnetometerData: { x: number; y: number; z: number };
  compassAvailable: boolean;
}

export default function CompassSensor({
  magnetometerData,
  compassAvailable,
}: CompassSensorProps) {
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
  );
}

const styles = StyleSheet.create({
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
