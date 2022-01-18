import { colors } from 'assets'
import { MyHeader } from 'custom-components'
import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Language from 'src/language/Language'

const ProfileGroups: FC<any> = (props) => {
    return (
        <SafeAreaView style={styles.container} >
            <MyHeader backEnabled title={Language.groups} />


        </SafeAreaView>
    )
}

export default ProfileGroups

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    }
})
