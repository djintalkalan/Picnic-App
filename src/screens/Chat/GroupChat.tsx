import { StackScreenProps } from '@react-navigation/stack'
import { colors } from 'assets/Colors'
import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const GroupChat: FC<StackScreenProps<any, 'GroupChat'>> = (props) => {

    return (
        <SafeAreaView style={styles.container} >

        </SafeAreaView>
    )
}

export default GroupChat

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.colorWhite,
        flex: 1
    }
})
