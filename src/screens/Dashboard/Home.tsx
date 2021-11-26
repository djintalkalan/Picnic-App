import { doLogout } from 'app-store/actions'
import { colors } from 'assets'
import React, { FC } from 'react'
import { Button, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import { useLanguage, useUpdateLanguage } from 'src/language/Language'
import { scaler } from 'utils'
const Home: FC = () => {

    const dispatch = useDispatch()

    const updateLanguage = useUpdateLanguage()
    const language = useLanguage()
    // console.log("language", language)
    return (
        <SafeAreaView style={styles.container} >
            {/* <Image source={Images.ic_homepage} style={{ flex: 1, resizeMode: 'contain' }} /> */}

            {/* <Button color={language == 'en' ? colors.colorPrimary : undefined} title={'EN'} onPress={() => {
                updateLanguage('en')
                // setLang("en")
            }} />

            <Button color={language == 'es' ? colors.colorPrimary : undefined} title={'ES'} onPress={() => {
                updateLanguage('es')
            }} />

            <Button title={'Profile'} onPress={() => {
                NavigationService.navigate('ProfileScreen')
            }} /> */}

            <Text style={{ marginBottom: scaler(10) }} >{"Homepage work is in progress"}</Text>


            <Button color={colors.colorPrimary} title={'Logout'} onPress={() => {
                dispatch(doLogout())
            }} />

        </SafeAreaView>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        alignItems: 'center',
        justifyContent: 'center',
    }
})
