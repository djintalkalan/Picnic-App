import { store } from 'app-store/store';
import { colors } from 'assets';
import { Images } from 'assets/Images';
import { FixedDropdown, MyHeader, Text, TextInput } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View, TextInput as RNTextInput } from 'react-native';
import Language from 'src/language/Language';
import { NavigationService, _hidePopUpAlert, _hideTouchAlert, _showPopUpAlert, _showTouchAlert, scaler } from 'utils';
import LightningService from 'src/lightning/LightningService';
import { set } from 'lodash';
import { Keyboard } from 'react-native';
import { StatusBar } from 'react-native';
import { ALL_CURRENCIES, REMOVED_CURRENCIES } from 'utils/Constants';
import Database from 'database';
import { useIsFocused } from '@react-navigation/native';

const AMOUNT_PRECESSION = 6;

const MyWallet: FC<any> = (props) => {
    const [btcAmount, setbtcAmount] = useState(0.0);
    const _currency = Database.getOtherString("selectedCurrency")
    const [currency, setCurrency] = useState(_currency || "USD");
    const [currencyExchangeRate, setCurrencyExchangeRate] = useState(0.0);
    const [currencyAmount, setCurrencyAmount] = useState(0.0);
    const isFocused = useIsFocused();

    const DropDownData = ALL_CURRENCIES?.filter(_ => (!REMOVED_CURRENCIES?.includes(_?.value)));

    useEffect(() => {
        async function setupState() {

            // set bitcoion amount
            let nodeInfo = await LightningService.getNodeInfo();
            let _btc = 0.0;
            if (nodeInfo !== null) {
                // convert from milisats to sats
                let sats = nodeInfo.channelsBalanceMsat / 1000;

                // convert from sats to btc
                _btc = sats / 100_000_000;
                console.log("sats", sats)

                setbtcAmount(_btc);
            }

            // set btc to currency amount
            const _exchangeRate = await LightningService.fetchExchangeRate(currency);
            setCurrencyExchangeRate(_exchangeRate);
            const _currencyAmount: number = _btc * _exchangeRate;
            setCurrencyAmount(_currencyAmount);
            // Database.setOtherString("selectedCurrency", "USD");
            // const state = store.getState().bitcoinState;
            // const btcAmount = state.btcAmount;
            // const usdAmount = state.usdAmount;
            // setbtcAmount(btcAmount);
            // setUsdAmount(usdAmount);
        }
        isFocused && setupState();

    }, [isFocused]);

    const safeToFixed = (amount: any) => {
        const floatAmount: number = parseFloat(amount);
        if (floatAmount && floatAmount.toFixed) {
            return floatAmount.toFixed(AMOUNT_PRECESSION);
        }
        return (0.0).toFixed(AMOUNT_PRECESSION);
    };

    const showCurrencyDropDown = useCallback(() => {
        Keyboard.dismiss()
        setTimeout(() => {
            currencyRef.current?.measureInWindow((x, y, w, h) => {
                _showTouchAlert({
                    placementStyle: {
                        top: y + h + scaler(15) + (StatusBar.currentHeight || 0),
                        left: x
                    },
                    transparent: true,
                    alertComponent: () => {
                        return <FixedDropdown
                            visible={true}
                            relative
                            containerStyle={{ width: w }}
                            data={DropDownData.map((_, i) => ({ id: i, data: _?.value, title: _?.text }))}
                            onSelect={async data => {
                                const _currency = data?.data;
                                console.log("currency", _currency);
                                Database.setOtherString("selectedCurrency", _currency);
                                setCurrency(_currency);

                                const _exchangeRate = await LightningService.fetchExchangeRate(_currency);
                                console.log("exchangeRate", _exchangeRate);
                                setCurrencyExchangeRate(_exchangeRate);

                                _hideTouchAlert()
                            }}
                        />
                    }
                })
            })
        }, Platform.OS == 'android' ? 50 : 0);

    }, [])

    useEffect(() => {
        if (currencyExchangeRate && btcAmount) {
            const _currencyAmount: number = btcAmount * currencyExchangeRate;
            console.log("currencyAmount", _currencyAmount, btcAmount, currencyExchangeRate);
            setCurrencyAmount(_currencyAmount);
        } else {
            setCurrencyAmount(0);
        }
    }, [currency, currencyExchangeRate])
    const currencyRef = useRef<RNTextInput>()

    return (
        <SafeAreaViewWithStatusBar style={styles.container} >
            <MyHeader title={Language.wallet_my_wallet} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: '100%', paddingHorizontal: scaler(15), alignItems: "center" }} >
                <View style={styles.amountText} >
                    <Image style={{ width: scaler(32), height: scaler(32), marginRight: scaler(10) }} source={Images.ic_bitcoin} />
                    <Text style={{ fontSize: scaler(32), }}>{safeToFixed(btcAmount)}</Text>
                    <Text style={{ fontSize: scaler(32), }}> BTC</Text>
                </View>
                <Text style={styles.usdText}>
                    <Text style={{ color: 'grey' }}>{Language.approx}. </Text> <Text style={{ color: 'grey', paddingLeft: scaler(30) }}> {currencyAmount?.toFixed(2)} {currency?.toUpperCase()}</Text>
                </Text>
                <TextInput
                    value={currency?.toUpperCase()}
                    ref={currencyRef}
                    containerStyle={{ width: scaler(90) }}
                    borderColor={colors.colorTextInputBackground}
                    backgroundColor={colors.colorTextInputBackground}
                    name={'currency'}
                    icon={Images.ic_arrow_dropdown}
                    // control={control}
                    iconContainerStyle={{ end: scaler(4) }}
                    onPress={showCurrencyDropDown}
                // errors={errors}
                />
                <View style={{ flexGrow: 1, paddingHorizontal: scaler(30) }}>
                    <TouchableOpacity onPress={() => { NavigationService.navigate('ListBitcoinTransactions') }} style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: scaler(15), paddingVertical: scaler(15), borderTopColor: "#efefef", borderTopWidth: 1 }}>
                        <Image source={Images.ic_view_history} />
                        <Text style={{ color: colors.colorPrimary, marginLeft: scaler(8) }}>{Language.wallet_history}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", gap: scaler(5), marginBottom: scaler(10) }}>
                    <TouchableOpacity onPress={() => { NavigationService.navigate('ReceiveBitcoin', { currency }) }} style={{ flex: 0.5, paddingVertical: scaler(12), backgroundColor: "transparent", borderWidth: 1, borderRadius: 15, flexDirection: "row", margin: scaler(5), justifyContent: "center", alignItems: "center" }}>
                        <Image source={Images.ic_scan} style={{ height: scaler(20), width: scaler(20), marginRight: scaler(10) }} />
                        <Text style={{ fontWeight: "600", fontSize: scaler(12) }}>{Language.wallet_receive}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { NavigationService.navigate('SendBitcoinAmount', { currency }) }} style={{ flex: 0.5, paddingVertical: scaler(12), backgroundColor: colors.colorPrimary, borderRadius: 15, flexDirection: "row", margin: scaler(5), justifyContent: "center", alignItems: "center" }}>
                        <Image source={Images.ic_send} style={{ height: scaler(20), width: scaler(20), marginRight: scaler(10), tintColor: "#FFF" }} />
                        <Text style={{ fontWeight: "600", fontSize: scaler(12), color: colors.colorWhite }}>{Language.wallet_send}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ marginBottom: scaler(30), color: '#ccc', textAlign: "center" }}>1 BTC = {currencyExchangeRate?.toFixed(2)} {currency?.toUpperCase()}</Text>
            </KeyboardAvoidingView>

        </SafeAreaViewWithStatusBar>
    );
};

export default MyWallet;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
    },
    button: {
        paddingHorizontal: scaler(15),
        left: 0,
        justifyContent: 'flex-end',
        paddingVertical: scaler(15),
    },
    amountText: {
        // textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: scaler(5),
        marginTop: scaler(50),
        marginHorizontal: scaler(10),
        flexWrap: "wrap",

    },
    usdText: {
        textAlign: 'center',
        fontSize: scaler(12),
        color: 'blue',
    },
});