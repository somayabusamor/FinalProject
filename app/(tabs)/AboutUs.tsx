import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AboutUs = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>About Us</Text>
            <Text style={styles.text}>
                Our app aims to address the challenges of accessing unrecognized areas in Israel.
                By providing accurate location information, we strive to enhance emergency and
                public service delivery to these regions. Together, we can bridge the gap and
                ensure better services for everyone.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
    text: { fontSize: 16, lineHeight: 24, color: '#333' },
});

export default AboutUs;
