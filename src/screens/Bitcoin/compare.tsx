import Clipboard from '@react-native-community/clipboard';
import { colors } from 'assets';
import { Images } from 'assets/Images';
import { Button, MyHeader, Text, TextInput } from 'custom-components';
import ModeButton from 'custom-components/Bitcoin/ModeButton';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import React, { FC, useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Language from 'src/language/Language';
import LightningService from 'src/lightning/LightningService';
import { scaler } from 'utils';


type FormType = {
    bitcoinAmount: number;
    description: string;
};


// bitcoin to satoshi conversion
const BTC_TO_SAT = 10000;

// BITCOIN MODE
const BTC_MODE = "BTC_MODE";

// LIGHTNING MODE
const LIGHTNING_MODE = "LIGHTNING_MODE";

/**
 * Receive Bitcoin Screen
 */
const ReceiveBitcoin: FC<any> = (props) => {

    // current balance in satoshis
    const [currentBalance, setCurrentBalance] = useState(0.0);

    // current balance in usd
    const [currentUSDBalance, setCurrentUSDBalance] = useState(0.0);

    //  current bitcoin to usd exchange rate
    const [btcToUsd, setBtcToUsd] = useState(0.0);

    // current bitcoin address or lightning invoice
    const [btcAddressOrLnInvoice, setBtcAddressOrLnInvoice] = useState('');

    // qr code for bitcoin address or lightning invoice
    const [qrCodeValue, setQRCodeValue] = useState('some-text');

    // current transaction mode, BTC_MODE or LIGHTNING_MODE
    const [transactionMode, setTransactionMode] = useState(BTC_MODE);

    // submit button text???
    const [submitButtonText, setSubmitButtonText] = useState(Language.generate_bitcoin_address);

    const [amount, setAmount] = useState(0.0);
    const [description, setDescription] = useState('');

    // initial setup
    useEffect(() => {
        async function setupState() {

            // get the current balance
            const balanceInMSats: number = await LightningService.getBalance();

            const balanceInSats: number = balanceInMSats / 1000;

            const balance: number = balanceInSats / BTC_TO_SAT;

            // set it to bitcoin
            setCurrentBalance(balance);

            // get the current exchange rate
            const btcEx: number = await LightningService.fetchBTCToUSD();
            setBtcToUsd(btcEx);

            const balanceInUSD: number = balance * btcEx;

            // set the current balance in usd
            setCurrentUSDBalance(balanceInUSD);

            // // generate a new bitcoin address
            // const btcAddress: string = await LightningService.generateBitcoinAddress();

            // // set the bitcoin address to display
            // setBtcAddressOrLnInvoice(btcAddress);

            // // set the qr code
            // setQRCodeValue(btcAddress);
        }
        setupState();
    }, []);

    // set the transaction mode and text for submit button
    const setModeAndText = (mode: string, text: string) => {
        setTransactionMode(mode);
        setSubmitButtonText(text);
        if (mode == LIGHTNING_MODE) {
            setQRCodeValue(Language.waiting_for_invoice);
        }
    };

    // generate bitcoin address or lightning invoice
    const generateAddressOrInvoice = async () => {
        // if transaction mode is bitcoin generate a bitcoin address
        if (transactionMode == BTC_MODE) {
            // generate a new bitcoin address
            const btcAddress: string = await LightningService.generateBitcoinAddress();

            // set the bitcoin address
            setBtcAddressOrLnInvoice(btcAddress);

            // set the qr code for bitcoin address
            setQRCodeValue(btcAddress);
        }
        // if transaction mode is lightning generate a lightning invoice
        else if (transactionMode == LIGHTNING_MODE) {
            // generate a lightning invoice
            const amountInSats: number = Math.round((amount / btcToUsd) * BTC_TO_SAT);
            const invoice = await LightningService.generateBolt11Invoice(amountInSats, description);

            if (invoice) {
                setBtcAddressOrLnInvoice(invoice);
                setQRCodeValue(invoice);
            }

            // set the lightning invoice

            // set the qr code for invoice
        }
    };

    return (
        <SafeAreaViewWithStatusBar style={styles.container} >

            <MyHeader title={transactionMode === LIGHTNING_MODE ? Language.receive_lightning : Language.receive_bitcoin} />

            <View style={{ flex: 1, width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(5) }} >

                {/* mode selection */}
                <View style={{ flex: 1, marginBottom: scaler(60), flexDirection: 'row', justifyContent: 'space-between' }}>
                    {/*  set to Bitcoin mode */}
                    <TouchableOpacity onPress={() =>
                        setModeAndText(BTC_MODE, Language.generate_bitcoin_address)
                    } >
                        <ModeButton borderColor={transactionMode === BTC_MODE ? colors.colorBlackText : colors.colorWhite} backgroundColor={transactionMode === BTC_MODE ? colors.colorWhite : colors.colorTextInputBackground} iconSource={Images.ic_bitcoin} title={Language.bitcoin} subtitle='BTC' />
                    </TouchableOpacity>
                    {/* set to Lightning mode */}
                    <TouchableOpacity onPress={() =>
                        setModeAndText(LIGHTNING_MODE, Language.generate_bitcoin_invoice)
                    } >
                        <ModeButton borderColor={transactionMode === LIGHTNING_MODE ? colors.colorBlackText : colors.colorWhite} backgroundColor={transactionMode === LIGHTNING_MODE ? colors.colorWhite : colors.colorTextInputBackground} iconSource={Images.ic_lightning} title={Language.lightning} subtitle='BTC' />
                    </TouchableOpacity>
                </View>
                {/* current balance */}
                <View style={{ marginBottom: scaler(10) }}>
                    <Text style={styles.balanceLabel}>
                        {Language.current_balance}:
                    </Text>
                    {/* current balance in bitcoin and usd */}
                    <Text style={styles.balanceText}> {currentBalance} BTC | {currentUSDBalance.toFixed(2)} USD</Text>
                </View>
                <View>
                    {/* amount */}
                    <TextInput
                        placeholder={transactionMode == LIGHTNING_MODE ? Language.add_amount : Language.add_amount_optional}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'bitcoinAmount'}
                        editable={transactionMode == LIGHTNING_MODE}
                        rules={{
                            validate: (v: string) => {
                                if (!v.trim()) {
                                    return Language.amount_required;
                                }
                            }
                        }}
                        required={Language.bitcoin_address_or_invoice_required}
                        onChangeText={(v: string): void => {
                            setAmount(parseFloat(v));
                        }}
                    />
                    {/* description/memo */}
                    <TextInput
                        placeholder={Language.description_input}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'Description'}
                        editable={transactionMode == LIGHTNING_MODE}
                        rules={{
                            validate: (v: string) => {
                                if (v?.length < 5)
                                    return Language.minimum_characters_description;
                            }
                        }}
                        onChangeText={(v: string): void => {
                            setDescription(v);
                        }}
                    />
                </View>
                {/* qr code */}
                <View style={{ justifyContent: 'center', alignItems: 'center', padding: scaler(30), marginHorizontal: scaler(5), marginVertical: scaler(16), borderRadius: 10, backgroundColor: colors.colorTextInputBackground }}>
                    <QRCode
                        value={qrCodeValue}
                        size={scaler(150)}
                    />
                </View>
                {/* show bitcoin address or lightning invoice */}
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <TextInput
                        containerStyle={{ flex: 1, justifyContent: 'flex-end', width: '90%', borderRadius: 10, height: scaler(70), borderColor: colors.colorWhite }}
                        placeholder={Language.bitcoin_address_or_lightning_invoice}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'bitcoinAddressOrInvoice'}
                        value={'0xE9c049459a3f3437D6a7204072'}
                        multiline={true}
                        editable={false}
                    />
                    {/* copy to clipboard */}
                    <TouchableOpacity onPress={() =>
                        Clipboard.setString(btcAddressOrLnInvoice)
                    }
                    >
                        < Image source={Images.ic_copy} style={{ height: scaler(36), width: scaler(36), resizeMode: 'contain', marginTop: scaler(15) }} />
                    </TouchableOpacity>
                </View>
                {/* generate bitcoin address or lightning invoice */}
                <Button
                    containerStyle={{ flex: 1, width: '100%', justifyContent: 'flex-start', marginTop: scaler(30) }}
                    title={Language.finish}
                    onPress={() => generateAddressOrInvoice()}
                    paddingVertical={scaler(10)}
                />
            </View>

        </SafeAreaViewWithStatusBar >
    );
};

export default ReceiveBitcoin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center'
    },
    button: {
        paddingHorizontal: scaler(15),
        left: 0,
        height: '100%',
        justifyContent: 'flex-end',
        paddingVertical: scaler(15),
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
        fontSize: scaler(14),
        color: 'grey',
    },
    balanceLabel: {
        fontSize: scaler(14),
        marginBottom: scaler(5),
    },
    bottomPanel: {
        flex: 1,
        width: '100%',
        paddingHorizontal: scaler(20),
        paddingVertical: scaler(20)
    },
    receiveBitcoinBtwWrapper: {
        borderWidth: 1,
        borderColor: colors.colorBlackText,
        borderRadius: 10,
        width: scaler(150),

    }

});