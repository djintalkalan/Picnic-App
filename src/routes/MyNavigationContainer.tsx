// import { useNetInfo } from '@react-native-community/netinfo';
import { firebase as firebaseCrashlytics } from '@react-native-firebase/crashlytics';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnalyticService from 'analytics';
import { refreshLanguage, setLoadingAction, tokenExpired, updateDeviceLanguage } from 'app-store/actions';
import { colors } from 'assets';
import { Card, PopupAlert } from 'custom-components';
import { BottomMenu } from 'custom-components/BottomMenu';
import { FocusAwareStatusBar } from 'custom-components/FocusAwareStatusBar';
import { ImageZoom } from 'custom-components/ImageZoom';
import { TouchAlert } from 'custom-components/TouchAlert';
import DropdownAlert from 'dj-react-native-dropdown-alert';
import IntercomService from 'intercom';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { DeviceEventEmitter, LogBox, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { Rollbar } from 'rollbar-service';
import CreateNewPassword from 'screens/Auth/CreateNewPassword';
import ForgotPassword from 'screens/Auth/ForgotPassword';
import Login from 'screens/Auth/Login';
import SendOtp from 'screens/Auth/SignUp/SendOtp';
import SignUp1 from 'screens/Auth/SignUp/SignUp1';
import SignUp2 from 'screens/Auth/SignUp/SignUp2';
import SignUp3 from 'screens/Auth/SignUp/SignUp3';
import VerifyOtp from 'screens/Auth/VerifyOtp';
import ReceiveBitcoin from 'screens/Bitcoin/ReceiveBitcoin';
import SendBitcoinAddressOrReceipt from 'screens/Bitcoin/SendBitcoin/SendBitcoinAddressOrReceipt';
import SendBitcoinAmount from 'screens/Bitcoin/SendBitcoin/SendBitcoinAmount';
import ListBitcoinTransactions from 'screens/Bitcoin/SendBitcoin/ListBitcoinTransactions';
import Mnemonic from 'screens/Bitcoin/Mnemonic';
import EventChats from 'screens/Chat/EventChat/EventChats';
import GroupChatScreen from 'screens/Chat/GroupChat/GroupChatScreen';
import ImagePreview from 'screens/Chat/ImagePreview';
import SearchChatScreen from 'screens/Chat/SearchChat/SearchChatScreen';
import PersonChat from 'screens/Chat/SingleChat/PersonChat';
import CheckInList from 'screens/Dashboard/CheckInList';
import Home from 'screens/Dashboard/Home';
import ProfileScreen from 'screens/Dashboard/ProfileScreen';
import BookEvent from 'screens/Event/BookEvent';
import CreateEvent1 from 'screens/Event/CreateEvent/CreateEvent1';
import CreateEvent2 from 'screens/Event/CreateEvent/CreateEvent2';
import CreateEvent3 from 'screens/Event/CreateEvent/CreateEvent3';
import CreateEvent4 from 'screens/Event/CreateEvent/CreateEvent4';
import SelectGroup from 'screens/Event/CreateEvent/SelectGroup';
import EventDetail from 'screens/Event/EventDetail';
import EventMembers from 'screens/Event/EventMembers';
import Payment from 'screens/Event/Payment';
import SelectTicket from 'screens/Event/SelectTicket';
import GooglePlacesTextInput from 'screens/GooglePlacesTextInput';
import CreateGroup from 'screens/Group/CreateGroup';
import Events from 'screens/Group/Events';
import GroupDetail from 'screens/Group/GroupDetail';
import SelectAdmin from 'screens/Group/SelectAdmin';
import BlockedMembers from 'screens/Profile/BlockedMembers';
import HiddenPosts from 'screens/Profile/HiddenPosts';
import MutedGroupsEvents from 'screens/Profile/MutedGroupsEvents';
import PaypalDetails from 'screens/Profile/PaypalDetails';
import PrivacyScreen from 'screens/Profile/PrivacyScreen';
import ProfileEvents from 'screens/Profile/ProfileEvents';
import ProfileGroups from 'screens/Profile/ProfileGroups';
import Settings from 'screens/Profile/Settings';
import TwoFactorAuth from 'screens/Profile/TwoFactorAuth';
import UpdatePassword from 'screens/Profile/UpdatePassword';
import Scanner from 'screens/Scanner/Scanner';
import SelectContacts from 'screens/SelectContacts';
import SelectLocation from 'screens/SelectLocation';
import Subscription from 'screens/Subscription/Subscription';
import { SocketService } from 'socket';
import Database, { useDatabase } from 'src/database/Database';
import { useLanguage } from 'src/language/Language';
import { useFirebaseNotifications } from 'src/notification/FirebaseNotification';
// import { useLanguage } from 'src/language/Language';
import { EmojiAlert } from 'custom-components/EmojiAlert';
import CreatePoll from 'screens/Chat/CreatePoll';
import LikeDetails from 'screens/Chat/LikeDetails';
import PaypalConnect from 'screens/Profile/PaypalConnect';
import PaypalDisconnect from 'screens/Profile/PaypalDisconnect';
import FeatureFlagService from 'src/featureflag/FeatureFlagService';
import LightningService from 'src/lightning/LightningService';
import MyWallet from 'src/screens/Bitcoin/myWallet';
import { NavigationService, scaler, _showInviteCodes } from 'utils';
import { KeyboardAccessoryView, StaticHolder } from 'utils/StaticHolder';
import Language from 'src/language/Language';
import { InviteCodes } from 'custom-components/InviteCodes';
import { config } from 'api';

interface IScreens {
  [key: string]: React.FC<any>
}

const NativeStack = createNativeStackNavigator();

const commonScreens: IScreens = {};

const authScreens: IScreens = {
  Login: Login,
  ForgotPassword: ForgotPassword,
  VerifyOtp: VerifyOtp,
  CreateNewPassword: CreateNewPassword,
  SignUp1: SignUp1,
  SignUp2: SignUp2,
  SignUp3: SignUp3,
  SendOtp: SendOtp,
};

const dashboardScreens: IScreens = {
  Home: Home,
  ProfileScreen: ProfileScreen,
  Settings: Settings,
  UpdatePassword: UpdatePassword,
  PrivacyScreen: PrivacyScreen,
  SendBitcoinAmount: SendBitcoinAmount,
  SendBitcoinAddressOrReceipt: SendBitcoinAddressOrReceipt,
  ListBitcoinTransactions: ListBitcoinTransactions,
  Mnemonic: Mnemonic,
  ReceiveBitcoin: ReceiveBitcoin,
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
  CreateEvent4: CreateEvent4,
  EventDetail: EventDetail,
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
  ImagePreview: ImagePreview,
  PersonChat: PersonChat,
  SelectTicket: SelectTicket,
  TwoFactorAuth: TwoFactorAuth,
  PaypalDetails: PaypalDetails,
  SelectGroup,
  CheckInList,
  SelectAdmin,
  PaypalConnect,
  PaypalDisconnect,
  CreatePoll,
  LikeDetails,
  MyWallet
};

const MNEMONIC = "mnemonic"
const INVITE_CODE = "inviteCode"

const MyNavigationContainer = () => {
  useFirebaseNotifications();
  const dispatch = useDispatch();

  // const { isConnected, isInternetReachable } = useNetInfo()
  // useSelector(_ => console.log(_))

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
    if (isLogin) {
      dispatch(updateDeviceLanguage())
    }
    dispatch(refreshLanguage())
    Rollbar?.init();
    return () => {
      Rollbar?.exit();
    }
  }, [isLogin])

  useEffect(() => {
    if (isLogin) {
      const userData = Database.getStoredValue("userData")
      firebaseCrashlytics.crashlytics().setCrashlyticsCollectionEnabled(true).then(() => {
        AnalyticService.setUserData(userData)
      });
      SocketService.init(dispatch);
      IntercomService.init();

      FeatureFlagService.checkFlag("enable-lightning").then(async (result) => {
        console.log("----- enable-lightning: ", result, " -----")

        let flags = await FeatureFlagService.allFlags();
        console.log("----- Launchdarkly flags: ", flags)

        const { "production-certificate": productionCertifcate, "invite-codes": inviteCodes } = flags;

        if (productionCertifcate) {
          console.log("----- production-certificate: ", productionCertifcate, " -----");
          LightningService.initWithProductionCertificate(config.BREEZ_CERTIFICATE_BASE64, config.BREEZ_PRIVATE_KEY_BASE64)
        }
        else if (inviteCodes) {
          // Database.clearLightningStorage();
          console.log("----- invite-codes: ", inviteCodes, " -----");

          let inviteCode = Database.getStoredValue("inviteCode", '')
          let mnemonic = Database.getStoredValue("mnemonic", '')

          if (inviteCode && mnemonic) {
            console.log("----- invite code and mnemonic -----", inviteCode, mnemonic)
            LightningService.initWithInviteCode(inviteCode, mnemonic)
          }
          else {
            _showInviteCodes({
              title: "Invite Codes",
              message: "Select an invite code",
              callback: (code: string) => {
                let mnemonic = ""
                switch (code) {
                  case "1":
                    inviteCode = config.INVITE_CODE
                    mnemonic = config.MNEMONIC
                    break;
                  case "2":
                    inviteCode = config.INVITE_CODE_2
                    mnemonic = config.MNEMONIC_2
                    break;
                  case "3":
                    inviteCode = config.INVITE_CODE_3
                    mnemonic = config.MNEMONIC_3
                    break;
                  case "4":
                    inviteCode = config.INVITE_CODE_4
                    mnemonic = config.MNEMONIC_4
                    break;
                }

                console.log("----- invite code and mnemonic selected -----: ", inviteCode, mnemonic)

                Database.setInviteCode(inviteCode)
                Database.setMnemonic(mnemonic)

                LightningService.initWithInviteCode(inviteCode, mnemonic);
              }
            })
          }
        }
      });
    }
    return () => {
      SocketService.closeSocket();
      IntercomService.logout()
      firebaseCrashlytics.crashlytics().setCrashlyticsCollectionEnabled(false)
    }
  }, [isLogin, language])

  const stopLoader = useCallback(() => {
    dispatch(setLoadingAction(false));
  }, []);

  const tokenExpiredLocal = useCallback(() => {
    dispatch(tokenExpired());
  }, []);

  const routeNameRef = React.useRef<string>("");

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={NavigationService.setNavigationRef}
        onReady={() => {
          routeNameRef.current = NavigationService.getCurrentScreen()?.name || "";
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = NavigationService.getCurrentScreen()?.name ?? "";
          if (previousRouteName !== currentRouteName) {//&& !__DEV__) {
            await AnalyticService.logScreenView(currentRouteName)
            // console.log("Event Sent", currentRouteName);
          }
          routeNameRef.current = currentRouteName;
        }}
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
        <TouchAlert ref={ref => StaticHolder.setTouchAlert(ref)} />
        <EmojiAlert ref={ref => StaticHolder.setEmojiAlert(ref)} />
        <InviteCodes ref={ref => StaticHolder.setInviteCodes(ref)} />
        <DropdownAlertWithStatusBar />
      </NavigationContainer>
    </SafeAreaProvider>

  );
};

