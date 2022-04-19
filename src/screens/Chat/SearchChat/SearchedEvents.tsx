import { colors } from 'assets/Colors'
import { Images } from 'assets/Images'
import { ListItem, ListItemSeparator, TicketView } from 'custom-components/ListItem/ListItem'
import React, { FC, useCallback } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { dateStringFormat, getImageUrl, NavigationService, scaler } from 'utils'
import { useSearchState } from './SearchProvider'


const SearchedEvents: FC<any> = ({ route, navigation }) => {
    const dispatch = useDispatch()

    const { events } = useSearchState()

    const _renderItem = useCallback(({ item, index }) => {

        return (
            <ListItem
                title={item?.name}
                subtitle={dateStringFormat(item?.event_date + " " + item?.event_start_time, "MMMM DD, YYYY, hh:mm A", "YYYY-MM-DD")}
                onPressImage={() => NavigationService.navigate('EventDetail', { id: item?._id })}
                icon={item?.image ? { uri: getImageUrl(item?.image, { type: 'events', width: scaler(50) }) } : undefined}
                defaultIcon={Images.ic_event_placeholder}
                customView={<TicketView {...item} is_event_admin={true} />}
            >
            </ListItem>
        )
    }, [])

    return (
        <View style={styles.container} >

            <FlatList
                style={{ flex: 1 }}
                keyboardShouldPersistTaps={'handled'}
                data={events}
                keyExtractor={(_, i) => i.toString()}
                renderItem={_renderItem}
                ItemSeparatorComponent={ListItemSeparator}
            />

        </View>
    )
}

export default SearchedEvents

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.colorWhite,
        flex: 1
    }
})
