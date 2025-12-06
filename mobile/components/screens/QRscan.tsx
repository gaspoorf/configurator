import { useCameraPermissions, CameraView } from "expo-camera";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, Pressable, StatusBar, Platform } from "react-native";

type Props = {
    onComplete: (roomId: string) => void;
};


export default function QRScan({ onComplete }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const isGranted = Boolean(permission?.granted);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (permission && permission.status === "denied") {
      requestPermission();
    }
  }, [permission]);

  const handleScan = ({ data }: { data: string }) => {
    if (!data) return;
    if (scannedData) return;
    setScannedData(data);
    setRoomId(data);
    onComplete(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}

      {!isGranted ? (
        <>
          <Text style={styles.info}>Permission caméra nécessaire</Text>
          <Pressable style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Autoriser</Text>
          </Pressable>
        </>
      ) : (
        <>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleScan}
          />

          <Text style={styles.info}>
            {scannedData ? `QR détecté : ${scannedData}` : "Scanne un QR Code"}
          </Text>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: 300,
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
  },
  info: {
    marginTop: 20,
    color: "#fff",
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#0BCD4C",
    padding: 12,
    borderRadius: 8,
  },
  btnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
