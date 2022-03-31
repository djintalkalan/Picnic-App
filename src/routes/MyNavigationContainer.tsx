// import { useNetInfo } from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { config, _getAppVersion } from 'api';
import { refreshLanguage, setLoadingAction, tokenExpired } from 'app-store/actions';
import { colors } from 'assets';
import { Card, PopupAlert } from 'custom-components';
import { BottomMenu } from 'custom-components/BottomMenu';
import { ImageZoom } from 'custom-components/ImageZoom';
import DropdownAlert from 'dj-react-native-dropdown-alert';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { Alert, DeviceEventEmitter, Linking, LogBox, Platform, Text, View } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import RNExitApp from 'react-native-exit-app';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { Rollbar } from 'rollbar-service';
import CreateNewPassword from 'screens/Auth/CreateNewPassword';
import ForgotPassword from 'screens/Auth/ForgotPassword';
import Login from 'screens/Auth/Login';
import SignUp1 from 'screens/Auth/SignUp/SignUp1';
import SignUp2 from 'screens/Auth/SignUp/SignUp2';
import SignUp3 from 'screens/Auth/SignUp/SignUp3';
import VerifyOTP from 'screens/Auth/VerifyOTP';
import EventChats from 'screens/Chat/EventChat/EventChats';
import GroupChatScreen from 'screens/Chat/GroupChat/GroupChatScreen';
import ImagePreview from 'screens/Chat/ImagePreview';
import SearchChatScreen from 'screens/Chat/SearchChat/SearchChatScreen';
import Home from 'screens/Dashboard/Home';
import ProfileScreen from 'screens/Dashboard/ProfileScreen';
import BookEvent from 'screens/Event/BookEvent';
import CreateEvent1 from 'screens/Event/CreateEvent/CreateEvent1';
import CreateEvent2 from 'screens/Event/CreateEvent/CreateEvent2';
import CreateEvent3 from 'screens/Event/CreateEvent/CreateEvent3';
import EditEvent from 'screens/Event/EditEvent';
import EventDetail from 'screens/Event/EventDetail';
import EventMembers from 'screens/Event/EventMembers';
import Payment from 'screens/Event/Payment';
import GooglePlacesTextInput from 'screens/GooglePlacesTextInput';
import CreateGroup from 'screens/Group/CreateGroup';
import Events from 'screens/Group/Events';
import GroupDetail from 'screens/Group/GroupDetail';
import BlockedMembers from 'screens/Profile/BlockedMembers';
import HiddenPosts from 'screens/Profile/HiddenPosts';
import MutedGroupsEvents from 'screens/Profile/MutedGroupsEvents';
import PrivacyScreen from 'screens/Profile/PrivacyScreen';
import ProfileEvents from 'screens/Profile/ProfileEvents';
import ProfileGroups from 'screens/Profile/ProfileGroups';
import Settings from 'screens/Profile/Settings';
import UpdatePassword from 'screens/Profile/UpdatePassword';
import Scanner from 'screens/Scanner/Scanner';
import SelectContacts from 'screens/SelectContacts';
import SelectLocation from 'screens/SelectLocation';
import Subscription from 'screens/Subscription/Subscription';
import Semver from 'semver';
import { SocketService } from 'socket';
import { useDatabase } from 'src/database/Database';
import Language, { useLanguage } from 'src/language/Language';
import FirebaseNotification from 'src/notification/FirebaseNotification';
// import { useLanguage } from 'src/language/Language';
import { NavigationService, scaler } from 'utils';
import { KeyboardAccessoryView, StaticHolder } from 'utils/StaticHolder';

export let TOKEN_EXPIRED = false;
const NativeStack = createNativeStackNavigator();

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
  GroupChatScreen: GroupChatScreen,
  EventChats: EventChats,
  CreateEvent1: CreateEvent1,
  CreateEvent2: CreateEvent2,
  CreateEvent3: CreateEvent3,
  EventDetail: EventDetail,
  EditEvent: EditEvent,
  Subscription: Subscription,
  BookEvent: BookEvent,
  EventMembers: EventMembers,
  Scanner: Scanner,
  ProfileEvents: ProfileEvents,
  ProfileGroups: ProfileGroups,
  HiddenPosts: HiddenPosts,
  Payment: Payment,
  SearchChatScreen: SearchChatScreen,
  SelectContacts: SelectContacts,
  ImagePreview: ImagePreview
};

