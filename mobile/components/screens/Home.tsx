import React from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
    onStart: () => void;
};

export default function Home({ onStart }: Props) {
    return (
        <View style={styles.container}>

            <Image
                source={require("../../assets/icons/logo.png")}
                style={styles.image}
            />
        
            <TouchableOpacity style={styles.button} onPress={onStart}>
                <Text style={styles.buttonText}>Letsgo</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#016df6',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    image: {
        width: '100%',
        resizeMode: 'contain',
        position: 'relative',
        
    },
});