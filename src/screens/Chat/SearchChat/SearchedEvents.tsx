import { colors } from 'assets/Colors'
import { Images } from 'assets/Images'
import { ListItem, ListItemSeparator, TicketView } from 'custom-components/ListItem/ListItem'
import React, { FC, useCallback } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { calculateImageUrl, dateFormat, getImageUrl, NavigationService, scaler } from 'utils'
import { useSearchState } from './SearchProvider'


const SearchedEvents: FC<any> = ({ route, navigation }) => {
    const dispatch = useDispatch()

    const { events } = useSearchState()

    const _renderItem = useCallback(({ item, index }) => {
        const eventImage = calculateImageUrl(item?.image, item?.event_images)
        return (
            <ListItem
                title={item?.name}
                subtitle={dateFormat(new Date(item?.event_start_date_time), "MMMM DD, YYYY, hh:mm A")}
                onPressImage={() => NavigationService.navigate('EventDetail', { id: item?._id })}
                icon={eventImage ? { uri: getImageUrl(eventImage, { type: 'events', width: scaler(50) }) } : undefined}
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
