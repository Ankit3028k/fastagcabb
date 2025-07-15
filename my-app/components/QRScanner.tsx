import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

// Safe dimension access that works in React Native
const screenDimensions = Dimensions.get('screen');
const { width, height } = screenDimensions;

interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ visible, onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { processQRCode } = useAuth();

  // Add error boundary for potential crashes
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      try {
        // Reset error state when requesting permissions
        setHasError(false);

        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permissions:', error);
        setHasError(true);
        setHasPermission(false);
      }
    };

    if (visible && Platform.OS !== 'web') {
      getCameraPermissions();
    } else if (Platform.OS === 'web') {
      // Web platform not supported for QR scanning
      setHasPermission(false);
      setHasError(true);
    }
  }, [visible]);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    try {
      // Add safety check for processQRCode function
      if (typeof processQRCode !== 'function') {
        throw new Error('QR code processing function not available');
      }

      const result = await processQRCode(data);

      Alert.alert(
        result.success ? t('success') : t('error'),
        result.message,
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('QR Code processing error:', error);
      Alert.alert(
        t('error'),
        error?.message || 'Failed to process QR code',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              onClose();
            },
          },
        ]
      );
    }
  };

  const resetScanner = () => {
    setScanned(false);
  };

  // Handle error state
  if (hasError) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Ionicons name="warning-outline" size={48} color={colors.warning} />
          <Text style={[styles.message, { color: colors.text }]}>
            QR Scanner Error
          </Text>
          <Text style={[styles.submessage, { color: colors.textSecondary }]}>
            {Platform.OS === 'web'
              ? 'QR scanning is not supported on web platform'
              : 'Camera access failed. Please check permissions and try again.'
            }
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.message, { color: colors.text }]}>
            Requesting camera permission...
          </Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.message, { color: colors.text }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.submessage, { color: colors.textSecondary }]}>
            Camera permission is required to scan QR codes. Please enable camera access in your device settings.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
        >
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Scanning Area */}
            <View style={styles.scanningArea}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
              </View>
              
              <Text style={[styles.instructionText, { color: colors.surface }]}>
                {t('scanQR')}
              </Text>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {scanned && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={resetScanner}
                >
                  <Text style={styles.buttonText}>Scan Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomControls: {
    padding: 20,
    paddingBottom: 60,
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  submessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
