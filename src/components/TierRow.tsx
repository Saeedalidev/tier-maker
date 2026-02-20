import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getDesignTokens } from '../theme/theme';

interface TierRowProps {
    label: string;
    color: string;
    labelImageUri?: string;
    onLabelPress?: () => void;
    onLabelLongPress?: () => void;
    onLayout?: (event: any) => void;
    children?: React.ReactNode;
}

const TierRowComp = ({ label, color, labelImageUri, onLabelPress, onLabelLongPress, onLayout, children }: TierRowProps) => {
    const theme = useSelector((state: RootState) => state.tier.theme);
    const DESIGN = getDesignTokens(theme);

    return (
        <View
            ref={null}
            collapsable={false}
            style={[styles.rowContainer, { backgroundColor: DESIGN.surface }]}
            onLayout={onLayout}
        >
            <TouchableOpacity
                style={[
                    styles.labelContainer,
                    { backgroundColor: color },
                ]}
                onPress={onLabelPress}
                onLongPress={onLabelLongPress}
                activeOpacity={0.8}
            >
                {labelImageUri ? (
                    <Image source={{ uri: labelImageUri }} style={styles.labelImage} />
                ) : (
                    <Text style={styles.labelText} numberOfLines={2}>{label}</Text>
                )}
            </TouchableOpacity>
            <View style={[styles.itemsContainer, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
                <View style={styles.itemsWrapper}>
                    {children}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: 'row',
        minHeight: 90,
        marginBottom: 2,
        borderRadius: 12,
    },
    labelContainer: {
        width: 90,
        minHeight: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelImage: {
        width: 90,
        height: 90,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        resizeMode: 'cover',
    },
    labelText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 20,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    itemsContainer: {
        flex: 1,
        padding: 8,
    },
    itemsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
});

export default TierRowComp;
