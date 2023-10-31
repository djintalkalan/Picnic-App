import { store } from 'app-store/store';
import { colors } from 'assets';
import { Images } from 'assets/Images';
import { Button, MyHeader, Text, TextInput } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import PopupComponent from 'custom-components/PopUpComponent';
import React, { Dispatch, FC, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { NavigationService, _hidePopUpAlert, _showErrorMessage, _showPopUpAlert, scaler } from 'utils';
import ConfirmSend from './ConfirmSend';
import { updateSendBitcoinData } from 'app-store/actions/bitcoinActions';
// import VirtualKeyboard from 'react-native-virtual-keyboard';
import LightningService from 'src/lightning/LightningService';
import Database from 'database';


type FormType = {
    bitcoinAddress: string;
};

const AMOUNT_PRECESSION = 6;

const BTC_TO_SAT = 100_000_000;
let dispatch: Dispatch<any>;

const SendBitcoinAddressOrReceipt: FC<any> = (props) => {

    // current balance in wallet
    const [currentWalletAmount, setCurrentWalletAmount] = useState(0.0);

    // current currency
    const _currency = Database.getOtherString("selectedCurrency")
    const [currentCurrency, setCurrentCurrency] = useState(_currency || "USD");

    //  current bitcoin to usd exchange rate
    const [exchangeRate, setExchangeRate] = useState(0.0);

    // current amount in btc
    const [amount, setAmount] = useState<string>("");

    // current balance in selected currency
    const [currencyAmount, setCurrencyAmount] = useState(0.0);

    const [destination, setDestination] = useState('');
    const [description, setDescription] = useState('');

    const [SendPopup, setSendPopup] = useState(false);

    dispatch = useDispatch();
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


    const onSubmit = () => {
        if (currencyAmount > 0) {
            console.log("show popup")
            console.log({
                amount_in_sats: (Number(amount) / exchangeRate).toFixed(6),
                amount,
                destination
            })
            // dispatch(updateSendBitcoinData({
            //     btcAmount: btcAmount,
            //     usdAmount: currencyAmount,
            //     destination: destination
            // }));
            setSendPopup(true);
        } else {
            _showErrorMessage(Language.btc_amount_not_0, 2000);
        }
    };

    useEffect(() => {
        async function setupState() {
            const state = props.route.params;
            console.log("state ========== ", state)
            const destination = state.destination;
            const description = state.description;
            setDestination(destination);
            setDescription(description);
        }
        setupState();

    }, []);

    useEffect(() => {
        async function setupState() {
            // get the current balance
            const balanceMsats: number = await LightningService.getBalance();
            const balanceSats = balanceMsats / 1000;
            console.log("balanceSats ========== ", balanceSats)
            const balanceBtc = balanceSats / BTC_TO_SAT;
            console.log("balanceBtc ========== ", balanceBtc)
            setCurrentWalletAmount(balanceBtc);

            // get the current exchange rate
            const exchangeRate: number = await LightningService.fetchExchangeRate(currentCurrency);
            setExchangeRate(exchangeRate);
        }
        setupState();

    }, []);

    const safeToFixed = (amount: any) => {
        const floatAmount: number = parseFloat(amount);
        if (floatAmount && floatAmount.toFixed) {
            return floatAmount.toFixed(AMOUNT_PRECESSION);
        }
        return (0.0).toFixed(AMOUNT_PRECESSION);
    };

    function isValidNumberWithSixDecimals(input: string) {
        // // Define the regular expression pattern
        // const pattern = /^(0|\d+(\.\d{1,6})?)$/;

        // // Test the input against the pattern
        // return pattern.test(input);
        const decimalParts = input.split(".");

        // Check if there are more than 1 decimal part and if the decimal part has more than 6 digits
        if (decimalParts.length > 1 && decimalParts[1].length > 6) {
            return false
        } else {
            return true
        }
    }

    const updatebtcAmount = (amount: string) => {
        console.log("amount", amount)
        console.log("sats", (Number(amount) ? Number(amount) : 0) * BTC_TO_SAT)
        if (!isValidNumberWithSixDecimals(amount)) {
            return
        }
        setAmount(amount);
        if (exchangeRate !== 0.0) {
            console.log("amount ======------- ", amount, exchangeRate, parseFloat(amount) * exchangeRate)
            setCurrencyAmount(parseFloat(amount) > 0 ? parseFloat(amount) * exchangeRate : 0);
            // setCurrentUSDBalance(Number((currentBalance * btcToUsd).toFixed(2)));
        }
    };

    function addCommasToNumber(numberStr: string) {
        try {
            const number = parseFloat(numberStr);
            if (isNaN(number)) {
                return numberStr; // Return the original string if it's not a valid number
            }
            return number.toLocaleString();
        } catch (error) {
            console.error(error);
            return numberStr; // Return the original string in case of an error
        }
    }

    return (
        <SafeAreaViewWithStatusBar style={styles.container} >
            <MyHeader title={Language.amount_to_send} />
            <PopupComponent isOpen={SendPopup} onClose={() => setSendPopup(false)}>
                <ConfirmSend
                    destination={destination}
                    btcAmount={Number(amount) / exchangeRate}
                    exchangeRate={exchangeRate}
                    currency={currentCurrency}
                    close={() => setSendPopup(false)} />
            </PopupComponent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', paddingHorizontal: scaler(20) }} >
                <View style={styles.amountText} >
                    <Image style={{ width: scaler(32), height: scaler(32), marginRight: scaler(10) }} source={Images.ic_bitcoin} />
                    <Text style={{ fontSize: scaler(32), }}>{safeToFixed(Number(amount) / exchangeRate)}</Text>
                    <Text style={{ fontSize: scaler(32), }}> BTC</Text>
                </View>
                <Text style={styles.usdText}>
                    <Text style={{ color: 'grey' }}>{Language.approx}. </Text> <Text style={{ color: 'grey', paddingLeft: scaler(30) }}> {addCommasToNumber(amount)} {currentCurrency}</Text>
                </Text>
                <View style={{ alignSelf: 'center', height: scaler(1), width: '90%', borderTopWidth: scaler(0.5), borderTopColor: colors.colorGreyText, marginTop: scaler(20) }}></View>
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>
                        {Language.current_balance}:
                    </Text>
                    {/* <TouchableOpacity onPress={() => { setBtcAmount((btcAmount)?.toString()) }}><Text style={styles.sendAll}>
                        Send All</Text>
                    </TouchableOpacity> */}
                </View>
                <Text style={styles.balanceText}> {safeToFixed(currentWalletAmount)} BTC | {addCommasToNumber((currentWalletAmount * exchangeRate)?.toFixed(2))} {currentCurrency}</Text>
                <View style={{ alignSelf: 'center', height: scaler(1), width: '90%', borderTopWidth: scaler(0.5), borderTopColor: colors.colorGreyText }}></View>
                <View style={{ marginTop: scaler(20), justifyContent: 'flex-end', flexDirection: 'row' }}>
                    <TextInput
                        containerStyle={{ width: '100%' }}
                        placeholder={Language.bitcoin_address_or_lightning_invoice}
                        borderColor={colors.colorTextInputBackground}
                        backgroundColor={colors.colorTextInputBackground}
                        name={'bitcoinAddressOrInvoice'}
                        value={destination}
                        disabled={true}
                        editable={false}
                    />
                </View>
                <TextInput
                    placeholder={Language.add_amount_in + " " + currentCurrency}
                    borderColor={colors.colorTextInputBackground}
                    backgroundColor={colors.colorTextInputBackground}
                    name={'bitcoinAmount'}
                    rules={{
                        validate: (v: number) => {
                            if (!v) {
                                return Language.amount_required;
                            }
                        }
                    }}
                    value={amount.toString()}
                    required={Language.bitcoin_address_or_invoice_required}
                    onChangeText={(amount: string) => updatebtcAmount(amount)}
                />
                <TextInput
                    placeholder={Language.description_input}
                    borderColor={colors.colorTextInputBackground}
                    backgroundColor={colors.colorTextInputBackground}
                    name={'Description'}
                    disabled={true}
                    editable={false}
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
                    {/* <VirtualKeyboard pressMode='string' onPress={(amount: number) => updatebtcAmount(amount / (10 ** AMOUNT_PRECESSION))} /> */}
                    <Button onPress={onSubmit} containerStyle={{ marginTop: scaler(25) }} textStyle={{ textTransform: 'capitalize' }} title={Language.give_permission} />
                </View>
            </KeyboardAvoidingView>

        </SafeAreaViewWithStatusBar>
    );
};

export default SendBitcoinAddressOrReceipt;

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
    bottomPanel: {
        width: '100%',
        paddingHorizontal: scaler(20),
        paddingVertical: scaler(20)
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