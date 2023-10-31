import Clipboard from '@react-native-community/clipboard';
import { colors } from 'assets';
import { Images } from 'assets/Images';
import { Button, MyHeader, Text, TextInput } from 'custom-components';
import DropModeButtons from 'custom-components/Bitcoin/DropModeButtons';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import React, { FC, Dispatch, useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Language from 'src/language/Language';
import LightningService from 'src/lightning/LightningService';
import { NavigationService, scaler } from 'utils';
import { setLoadingAction } from "app-store/actions";
import { useDispatch } from 'react-redux';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/AntDesign';
import { isNumber } from 'lodash';
import Database from 'database';


type FormType = {
    bitcoinAmount: number;
    description: string;
};

const AMOUNT_PRECESSION = 6;


// bitcoin to satoshi conversion
const BTC_TO_SAT = 100_000_000;

// BITCOIN MODE
const BTC_MODE = "BTC_MODE";

// LIGHTNING MODE
const LIGHTNING_MODE = "LIGHTNING_MODE";

let dispatch: Dispatch<any>;

/**
 * Receive Bitcoin Screen
 */
const ReceiveBitcoin: FC<any> = (props) => {

    // get the dispatch function  
    dispatch = useDispatch();

    // current balance in satoshis
    const _currency = Database.getOtherString("selectedCurrency")
    const [currentCurrency, setCurrentCurrency] = useState(_currency || "USD");

    // current balance in satoshis
    const [currentBalance, setCurrentBalance] = useState(0.0);

    // current balance in usd
    // const [currentUSDBalance, setCurrentUSDBalance] = useState(0.0);
    const [currencyBalance, setCurrencyBalance] = useState(0.0);

    //  current bitcoin to usd exchange rate
    const [exchangeRate, setExchangeRate] = useState(0.0);

    // current bitcoin address or lightning invoice
    const [btcAddressOrLnInvoice, setBtcAddressOrLnInvoice] = useState('');

    // qr code for bitcoin address or lightning invoice
    const [qrCodeValue, setQRCodeValue] = useState('some-text');

    // current transaction mode, BTC_MODE or LIGHTNING_MODE
    const [transactionMode, setTransactionMode] = useState(BTC_MODE);

    // current transaction mode, BTC_MODE or LIGHTNING_MODE
    const [editMode, setEditMode] = useState(false);

    // submit button text???
    const [submitButtonText, setSubmitButtonText] = useState(Language.generate_bitcoin_address);

    // submit button text???
    const [buttonState, setButtonState] = useState(2);

    const [amount, setAmount] = useState(0.0);
    const [description, setDescription] = useState('');


    const safeToFixed = (amount: any) => {
        const floatAmount: number = parseFloat(amount);
        if (floatAmount && floatAmount.toFixed) {
            return floatAmount.toFixed(AMOUNT_PRECESSION);
        }
        return (0.0).toFixed(AMOUNT_PRECESSION);
    };

    // initial setup
    useEffect(() => {
        async function setupState() {

            // get the current balance
            const balanceInMSats: number = await LightningService.getBalance();

            const balanceInSats: number = balanceInMSats / 1000;

            const balance: number = balanceInSats / BTC_TO_SAT;

            // set it to bitcoin
            setCurrentBalance(Number(safeToFixed(balance)));

            // get the current exchange rate
            const exchangeRate: number = await LightningService.fetchExchangeRate(currentCurrency);
            setExchangeRate(exchangeRate);


            const balanceInCurrency: number = balance * exchangeRate;

            // set the current balance in usd
            setCurrencyBalance(balanceInCurrency);

            // // generate a new bitcoin address
            // const btcAddress: string = await LightningService.generateBitcoinAddress();

            // // set the bitcoin address to display
            // setBtcAddressOrLnInvoice(btcAddress);

            // // set the qr code
            // setQRCodeValue(btcAddress);

            // Currency Currency Title
            // const currency = Database?.getOtherString("selectedCurrency");
            // console.log("currency --------- ============ ", currency)
            // setCurrentCurrency(currency);
        }
        setupState();
    }, []);

    // transaction mode change
    useEffect(() => {
        if (transactionMode === BTC_MODE) {
            generateAddressOrInvoice();
        }
    }, [transactionMode])

    useEffect(() => {
        if (amount > 0 && transactionMode === LIGHTNING_MODE) {
            setButtonState(1);
        } else if (!amount || amount == 0 || !isNumber(amount)) {
            setButtonState(0);
        }
    }, [amount])

    // set the transaction mode and text for submit button
    const setModeAndText = (mode: string, text: string) => {
        setEditMode(false);
        setBtcAddressOrLnInvoice("")
        setTransactionMode(mode);
        setSubmitButtonText(text);
        if (mode == LIGHTNING_MODE) {
            setQRCodeValue(Language.waiting_for_invoice);
            setButtonState(0);
        } else {
            setButtonState(2);
        }
    };

    // generate bitcoin address or lightning invoice
    const generateAddressOrInvoice = async () => {

        // if transaction mode is bitcoin generate a bitcoin address
        if (transactionMode == BTC_MODE) {
            dispatch(setLoadingAction(true));

            // generate a new bitcoin address
            const btcAddress: string = await LightningService.generateBitcoinAddress();

            dispatch(setLoadingAction(false));


            // set the bitcoin address
            setBtcAddressOrLnInvoice(btcAddress);

            // set the qr code for bitcoin address
            setQRCodeValue(btcAddress);

            setButtonState(2);
        }
        // if transaction mode is lightning generate a lightning invoice
        else if (transactionMode == LIGHTNING_MODE) {
            // generate a lightning invoice
            // console.log("(amount / btcToUsd) * BTC_TO_SAT): ", Math.round((amount / btcToUsd) * BTC_TO_SAT));
            const amountInSats: number = Math.round((amount / exchangeRate) * BTC_TO_SAT);

            dispatch(setLoadingAction(true));
            const invoice = await LightningService.generateBolt11Invoice(amountInSats, description);
            dispatch(setLoadingAction(false));

            if (invoice) {
                setBtcAddressOrLnInvoice(invoice);
                setQRCodeValue(invoice);
            }

            setButtonState(2);
        }
    };

    return (
        <SafeAreaViewWithStatusBar style={styles.container} >

            <MyHeader title={transactionMode === LIGHTNING_MODE ? Language.receive_lightning : Language.receive_bitcoin} />
            <ScrollView>
              <View style={{ flex: 1, width: '100%', paddingHorizontal: scaler(20), paddingVertical: scaler(5) }} >
                  {/* <Dropdown
                      containerStyle={{ borderRadius: 10 }}
                      onChange={(item) => { item?.value === "Bitcoin" ? setModeAndText(BTC_MODE, 'Generate Bitcoin Address') : setModeAndText(LIGHTNING_MODE, 'Generate Lightning Invoice') }}
                      data={[
                          { label: 'Bitcoin', value: 'Bitcoin' },
                          { label: 'Lightning', value: 'Lightning' },
                      ]}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      renderItem={(item) => (
                          item?.value === "Bitcoin" ?
                              <DropModeButtons borderColor={transactionMode === BTC_MODE ? colors.colorBlackText : colors.colorWhite} backgroundColor={transactionMode === BTC_MODE ? colors.colorWhite : colors.colorTextInputBackground} iconSource={Images.ic_bitcoin} title='Bitcoin' subtitle='BTC' />
                              :
                              <DropModeButtons borderColor={transactionMode === LIGHTNING_MODE ? colors.colorBlackText : colors.colorWhite} backgroundColor={transactionMode === LIGHTNING_MODE ? colors.colorWhite : colors.colorTextInputBackground} iconSource={Images.ic_lightning} title='Lightning' subtitle='BTC' />
                      )}
                  /> */}
                  {/* mode selection */}
                  <View>
                      {
                          editMode == false ?
                              <TouchableOpacity onPress={() => { setEditMode(true) }} style={{ marginBottom: scaler(20), backgroundColor: colors.colorTextInputBackground, borderRadius: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                  {
                                      transactionMode === BTC_MODE ?
                                          <DropModeButtons borderColor={transactionMode === BTC_MODE ? colors.colorBlackText : colors.colorWhite} backgroundColor={transactionMode === BTC_MODE ? colors.colorWhite : colors.colorTextInputBackground} iconSource={Images.ic_bitcoin} title={Language.bitcoin} subtitle='BTC' />
                                          :
                                          <DropModeButtons borderColor={transactionMode === LIGHTNING_MODE ? colors.colorBlackText : colors.colorWhite} backgroundColor={transactionMode === LIGHTNING_MODE ? colors.colorWhite : colors.colorTextInputBackground} iconSource={Images.ic_lightning} title={Language.lightning} subtitle='BTC' />
                                  }
                                  <Icon name="caretdown" size={30} color="#000" style={{ flex: 1, textAlign: "center" }} />
                              </TouchableOpacity>
                              :
                              <View style={{ backgroundColor: colors.colorTextInputBackground, borderRadius: 15 }}>
                                  <TouchableOpacity onPress={() => { setModeAndText(BTC_MODE, Language.generate_bitcoin_address) }}>
                                      <DropModeButtons borderColor={transactionMode === BTC_MODE ? colors.colorBlackText : colors.colorWhite} backgroundColor={transactionMode === BTC_MODE ? colors.colorWhite : colors.colorTextInputBackground} iconSource={Images.ic_bitcoin} title={Language.bitcoin} subtitle='BTC' />
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={() => { setModeAndText(LIGHTNING_MODE, Language.generate_bitcoin_invoice) }}>
                                      <DropModeButtons borderColor={transactionMode === LIGHTNING_MODE ? colors.colorBlackText : colors.colorWhite} backgroundColor={transactionMode === LIGHTNING_MODE ? colors.colorWhite : colors.colorTextInputBackground} iconSource={Images.ic_lightning} title={Language.lightning} subtitle='BTC' />
                                  </TouchableOpacity>
                              </View>

                      }
                  </View>
                  {/* current balance */}
                  <View style={{ marginBottom: scaler(10) }}>
                      <Text style={styles.balanceLabel}>
                          {Language.current_balance}:
                      </Text>
                      {/* current balance in bitcoin and usd */}
                      <Text style={styles.balanceText}> {currentBalance} BTC | {currencyBalance.toFixed(2)} {currentCurrency}</Text>
                  </View>
                  <View>
                      {/* amount */}
                      <TextInput
                          placeholder={transactionMode == LIGHTNING_MODE ? Language.add_amount_in + " " + currentCurrency : Language.add_amount_in + " " + currentCurrency + " " + Language.optional_tag}
                          borderColor={colors.colorTextInputBackground}
                          backgroundColor={colors.colorTextInputBackground}
                          name={'bitcoinAmount'}
                          disabled={transactionMode == BTC_MODE}
                          rules={{
                              validate: (v: number) => {
                                  if (!v) {
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
                          disabled={transactionMode == BTC_MODE}
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
                      {
                          transactionMode === LIGHTNING_MODE && buttonState !== 2 &&
                          <View style={{ position: "absolute", width: scaler(180), height: scaler(180), justifyContent: "center", alignItems: "center", padding: scaler(30), backgroundColor: "rgba(0,0,0, 0.7)", zIndex: 1 }}>
                              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                                  {Language.click_on_generate}
                              </Text>
                          </View>
                      }
                      <QRCode
                          value={qrCodeValue}
                          size={scaler(150)}
                      />
                  </View>
                  {/* show bitcoin address or lightning invoice */}
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      <TextInput
                          containerStyle={{ flex: 1, justifyContent: 'flex-end', width: '90%', borderRadius: 10, height: scaler(70), borderColor: colors.colorWhite }}
                          placeholder={transactionMode === LIGHTNING_MODE ? Language.lightning_invoice : Language.bitcoin_address}
                          borderColor={colors.colorTextInputBackground}
                          backgroundColor={colors.colorTextInputBackground}
                          name={'bitcoinAddressOrInvoice'}
                          value={btcAddressOrLnInvoice}
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
                  {
                      buttonState === 2 ?
                          <Button
                              containerStyle={{ flex: 1, width: '100%', justifyContent: 'flex-start', marginTop: scaler(30) }}
                              title={Language.finish}
                              onPress={() => { NavigationService?.goBack() }}
                              paddingVertical={scaler(10)}
                          />
                          :
                          <Button
                              disabled={buttonState === 0}
                              containerStyle={{ flex: 1, width: '100%', justifyContent: 'flex-start', marginTop: scaler(30) }}
                              title={Language.generate}
                              onPress={() => generateAddressOrInvoice()}
                              paddingVertical={scaler(10)}
                          />
                  }
              </View>
            </ScrollView>
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
