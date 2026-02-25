import { Platform, StatusBarStyle } from 'react-native';
import { Colors } from '../theme/theme';

interface StatusBarConfig {
    barStyle: StatusBarStyle;
    backgroundColor: string;
}

export const getStatusBarConfig = (theme: 'dark' | 'light'): StatusBarConfig => {
    const isDarkMode = theme === 'dark';
    const androidVersion = Platform.OS === 'android' ? (Platform.Version as number) : undefined;
    const supportsDarkIcons = Platform.OS === 'ios' || (androidVersion !== undefined && androidVersion >= 23);
    const shouldUseLightIcons = isDarkMode || !supportsDarkIcons;

    const barStyle: StatusBarStyle = shouldUseLightIcons ? 'light-content' : 'dark-content';
    const backgroundColor = isDarkMode
        ? Colors.dark.background
        : barStyle === 'light-content'
            ? Colors.primary
            : Colors.light.background;

    return { barStyle, backgroundColor };
};
