import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Colors, Spacing, Shadows } from '../theme/theme';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

interface AddItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: { imageUri?: string, text?: string }) => void;
}

const AddItemModal = ({ visible, onClose, onSave }: AddItemModalProps) => {
    const [text, setText] = useState('');
    const [imageUri, setImageUri] = useState<string | undefined>(undefined);
    const translateY = useSharedValue(0);

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > 100 || event.velocityY > 500) {
                runOnJS(onClose)();
            } else {
                translateY.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    useEffect(() => {
        if (!visible) {
            setText('');
            setImageUri(undefined);
        } else {
            translateY.value = withSpring(0);
        }
    }, [visible, translateY]);

    const handlePickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
        });

        if (result.assets && result.assets[0]?.uri) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleRemoveImage = () => {
        setImageUri(undefined);
    };

    const handleSave = () => {
        if (imageUri || text.trim()) {
            onSave({ imageUri, text: imageUri ? undefined : text.trim() });
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
                style={styles.overlay}
            >
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.sheet, animatedStyle]}>
                        <View style={styles.dragHandle} />
                        <View style={styles.header}>
                            <Text style={styles.title}>Add New Item</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={20} color={Colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.imageSection}>
                                {imageUri ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                                        <TouchableOpacity
                                            style={styles.removeImageBadge}
                                            onPress={handleRemoveImage}
                                        >
                                            <Ionicons name="close" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.imagePlaceholder}
                                        onPress={handlePickImage}
                                    >
                                        <View style={styles.imagePlaceholderIcon}>
                                            <Ionicons name="camera-outline" size={36} color={Colors.textSecondary} />
                                        </View>
                                        <Text style={styles.imagePlaceholderText}>Pick an Image</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.divider}>
                                <View style={styles.line} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.line} />
                            </View>

                            <View style={styles.inputSection}>
                                <Text style={styles.label}>Enter Text label</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        imageUri && styles.disabledInput
                                    ]}
                                    placeholder="e.g., E Tier Item"
                                    placeholderTextColor={Colors.textMuted}
                                    value={text}
                                    onChangeText={setText}
                                    editable={!imageUri}
                                    selectTextOnFocus={!imageUri}
                                />
                                {imageUri && (
                                    <Text style={styles.hintText}>
                                        Text is disabled while image is selected.
                                    </Text>
                                )}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                !(imageUri || text.trim()) && styles.disabledSaveButton
                            ]}
                            onPress={handleSave}
                            disabled={!(imageUri || text.trim())}
                        >
                            <Text style={styles.saveButtonText}>Add to Collection</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </GestureDetector>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.s,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.soft,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: Colors.border,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: Spacing.s,
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
    imageSection: {
        alignItems: 'center',
        marginVertical: Spacing.m,
    },
    imagePreviewContainer: {
        width: 150,
        height: 150,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        ...Shadows.soft,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    removeImageBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    imagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 20,
        backgroundColor: Colors.surfaceLight,
        borderWidth: 2,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderIcon: {
        marginBottom: 8,
    },
    imagePlaceholderText: {
        color: Colors.textSecondary,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.l,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        marginHorizontal: Spacing.m,
        color: Colors.textMuted,
        fontWeight: '900',
        fontSize: 12,
    },
    inputSection: {
        marginBottom: Spacing.l,
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
    },
    disabledInput: {
        opacity: 0.5,
        backgroundColor: '#eee',
    },
    hintText: {
        color: Colors.primary,
        fontSize: 12,
        marginTop: 6,
        fontStyle: 'italic',
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

export default AddItemModal;
