import { RootState, store } from 'app-store'
import { getAllCurrencies, getProfile, searchAtHome, setSearchedData } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Card, defaultLocation, Text } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import ImageLoader from 'custom-components/ImageLoader'
import TopTab, { TabProps } from 'custom-components/TopTab'
import _, { isEqual } from 'lodash'
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, AppState, GestureResponderEvent, Image, ImageSourcePropType, ImageStyle, InteractionManager, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import RNShake from 'react-native-shake'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Octicons from 'react-native-vector-icons/Octicons'
import { useDispatch, useSelector } from 'react-redux'
import EventList from 'screens/Event/EventList'
import GroupList from 'screens/Group/GroupList'
import Database, { ILocation, useDatabase } from 'src/database/Database'
import Language, { useLanguage } from 'src/language/Language'
import { getCityOnly, getImageUrl, NavigationService, scaler, shareAppLink } from 'utils'


const addIcon = Ionicons.getImageSourceSync("add-circle-sharp", 50, colors.colorPrimary)

const Home: FC = () => {
  const [isFABOpen, setFABOpen] = useState(false)
  const dispatch = useDispatch()

  const { groupLength, eventLength } = useSelector<RootState, any>((state) => ({
    eventLength: state?.event?.allEvents?.length,
    groupLength: state?.group?.allGroups?.length,
    // a: console.log(state)
  }), isEqual)

  const tabs: TabProps[] = useMemo(() => [
    {
      title: Language.groups,
      icon: Images.ic_group_icon,
      name: 'HomeGroupTab',
      Screen: GroupList,
    },
    {
      title: Language.events,
      icon: Images.ic_calender,
      name: 'HomeEventTab',
      Screen: EventList,
    },
  ], [useLanguage()])

  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [searchLoader, setSearchLoader] = useState(false)
  const inputRef = useRef<TextInput>(null);
  const [userData] = useDatabase("userData");
  const [currentLocation] = useDatabase<ILocation>("currentLocation", defaultLocation)
  const [selectedLocation] = useDatabase<ILocation | null>("selectedLocation", currentLocation)

  const isFabTransparent = (currentTabIndex && !eventLength) || (!currentTabIndex && !groupLength)

  const debounceSearch = useCallback(_.debounce((text) => {
    dispatch(searchAtHome({ text, type: currentTabIndex ? 'events' : 'groups', setSearchLoader: setSearchLoader }))
  }, 500), [currentTabIndex])

  const debounceClear = useCallback(_.debounce(() => {
    Database.setOtherString("searchHomeText", "")
    dispatch(setSearchedData({ data: null, type: currentTabIndex ? 'events' : 'groups' }))
  }, 0), [])

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      dispatch(getAllCurrencies())
      dispatch(getProfile())
    })
  }, [])

  useEffect(() => {
    const shakeSubscription = RNShake.addListener(() => {
      // Your code here...
      console.log("Shacked", AppState.currentState)
      if (AppState.currentState == 'active' && !store.getState()?.isLoading && !searchLoader) {
        NavigationService.navigate("Home")
      }
    })

    return () => {
      shakeSubscription.remove()
    }
  }, [searchLoader])


  const insets = useSafeAreaInsets()
  const bottom = useMemo(() => {
    return insets.bottom
  }, [])

  const onPressSetting = useCallback(() => {
    NavigationService.navigate("Settings")
  }, [])

  // const a = "id1id1id1";
  // const b = "id2id2id2";

  return (
    <SafeAreaViewWithStatusBar translucent backgroundColor={'white'} edges={['top']} >
      <View style={styles.headerContainer} >
        <TouchableOpacity
          onPress={() => {
            NavigationService.navigate("SelectLocation")
          }}
          style={styles.settingButtonContainer} >
          <Text numberOfLines={1} style={styles.locationText} >
            {getCityOnly(selectedLocation?.otherData?.city, selectedLocation?.otherData?.state, selectedLocation?.otherData?.country)}
          </Text>
          <Octicons style={{ marginLeft: scaler(6) }} name={"chevron-down"} size={scaler(18)} />
        </TouchableOpacity>
        <TouchableOpacity style={{ borderRadius: scaler(18), overflow: 'hidden' }} onPress={() => {
          NavigationService.navigate("ProfileScreen")
          // NavigationService.navigate("Scanner")
        }} >
          {/*@ts-ignore*/}
          <ImageLoader style={{ borderRadius: scaler(18), height: scaler(35), width: scaler(35), resizeMode: 'contain' }}
            placeholderSource={Images.ic_home_profile}
            source={userData?.image ? { uri: getImageUrl(userData?.image, { type: 'users', width: scaler(60) }) } : null}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressSetting} >
          <Image style={{ marginLeft: scaler(10), height: scaler(25), width: scaler(25), resizeMode: 'contain' }} source={Images.ic_setting} />
        </TouchableOpacity>

      </View>

      <View style={{
        paddingBottom: scaler(20),
        borderBottomColor: 'rgba(0, 0, 0, 0.04)',
        borderBottomWidth: 2,
        marginBottom: scaler(2),
      }} >

        <TextInput
          ref={inputRef}
          autoCapitalize={'none'}
          onChangeText={(text) => {
            if (text?.trim()?.length > 2) {
              Database.setOtherString("searchHomeText", text)
              debounceSearch(text)
            } else {

              debounceClear()
            }
          }}
          style={styles.searchInput}
          placeholder={Language.search_placeholder}
          placeholderTextColor={colors.colorGreyInactive}
        />
        <Image style={styles.imagePlaceholder} source={Images.ic_lens} />

        {searchLoader && <View style={[styles.imagePlaceholder, { top: scaler(10), left: undefined, right: scaler(30), alignItems: 'center', justifyContent: 'center' }]} >
          <ActivityIndicator color={colors.colorPrimary} size={scaler(24)} />
        </View>}
      </View>

      <TopTab onChangeIndex={(i) => {
        inputRef?.current?.clear();
        debounceClear();
        setCurrentTabIndex(i);
      }} swipeEnabled={false} tabs={tabs} />

      <View
        style={{
          alignSelf: 'baseline',
          position: 'absolute',
          bottom: bottom + scaler(0),
          right: scaler(15),
        }}>
        {isFABOpen && (
          <Card
            cardElevation={isFabTransparent ? 0 : 2}
            style={[
              styles.fabActionContainer,
              {
                backgroundColor: isFabTransparent
                  ? 'transparent'
                  : colors.colorWhite,
              },
            ]}>
            <InnerButton
              title={Language.share_picnic}
              icon={Images.ic_share_picnic}
              onPress={() => {
                shareAppLink("Picnic Groups")
                setTimeout(() => {
                  setFABOpen(false);
                }, 1000);
              }}
            />
            <InnerButton
              onPress={() => {
                NavigationService.navigate('CreateGroup');
                setTimeout(() => {
                  setFABOpen(false);
                }, 1000);
              }}
              title={Language.create_group}
              icon={Images.ic_create_group}
            />
            <InnerButton
              title={Language.host_event}
              onPress={() => {
                NavigationService.navigate('CreateEvent1');
                setTimeout(() => {
                  setFABOpen(false);
                }, 1000);
              }}
              icon={Images.ic_host_event}
            />
            <InnerButton
              title={Language.check_in}
              onPress={() => {
                NavigationService.navigate('CheckInList');
                setTimeout(() => {
                  setFABOpen(false);
                }, 1000);
              }}
              // imageStyle={{ height: scaler(42), width: scaler(42), resizeMode: 'contain', marginHorizontal: scaler(4) }}
              icon={Images.ic_fab_check_in}
            />
            {!userData?.is_premium ?
              <InnerButton
                title={Language.join_now}
                onPress={() => {
                  NavigationService.navigate('Subscription', { from: 'settings' });
                  setTimeout(() => {
                    setFABOpen(false);
                  }, 1000);
                }}
                imageStyle={{ height: scaler(42), width: scaler(42), resizeMode: 'contain', marginHorizontal: scaler(3) }}
                icon={addIcon}
              /> : null}
          </Card>
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setFABOpen(!isFABOpen);
          }}
          style={{ alignSelf: 'flex-end' }}>
          <Image
            style={{ height: scaler(90), width: scaler(90) }}
            source={isFABOpen ? Images.ic_fab_open : Images.ic_add_fab}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaViewWithStatusBar>
  );
};