const MyNavigationContainer = () => {
  FirebaseNotification();
  const dispatch = useDispatch();

  // const { isConnected, isInternetReachable } = useNetInfo()

  const [isLogin] = useDatabase<boolean>('isLogin', false);
  const language = useLanguage();
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

  useEffect(() => {
    dispatch(refreshLanguage())
    Rollbar?.init();
    return () => {
      Rollbar?.exit();
    }
  }, [isLogin])

  useEffect(() => {
    if (isLogin) {
      SocketService.init(dispatch);
    }
    return () => {
      SocketService.closeSocket();
    }
  }, [isLogin, language])

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

  const getVersion = useCallback(() => {
    _getAppVersion().then(res => {
      if (res && res.status == 200) {
        const serverVersion = res?.data?.[Platform.OS]
        const currentVersion = Platform.OS == 'ios' ? config.APP_STORE_VERSION : config.ANDROID_VERSION_NAME
        const isUpdateAvailable = Semver.compare(serverVersion, currentVersion)
        console.log("isUpdateAvailable", isUpdateAvailable);
        if (isUpdateAvailable == 1) {
          Alert.alert(Language.update_available, Language.must_update_app, [
            {
              text: Language.update, onPress: () => {
                Platform.OS == 'android' ?
                  Linking.openURL("http://play.google.com/store/apps/details?id=" + config.PACKAGE_NAME?.replace('test', 'app'))
                  :
                  Linking.openURL('itms-apps://apps.apple.com/us/app/picnic-groups/id1561013758')
                RNExitApp.exitApp();
              }
            }
          ], {
            cancelable: false
          }
          )
        }
      }
      RNBootSplash.hide()
    }).catch((e: Error) => {
      console.log("error", e);
      if (e?.message?.includes("Network Error")) {
        Alert.alert(Language.connection_error, Language.internet_connection_seems_not, [
          {
            text: Language.try_again, onPress: () => {
              getVersion()
            }
          }
        ], {
          cancelable: false
        }
        )
        return
      }
      RNBootSplash.hide()
    })
  }, [])

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={NavigationService.setNavigationRef}
        onReady={() => setTimeout(() => {
          getVersion()
          // RNBootSplash.hide({ fade: true })
        }, 500)}
      >
        {/* <Stack.Navigator screenOptions={{ headerShown: false }}>
        {Object.entries({
          // Use some screens conditionally based on some condition
          ...(isLogin ? dashboardScreens : authScreens),
          // Use the screens normally
          ...commonScreens,
        }).map(([name, component]) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
      </Stack.Navigator> */}


        <NativeStack.Navigator screenOptions={{ headerShown: false }}>
          {Object.entries({
            // Use some screens conditionally based on some condition
            ...(isLogin ? dashboardScreens : authScreens),
            // Use the screens normally
            ...commonScreens,
          }).map(([name, component]) => (
            <NativeStack.Screen key={name} name={name} component={component} />
          ))}
        </NativeStack.Navigator>
        <ImageZoom ref={ref => StaticHolder.setImageZoom(ref)} />
        <PopupAlert ref={ref => StaticHolder.setPopupAlert(ref)} />
        <BottomMenu ref={ref => StaticHolder.setBottomMenu(ref)} />
        <KeyboardAccessoryView ref={ref => StaticHolder.setKeyboardAccessoryView(ref)} />
        <DropdownAlertWithStatusBar />
      </NavigationContainer>
    </SafeAreaProvider>

  );
};

const successImageSrc = Ionicons.getImageSourceSync("ios-checkmark-circle-outline", 50, colors.colorWhite)

const DropdownAlertWithStatusBar = () => {
  return <DropdownAlert
    successImageSrc={successImageSrc}
    updateStatusBar={false}
    customAlert={(data) => {
      // console.log("data", data)
      let IconComponent = <Feather color={colors.colorWhite} size={scaler(22)} name={'check'} />
      let iconBackgroundColor = colors.colorPrimary

      switch (data?.type) {
        case "error":
          IconComponent = <AntDesign color={colors.colorWhite} size={scaler(22)} name={'close'} />
          iconBackgroundColor = "#cc3232"
          break;

        case "info":
        case "warn":
          IconComponent = <Ionicons color={colors.colorWhite} size={scaler(22)} name={'information'} />
          iconBackgroundColor = "#cd853f"
          break;
      }
      return (
        <Card cornerRadius={scaler(40)} cardElevation={3} style={{ flexDirection: 'row', alignItems: 'center', padding: scaler(4), borderRadius: scaler(40), backgroundColor: 'white', width: '90%', marginHorizontal: '5%' }} >
          <View style={{ alignItems: 'center', justifyContent: 'center', borderRadius: scaler(20), height: scaler(40), width: scaler(40), backgroundColor: iconBackgroundColor }}>
            {IconComponent}
          </View>
          <Text style={{ flex: 1, fontWeight: '500', fontSize: scaler(14), paddingHorizontal: scaler(10), color: '#061D32' }} >{data?.message}</Text>
        </Card>
      )
    }}
    ref={ref => StaticHolder.setDropDown(ref)} />
}


export default MyNavigationContainer;
