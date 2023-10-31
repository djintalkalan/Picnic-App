import { colors } from 'assets';
import { MyHeader, Text } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import React, { Dispatch, FC, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LightningService from 'src/lightning/LightningService';
import { _showErrorMessage, scaler } from "utils";

import {
    Payment
} from '@breeztech/react-native-breez-sdk';
import Language from 'src/language/Language';



const Mnemonic: FC<any> = (props) => {

    let [mnemonic, setMnemonic] = useState<string>("")

    useEffect(() => {
        let mnemonic = LightningService.requestMnemonic();
        setMnemonic(mnemonic)
    }, [])


    return (
        <SafeAreaViewWithStatusBar style={styles.container} >

            <MyHeader title={Language.bitcoin_mnemonic} />

            <View style={styles.bottomPanel} >
                <Text>{mnemonic}</Text>
            </View>

        </SafeAreaViewWithStatusBar>
    )
}

export default Mnemonic

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center'
    },
    amountText: {
        textAlign: 'center',
        padding: scaler(5),
        fontSize: scaler(40),
        marginTop: scaler(50)
    },
    usdText: {
        textAlign: 'center',
        marginEnd: scaler(20),
        marginBottom: scaler(40),
        fontSize: scaler(12),
        color: 'blue',
    },
    balanceText: {
        marginTop: scaler(10),
        marginEnd: scaler(10),
        marginBottom: scaler(15),
        fontSize: scaler(14),
        marginLeft: scaler(25),
        color: 'grey',
    },
    balanceLabel: {
        marginTop: scaler(15),
        marginEnd: scaler(10),
        fontSize: scaler(14),
        marginLeft: scaler(25)
    },
    bottomPanel: {
        flex: 1,
        width: '100%',
        paddingHorizontal: scaler(20),
        paddingVertical: scaler(20)
    }

})