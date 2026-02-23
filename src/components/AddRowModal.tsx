import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image
} from 'react-native';
import { Colors, Spacing, Shadows } from '../theme/theme';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorPicker from './ColorPicker';

interface AddRowModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (label: string, color: string, imageUri?: string) => void;
}

const DEFAULT_ROW_COLOR = '#FF7F7F';

const AddRowModal = ({ visible, onClose, onSave }: AddRowModalProps) => {
    const [label, setLabel] = useState('');
    const [color, setColor] = useState(DEFAULT_ROW_COLOR);
    const [labelImageUri, setLabelImageUri] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!visible) {
            setLabel('');
            setLabelImageUri(undefined);
            setColor(DEFAULT_ROW_COLOR);
        }
    }, [visible]);

    const handlePickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
        });

        if (result.assets && result.assets[0]?.uri) {
            setLabelImageUri(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (label.trim() || labelImageUri) {
            onSave(label.trim(), color, labelImageUri);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add New Tier Row</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.imagePickerSection}>
                            {labelImageUri ? (
                                <View style={styles.imagePreviewWrapper}>
                                    <TouchableOpacity onPress={handlePickImage} style={styles.imagePreviewContainer}>
                                        <Image source={{ uri: labelImageUri }} style={styles.imagePreview} />
                                        <View style={styles.changeImageBadge}>
                                            <Text style={styles.changeImageText}>Edit Image</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setLabelImageUri(undefined)} style={styles.removeImageLink}>
                                        <Text style={styles.removeImageText}>Remove Image</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handlePickImage} style={styles.imagePlaceholder}>
                                    <Ionicons name="image-outline" size={28} color={Colors.textSecondary} />
                                    <Text style={styles.imagePlaceholderText}>Row Image (Optional)</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text style={styles.label}>Tier Label</Text>
                        <TextInput
                            style={[styles.input, labelImageUri && styles.disabledInput]}
                            placeholder="e.g. S, A, E, F..."
                            placeholderTextColor={Colors.textMuted}
                            value={label}
                            onChangeText={setLabel}
                            maxLength={10}
                            editable={!labelImageUri}
                        />

                        <Text style={[styles.label, labelImageUri && { opacity: 0.5 }]}>
                            Row Color {labelImageUri && "(Disabled with Image)"}
                        </Text>
                        <ColorPicker value={color} onChange={setColor} disabled={!!labelImageUri} />
                    </ScrollView>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            (!label.trim() && !labelImageUri) && styles.disabledSaveButton
                        ]}
                        onPress={handleSave}
                        disabled={!label.trim() && !labelImageUri}
                    >
                        <Text style={styles.saveButtonText}>Add Row</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.l,
        paddingBottom: Spacing.xl,
        maxHeight: '100%',
        ...Shadows.soft,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.s,
        marginBottom: Spacing.m,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.text,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: Colors.textMuted,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: Spacing.xxl,
    },
    imagePickerSection: {
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: Colors.surfaceLight,
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
        ...Shadows.soft,
    },
    imagePreviewWrapper: {
        alignItems: 'center',
        gap: 10,
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
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    removeImageText: {
        color: Colors.error,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.textSecondary,
        marginBottom: Spacing.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: Colors.surfaceLight,
        borderRadius: 12,
        padding: Spacing.m,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.l,
    },
    disabledInput: {
        opacity: 0.5,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: Spacing.m,
        alignItems: 'center',
        marginTop: Spacing.l,
        marginBottom: Spacing.s,
        ...Shadows.soft,
    },
    disabledSaveButton: {
        backgroundColor: Colors.textMuted,
        opacity: 0.5,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    },
});

export default AddRowModal;
