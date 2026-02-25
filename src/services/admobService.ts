import { Platform } from 'react-native';
import MobileAds, {
    RewardedAd,
    RewardedAdEventType,
    AdEventType,
    TestIds,
} from 'react-native-google-mobile-ads';

// Toggle to globally enable/disable ads (helpful while testing)
export const SHOW_ADS = false;

const IOS_REWARDED_ID = 'ca-app-pub-4844847303742824/2942740253';
const IOS_BANNER_ID = 'ca-app-pub-4844847303742824/5568903598';
const ANDROID_REWARDED_ID = 'ca-app-pub-3572144641927803/9335457475';
const ANDROID_BANNER_ID = 'ca-app-pub-3572144641927803/8213947497';

const REWARDED_AD_UNIT_ID = Platform.select({
    ios: __DEV__ ? TestIds.REWARDED : IOS_REWARDED_ID,
    android: __DEV__ ? TestIds.REWARDED : ANDROID_REWARDED_ID,
}) || TestIds.REWARDED;

const BANNER_AD_UNIT_ID = Platform.select({
    ios: __DEV__ ? TestIds.BANNER : IOS_BANNER_ID,
    android: __DEV__ ? TestIds.BANNER : ANDROID_BANNER_ID,
}) || TestIds.BANNER;

export const FINAL_REWARDED_ID = REWARDED_AD_UNIT_ID;
export const FINAL_BANNER_ID = BANNER_AD_UNIT_ID;

class AdMobService {
    private static instance: AdMobService;
    private rewardedAd: RewardedAd | null = null;
    private isInitialized = false;
    private initializationPromise: Promise<void> | null = null;

    private constructor() { }

    private isModuleAvailable(): boolean {
        try {
            return !!MobileAds && typeof MobileAds === 'function';
        } catch {
            return false;
        }
    }

    static getInstance(): AdMobService {
        if (!AdMobService.instance) {
            AdMobService.instance = new AdMobService();
        }
        return AdMobService.instance;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized || this.initializationPromise) {
            return this.initializationPromise || Promise.resolve();
        }

        if (!this.isModuleAvailable()) {
            console.warn('[AdMob] Native module missing. Rebuild the app.');
            return;
        }

        this.initializationPromise = (async () => {
            try {
                await MobileAds().setRequestConfiguration({
                    testDeviceIdentifiers: ['EMULATOR'],
                });
                await MobileAds().initialize();
                this.isInitialized = true;
                console.log('[AdMob] Initialized');
            } catch (error) {
                console.warn('[AdMob] Initialization failed:', error);
            } finally {
                this.initializationPromise = null;
            }
        })();

        return this.initializationPromise;
    }

    async loadRewardedAd(): Promise<void> {
        if (!this.isModuleAvailable()) {
            throw new Error('AdMob native module not available');
        }

        if (this.initializationPromise) {
            await this.initializationPromise;
        }

        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.rewardedAd && this.rewardedAd.loaded) {
            return;
        }

        if (!this.rewardedAd) {
            this.rewardedAd = RewardedAd.createForAdRequest(FINAL_REWARDED_ID, {
                requestNonPersonalizedAdsOnly: false,
            });
        }

        return new Promise<void>((resolve, reject) => {
            if (!this.rewardedAd) {
                reject(new Error('Failed to create rewarded ad'));
                return;
            }

            const unsubscribeLoaded = this.rewardedAd.addAdEventListener(
                RewardedAdEventType.LOADED,
                () => {
                    console.log('[AdMob] Rewarded ad loaded');
                    unsubscribeLoaded();
                    unsubscribeError();
                    resolve();
                }
            );

            const unsubscribeError = this.rewardedAd.addAdEventListener(
                AdEventType.ERROR,
                (error) => {
                    console.warn('[AdMob] Failed to load rewarded ad:', error);
                    unsubscribeLoaded();
                    unsubscribeError();
                    this.rewardedAd = null;
                    reject(error);
                }
            );

            this.rewardedAd.load();
        });
    }

    async showRewardedAd(
        onRewarded: () => void,
        onAdClosed?: () => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        if (!this.rewardedAd || !this.rewardedAd.loaded) {
            const error = new Error('Rewarded ad is not ready');
            onError?.(error);
            throw error;
        }

        return new Promise<void>((resolve, reject) => {
            const ad = this.rewardedAd!;
            let hasEarnedReward = false;

            const unsubscribeEarned = ad.addAdEventListener(
                RewardedAdEventType.EARNED_REWARD,
                (reward) => {
                    console.log('[AdMob] User earned reward:', reward);
                    hasEarnedReward = true;
                    onRewarded();
                }
            );

            const unsubscribeClosed = ad.addAdEventListener(
                AdEventType.CLOSED,
                () => {
                    console.log('[AdMob] Rewarded ad closed');
                    unsubscribeEarned();
                    unsubscribeClosed();
                    unsubscribeError();
                    this.rewardedAd = null;
                    onAdClosed?.();

                    if (hasEarnedReward) {
                        resolve();
                    } else {
                        reject(new Error('Ad closed before reward earned'));
                    }
                }
            );

            const unsubscribeError = ad.addAdEventListener(
                AdEventType.ERROR,
                (error) => {
                    console.warn('[AdMob] Error while showing rewarded ad:', error);
                    unsubscribeEarned();
                    unsubscribeClosed();
                    unsubscribeError();
                    this.rewardedAd = null;
                    onError?.(error);
                    reject(error);
                }
            );

            ad.show();
        });
    }

    isRewardedAdLoaded() {
        return !!this.rewardedAd && this.rewardedAd.loaded;
    }

    cleanupRewardedAd() {
        this.rewardedAd = null;
    }
}

export default AdMobService.getInstance();
