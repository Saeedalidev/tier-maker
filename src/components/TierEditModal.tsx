import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Image, ScrollView, Platform, Dimensions, Alert } from 'react-native';
import { Colors, Spacing, Shadows } from '../theme/theme';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorPicker from './ColorPicker';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TierEditModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (label: string, color: string, labelImageUri?: string) => void;
    onDelete?: () => void;
    initialLabel: string;
    initialColor: string;
    initialLabelImage?: string;
}

const TierEditModal = ({ visible, onClose, onSave, onDelete, initialLabel, initialColor, initialLabelImage }: TierEditModalProps) => {
    const [label, setLabel] = useState(initialLabel);
    const [color, setColor] = useState(initialColor);
    const [labelImageUri, setLabelImageUri] = useState(initialLabelImage);

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
        if (visible) {
            setLabel(initialLabel);
            setColor(initialColor);
            setLabelImageUri(initialLabelImage);
            translateY.value = withSpring(0);
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
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.content, animatedStyle]}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.title}>Edit Tier</Text>

                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
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
                                        <Ionicons name="image-outline" size={24} color={Colors.textSecondary} />
                                        <Text style={styles.imagePlaceholderText}>Image</Text>
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
                            <TouchableOpacity
                                onPress={() => {
                                    if (onDelete) {
                                        Alert.alert(
                                            'Delete Tier',
                                            'Are you sure? Items in this row will be moved to your collection.',
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Delete Tier', style: 'destructive', onPress: onDelete },
                                            ]
                                        );
                                    } else {
                                        onClose();
                                    }
                                }}
                                style={styles.deleteFooterBtn}
                            >
                                <Ionicons name="trash-outline" size={20} color="#FF5252" />
                                <Text style={styles.deleteFooterText}>Delete</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => onSave(label, color, labelImageUri)}
                                style={styles.saveButton}
                            >
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </GestureDetector>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end', // Align to bottom like a sheet
    },
    content: {
        width: '100%',
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.s,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 1,
        borderColor: Colors.border,
        maxHeight: '75%', // Limit height
        ...Shadows.soft,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: Colors.border,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: Spacing.m,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.m,
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
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.border,
    },
    imagePlaceholderText: {
        fontSize: 9,
        color: Colors.textSecondary,
        marginTop: 2,
        textAlign: 'center',
    },
    imagePreviewContainer: {
        width: 70,
        height: 70,
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
        fontSize: 9,
        fontWeight: 'bold',
    },
    removeImageLink: {
        marginTop: 6,
    },
    removeImageText: {
        color: '#FF5252',
        fontSize: 11,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.m,
        paddingHorizontal: Spacing.s,
    },
    deleteFooterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: Spacing.m,
    },
    deleteFooterText: {
        color: '#FF5252',
        fontSize: 16,
        fontWeight: '700',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.xl,
        borderRadius: 16,
        minWidth: 120,
        alignItems: 'center',
        ...Shadows.soft,
    },
    saveText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
    },
});

export default TierEditModal;
