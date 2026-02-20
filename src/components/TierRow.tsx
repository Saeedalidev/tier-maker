import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, Shadows } from '../theme/theme';

interface TierRowProps {
    label: string;
    color: string;
    labelImageUri?: string;
    onLabelPress?: () => void;
    onLabelLongPress?: () => void;
    onLayout?: (event: any) => void;
    isHighlighted?: boolean;
    children?: React.ReactNode;
}

const TierRowComp = ({ label, color, labelImageUri, onLabelPress, onLabelLongPress, onLayout, isHighlighted, children }: TierRowProps) => {
    return (
        <View
            ref={null}
            collapsable={false}
            style={[
                styles.rowContainer,
                isHighlighted && { backgroundColor: 'rgba(108, 72, 255, 0.2)', borderColor: Colors.primary, borderWidth: 1 }
            ]}
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
            <View style={styles.itemsContainer}>
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
        backgroundColor: Colors.surface,
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
        padding: Spacing.s,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    itemsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
});

export default TierRowComp;
