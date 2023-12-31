import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getMyEvents, setActiveEvent } from 'app-store/actions'
import { colors } from 'assets/Colors'
import { Images } from 'assets/Images'
import { ListItem, ListItemSeparator, TicketView } from 'custom-components/ListItem/ListItem'
import { isEqual } from 'lodash'
import React, { FC, useCallback, useEffect } from 'react'
import { FlatList, InteractionManager, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { RootParams } from 'src/routes/Routes'
import { calculateImageUrl, dateFormat, getImageUrl, NavigationService, scaler } from 'utils'


const UpcomingPastEvents: FC<NativeStackScreenProps<RootParams, 'UpcomingPastEvents'>> = ({ route, navigation }) => {
    const dispatch = useDispatch()
    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            dispatch(getMyEvents({ groupId: route?.params?.id, type: route?.params?.type, noLoader: route?.params?.noLoader }))
        })
    }, [])

    const { events } = useSelector(state => {
        return {
            events: state?.groupDetails?.[route?.params?.id]?.[route?.params?.type == "upcoming" ? 'upcomingEvents' : 'pastEvents']
        }
    }, isEqual)

    const _renderItem = useCallback(({ item, index }) => {

        const eventImage = calculateImageUrl(item?.image, item?.event_images)

        return (
            <ListItem
                title={item?.name}
                subtitle={dateFormat(new Date(item?.event_start_date_time), "MMMM DD, YYYY, hh:mm A")}
                onPressImage={() => {
                    dispatch(setActiveEvent(item))
                    NavigationService.navigate('EventDetail', { id: item?._id })
                }}
                onPress={() => {
                    dispatch(setActiveEvent(item))
                    NavigationService.navigate('EventDetail', { id: item?._id })
                }}
                icon={eventImage ? { uri: getImageUrl(eventImage, { type: 'events', width: scaler(50) }) } : undefined}
                defaultIcon={Images.ic_event_placeholder}
                customView={<TicketView {...item} is_event_admin={item?.is_event_admin ?? true} />}
            >

            </ListItem>
        )
    }, [])

    return (
        <View style={styles.container} >
            <FlatList
                data={events}
                keyExtractor={(_, i) => i.toString()}
                renderItem={_renderItem}
                ItemSeparatorComponent={ListItemSeparator}
            />

        </View>
    )
}

export default UpcomingPastEvents

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.colorWhite,
        flex: 1
    }
})
