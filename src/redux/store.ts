
import * as Reducers from 'app-store/reducers';
import { IEventReducer, IGroupChatReducer, IGroupReducer, IHomeReducer, INotificationSettings, IPrivacyData, IPrivacyState } from 'app-store/reducers';
import { rootSaga } from "app-store/saga";
import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import { Persistor, persistReducer, persistStore } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import { mergeStorageInPersistedReducer } from 'src/database/Database';

export interface RootState {
    isLoading: boolean
    loadingMsg: string
    privacyState: IPrivacyState
    notificationSettings: INotificationSettings
    privacyData: IPrivacyData
    group: IGroupReducer
    homeData: IHomeReducer
    event: IEventReducer
    groupChat: IGroupChatReducer
}

const sagaMiddleware = createSagaMiddleware();

const persistConfig = {
    // Root
    key: 'root',
    // Storage Method (React Native)
    // storage: AsyncStorage // 
    // Whitelist (Save Specific Reducers)
    whitelist: [
        "group",
        "event",
        // "groupChat",
    ],
    blacklist: [],
    throttle: 1000,
    debounce: 1000,
};

const rootReducer = combineReducers({
    isLoading: Reducers.isLoadingReducer,
    loadingMsg: Reducers.loadingMsgReducer,
    notificationSettings: Reducers.notificationSettingsReducer,
    privacyState: Reducers.privacyStateReducer,
    privacyData: Reducers.privacyDataReducer,
    group: Reducers.groupReducer,
    homeData: Reducers.homeReducer,
    event: Reducers.eventReducer,
    groupChat: Reducers?.groupChatReducer,
});

const persistedReducer = mergeStorageInPersistedReducer(persistReducer, persistConfig, rootReducer);

interface MyStore extends Store {
    getState(): RootState
}

const store: Store<RootState> = createStore<RootState, any, any, any>(
    persistedReducer,/* preloadedState, */
    applyMiddleware(sagaMiddleware)
)

// Middleware: Redux Persist Persister
const persistor: Persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

export { store, persistor };

