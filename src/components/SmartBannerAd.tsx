import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { FINAL_BANNER_ID, SHOW_ADS } from '../services/admobService';

interface SmartBannerAdProps {
    size?: BannerAdSize;
}

const SmartBannerAd: React.FC<SmartBannerAdProps> = ({
    size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
}) => {
    const [hideAd, setHideAd] = useState(false);

    if (!SHOW_ADS || hideAd) {
        return null;
    }

    return (
        <View style={styles.container}>
            <BannerAd
                unitId={FINAL_BANNER_ID}
                size={size}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                onAdFailedToLoad={() => setHideAd(true)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
});

export default SmartBannerAd;
