import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AddVillage = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const addImageUrl = () => {
        if (currentImageUrl.trim() && !imageUrls.includes(currentImageUrl)) {
            setImageUrls([...imageUrls, currentImageUrl]);
            setCurrentImageUrl("");
        }
    };

    const removeImageUrl = (urlToRemove: string) => {
        setImageUrls(imageUrls.filter(url => url !== urlToRemove));
    };

    const handleSubmit = async () => {
        if (imageUrls.length === 0) {
            Alert.alert("Error", "Please add at least one image");
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage("");
        
        try {
            const response = await axios.post(
                "http://localhost:8082/api/addVillage",
                { name, description, images: imageUrls },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            
            setSuccessMessage("Village added successfully!");
            setName("");
            setDescription("");
            setImageUrls([]);

            setTimeout(() => {
                router.back();
            }, 2000);

        } catch (error: unknown) {
            let errorMessage = "Failed to add village";
            
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.error || 
                              error.response?.data?.message || 
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
                
                <View style={styles.imageInputContainer}>
                    <TextInput 
                        style={[styles.input, styles.imageInput]}
                        placeholder="Image URL"
                        placeholderTextColor="#8d6e63"
                        value={currentImageUrl}
                        onChangeText={setCurrentImageUrl}
                        keyboardType="url"
                    />
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={addImageUrl}
                        disabled={!currentImageUrl.trim()}
                    >
                        <MaterialIcons name="add" size={24} color="#FFD700" />
                    </TouchableOpacity>
                </View>

                {imageUrls.length > 0 && (
                    <View style={styles.imageList}>
                        {imageUrls.map((url, index) => (
                            <View key={index} style={styles.imageItem}>
                                <Text style={styles.imageUrl} numberOfLines={1}>
                                    {url}
                                </Text>
                                <TouchableOpacity onPress={() => removeImageUrl(url)}>
                                    <MaterialIcons name="close" size={20} color="#f44336" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleSubmit}
                    disabled={isSubmitting || imageUrls.length === 0}
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
     imageInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    imageInput: {
        flex: 1,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: '#6d4c41',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageList: {
        marginBottom: 20,
    },
    imageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 8,
    },
    imageUrl: {
        flex: 1,
        color: '#5d4037',
        marginRight: 10,
    },
});

export default AddVillage;