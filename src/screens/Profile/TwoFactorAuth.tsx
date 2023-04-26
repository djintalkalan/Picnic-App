import { _enableDisable2FA } from 'api';
import { colors } from 'assets/Colors';
import { MyHeader, Text } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Switch from 'custom-components/Switch';
import Database, { useDatabase } from 'database';
import { debounce } from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { InteractionManager, StyleSheet, View } from 'react-native';
import Language from 'src/language/Language';
import { scaler, _showErrorMessage } from 'utils';
let count = 0
const TwoFactorAuth: FC = () => {
    const [userData] = useDatabase<any>("userData")
    const [authEnabled, setAuthEnabled] = useState<boolean>(userData?.is_two_factor_enabled == '1' ? true : false)
    useEffect(() => {
        InteractionManager?.runAfterInteractions(() => {
            setAuthEnabled(userData?.is_two_factor_enabled == '1' ? true : false)
        })
    }, [userData?.is_two_factor_enabled])

    const debounceSearch = useCallback(debounce((permissionEnabled) => {
        _enableDisable2FA(
            {
                "is_two_factor_enabled": permissionEnabled ? '1' : '0',
                "two_factor_mode": "email"
            }).then(res => {
                if (res && res?.status == 200) {
                    Database.setUserData({
                        ...Database.getStoredValue("userData"),
                        is_two_factor_enabled: permissionEnabled ? '1' : '0'
                    })
                    setAuthEnabled(permissionEnabled)
                }
                else _showErrorMessage(res?.message)
            }).catch(e => console.log(e))
    }, 1200), [])


    const onChangePermission = useCallback((permissionEnabled: boolean) => {
        try {
            setAuthEnabled(permissionEnabled)
            debounceSearch(permissionEnabled)
        }
        catch { (e: any) => console.log(e) }
    }, [])


    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={Language.two_factor_auth} backEnabled />
            <View style={styles.authView} >
                <Text style={styles.textStyle} >{Language.two_factor_auth}</Text>
                <Switch value={authEnabled} onChange={onChangePermission} />
            </View>
        </SafeAreaViewWithStatusBar>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
    },
    authView: {
        flexDirection: 'row',
        flex: 1,
        margin: scaler(20)
    },
    textStyle: {
        fontSize: scaler(14),
        color: colors.colorBlackText,
        flex: 1
    }
});

export default TwoFactorAuth;