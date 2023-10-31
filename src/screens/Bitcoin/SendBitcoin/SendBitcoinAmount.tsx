import { setSendBitcoinData, updateSendBitcoinData } from 'app-store/actions/bitcoinActions';
import { colors, Images } from 'assets';
import { Button, MyHeader, Text, TextInput } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import PopupComponent from 'custom-components/PopUpComponent';
import React, { Dispatch, FC, useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import LightningService from 'src/lightning/LightningService';
import { _showErrorMessage, NavigationService, scaler } from "utils";
import ConfirmSend from './ConfirmSend';
import { useForm } from 'react-hook-form';
import Database from 'database';

const bitcoin = require('bitcoinjs-lib');

type FormType = {
    BitcoinAmount: number,
};
let dispatch: Dispatch<any>;

const SendBitcoinAmount: FC<any> = (props) => {

    dispatch = useDispatch();

    // current currency
    const _currency = Database.getOtherString("selectedCurrency")
    const [currentCurrency, setCurrentCurrency] = useState(_currency || "USD");

    //  current bitcoin to usd exchange rate
    const [exchangeRate, setExchangeRate] = useState(0.0);

    const [btcAmount, setbtcAmount] = useState(0.0);
    const [usdAmount, setUsdAmount] = useState(0.0);
    const [destination, setDestination] = useState('');
    const [description, setDescription] = useState('');
    const [SendPopup, setSendPopup] = useState(false);
    const [addressError, setAddressError] = useState(false);

    function isValidBTCAddress(address: string) {
        try {
            // bitcoin.address.toOutputScript(address.toLowerCase());
            const btcRegex = /^(1|3|bc1)/;
            // const btcRegex = /^(1|bc1)/i;
            return btcRegex.test(address);
        } catch (error) {
            return false;
        }
    }

    function isValidLNBCAddress(lnbcAddress: string) {
        const lncRegex = /^lnbc/;
        return lncRegex.test(lnbcAddress);
    }

    useEffect(() => {
        async function setupState() {
            // get the current exchange rate
            const exchangeRate: number = await LightningService.fetchExchangeRate(currentCurrency);
            setExchangeRate(exchangeRate);
        }
        setupState();

    }, []);

    const {
        control,
        setValue,
        handleSubmit,
        getValues,
        clearErrors,
        formState: { errors, isValid },
    } = useForm<FormType>({
        mode: 'onChange', shouldFocusError: true, defaultValues: {}
    });

    const validateAndNavigate = async () => {
        if (destination?.trim() == '') {
            _showErrorMessage(Language.destination_is_required, 2000);
        } else {
            if ((destination?.toLowerCase()).startsWith("lnbc")) {
                // let invoice = await LightningService.parseInvoice(destination);
                // console.log("invoice ========== -------- ", invoice);
                // const amount = invoice?.amountMsat ? invoice?.amountMsat / 1000 / 100_000_000 : 0;
                // const btcEx: number = await LightningService.fetchBTCToUSD();
                // const amount_in_usd = amount * btcEx;
                // dispatch(updateSendBitcoinData({
                //     btcAmount: amount,
                //     usdAmount: amount_in_usd,
                //     destination: destination
                // }));
                setSendPopup(true);
            } else {
                NavigationService.navigate("SendBitcoinAddressOrReceipt", {
                    destination,
                    description
                });
            }
        }
    };

    useEffect(() => {
        if (props?.route?.params?.address) {
            setDestination(props?.route?.params?.address);
        }
    }, [props?.route?.params?.address])

    useEffect(() => {
        setAmounts();
    }, [destination])

    const setAmounts = async () => {
        if ((destination?.toLowerCase())?.startsWith('lnbc')) {
            let invoice = await LightningService.parseInvoice(destination);
            console.log("invoice ========== -------- ", invoice);
            const amount = invoice?.amountMsat ? invoice?.amountMsat / 1000 / 100_000_000 : 0;
            const btcEx: number = await LightningService.fetchBTCToUSD();
            const amount_in_usd = amount * btcEx;

            setbtcAmount(amount);
            setUsdAmount(amount_in_usd);
        }
    }

    console.log("errors?.bitcoinAddressOrInvoice || !(isValidBTCAddress(destination) && isValidLNBCAddress(destination))", isValidBTCAddress(destination) || isValidLNBCAddress(destination))

    return (
        <SafeAreaViewWithStatusBar style={styles.container} >

            <MyHeader title={Language.send_btc} />
            <PopupComponent isOpen={SendPopup} onClose={() => setSendPopup(false)}>
                <ConfirmSend
                    destination={destination?.toLowerCase()}
                    btcAmount={btcAmount}
                    exchangeRate={exchangeRate}
                    currency={currentCurrency}
                    close={() => setSendPopup(false)}
                />
            </PopupComponent>
            <View style={styles.amountText} >
                <Image style={{ width: scaler(60), height: scaler(60), marginRight: scaler(10) }} source={Images.ic_bitcoin} />
            </View>

            <View style={{ marginHorizontal: scaler(20), marginTop: scaler(40), marginBottom: scaler(5), justifyContent: 'flex-end', flexDirection: 'row' }}>
                <TextInput
                    containerStyle={{ width: '100%' }}
                    style={{ fontSize: scaler(12) }}
                    placeholder={Language.bitcoin_address_or_lightning_invoice}
                    borderColor={colors.colorTextInputBackground}
                    backgroundColor={colors.colorTextInputBackground}
                    name={'bitcoinAddressOrInvoice'}
                    rules={{
                        validate: (v: string) => {
                            if (!v.trim()) {
                                return Language.bitcoin_address_or_invoice_required;
                            }
                            if (v?.length < 26)
                                return Language.minimum_characters_bitcoin_address;
                        }
                    }}
                    icon={Images.ic_scan}
                    onPressIcon={() => NavigationService.navigate('Scanner', { id: "bitcoinAddress", currency: props?.route?.params?.currency })}
                    required={Language.bitcoin_address_or_invoice_required}
                    // control={control}
                    errors={errors}
                    value={destination}
                    onChangeText={(v: string): void => {
                        console.log("set destination ", v)
                        setDestination(v);
                    }}
                />
            </View>
            <TextInput
                containerStyle={{ marginHorizontal: scaler(20), }}
                style={{ fontSize: scaler(12) }}
                placeholder={Language.description_input}
                borderColor={colors.colorTextInputBackground}
                backgroundColor={colors.colorTextInputBackground}
                name={'Description'}
                rules={{
                    validate: (v: string) => {
                        if (v?.length < 5)
                            return Language.minimum_characters_description;
                    }
                }}
                value={description}
                onChangeText={(v: string): void => {
                    setDescription(v);
                }}
            />

            <View style={styles.bottomPanel} >
                <Button onPress={(_event) => validateAndNavigate()} disabled={errors?.bitcoinAddressOrInvoice || !(isValidBTCAddress(destination) || isValidLNBCAddress(destination)) ? true : false} containerStyle={{ marginTop: scaler(25) }} textStyle={{ textTransform: 'capitalize' }} title={Language.give_permission} />
            </View>

        </SafeAreaViewWithStatusBar>
    );
};

export default SendBitcoinAmount;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center'
    },
    amountText: {
        // textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: scaler(5),
        marginTop: scaler(50),
        marginHorizontal: scaler(30),
        flexWrap: "wrap",

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
        fontSize: scaler(14),
        marginLeft: scaler(25)
    },
    bottomPanel: {
        flex: 1,
        width: '100%',
        paddingHorizontal: scaler(20),
        paddingVertical: scaler(20),
        justifyContent: "flex-end"
    },
    balanceContainer: {
        marginTop: scaler(15),
        marginEnd: scaler(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sendAll: {
        marginRight: scaler(25),
        fontSize: scaler(10),
        color: colors.colorPrimary
    }

});