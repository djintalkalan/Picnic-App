
import * as Reducers from 'app-store/reducers';
import { ICreateEventReducer, IEventChatReducer, IEventDetailReducer, IEventForCheckInReducer, IEventReducer, IGroupChatReducer, IGroupDetailReducer, IGroupReducer, IHomeReducer, INotificationSettings, IPersonChatReducer, IPrivacyData, IPrivacyState, IUserEventsGroups } from 'app-store/reducers';
import { rootSaga } from "app-store/saga";
import { DefaultRootState, EqualityFn } from 'react-redux';
import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import { Persistor, persistReducer, persistStore } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import { SelectEffect, Tail } from 'redux-saga/effects';
import { mergeStorageInPersistedReducer } from 'src/database/Database';

declare module 'react-redux' {
    export interface DefaultRootState {
        isLoading: boolean
        loadingMsg: string
        privacyState: IPrivacyState
        notificationSettings: INotificationSettings
        privacyData: IPrivacyData
        group: IGroupReducer
        groupDetails: IGroupDetailReducer,
        activeGroup: any,
        eventDetails: IEventDetailReducer,
        activeEvent: any,
        homeData: IHomeReducer
        event: IEventReducer
        groupChat: IGroupChatReducer
        eventChat: IEventChatReducer
        personChat: IPersonChatReducer
        userGroupsEvents: IUserEventsGroups
        createEventState: ICreateEventReducer
        eventForCheckIn: IEventForCheckInReducer
    }

    function useSelector<TState = DefaultRootState, Selected = unknown>(
        selector: (state: TState) => Selected,
        equalityFn?: EqualityFn<Selected> | undefined
    ): Selected
}

declare module 'redux-saga/effects' {
    function select<Fn extends (state: DefaultRootState, ...args: any[]) => any>(
        selector: Fn,
        ...args: Tail<Parameters<Fn>>
    ): SelectEffect
}

const PERSIST_ENABLED = true// !__DEV__

const sagaMiddleware = createSagaMiddleware();

const persistConfig = {
    // Root
    key: 'root',
    // Storage Method (React Native)
    // storage: AsyncStorage // 
    // Whitelist (Save Specific Reducers)
    whitelist: PERSIST_ENABLED ? [
        "group",
        "event",
        "groupChat",
        "eventChat",
        "groupDetails",
        "eventDetails",
        "personChat",
    ] : [],
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
    groupDetails: Reducers.groupDetailReducer,
    activeGroup: Reducers.activeGroupReducer,
    eventDetails: Reducers.eventDetailReducer,
    activeEvent: Reducers.activeEventReducer,
    homeData: Reducers.homeReducer,
    event: Reducers.eventReducer,
    groupChat: Reducers?.groupChatReducer,
    eventChat: Reducers?.eventChatReducer,
    personChat: Reducers?.personChatReducer,
    userGroupsEvents: Reducers?.userEventGroupReducer,
    createEventState: Reducers?.createEventReducer,
    eventForCheckIn: Reducers?.eventForCheckInReducer,
});

const persistedReducer = mergeStorageInPersistedReducer(persistReducer, persistConfig, rootReducer);

const store: Store<DefaultRootState> = createStore<DefaultRootState, any, any, any>(
    persistedReducer,/* preloadedState, */
    applyMiddleware(sagaMiddleware)
)

// Middleware: Redux Persist Persister
const persistor: Persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

export { store, persistor };