const InnerButton = (props: {
  title: string;
  icon: ImageSourcePropType;
  onPress?: (e?: GestureResponderEvent) => void;
  imageStyle?: ImageStyle
}) => {
  const { onPress, title, icon } = props;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
      <Text
        style={{
          fontWeight: '500',
          fontSize: scaler(12),
          color: colors.colorBlackText,
        }}>
        {title}
      </Text>
      <Image style={[{ height: scaler(50), width: scaler(50), resizeMode: 'contain' }, props?.imageStyle ?? {}]} source={icon} />
    </TouchableOpacity>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.colorWhite,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scaler(20),
  },
  locationText: {
    fontWeight: '600',
    fontSize: scaler(15),
    color: '#292929',
    maxWidth: '80%',
  },
  settingButtonContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    // justifyContent: 'flex-end'
  },
  searchInput: {
    height: scaler(40),
    backgroundColor: colors.colorBackground,
    borderRadius: scaler(10),
    paddingHorizontal: scaler(45),
    paddingVertical: 0,
    marginVertical: 0,
    // marginTop: scaler(0),
    marginHorizontal: scaler(20),
    fontSize: scaler(11),
    fontWeight: '300',
    color: colors.colorBlackText,
  },
  imagePlaceholder: {
    height: scaler(20),
    position: 'absolute',
    top: scaler(10),
    left: scaler(25),
    resizeMode: 'contain',
  },
  fabActionContainer: {
    borderRadius: scaler(10),
    paddingHorizontal: scaler(10),
    backgroundColor: colors.colorWhite,
    elevation: 2,
    marginRight: scaler(8),
    justifyContent: 'flex-end',
  },
});
