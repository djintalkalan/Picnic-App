import { StackScreenProps } from '@react-navigation/stack'
import { colors } from 'assets/Colors'
import { MyHeader } from 'custom-components'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React, { FC, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Language, { useLanguage } from 'src/language/Language'
import { RootParams } from 'src/routes/Routes'
import UpcomingPastEvents from './UpcomingPastEvents'




const Events: FC<StackScreenProps<RootParams, 'Events'>> = ({ route, navigation }) => {
    const dispatch = useDispatch()

    const getTabs = useCallback((): TabProps[] => {
        return [
            {
                title: Language.upcoming_events,
                name: 'UpcomingEventsTab',
                screen: UpcomingPastEvents,
                initialParams: { type: 'upcoming', id: route?.params.id }
            },
            {
                title: Language.past_events,
                name: 'PastEventsTab',
                screen: UpcomingPastEvents,
                // disable: true,
                initialParams: { type: 'past', id: route?.params.id }
            },
        ]
    }, [useLanguage()])

    return (
        <SafeAreaView style={styles.container} >
            <MyHeader title={Language.events} />
            <TopTab tabs={getTabs()} />


        </SafeAreaView>
    )
}

export default Events

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.colorWhite,
        flex: 1
    }
})
