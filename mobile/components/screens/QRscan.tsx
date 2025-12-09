import { useCameraPermissions, CameraView } from "expo-camera";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image, Pressable, StatusBar, Platform } from "react-native";

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
    <View style={styles.container}>
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

        <Image
              source={require("../../assets/icons/logo.png")}
              style={styles.image}
          />


          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleScan}
          />

          <Text style={styles.info}>
            {scannedData ? `QR détecté : ${scannedData}` : "Rends-toi sur 2100.fr et scan le QR Code"}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    color: "#000000",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: 300,
  },
  btn: {
    backgroundColor: "#2676FF",
    padding: 20,
    paddingHorizontal: 24,
    marginTop: 20,
    borderRadius: 100,
  },
  btnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  image: {
    width: '70%',
    height: 120,
    marginBottom: 30,
    resizeMode: 'contain',
    position: 'relative',
  },
});
