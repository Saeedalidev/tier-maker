import React, { useEffect } from 'react';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from './src/store/store';
import ApplicationNavigator from './src/navigators/Application';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { Colors } from './src/theme/theme';
import { getStatusBarConfig } from './src/utils/statusBar';
import admobService, { SHOW_ADS } from './src/services/admobService';

const AppContent = () => {
  const theme = useSelector((state: RootState) => state.tier.theme);
  const { barStyle, backgroundColor: statusBarBg } = getStatusBarConfig(theme);


  return (
    <>
      <StatusBar barStyle={barStyle} backgroundColor={statusBarBg} />
      <NavigationContainer>
        <ApplicationNavigator />
      </NavigationContainer>
    </>
  );
};

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate
          loading={null}
          persistor={persistor}
        >
          <AppContent />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
