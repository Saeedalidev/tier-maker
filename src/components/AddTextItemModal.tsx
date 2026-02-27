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
import ColorPicker from './ColorPicker';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

interface AddTextItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (text: string, color: string) => void;
}

const DEFAULT_TEXT_COLOR = Colors.accent;

const AddTextItemModal = ({ visible, onClose, onSave }: AddTextItemModalProps) => {
    const [text, setText] = useState('');
    const [color, setColor] = useState(DEFAULT_TEXT_COLOR);
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
            setColor(DEFAULT_TEXT_COLOR);
        } else {
            translateY.value = withSpring(0);
        }
    }, [visible, translateY]);

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
                style={styles.overlay}
            >
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.sheet, animatedStyle]}>
                        <View style={styles.dragHandle} />
                        <View style={styles.header}>
                            <Text style={styles.title}>Add Text Item</Text>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
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
                            <ColorPicker value={color} onChange={setColor} />
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.s,
        marginBottom: Spacing.m,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.text,
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
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: Spacing.m,
        alignItems: 'center',
        marginTop: Spacing.m,
        marginBottom: 20,
        ...Shadows.soft,
    },
    disabledSaveButton: {
        backgroundColor: Colors.textMuted,
        opacity: 0.5,
        marginBottom: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    },
});

export default AddTextItemModal;
