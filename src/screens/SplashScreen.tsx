import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Image,
    Platform,
} from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Colors } from '../theme/theme';
import { CommonActions } from '@react-navigation/native';
import admobService, { SHOW_ADS } from '../services/admobService';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
    const theme = useSelector((state: RootState) => state.tier.theme);
    const isDarkMode = theme === 'dark';
    const finalBackgroundColor = isDarkMode ? Colors.dark.background : Colors.light.background;
    const textColor = isDarkMode ? Colors.dark.textPrimary : Colors.light.textPrimary;
    const mutedColor = isDarkMode ? '#A0A0A0' : '#6B7280';

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    const [loadingText, setLoadingText] = useState('Initializing');

    useEffect(() => {
        // Hide native splash screen as soon as JS is ready
        RNBootSplash.hide({ fade: true });

        // Start entry animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                delay: 200, // Small delay for native to JS transition
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
            // Background transition from White to Theme Color
            Animated.timing(bgAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: false,
            }),
        ]).start();

        // Progress animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
        }).start();

        const sequence = [
            { time: 0, text: 'Initializing' },
            { time: 800, text: 'Loading resources' },
            { time: 1600, text: 'Preparing workspace' },
            { time: 2400, text: 'Finalizing' },
        ];

        const timers = sequence.map(({ time, text }) =>
            setTimeout(() => setLoadingText(text), time)
        );

        const initAndNavigate = async () => {
            try {
                // Initialize services if needed
                if (SHOW_ADS) {
                    await admobService.initialize().catch(err => console.warn(err));
                }

                // Ensure we stay on splash for at least 3 seconds
                await new Promise(resolve => setTimeout(() => resolve(true), 3200));

                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                    })
                );
            } catch (error) {
                console.error('Splash error:', error);
                navigation.navigate('Home');
            }
        };

        initAndNavigate();

        return () => timers.forEach(clearTimeout);
    }, []);

    const animatedBackgroundColor = bgAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#1A1A1A', finalBackgroundColor],
    });

    return (
        <Animated.View style={[styles.container, { backgroundColor: animatedBackgroundColor }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'} // Or keep static during transition
            />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/bootsplash/app_icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: mutedColor }]}>
                        {loadingText}...
                    </Text>

                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    backgroundColor: Colors.primary,
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        />
                    </View>
                </View>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: mutedColor }]}>
                    Powered by AsappStudio
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 150,
        height: 150,
        borderRadius: 35,
        overflow: 'hidden',
        marginBottom: 30,
        // Shadow for premium look
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        width: width * 0.6,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 12,
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

export default SplashScreen;
