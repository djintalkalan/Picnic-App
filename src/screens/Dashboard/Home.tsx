import { getAllCurrencies, getProfile, searchAtHome, setSearchedData } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Card, defaultLocation, Text } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import ImageLoader from 'custom-components/ImageLoader'
import TopTab, { TabProps } from 'custom-components/TopTab'
import _, { isEqual } from 'lodash'
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, GestureResponderEvent, Image, ImageSourcePropType, ImageStyle, InteractionManager, Platform, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'
// import RNShake from 'react-native-shake'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Octicons from 'react-native-vector-icons/Octicons'
import { useDispatch, useSelector } from 'react-redux'
import EventList from 'screens/Event/EventList'
import GroupList from 'screens/Group/GroupList'
import Database, { ILocation, useDatabase } from 'src/database/Database'
import Language, { useLanguage } from 'src/language/Language'
import { getCityOnly, getImageUrl, NavigationService, scaler, shareAppLink, _hideTouchAlert, _showTouchAlert } from 'utils'


const addIcon = Ionicons.getImageSourceSync("add-circle-sharp", 50, colors.colorPrimary)

const Home: FC = () => {
  const dispatch = useDispatch()

  const { groupLength, eventLength } = useSelector(state => ({
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
      title: Language.upcoming,
      icon: Images.ic_calender,
      name: 'HomeEventTab',
      Screen: EventList,
    },
  ], [useLanguage()])
  const [selectedTabType, setSelectedTabType] = useState<'events' | 'groups'>(tabs[0]?.name?.toLowerCase()?.includes('event') ? 'events' : 'groups')
  const [searchLoader, setSearchLoader] = useState(false)
  const inputRef = useRef<TextInput>(null);
  const [userData] = useDatabase("userData");
  const [currentLocation] = useDatabase<ILocation>("currentLocation", defaultLocation)
  const [selectedLocation] = useDatabase<ILocation | null>("selectedLocation", currentLocation)


  const debounceSearch = useCallback(_.debounce((text) => {
    dispatch(searchAtHome({ text, type: selectedTabType, setSearchLoader: setSearchLoader }))
  }, 500), [selectedTabType])

  const debounceClear = useCallback(_.debounce(() => {
    Database.setOtherString("searchHomeText", "")
    dispatch(setSearchedData({ data: null, type: selectedTabType }))
  }, 0), [])

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      dispatch(getAllCurrencies())
      dispatch(getProfile())
    })
    // setTimeout(() => {
    // dispatch(setActiveEvent({ _id: '636e3bb06c752686a98a9822', id: '636e3bb06c752686a98a9822' }))
    // NavigationService.navigate("EventDetail", { id: '636e3bb06c752686a98a9822' })
    // _openMenu()
    // }, 2000);
  }, [])

  // useEffect(() => {
  //   const shakeSubscription = RNShake.addListener(() => {
  //     // Your code here...
  //     console.log("Shacked", AppState.currentState)
  //     if (AppState.currentState == 'active' && !store.getState()?.isLoading && !searchLoader) {
  //       NavigationService.navigate("Home")
  //     }
  //   })

  //   return () => {
  //     shakeSubscription.remove()
  //   }
  // }, [searchLoader])

  const onPressSetting = useCallback(() => {
    NavigationService.navigate("Settings")
  }, [])

  // const a = "id1id1id1";
  // const b = "id2id2id2";

  const _createButtonRef = useRef<TouchableOpacity>(null)

  const _openMenu = () => {
    _createButtonRef?.current?.measureInWindow((x, y) => {
      _showTouchAlert({
        transparent: true,
        placementStyle: {
          right: scaler(10),
          top: y + scaler(45) + (Platform.OS == 'android' ? StatusBar.currentHeight || 0 : 0)
        },
        alertComponent: () => {
          return (<View
            style={{

            }}>
            <Card
              cardElevation={2}
              style={[
                styles.fabActionContainer,
                {
                  backgroundColor: colors.colorWhite,
                },
              ]}>
              <InnerButton
                title={Language.share_picnic}
                icon={Images.ic_share_picnic}
                onPress={() => {
                  shareAppLink("Picnic Groups")
                  _hideTouchAlert()
                }}
              />
              <InnerButton
                onPress={() => {
                  NavigationService.navigate('CreateGroup', { is_broadcast_group: true });
                  _hideTouchAlert()
                }}
                title={Language.start_a_broadcast}
                icon={Images.ic_megaphone_menu}
              />
              <InnerButton
                onPress={() => {
                  NavigationService.navigate('CreateGroup');
                  _hideTouchAlert()
                }}
                title={Language.create_group}
                icon={Images.ic_create_group}
              />
              <InnerButton
                title={Language.host_event}
                onPress={() => {
                  NavigationService.navigate('CreateEvent1');
                  _hideTouchAlert()
                }}
                icon={Images.ic_host_event}
              />
              <InnerButton
                title={Language.check_in}
                onPress={() => {
                  NavigationService.navigate('CheckInList');
                  _hideTouchAlert()
                }}
                // imageStyle={{ height: scaler(42), width: scaler(42), resizeMode: 'contain', marginHorizontal: scaler(4) }}
                icon={Images.ic_fab_check_in}
              />
              {!userData?.is_premium || userData?.type == 'trial' ?
                <InnerButton
                  title={Language.join_now}
                  onPress={() => {
                    NavigationService.navigate('Subscription', { from: 'settings' });
                    _hideTouchAlert()
                  }}
                  imageStyle={{ height: scaler(42), width: scaler(42), resizeMode: 'contain', marginHorizontal: scaler(3) }}
                  icon={addIcon}
                /> : null}
            </Card>
          </View>)
        },
      })
    })
  }

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
            source={userData?.image ? { uri: getImageUrl(userData?.image, { type: 'users', width: scaler(100) }) } : null}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressSetting} >
          <Image style={{ marginLeft: scaler(10), height: scaler(25), width: scaler(25), resizeMode: 'contain' }} source={Images.ic_setting} />
        </TouchableOpacity>

      </View>
      <View style={{ flex: 1 }} >
        <View style={styles.searchHolderRow} >
          <View style={{
            flex: 1,
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
              placeholder={Language.search}
              placeholderTextColor={colors.colorGreyInactive}
            />
            <Image style={styles.imagePlaceholder} source={Images.ic_lens} />
            {searchLoader && <View style={[styles.imagePlaceholder, { top: scaler(10), left: undefined, right: scaler(10), alignSelf: 'center', justifyContent: 'center' }]} >
              <ActivityIndicator color={colors.colorPrimary} size={scaler(20)} />
            </View>}
          </View>

          <TouchableOpacity
            ref={_createButtonRef}
            activeOpacity={0.7}
            onPress={_openMenu} style={styles.plus_button} >
            <Text style={styles.buttonText} >{Language.create} </Text>
            <Entypo size={scaler(18)} style={{ alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }} name='plus' color={colors.colorPrimary} />
          </TouchableOpacity>
        </View>

        <TopTab onChangeIndex={(i) => {
          inputRef?.current?.clear();
          debounceClear();
          setSelectedTabType(tabs[i]?.name?.toLowerCase()?.includes('event') ? 'events' : 'groups');
        }} swipeEnabled={false} tabs={tabs} />


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
    flex: 1,
    height: scaler(40),
    backgroundColor: colors.colorBackground,
    borderRadius: scaler(10),
    paddingLeft: scaler(45),
    paddingRight: scaler(20),
    paddingVertical: 0,
    marginVertical: 0,
    // marginTop: scaler(0),
    // marginHorizontal: scaler(20),
    fontSize: scaler(12),
    fontWeight: '300',
    color: colors.colorBlackText,
    borderColor: colors.colorGreyInactive,
    borderWidth: 0.8
  },
  imagePlaceholder: {
    height: scaler(20),
    position: 'absolute',
    top: scaler(10),
    left: scaler(5),
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
  plus_button: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: scaler(10),
    height: scaler(40),
    backgroundColor: colors.colorBackground,
    borderRadius: scaler(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.colorGreyInactive,
    borderWidth: 0.8
  },
  buttonText: {
    color: colors.colorGreyInactive,
    fontWeight: '400',
    fontSize: scaler(14),
    height: scaler(20),
  },
  searchHolderRow: {
    flexDirection: 'row',
    paddingBottom: scaler(20),
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    borderBottomWidth: 2,
    marginBottom: scaler(2),
    paddingHorizontal: scaler(20)
  },
});
