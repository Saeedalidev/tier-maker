import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Colors, Spacing, Shadows } from '../theme/theme';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorPicker from './ColorPicker';

interface TierEditModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (label: string, color: string, labelImageUri?: string) => void;
    initialLabel: string;
    initialColor: string;
    initialLabelImage?: string;
}

const TierEditModal = ({ visible, onClose, onSave, initialLabel, initialColor, initialLabelImage }: TierEditModalProps) => {
    const [label, setLabel] = useState(initialLabel);
    const [color, setColor] = useState(initialColor);
    const [labelImageUri, setLabelImageUri] = useState(initialLabelImage);

    useEffect(() => {
        if (visible) {
            setLabel(initialLabel);
            setColor(initialColor);
            setLabelImageUri(initialLabelImage);
        }
    }, [visible, initialLabel, initialColor, initialLabelImage]);

    const handlePickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
        });

        if (result.assets && result.assets[0]?.uri) {
            setLabelImageUri(result.assets[0].uri);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <Text style={styles.title}>Edit Tier</Text>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.imagePickerSection}>
                            {labelImageUri ? (
                                <TouchableOpacity onPress={handlePickImage} style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: labelImageUri }} style={styles.imagePreview} />
                                    <View style={styles.changeImageBadge}>
                                        <Text style={styles.changeImageText}>Edit Image</Text>
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={handlePickImage} style={styles.imagePlaceholder}>
                                    <Ionicons name="image-outline" size={28} color={Colors.textSecondary} />
                                    <Text style={styles.imagePlaceholderText}>Row Image (Optional)</Text>
                                </TouchableOpacity>
                            )}
                            {labelImageUri && (
                                <TouchableOpacity
                                    onPress={() => setLabelImageUri(undefined)}
                                    style={styles.removeImageLink}
                                >
                                    <Text style={styles.removeImageText}>Remove Image</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text style={styles.label}>Tier Label</Text>
                        <TextInput
                            style={[styles.input, labelImageUri && styles.disabledInput]}
                            value={label}
                            onChangeText={setLabel}
                            maxLength={10}
                            placeholder="e.g. S, A, Best..."
                            placeholderTextColor={Colors.textSecondary}
                            editable={!labelImageUri}
                        />

                        <Text style={[styles.label, labelImageUri && { opacity: 0.5 }]}>
                            Select Color {labelImageUri && "(Disabled with Image)"}
                        </Text>
                        <ColorPicker value={color} onChange={setColor} disabled={!!labelImageUri} />
                    </ScrollView>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onSave(label, color, labelImageUri)}
                            style={styles.saveButton}
                        >
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '85%',
        backgroundColor: Colors.surface,
        padding: Spacing.l,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.soft,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.l,
        textAlign: 'center',
    },
    label: {
        color: Colors.textSecondary,
        marginBottom: Spacing.s,
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: Colors.background,
        color: Colors.text,
        padding: Spacing.m,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.l,
        fontSize: 18,
        fontWeight: '600',
    },
    disabledInput: {
        opacity: 0.5,
    },
    scrollContent: {
        paddingBottom: Spacing.m,
    },
    imagePickerSection: {
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.border,
    },
    imagePlaceholderText: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    imagePreviewContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    changeImageBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 2,
        alignItems: 'center',
    },
    changeImageText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    removeImageLink: {
        marginTop: 8,
    },
    removeImageText: {
        color: Colors.error || '#FF5252',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cancelButton: {
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.l,
    },
    cancelText: {
        color: Colors.textSecondary,
        fontWeight: '700',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.xl,
        borderRadius: 14,
        ...Shadows.soft,
    },
    saveText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
    },
});

export default TierEditModal;
