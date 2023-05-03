import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { colors } from 'assets/Colors'
import { Images } from 'assets/Images'
import { MyHeader } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React, { FC, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import Language, { useLanguage } from 'src/language/Language'
import { RootParams } from 'src/routes/Routes'
import { scaler } from 'utils'
import UpcomingPastEvents from './UpcomingPastEvents'




const Events: FC<NativeStackScreenProps<RootParams, 'Events'>> = ({ route, navigation }) => {

    const tabs = useMemo<TabProps[]>(() => {
        return [
            {
                title: Language.upcoming_2,
                name: 'UpcomingEventsTab',
                Screen: UpcomingPastEvents,
                initialParams: { type: 'upcoming', id: route?.params.id },
                icon: Images.ic_calender,
                iconPosition: 'right',
            },
            {
                title: Language.previous,
                name: 'PastEventsTab',
                Screen: UpcomingPastEvents,
                // disable: true,
                initialParams: { type: 'past', id: route?.params.id },
                icon: Images.ic_member_tick,
                iconStyle: { height: scaler(20), width: scaler(20) },
                iconPosition: 'right',
            },
        ]
    }, [useLanguage()])

    return (
        <SafeAreaViewWithStatusBar style={styles.container} >
            <MyHeader title={Language.events} />
            <TopTab swipeEnabled={false} tabs={tabs} />
        </SafeAreaViewWithStatusBar>
    )
}

export default Events

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.colorWhite,
        flex: 1
    }
})
