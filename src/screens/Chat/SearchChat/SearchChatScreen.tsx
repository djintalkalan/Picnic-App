import { _getMyEvents, _searchChat, _searchPersonChat } from 'api'
import { setLoadingAction } from 'app-store/actions'
import { colors, Images } from 'assets'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import TopTab, { TabProps } from 'custom-components/TopTab'
import _ from 'lodash'
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, InteractionManager, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import Language from 'src/language/Language'
import { NavigationService, scaler } from 'utils'
import ChatSearch from './ChatSearch'
import SearchedEvents from './SearchedEvents'
import { SearchProvider, useSearchState } from './SearchProvider'

const SearchChatScreen: FC<any> = (props) => {
    const dispatch = useDispatch()
    const [currentTabIndex, setCurrentTabIndex] = useState(0)

    const { setChats = () => (null), setEvents = () => (null), searchedText, setSearchedText = () => (null) } = useSearchState()
    const chatRoomId = props?.route?.params?.chatRoomId
    const person = props?.route?.params?.person
    const { activeGroup } = useSelector(state => {
        return !chatRoomId ? {
            activeGroup: props?.route?.params?.type == 'group' ? state?.activeGroup : state?.activeEvent,
        } : {}
    }, shallowEqual)

    const tabs: TabProps[] = useMemo(() => !chatRoomId ? [
        {
            title: Language.chat,
            name: "ChatSearch",
            Screen: ChatSearch,
            icon: Images.ic_chat_bubble,
            initialParams: { type: props?.route?.params?.type },
        },
        {
            title: Language.upcoming,
            name: "SearchedEvents",
            Screen: SearchedEvents,
            initialParams: { type: props?.route?.params?.type },
            icon: Images.ic_calender
        }
    ] : [], [])

    const debounceSearch = useCallback(_.debounce((text) => {
        if (!text?.length) return
        if (currentTabIndex == 0) {
            dispatch(setLoadingAction(true))
            const fun = chatRoomId ? _searchPersonChat : _searchChat
            fun({
                id: chatRoomId || activeGroup?._id,
                q: text
            }).then(res => {
                dispatch(setLoadingAction(false))
                if (chatRoomId) {
                    res?.data?.data && setChats(res?.data?.data)
                } else
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

                if (res?.data?.data) {
                    for (const index in res?.data?.data) {
                        if (res?.data?.data[index].ticket_type == 'multiple') {
                            const leastTicket = res?.data?.data[index]?.ticket_plans?.reduce((p: any, c: any) => ((Math.min(p.amount, c.amount)) == c.amount ? c : p))

                            res.data.data[index].event_fees = leastTicket.amount?.toString()
                            res.data.data[index].event_tax_rate = leastTicket.event_tax_rate?.toString()
                            res.data.data[index].event_currency = leastTicket.currency

                            // if (!res?.data?.data[index]?.capacity) {
                            const eventCapacityType = res?.data?.data[index]?.capacity_type
                            const totalCapacity = res?.data?.data[index]?.ticket_plans?.reduce((p: any, c: any) => (((c?.capacity_type || eventCapacityType) == 'unlimited' || (p?.capacity_type || eventCapacityType) == 'unlimited') ? { capacity_type: 'unlimited', capacity: 0 } : { capacity_type: 'limited', capacity: p?.capacity + c.capacity }))
                            // console.log("totalCapacity", totalCapacity);

                            res.data.data[index].capacity_type = totalCapacity?.capacity_type
                            res.data.data[index].capacity = totalCapacity?.capacity
                            // }
                        }
                    }
                    setEvents(res?.data?.data)
                }
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


    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setTimeout(() => {
                inputRef?.current?.focus()
            }, 1000);
        })
    }, [])

    const inputRef = useRef<TextInput>(null)
    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            {true && <View style={{
                paddingVertical: scaler(20),
                borderBottomColor: 'rgba(0, 0, 0, 0.04)',
                borderBottomWidth: 2,
                marginBottom: scaler(2),
            }} >
                <TextInput
                    ref={inputRef}
                    autoCapitalize={'none'}
                    onChangeText={(text) => {
                        // console.log("Text is ", text);
                        setSearchedText(text?.toLowerCase())
                    }}
                    // autoFocus={true}
                    style={styles.searchInput}
                    // value={searchedText}
                    clearButtonMode={'while-editing'}
                    placeholder={Language.search_here}
                />
                <TouchableOpacity style={styles.imagePlaceholderContainer} onPress={NavigationService.goBack} >
                    <Image style={styles.imagePlaceholder} source={Images.ic_left} />
                </TouchableOpacity>
            </View>}
            {props?.route?.params?.type == 'group' ?
                <TopTab onChangeIndex={(i) => {
                    setCurrentTabIndex(i);
                }} swipeEnabled={false} iconPosition='right' tabs={tabs} />
                :
                <ChatSearch person={person} />
            }
        </SafeAreaViewWithStatusBar>
    )
}

const SearchScreenWithProvider: FC<any> = (props: any) => {
    return <SearchProvider>
        <SearchChatScreen {...props} />
    </SearchProvider>
};

export default SearchScreenWithProvider
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
        tintColor: colors.colorGreyInactive,
        resizeMode: 'contain',
    },
    imagePlaceholderContainer: {
        height: scaler(20),
        position: 'absolute',
        top: scaler(30),
        left: scaler(25),
    },
})