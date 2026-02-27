import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import HomeScreen from '../screens/HomeScreen';
import CreateTierScreen from '../screens/CreateTierScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SplashScreen from '../screens/SplashScreen';
import { Colors } from '../theme/theme';

const Stack = createStackNavigator();

const ApplicationNavigator = () => {
    const theme = useSelector((state: RootState) => state.tier.theme);
    const isDarkMode = theme === 'dark';
    const backgroundColor = isDarkMode ? Colors.dark.background : Colors.light.background;

    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor }
            }}
        >
            <Stack.Screen
                name="Splash"
                component={SplashScreen}
            />
            <Stack.Screen
                name="Home"
                component={HomeScreen}
            />
            <Stack.Screen
                name="CreateTier"
                component={CreateTierScreen}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
            />
        </Stack.Navigator>
    );
};

export default ApplicationNavigator;
