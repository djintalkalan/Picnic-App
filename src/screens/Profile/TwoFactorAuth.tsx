import { _enableDisable2FA } from 'api';
import { getProfile } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { MyHeader, Text } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Switch from 'custom-components/Switch';
import { useDatabase } from 'database/Database';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { scaler, _showErrorMessage, _showSuccessMessage } from 'utils';

const TwoFactorAuth: FC = () => {
    const [authEnabled, setAuthEnabled] = useState<boolean>(false)
    const dispatch = useDispatch()
    const [userData] = useDatabase("userData")

    useEffect(() => {
        setAuthEnabled(userData?.is_two_factor_enabled == '1' ? true : false)
    }, [userData])


    const onChangePermission = useCallback((permissionEnabled: boolean) => {
        try {
            _enableDisable2FA(
                {
                    "is_two_factor_enabled": permissionEnabled ? '1' : '0',
                    "two_factor_mode": "email"
                }).then(res => {
                    if (res && res?.status == 200) {
                        _showSuccessMessage(res?.message)
                        setAuthEnabled(permissionEnabled)
                        dispatch(getProfile())
                    }
                    else _showErrorMessage(res?.message)
                }).catch(e => console.log(e))
        }
        catch { (e: any) => console.log(e) }
    }, [])


    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={Language.two_factor_auth} backEnabled />
            <View style={styles.authView} >
                <Text style={styles.textStyle} >{Language.two_factor_auth}</Text>
                <Switch active={authEnabled} onChange={_ => onChangePermission(_)} />
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