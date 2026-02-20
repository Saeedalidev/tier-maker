import { captureRef } from 'react-native-view-shot';
import { Share, Alert } from 'react-native';

export const exportTierList = async (viewRef: any) => {
    if (!viewRef.current) {
        Alert.alert('Error', 'Could not capture the view');
        return;
    }

    try {
        const uri = await captureRef(viewRef, {
            format: 'png',
            quality: 0.8,
        });

        await Share.share({
            url: uri,
            title: 'My Tier List',
        });
    } catch (error) {
        console.error('Export error:', error);
        Alert.alert('Error', 'Failed to export tier list');
    }
};
