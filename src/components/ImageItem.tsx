import { StyleSheet, Image, View, TouchableOpacity, Text } from 'react-native';
import { Colors } from '../theme/theme';

interface ImageItemProps {
    uri?: string;
    text?: string;
    backgroundColor?: string;
    onPress?: () => void;
    onLongPress?: () => void;
    selected?: boolean;
    width?: number;
    height?: number;
}

const ImageItem = ({ uri, text, backgroundColor, onPress, onLongPress, selected, width, height }: ImageItemProps) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                selected && styles.selectedContainer,
                backgroundColor ? { backgroundColor } : null,
                width ? { width } : null,
                height ? { height } : null
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            {uri ? (
                <Image source={{ uri }} style={styles.image} />
            ) : (
                <Text style={[styles.itemText, backgroundColor ? { color: '#000' } : null]} numberOfLines={3}>{text}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 80,
        height: 80,
        borderRadius: 10,
        backgroundColor: Colors.surface,
        overflow: 'hidden',
        margin: 1,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedContainer: {
        borderColor: Colors.primary,
        borderWidth: 3,
        transform: [{ scale: 1.05 }],
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    textContainer: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default ImageItem;
