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
    ScrollView
} from 'react-native';
import { Colors, Spacing, Shadows } from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface AddTextItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (text: string, color: string) => void;
}

const PRESET_COLORS = [
    '#6C48FF', '#00D1FF', '#FF2E7E', '#00E676', '#FFD600',
    '#FF7F7F', '#FFBF7F', '#FFFF7F', '#BFFF7F', '#7FFF7F',
    '#7FBFFF', '#7F7FFF', '#FF7FB3', '#FFFFFF'
];

const AddTextItemModal = ({ visible, onClose, onSave }: AddTextItemModalProps) => {
    const [text, setText] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);

    useEffect(() => {
        if (!visible) {
            setText('');
            setColor(PRESET_COLORS[0]);
        }
    }, [visible]);

    const handleSave = () => {
        if (text.trim()) {
            onSave(text.trim(), color);
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
                        <Text style={styles.title}>Add Text Item</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.previewSection}>
                            <View style={[styles.previewBox, { backgroundColor: color }]}>
                                <Text style={[styles.previewText, color === '#FFFFFF' ? { color: '#000' } : { color: '#fff' }]}>
                                    {text || 'Aa'}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.label}>Item Text</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter text..."
                            placeholderTextColor={Colors.textMuted}
                            value={text}
                            onChangeText={setText}
                            maxLength={50}
                        />

                        <Text style={styles.label}>Box Color</Text>
                        <View style={styles.colorGrid}>
                            {PRESET_COLORS.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: c },
                                        color === c && styles.colorSelected
                                    ]}
                                    onPress={() => setColor(c)}
                                />
                            ))}
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            !text.trim() && styles.disabledSaveButton
                        ]}
                        onPress={handleSave}
                        disabled={!text.trim()}
                    >
                        <Text style={styles.saveButtonText}>Add to Collection</Text>
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
        padding: Spacing.m,
        maxHeight: '90%',
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
        paddingBottom: Spacing.xl,
    },
    previewSection: {
        alignItems: 'center',
        marginVertical: Spacing.m,
    },
    previewBox: {
        width: 100,
        height: 100,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        ...Shadows.soft,
    },
    previewText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
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
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        margin: 6,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    colorSelected: {
        borderColor: 'white',
        transform: [{ scale: 1.1 }],
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: Spacing.m,
        alignItems: 'center',
        marginTop: Spacing.m,
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

export default AddTextItemModal;
