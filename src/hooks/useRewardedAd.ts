import { useState, useEffect, useCallback, useRef } from 'react';
import admobService, { SHOW_ADS } from '../services/admobService';

interface UseRewardedAdOptions {
    onRewarded: () => void;
    onAdClosed?: () => void;
    onError?: (error: Error) => void;
}

export const useRewardedAd = (options: UseRewardedAdOptions) => {
    const [isAdLoaded, setIsAdLoaded] = useState(false);
    const [isAdLoading, setIsAdLoading] = useState(false);
    const [isAdShowing, setIsAdShowing] = useState(false);

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const loadingRef = useRef(false);
    const loadedRef = useRef(false);

    const loadAd = useCallback(async () => {
        if (!SHOW_ADS) return;
        if (loadingRef.current) return;

        if (loadedRef.current && admobService.isRewardedAdLoaded()) {
            setIsAdLoaded(true);
            return;
        }

        loadingRef.current = true;
        loadedRef.current = false;
        setIsAdLoading(true);
        setIsAdLoaded(false);

        try {
            await admobService.loadRewardedAd();
            loadedRef.current = true;
            setIsAdLoaded(true);
        } catch (error) {
            console.warn('[useRewardedAd] Failed to load ad:', error);
            loadedRef.current = false;
            setIsAdLoaded(false);
            optionsRef.current.onError?.(error as Error);
        } finally {
            loadingRef.current = false;
            setIsAdLoading(false);
        }
    }, []);

    const showAd = useCallback(async () => {
        if (isAdShowing) return;

        if (!admobService.isRewardedAdLoaded()) {
            loadedRef.current = false;
            setIsAdLoaded(false);
            optionsRef.current.onError?.(new Error('Ad not loaded. Reloading...'));
            loadAd();
            return;
        }

        setIsAdShowing(true);

        try {
            await admobService.showRewardedAd(
                () => optionsRef.current.onRewarded(),
                () => {
                    loadedRef.current = false;
                    setIsAdShowing(false);
                    setIsAdLoaded(false);
                    optionsRef.current.onAdClosed?.();
                    loadAd();
                },
                (error) => {
                    loadedRef.current = false;
                    setIsAdShowing(false);
                    setIsAdLoaded(false);
                    optionsRef.current.onError?.(error);
                    loadAd();
                }
            );
        } catch (error) {
            console.warn('[useRewardedAd] Failed to show ad:', error);
            loadedRef.current = false;
            setIsAdShowing(false);
            setIsAdLoaded(false);
            optionsRef.current.onError?.(error as Error);
            loadAd();
        }
    }, [isAdShowing, loadAd]);

    useEffect(() => {
        loadAd();
    }, [loadAd]);

    return {
        isAdLoaded,
        isAdLoading,
        isAdShowing,
        loadAd,
        showAd,
    };
};

export default useRewardedAd;
