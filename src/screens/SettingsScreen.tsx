import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Alert,
    Platform,
    StatusBar,
    SafeAreaView,
    Switch,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleTheme } from '../store/slices/tierSlice';
import { getDesignTokens } from '../theme/theme';

const SettingsScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const theme = useSelector((state: RootState) => state.tier.theme);
    const isDarkMode = theme === 'dark';
    const DESIGN = getDesignTokens(theme);

    const socialLinks = [
        { name: 'logo-instagram', url: 'https://www.instagram.com/asappstudio_official/', color: '#E1306C' },
        { name: 'logo-facebook', url: 'https://www.facebook.com/share/1DBjoaBUvp/', color: '#1877F2' },
        { name: 'logo-youtube', url: 'https://www.youtube.com/@AsappStudio', color: '#FF0000' },
        { name: 'logo-tiktok', url: 'https://www.tiktok.com/@asappstudio', color: isDarkMode ? '#fff' : '#000' },
        { name: 'logo-linkedin', url: 'https://www.linkedin.com/company/asappstudio/posts/?feedView=all', color: '#0077B5' },
        { name: 'logo-twitter', url: 'https://x.com/AsappStudio', color: isDarkMode ? '#fff' : '#000' },
    ];

    const handleOpenURL = (url: string) => {
        Linking.openURL(url).catch(() =>
            Alert.alert('Error', 'Unable to open the link.')
        );
    };

    const handleFeedback = () => {
        Linking.openURL('mailto:zeeshan@asappstudio.com?subject=Feedback for TierUP').catch(() =>
            Alert.alert('Error', 'Could not open mail client.')
        );
    };

    const handleRateUs = () => {
        const url = Platform.OS === 'ios'
            ? 'itms-apps://apps.apple.com/app/id6757762588?action=write-review'
            : 'https://play.google.com/store/apps/details?id=com.tiermaker.tierup';

        Linking.openURL(url).catch(() =>
            Alert.alert('Error', 'Unable to open store page.')
        );
    };

    const handleMoreApps = () => {
        const url = Platform.OS === 'ios'
            ? 'https://apps.apple.com/ro/developer/asapp-studio/id1338092352'
            : 'https://play.google.com/store/apps/developer?id=ASAPP+STUDIO&hl=en_US';

        Linking.openURL(url).catch(() =>
            Linking.openURL('https://asappstudio.com')
        );
    };

    const styles = useMemo(() => StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: DESIGN.bg,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: DESIGN.border,
        },
        backBtn: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitle: {
            color: DESIGN.textPrimary,
            fontSize: 18,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        content: {
            padding: 16,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            color: DESIGN.textMuted,
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 12,
            marginLeft: 4,
        },
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: DESIGN.card,
            padding: 14,
            borderRadius: 14,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: DESIGN.cardBorder,
        },
        itemLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        itemIconWrap: {
            width: 36,
            height: 36,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        itemLabel: {
            color: DESIGN.textPrimary,
            fontSize: 15,
            fontWeight: '600',
        },
        socialGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 4,
        },
        socialBtn: {
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: DESIGN.card,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: DESIGN.cardBorder,
        },
        versionText: {
            color: DESIGN.textMuted,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 20,
            marginBottom: 40,
        },
    }), [DESIGN]);

    const renderItem = (icon: string, label: string, color: string, onPress: () => void) => (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <View style={styles.itemLeft}>
                <View style={[styles.itemIconWrap, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={DESIGN.textMuted} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={DESIGN.bg} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={DESIGN.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <View style={[styles.itemIconWrap, { backgroundColor: `${DESIGN.accent}15` }]}>
                                <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color={DESIGN.accent} />
                            </View>
                            <Text style={styles.itemLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={() => { dispatch(toggleTheme()); }}
                            trackColor={{ false: '#767577', true: DESIGN.accent }}
                            thumbColor={Platform.OS === 'ios' ? undefined : '#f4f3f4'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Premium</Text>
                    {renderItem('diamond', 'Upgrade to Premium', DESIGN.amber, () => Alert.alert('Premium', 'Coming Soon!'))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support & More</Text>
                    {renderItem('mail-outline', 'Feedback', DESIGN.accent, handleFeedback)}
                    {renderItem('star-outline', 'Rate Us', DESIGN.cyan, handleRateUs)}
                    {renderItem('apps-outline', 'More Apps', DESIGN.green, handleMoreApps)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    {renderItem('information-circle-outline', 'About Us', DESIGN.accent, () => handleOpenURL('https://asappstudio.com/our-products/'))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Connect With Us</Text>
                    <View style={styles.socialGrid}>
                        {socialLinks.map((social, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.socialBtn}
                                onPress={() => handleOpenURL(social.url)}
                            >
                                <Ionicons name={social.name} size={24} color={social.color} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;
