import { Images, colors } from 'assets';
import { MyHeader, Text } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import React, { Dispatch, FC, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LightningService from 'src/lightning/LightningService';
import { _showErrorMessage, scaler } from "utils";

import { setLoadingAction } from "app-store/actions";
import { useDispatch } from 'react-redux';

import {
    Payment,
    ReverseSwapInfo,
    SwapInfo
} from '@breeztech/react-native-breez-sdk';
import Language from 'src/language/Language';
import { ScrollView } from 'react-native-gesture-handler';

const Transaction = (props: any) => {
    return (
        <View key={props.index} style={{ flexDirection: "row", padding: scaler(20), borderColor: "#eee", borderTopWidth: 1 }}>
            <Image source={props?.item?.paymentType == "received" ? Images?.ic_transaction_receive : Images.ic_transaction_send} style={{ height: scaler(24), width: scaler(24), marginRight: scaler(15) }} />
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: scaler(14), fontWeight: "600", }}>{props?.item?.description}</Text>
                <Text style={{ fontSize: scaler(12), color: "#aaa" }}>{props?.item?.paymentType == "received" ? "+" : "-"}{((props?.item?.amountMsat / 10 / 1000) / 100_000_00).toFixed(6)} BTC</Text>
            </View>
        </View>
    )
}

let dispatch: Dispatch<any>;

const ListBitcoinTransactions: FC<any> = (props) => {

    dispatch = useDispatch();

    let [transactions, setTransactions] = useState<Payment[]>([])
    let [swapIn, setSwapIn] = useState<SwapInfo>()
    let [swapOut, setSwapOut] = useState<ReverseSwapInfo[]>([])

    useEffect(() => {
        async function setupState() {
            try {
                dispatch(setLoadingAction(true));
                await LightningService.requestPayments()
                const payments: Payment[] = await LightningService.listPayments();
                const swapIn: SwapInfo | null = await LightningService.pendingSwapIn();
                if (swapIn !== null) {
                    setSwapIn(swapIn)
                }
                const swapOut: ReverseSwapInfo[] | null = await LightningService.pendingSwapOut();
                if (swapOut !== null) {
                    setSwapOut(swapOut)
                }

                setTransactions(payments)
                dispatch(setLoadingAction(false));
                // setTransactions(payments)

            } catch (error) {
                dispatch(setLoadingAction(false));
            }
        }


        setupState()

    }, [])


    return (
        <SafeAreaViewWithStatusBar style={styles.container} >

            <MyHeader title={Language.bitcoin_transactions} />
            <ScrollView contentContainerStyle={styles.bottomPanel} >
                {
                    !!swapIn?.unconfirmedTxIds?.length &&
                    <View key={props.index} style={{ flexDirection: "row", padding: scaler(20), borderColor: "#eee", borderTopWidth: 1, backgroundColor: "#f7f7e6" }}>
                        <Image source={Images?.ic_transaction_receive} style={{ height: scaler(24), width: scaler(24), marginRight: scaler(15) }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: scaler(14), fontWeight: "600", }}>{Language.pending_in_transaction}</Text>
                            <Text style={{ fontSize: scaler(12), color: "#aaa" }}>{"+"}{(((swapIn?.['unconfirmedSats'] ? swapIn?.['unconfirmedSats'] : 0) / 10) / 100_000_00)?.toFixed(6)} BTC</Text>
                        </View>
                    </View>
                }
                {
                    swapOut?.map((item, index) => (
                        <View key={props.index} style={{ flexDirection: "row", padding: scaler(20), borderColor: "#eee", borderTopWidth: 1, backgroundColor: "#f7f7e6" }}>
                            <Image source={Images?.ic_transaction_send} style={{ height: scaler(24), width: scaler(24), marginRight: scaler(15) }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: scaler(14), fontWeight: "600", }}>{Language.pending_out_transaction}</Text>
                                <Text style={{ fontSize: scaler(12), color: "#aaa" }}>{"-"}{(((item.onchainAmountSat ? item.onchainAmountSat : 0) / 10) / 100_000_00)?.toFixed(6)} BTC</Text>
                            </View>
                        </View>
                    ))
                }
                {transactions.map((item, index) => {
                    // console.log("item ========== ", item)
                    return <Transaction item={item} index={index} />
                })}
            </ScrollView>

        </SafeAreaViewWithStatusBar>
    )
}

export default ListBitcoinTransactions

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
        // width: '100%',
        // paddingHorizontal: scaler(20),
        paddingVertical: scaler(20)
    }

})