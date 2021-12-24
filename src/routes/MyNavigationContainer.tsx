import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { setLoadingAction, tokenExpired } from 'app-store/actions';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { DeviceEventEmitter, LogBox } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import { useDispatch } from 'react-redux';
import CreateNewPassword from 'screens/Auth/CreateNewPassword';
import ForgotPassword from 'screens/Auth/ForgotPassword';
import Login from 'screens/Auth/Login';
import SignUp1 from 'screens/Auth/SignUp/SignUp1';
import SignUp2 from 'screens/Auth/SignUp/SignUp2';
import SignUp3 from 'screens/Auth/SignUp/SignUp3';
import VerifyOTP from 'screens/Auth/VerifyOTP';
import BlockedMembers from 'screens/BlockedMembers';
import GroupChat from 'screens/Chat/GroupChat';
import Home from 'screens/Dashboard/Home';
import ProfileScreen from 'screens/Dashboard/ProfileScreen';
import CreateEvent1 from 'screens/Event/CreateEvent/CreateEvent1';
import CreateEvent2 from 'screens/Event/CreateEvent/CreateEvent2';
import CreateEvent3 from 'screens/Event/CreateEvent/CreateEvent3';
import EditEvent from 'screens/Event/EditEvent';
import GooglePlacesTextInput from 'screens/GooglePlacesTextInput';
import CreateGroup from 'screens/Group/CreateGroup';
import Events from 'screens/Group/Events';
import GroupDetail from 'screens/Group/GroupDetail';
import MutedGroupsEvents from 'screens/MutedGroupsEvents';
import PrivacyScreen from 'screens/PrivacyScreen';
import SelectLocation from 'screens/SelectLocation';
import Settings from 'screens/Settings';
import UpdatePassword from 'screens/UpdatePassword';
import { useDatabase } from 'src/database/Database';
// import { useLanguage } from 'src/language/Language';
import { navigationRef } from 'utils';

export let TOKEN_EXPIRED = false;

const Stack = createStackNavigator();

const commonScreens = {};

const authScreens = {
  Login: Login,
  ForgotPassword: ForgotPassword,
  VerifyOTP: VerifyOTP,
  CreateNewPassword: CreateNewPassword,
  SignUp1: SignUp1,
  SignUp2: SignUp2,
  SignUp3: SignUp3,
};

const dashboardScreens = {
  Home: Home,
  ProfileScreen: ProfileScreen,
  Settings: Settings,
  UpdatePassword: UpdatePassword,
  PrivacyScreen: PrivacyScreen,
  BlockedMembers: BlockedMembers,
  MutedGroupsEvents: MutedGroupsEvents,
  SelectLocation: SelectLocation,
  GooglePlacesTextInput: GooglePlacesTextInput,
  CreateGroup: CreateGroup,
  GroupDetail: GroupDetail,
  Events: Events,
  GroupChat: GroupChat,
  CreateEvent1: CreateEvent1,
  CreateEvent2: CreateEvent2,
  CreateEvent3: CreateEvent3,
  EditEvent: EditEvent,
};

const MyNavigationContainer = () => {
  const dispatch = useDispatch();
  const [isLogin] = useDatabase<boolean>('isLogin', false);
  // const language = useLanguage();
  // console.log("language", language)
  useEffect(() => {
    LogBox.ignoreAllLogs();
    const loaderListener = DeviceEventEmitter.addListener(
      'STOP_LOADER_EVENT',
      stopLoader,
    );
    const tokenListener = DeviceEventEmitter.addListener(
      'TOKEN_EXPIRED',
      tokenExpiredLocal,
    );
    return () => {
      loaderListener.remove();
      tokenListener.remove();
    };
  }, []);

  const stopLoader = useCallback(() => {
    dispatch(setLoadingAction(false));
  }, []);

  const tokenExpiredLocal = useCallback(() => {
    if (!TOKEN_EXPIRED) {
      TOKEN_EXPIRED = true;
      console.log('Logout Dispatched');
      dispatch(tokenExpired());
    }
  }, []);

  return (
    <NavigationContainer
      ref={ref => (navigationRef.current = ref)}
      onReady={() => RNBootSplash.hide()}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {Object.entries({
          // Use some screens conditionally based on some condition
          ...(isLogin ? dashboardScreens : authScreens),
          // Use the screens normally
          ...commonScreens,
        }).map(([name, component]) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyNavigationContainer;
