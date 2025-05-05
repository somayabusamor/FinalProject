import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AddVillage = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSuccessMessage("");
        
        try {
            const response = await axios.post(
                "http://localhost:8082/api/addVillage",
                { name, description, imageUrl },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            
            // Set success message
            setSuccessMessage("Village added successfully!");
            
            // Clear form
            setName("");
            setDescription("");
            setImageUrl("");

            // Optionally navigate back after 2 seconds
            setTimeout(() => {
                router.back();
            }, 2000);

        } catch (error: unknown) {
            let errorMessage = "Failed to add village";
            
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            Alert.alert("Error", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="add-location" size={40} color="#FFD700" />
                <Text style={styles.title}>Add New Village</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Village Name"
                    placeholderTextColor="#8d6e63"
                    value={name}
                    onChangeText={setName}
                />
                
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Village Description"
                    placeholderTextColor="#8d6e63"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />
                
                <TextInput 
                    style={styles.input}
                    placeholder="Image URL"
                    placeholderTextColor="#8d6e63"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    keyboardType="url"
                />

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Text style={styles.buttonText}>
                        {isSubmitting ? "Adding..." : "Add Village"}
                    </Text>
                </TouchableOpacity>

                {successMessage ? (
                    <View style={styles.successContainer}>
                        <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                        <Text style={styles.successText}>{successMessage}</Text>
                    </View>
                ) : null}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6d4c41',
        marginTop: 10,
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f0e6e2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#d7ccc8',
        borderRadius: 8,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#5d4037',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#6d4c41',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonText: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
    },
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        padding: 10,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    successText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default AddVillage;