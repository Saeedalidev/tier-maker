import { captureRef } from 'react-native-view-shot';
import { Share, Alert, PermissionsAndroid, Platform } from 'react-native';
import {
    CameraRoll,
    iosRequestAddOnlyGalleryPermission,
    iosReadGalleryPermission,
} from '@react-native-camera-roll/camera-roll';

export type ExportIntent = 'share' | 'save';

const requestAndroidPhotoPermission = async () => {
    if (Platform.OS !== 'android') return true;

    const permission =
        Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const status = await PermissionsAndroid.request(permission, {
        title: 'TierUP photo access',
        message: 'Allow TierUP to save tier list images to your device.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
    });

    return status === PermissionsAndroid.RESULTS.GRANTED;
};

const requestIOSPhotoPermission = async () => {
    if (Platform.OS !== 'ios') return true;

    try {
        // Silently check current status WITHOUT showing any prompt.
        // Calling iosRequestAddOnlyGalleryPermission() when already 'limited'
        // triggers iOS to show the recurring "Select More Photos" dialog.
        const currentStatus = await iosReadGalleryPermission('addOnly');
        if (currentStatus === 'granted' || currentStatus === 'limited') {
            return true;
        }

        // Only prompt if no decision has been made yet.
        const status = await iosRequestAddOnlyGalleryPermission();
        if (status === 'granted' || status === 'limited') {
            return true;
        }

        if (status === 'blocked' || status === 'denied') {
            Alert.alert(
                'Permission needed',
                'Enable "Add Photos Only" access for TierUP in Settings > Privacy & Security > Photos to save your images.'
            );
        }

        return false;
    } catch (error) {
        console.error('iOS save permission error', error);
        return false;
    }
};

export const exportTierList = async (
    viewRef: any,
    options: { intent?: ExportIntent; title?: string } = {}
) => {
    if (!viewRef?.current) {
        Alert.alert('Error', 'Could not capture the tier list preview.');
        return;
    }

    const intent: ExportIntent = options.intent || 'share';

    try {
        const uri = await captureRef(viewRef, {
            format: 'png',
            quality: 0.9,
        });

        if (intent === 'save') {
            const hasPermission = Platform.OS === 'android'
                ? await requestAndroidPhotoPermission()
                : await requestIOSPhotoPermission();
            if (!hasPermission) {
                Alert.alert('Permission needed', 'Please allow photo access to save your tier list.');
                return;
            }

            const shareFallback = async () => {
                await Share.share({
                    url: uri,
                    title: options.title ? `TierUP - ${options.title}` : 'Share tier list image',
                });
            };

            try {
                try {
                    await CameraRoll.save(uri, { type: 'photo', album: 'TierUP' });
                } catch (error) {
                    console.warn('Album save failed, retrying without album', error);
                    await CameraRoll.save(uri, { type: 'photo' });
                }
                Alert.alert('Saved', 'Tier list image saved to your gallery.');
            } catch (error: any) {
                // Check for known iOS "Add Only" bug where save succeeds but library fails to fetch meta.
                // Use iosReadGalleryPermission (read-only, no dialog) to avoid triggering a permission prompt.
                const currentStatus = Platform.OS === 'ios' ? await iosReadGalleryPermission('addOnly') : null;
                const isAddOnlyIosBug =
                    Platform.OS === 'ios' &&
                    error?.message?.includes('Unknown error') &&
                    (currentStatus === 'granted' || currentStatus === 'limited');

                if (isAddOnlyIosBug) {
                    Alert.alert('Saved', 'Tier list image saved to your gallery.');
                    return;
                }

                console.error('Direct save failed:', error);
                Alert.alert(
                    'Save Issue',
                    `Could not save directly to gallery: ${error?.message || 'Permission or storage issue'}. You can still save it manually via the share sheet.`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Share Sheet', onPress: shareFallback },
                    ]
                );
            }
            return;
        }

        await Share.share({
            url: uri,
            title: options.title ? `TierUP - ${options.title}` : 'Share tier list',
        });
    } catch (error) {
        console.error('Export error:', error);
        Alert.alert('Error', intent === 'save' ? 'Failed to save tier list.' : 'Failed to share tier list.');
    }
};
