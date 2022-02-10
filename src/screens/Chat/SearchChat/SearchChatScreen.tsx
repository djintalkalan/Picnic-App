import { _getMyEvents, _searchChat } from 'api'
import { RootState } from 'app-store'
import { setLoadingAction } from 'app-store/actions'
import { colors, Images } from 'assets'
import TopTab, { TabProps } from 'custom-components/TopTab'
import _ from 'lodash'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import Language from 'src/language/Language'
import { NavigationService, scaler } from 'utils'
import ChatSearch from './ChatSearch'
import SearchedEvents from './SearchedEvents'
import { SearchProvider, useSearchState } from './SearchProvider'

const SearchChatScreen: FC<any> = (props) => {
    const dispatch = useDispatch()
    const [currentTabIndex, setCurrentTabIndex] = useState(0)

    const { setChats, setEvents, searchedText, setSearchedText } = useSearchState()

    const { activeGroup } = useSelector((state: RootState) => {
        return {
            activeGroup: props?.route?.params?.type == 'group' ? state?.activeGroup : state?.activeEvent,

        }
    }, shallowEqual)


    const tabs: TabProps[] = useMemo(() => [
        {
            title: Language.chat,
            name: "ChatSearch",
            screen: ChatSearch,
            // icon: Images.ic_chat_bubble,
            initialParams: { type: props?.route?.params?.type },
        },
        {
            title: Language.upcoming,
            name: "SearchedEvents",
            screen: SearchedEvents,
            initialParams: { type: props?.route?.params?.type },
        }
    ], [])

    const debounceSearch = useCallback(_.debounce((text) => {
        if (!text?.length) return
        if (currentTabIndex == 0) {
            dispatch(setLoadingAction(true))
            _searchChat({
                id: activeGroup?._id,
                q: text
            }).then(res => {
                dispatch(setLoadingAction(false))
                res?.data && setChats(res?.data)
            }).catch(e => {
                dispatch(setLoadingAction(false))
                console.log(e)
            })
        } else {
            dispatch(setLoadingAction(true))
            _getMyEvents({
                groupId: activeGroup?._id,
                type: 'upcoming',
                text
            }).then(res => {
                dispatch(setLoadingAction(false))
                res?.data?.data && setEvents(res?.data?.data)
            }).catch(e => {
                dispatch(setLoadingAction(false))
                console.log(e)
            })
        }
    }, 1000), [currentTabIndex])

    const debounceClear = useCallback(_.debounce(() => {
        setChats([])
        setEvents([])
    }, 500), [])

    useEffect(() => {
        // console.log("Text Changed is ", searchedText);

        debounceSearch(searchedText?.trim()?.length > 2 ? searchedText : null)
        searchedText?.trim()?.length < 3 && debounceClear()
    }, [currentTabIndex, searchedText])

    return (
        <SafeAreaView style={styles.container}>
            <View style={{
                paddingVertical: scaler(20),
                borderBottomColor: 'rgba(0, 0, 0, 0.04)',
                borderBottomWidth: 2,
                marginBottom: scaler(2),
            }} >
                <TextInput
                    onChangeText={(text) => {
                        // console.log("Text is ", text);
                        setSearchedText(text?.toLowerCase())
                    }}
                    autoFocus
                    style={styles.searchInput}
                    // value={searchedText}
                    clearButtonMode={'while-editing'}
                    placeholder={Language.search_here}
                />
                <TouchableOpacity style={styles.imagePlaceholderContainer} onPress={NavigationService.goBack} >
                    <Image style={styles.imagePlaceholder} source={Images.ic_left} />
                </TouchableOpacity>
            </View>
            {props?.route?.params?.type == 'group' ?
                <TopTab onChangeIndex={(i) => {
                    setCurrentTabIndex(i);
                }} swipeEnabled={false} iconPosition='right' tabs={tabs} />
                :
                <ChatSearch />
            }
        </SafeAreaView>
    )
}

export default (props: any) => {
    return <SearchProvider>
        <SearchChatScreen {...props} />
    </SearchProvider>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
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
        height: scaler(19),
        // top: scaler(30),
        // left: scaler(25),
        resizeMode: 'contain',
    },
    imagePlaceholderContainer: {
        height: scaler(20),
        position: 'absolute',
        top: scaler(30),
        left: scaler(25),
    },
})