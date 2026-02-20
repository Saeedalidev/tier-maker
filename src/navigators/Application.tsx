import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CreateTierScreen from '../screens/CreateTierScreen';
import { Colors } from '../theme/theme';

const Stack = createStackNavigator();

const ApplicationNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: Colors.background }
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
            />
            <Stack.Screen
                name="CreateTier"
                component={CreateTierScreen}
            />
        </Stack.Navigator>
    );
};

export default ApplicationNavigator;
