import { getEventsForCheckIn } from 'app-store/actions'
import { RootState } from 'app-store/store'
import { colors } from 'assets/Colors'
import { Images } from 'assets/Images'
import { MyHeader } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { ListItem, ListItemSeparator, TicketView } from 'custom-components/ListItem/ListItem'
import { debounce } from 'lodash'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Image, StyleSheet, TextInput, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import Language from 'src/language/Language'
import { getCityOnly, getImageUrl, NavigationService, scaler } from 'utils'

const CheckInList: FC<any> = (props) => {
    const LOADING = useRef(true)
    const [text, setText] = useState('')
    const inputRef = useRef<TextInput>(null)
    const [searchLoader, setSearchLoader] = useState(false)

    useEffect(() => {
        debounceSearch(text)
    }, [text])
    const dispatch = useDispatch()
    const debounceSearch = useCallback(debounce((text) => {
        console.log("text", text);
        LOADING.current = true
        setTimeout(() => {
            LOADING.current = false
        }, 2000);
        dispatch(getEventsForCheckIn({
            q: text,
            _id: "",
        }))
    }, 500), [])

    const { events } = useSelector<RootState, any>((state) => ({
        events: state?.eventForCheckIn?.events,
    }))


    const _renderItem = useCallback(({ item, index }) => {
        const { name, image, city, state, country } = item

        return (
            <ListItem
                defaultIcon={Images.ic_group_placeholder}
                title={name}
                //@ts-ignore
                icon={image ? { uri: getImageUrl(image, { width: scaler(50), type: 'events' }) } : undefined}
                // subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                subtitle={getCityOnly(city, state, country)}
                // isSelected={is_group_member}
                onPress={() => {
                    NavigationService.navigate('EventMembers', { id: item?._id })
                }}
                onPressImage={() => {

                }}
                customView={<TicketView {...item} is_event_admin={item?.is_event_admin ?? true} />}
            />
        )
    }, [])


    return <SafeAreaViewWithStatusBar style={styles.container} >
        <MyHeader title={Language.select_event} />
        <View style={{
            paddingVertical: scaler(15),
            borderBottomColor: 'rgba(0, 0, 0, 0.04)',
            borderBottomWidth: 2,
            marginBottom: scaler(2),
        }} >
            <TextInput
                ref={inputRef}
                autoCapitalize={'none'}
                onChangeText={(text) => {
                    // console.log("Text is ", text);
                    setText(text?.toLowerCase())
                }}
                // autoFocus={true}
                style={styles.searchInput}
                // value={searchedText}
                placeholder={Language.search_here}
            />
            <View style={styles.imagePlaceholderContainer} >
                <Image style={styles.imagePlaceholder} source={Images.ic_lens} />
            </View>

            {searchLoader && <View style={[styles.imagePlaceholderContainer, { top: scaler(25), left: undefined, right: scaler(30), alignItems: 'center', justifyContent: 'center' }]} >
                <ActivityIndicator color={colors.colorPrimary} size={scaler(24)} />
            </View>}
        </View>
        <View style={{ flex: 1 }} >
            <FlatList
                style={{ flex: 1 }}
                keyboardShouldPersistTaps={'handled'}
                data={events}
                // extraData={chats?.length}
                keyExtractor={_ => _?._id}
                bounces={false}
                ItemSeparatorComponent={ListItemSeparator}
                renderItem={_renderItem}
                onEndReached={() => {
                    if (!LOADING.current) {
                        LOADING.current = true
                        setTimeout(() => {
                            LOADING.current = false
                        }, 2000);
                        dispatch(getEventsForCheckIn({
                            q: text,
                        }))
                    }
                }}
            />
        </View>

    </SafeAreaViewWithStatusBar>
}

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
        top: scaler(25),
        left: scaler(25),
    },
})


export default CheckInList
