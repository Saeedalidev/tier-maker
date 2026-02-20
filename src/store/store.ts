import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tierReducer from './slices/tierSlice';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['tierLists'], // Only persist tierLists
};

const persistedReducer = persistReducer(persistConfig, tierReducer);

export const store = configureStore({
    reducer: {
        tier: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