const successImageSrc = Ionicons.getImageSourceSync("ios-checkmark-circle-outline", 50, colors.colorWhite)
const DropdownAlertWithStatusBar = () => {
  const [padding, setPadding] = React.useState(0)
  const { top } = useSafeAreaInsets();
  React.useLayoutEffect(() => {
    if (!padding) {
      setPadding(top)
    }
  }, [top, padding])
  return <>
    <DropdownAlert
      wrapperStyle={{ paddingTop: padding }}
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
          <>
            <FocusAwareStatusBar backgroundColor={'transparent'} />
            <Card cornerRadius={scaler(40)} cardElevation={3} style={{ flexDirection: 'row', alignItems: 'center', padding: scaler(4), borderRadius: scaler(40), backgroundColor: 'white', width: '90%', marginHorizontal: '5%' }} >
              <View style={{ alignItems: 'center', justifyContent: 'center', borderRadius: scaler(20), height: scaler(40), width: scaler(40), backgroundColor: iconBackgroundColor }}>
                {IconComponent}
              </View>
              <Text style={{ flex: 1, fontWeight: '500', fontSize: scaler(14), paddingHorizontal: scaler(10), color: '#061D32' }} >{data?.message}</Text>
            </Card>
          </>

        )
      }}
      ref={ref => StaticHolder.setDropDown(ref)} />
  </>
}


export default MyNavigationContainer;
