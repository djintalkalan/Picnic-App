import { colors } from 'assets'
import { MyHeader } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import TopTab, { TabProps } from 'custom-components/TopTab'
import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
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
        // screen: (() => <View />),
        screen: MutedResources,
        initialParams: { type: 'event' }

    }
]

const MutedGroupsEvents: FC<any> = () => {
    return (
        <SafeAreaViewWithStatusBar style={styles.container} >
            <MyHeader title={Language.muted} />

            <TopTab activeTitleColor={colors.colorPrimary}
                disableTitleColor={'rgba(6, 29, 50, 0.5)'} swipeEnabled={false} tabs={tabs} />
        </SafeAreaViewWithStatusBar>
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
