import React, { useMemo } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getDesignTokens, Spacing } from '../theme/theme';

interface AdConfirmDialogProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    hasError?: boolean;
    errorMessage?: string;
    onExportAnyway?: () => void;
    title?: string;
    message?: string;
}

const AdConfirmDialog: React.FC<AdConfirmDialogProps> = ({
    visible,
    onConfirm,
    onCancel,
    isLoading = false,
    hasError = false,
    errorMessage,
    onExportAnyway,
    title = 'Watch an ad to continue',
    message = 'Viewing a short ad unlocks the save/share action and keeps TierMaker free for everyone.',
}) => {
    const theme = useSelector((state: RootState) => state.tier.theme);
    const D = getDesignTokens(theme);

    const styles = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: Spacing.l,
        },
        dialog: {
            width: '100%',
            maxWidth: 400,
            borderRadius: 20,
            backgroundColor: D.surface,
            padding: Spacing.l,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 10,
        },
        title: {
            fontSize: 18,
            fontWeight: '700',
            color: D.textPrimary,
            textAlign: 'center',
            marginBottom: Spacing.s,
        },
        message: {
            fontSize: 14,
            lineHeight: 20,
            color: D.textSecondary,
            textAlign: 'center',
            marginBottom: Spacing.l,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: Spacing.s,
        },
        button: {
            flex: 1,
            borderRadius: 14,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        cancelBtn: {
            borderWidth: 1,
            borderColor: D.border,
            backgroundColor: D.surface,
        },
        cancelText: {
            color: D.textSecondary,
            fontSize: 15,
            fontWeight: '600',
        },
        confirmBtn: {
            backgroundColor: D.accent,
        },
        confirmText: {
            color: '#fff',
            fontSize: 15,
            fontWeight: '700',
        },
        errorBtn: {
            backgroundColor: D.amber,
        },
        errorText: {
            color: '#1a1a1a',
            fontSize: 15,
            fontWeight: '700',
        },
        loadingWrap: {
            alignItems: 'center',
            paddingVertical: Spacing.m,
            gap: Spacing.s,
        },
        loadingText: {
            color: D.textSecondary,
            fontSize: 13,
        },
    }), [D]);

    const displayTitle = hasError ? 'Ad unavailable' : title;
    const displayMessage = hasError
        ? errorMessage || 'We could not load an ad right now. You can still continue without it.'
        : message;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{displayTitle}</Text>
                    <Text style={styles.message}>{displayMessage}</Text>

                    {isLoading ? (
                        <View style={styles.loadingWrap}>
                            <ActivityIndicator size="large" color={D.accent} />
                            <Text style={styles.loadingText}>Loading ad…</Text>
                        </View>
                    ) : hasError ? (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.errorBtn]}
                                onPress={onExportAnyway}
                            >
                                <Text style={styles.errorText}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={onConfirm}>
                                <Text style={styles.confirmText}>Watch Ad</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default AdConfirmDialog;
