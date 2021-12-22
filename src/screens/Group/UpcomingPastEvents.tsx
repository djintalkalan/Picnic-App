import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from 'app-store'
import { getMyEvents } from 'app-store/actions'
import { colors } from 'assets/Colors'
import { Images } from 'assets/Images'
import { ListItem, ListItemSeparator } from 'custom-components/ListItem/ListItem'
import { isEqual } from 'lodash'
import React, { FC, useCallback, useEffect } from 'react'
import { InteractionManager, StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import { RootParams } from 'src/routes/Routes'
import { dateStringFormat, getImageUrl, scaler } from 'utils'


const UpcomingPastEvents: FC<StackScreenProps<RootParams, 'UpcomingPastEvents'>> = ({ route, navigation }) => {
    const dispatch = useDispatch()
    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            dispatch(getMyEvents({ groupId: route?.params?.id, type: route?.params?.type }))
        })
    }, [])

    const { events } = useSelector((state: RootState) => {
        return {
            events: state?.group?.groupDetail?.upcomingEvents
        }
    }, isEqual)

    const _renderItem = useCallback(({ item, index }) => {
        console.log("Item : ", item)
        return (
            <ListItem
                title={item?.name}
                subtitle={dateStringFormat(item?.event_start_date_time, "MMMM DD, YYYY, hh:mm A")}
                icon={item?.image ? { uri: getImageUrl(item?.image, { type: 'events', width: scaler(50) }) } : undefined}
                defaultIcon={Images.ic_group_icon}

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
