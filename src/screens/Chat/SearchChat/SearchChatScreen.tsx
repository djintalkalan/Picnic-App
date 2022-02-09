import { colors, Images } from 'assets'
import TopTab, { TabProps } from 'custom-components/TopTab'
import _ from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { Image, StyleSheet, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import UpcomingPastEvents from 'screens/Group/UpcomingPastEvents'
import Language from 'src/language/Language'
import { scaler } from 'utils'
import ChatSearch from './ChatSearch'



const SearchChatScreen = (props: any) => {
    const [searchText, setSearchText] = useState("")
    const tabs: TabProps[] = useMemo(() => [
        {
            title: Language.chat,
            name: "Chats",
            screen: ChatSearch,
            // icon: Images.ic_chat_bubble,
            // initialParams: { id: _id },
        },
        {
            title: Language.upcoming,
            name: "UpcomingEventsChat",
            screen: UpcomingPastEvents,
            // initialParams: { type: 'upcoming', id: _id, noLoader: true },
            // icon: Images.ic_calender
        }
    ], [])

    const debounceSearch = useCallback(_.debounce((text) => {
        // dispatch(searchAtHome({ text, type: currentTabIndex ? 'events' : 'groups' }))
    }, 500), [])

    const debounceClear = useCallback(_.debounce(() => {
        // dispatch(setSearchedData({ data: null, type: currentTabIndex ? 'events' : 'groups' }))
    }, 1000), [])

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
                        setSearchText(text)
                        debounceSearch(text?.trim()?.length > 2 ? text : null)
                        text?.trim()?.length < 3 && debounceClear()
                    }}
                    style={styles.searchInput}
                    value={searchText}
                    clearButtonMode={'while-editing'}
                // placeholder={Language.search_placeholder}a
                />
                <Image style={styles.imagePlaceholder} source={Images.ic_left} />
            </View>
            <TopTab swipeEnabled={false} iconPosition='right' tabs={tabs} />
        </SafeAreaView>
    )
}

export default SearchChatScreen;

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
        height: scaler(17),
        position: 'absolute',
        top: scaler(30),
        left: scaler(25),
        resizeMode: 'contain',
    },
})