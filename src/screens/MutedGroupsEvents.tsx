import { colors } from 'assets'
import { MyHeader } from 'custom-components'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Language from 'src/language/Language'
import MutedResources from './MutedResources'

const tabs: TabProps[] = [
    {
        title: Language.mute_groups,
        name: "MuteGroupTab",
        screen: MutedResources,
        initialParams: { type: 'group' }
    },
    {
        title: Language.mute_events,
        name: "MuteEventTab",
        screen: MutedResources,
        initialParams: { type: 'event' }

    }
]

const MutedGroupsEvents = () => {
    return (
        <SafeAreaView style={styles.container} >
            <MyHeader title={Language.muted} />

            <TopTab activeTitleColor={colors.colorPrimary}
                disableTitleColor={'rgba(6, 29, 50, 0.5)'} swipeEnabled={false} tabs={tabs} />
        </SafeAreaView>
    )
}

export default MutedGroupsEvents

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        overflow: 'hidden'
    },
})
