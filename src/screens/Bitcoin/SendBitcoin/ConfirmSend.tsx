import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { Dispatch, useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { colors } from 'assets/Colors';
import { TextInput } from 'custom-components/TextInput/TextInput';
import Language from 'src/language/Language';
import { NavigationService, scaler, _showSuccessMessage, _showErrorMessage } from 'utils';
import SwipeButton from 'rn-swipe-button';
import { Images } from 'assets';
import LightningService from 'src/lightning/LightningService';
import { setLoadingAction } from "app-store/actions";
import { useDispatch } from 'react-redux';
import { RecommendedFees, ReverseSwapPairInfo } from '@breeztech/react-native-breez-sdk';
import { set } from 'lodash';

let dispatch: Dispatch<any>;

const RightArrow = () => {
  return (
    <View style={{ width: 100, height: 30, backgroundColor: '#C70039', borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#ffffff' }}>{Language.checkout}</Text>
    </View>
  );
};

interface Props {
  destination: string,
  btcAmount: number,
  exchangeRate: number,
  currency: string,
  close: () => void,
}

const ConfirmSend: React.FC<Props> = ({
  destination,
  btcAmount,
  exchangeRate,
  currency,
  close }) => {

  // get the dispatch function  
  dispatch = useDispatch();


  const [swapFees, setSwapFees] = useState<ReverseSwapPairInfo>()
  const [feeInfo, setFeeInfo] = useState<RecommendedFees>()
  const [fees, setFees] = useState<number>(0)
  const isOnChain = destination.startsWith("lnbc") ? false : true

  const swipeConfirm = async (destination: string, amount: string) => {
    console.log("swipeConfirm", destination)


    // send lightning payment
    if (destination.startsWith("lnbc")) {
      console.log("pay lightning: ", destination)
      try {
        dispatch(setLoadingAction(true));
        let res = await LightningService.sendPayment(destination)
        console.log("res", res)
        dispatch(setLoadingAction(false));
      } catch (error: any) {
        console.log(`Error: ${error.message}`)
        // console.log("error", error.message.data)
        dispatch(setLoadingAction(false));
        if (error.message.includes('Invoice expired')) {
          console.error('Invoice has expired. Cannot complete the payment.');
          return _showErrorMessage(Language.invoice_expired);
        } else if (error.message.includes("Self-payments are not supported")) {
          return _showErrorMessage(Language.self_payment_not_supported);
        } else {
          console.error('An error occurred:', error.message);
          return _showErrorMessage(Language.something_went_wrong);
          // Handle other errors or rethrow the error
        }
      }
    }
    // send bitcoin payment
    else {
      console.log("pay bitcoin: ", destination)
      console.log("amount: ", amount)

      let amountInSats = Math.floor(Number.parseFloat(amount) * 100_000_000)

      console.log("amountInSats: ", amountInSats)
      // let feeInfo = await LightningService.getFees();
      // console.log("feeInfo", feeInfo)
      if (feeInfo && swapFees) {
        if (amountInSats < swapFees.min) {
          console.log("amount is too small")
          return _showErrorMessage(Language.amount_to_small + swapFees.min + " sats" + Language.try_lightning_instead)
          // return
        }
        else {
          dispatch(setLoadingAction(true));

          console.log("fees: ", fees)
          let total = Math.floor(amountInSats + fees)
          // console.log("feeRate", feeRate)
          let satsPerVByte = feeInfo.hourFee
          try {

            const _swapFees = await LightningService.getSwapFees(amountInSats);
            console.log("total ", total)
            console.log("destination ", destination)
            console.log("swapFees ", _swapFees)
            console.log("satsPerVByte", satsPerVByte);
            if (_swapFees) {
              console.log("sendOnChain: ", total, destination, _swapFees, satsPerVByte)
              let res = await LightningService.sendOnChain(
                total,
                destination,
                _swapFees,
                satsPerVByte)
            } else {
              dispatch(setLoadingAction(false));
              return _showErrorMessage(Language.something_went_wrong_try_again);
            }
          } catch (error) {
            console.log("error", error)
            dispatch(setLoadingAction(false));
            return _showErrorMessage(Language.breez_onchain_error)
          }

          // console.log("sendOnChain: ", res)
          dispatch(setLoadingAction(false));
        }
      }
    }

    _showSuccessMessage(Language.payment_sent_successfully)

    NavigationService.navigate('ListBitcoinTransactions')
  }

  useEffect(() => {
    dispatch(setLoadingAction(false));
    async function setupState() {
      if (isOnChain) {
        try {
          const swapFees = await LightningService.getSwapFees(btcAmount * 100_000_000);
          const feeInfo = await LightningService.getFees();

          if (swapFees !== null) {
            setSwapFees(swapFees)
            setFees(swapFees.feesLockup + swapFees.feesClaim + Math.round(btcAmount * 100_000_000) * (swapFees.feesPercentage / 100))
          }
          else {
            close();
            return _showErrorMessage(Language.amount_to_small_try_lightning)
          }

          if (feeInfo !== null) {
            setFeeInfo(feeInfo)
          }

          console.log("swapFees", swapFees)
          console.log("feeInfo", feeInfo)
        } catch (error) {
          console.log("breez-sdk error: ", error)
        }
      } else {
        setFees(0)
      }
    }
    setupState();
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.back}>{Language.send_from_picnic_groups}</Text>
      {/* <Text>ConfirmSend</Text> */}
      <Text style={styles.heading}>
        {((destination)?.toLowerCase())?.includes('lnbc') ? Language.lightning_invoice : Language.destination_address}
      </Text>
      <TextInput
        containerStyle={{ width: '100%', borderRadius: 10, height: scaler(70), borderColor: colors.colorPlaceholder }}
        placeholder={Language.bitcoin_address_or_lightning_invoice}
        borderColor={colors.colorTextInputBackground}
        backgroundColor={colors.colorTextInputBackground}
        name={'bitcoinAddressOrInvoice'}
        value={destination}
        multiline={true}
        editable={false}
      />
      {/* Transfer summary */}
      <Text style={styles.heading}>
        {Language.transfer_summary}
      </Text>
      {/* <View style={styles.informationContainer}>
        <Text style={styles.subHeader}>Effective date?????</Text>
        <Text style={styles.subHeader}>04/19/2023</Text>
      </View> */}
      <View style={styles.divider}></View>
      {/* Withdrawal Amount */}
      <View style={[styles.informationContainer, { alignItems: "flex-start" }]}>
        <Text style={styles.heading}>{Language.amount_to_send}</Text>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.heading, { color: '#555', fontWeight: "bold" }]}>{btcAmount?.toFixed(6)} BTC</Text>
          {exchangeRate && <Text style={styles.heading}>{"($" + (btcAmount * exchangeRate)?.toFixed(2) + " " + currency?.toUpperCase() + ")"}</Text>}
        </View>
      </View>
      {/* Withdrawal fee */}
      {isOnChain &&
        <View style={styles.informationContainer}>
          <Text style={styles.heading}>{Language.fees}</Text>
          {
            fees ?
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.heading, { color: '#555', fontWeight: "bold" }]}>{(fees / 100_000_000)?.toFixed(6)} BTC</Text>
                {exchangeRate && <Text style={styles.heading}>{"($" + (Number(((fees / 100_000_000) * exchangeRate)))?.toFixed(2) + " " + currency?.toUpperCase() + ")"}</Text>}
              </View>
              :
              ''
          }
        </View>
      }

      <View style={styles.divider}></View>
      {/* Total */}
      <View style={[styles.informationContainer, { alignItems: "flex-start" }]}>
        <Text style={styles.heading}>{Language.total}</Text>
        <View style={{ alignItems: "flex-end" }}>
          {fees ?
            <Text style={[styles.heading, { color: '#555', fontWeight: "bold" }]}>{(btcAmount + (fees / 100_000_000))?.toFixed(6)} BTC</Text>
            : <Text style={[styles.heading, { color: '#555', fontWeight: "bold" }]}>{(btcAmount)?.toFixed(6)} BTC</Text>}
          {exchangeRate && <Text style={styles.heading}>{"($" + (fees ? Number(((btcAmount + (fees / 100_000_000)) * exchangeRate)?.toFixed(2)) : Number((btcAmount * exchangeRate)?.toFixed(2))?.toFixed(2)) + " " + currency?.toUpperCase() + ")"}</Text>}
        </View>
      </View>
      {/* Slider Button */}
      <SwipeButton
        containerStyles={{
          borderRadius: 10,
          marginVertical: scaler(20),
          borderWidth: 0,
        }}
        enableRightToLeftSwipe
        title={Language.confirm_and_send}
        titleColor={colors.colorWhite}
        railStyles={{
          borderRadius: 10,
          // borderWidth: 0,
        }}
        thumbIconStyles={{
          borderRadius: 10
        }}
        disabled={!isOnChain ? false : fees ? false : true}
        railBackgroundColor={colors.ColorButtonSliderBackground}
        railBorderColor={colors.ColorButtonSliderBackground}
        thumbIconBackgroundColor={colors.colorPrimary}
        thumbIconBorderColor={colors.colorPrimary}
        railFillBackgroundColor={colors.colorPrimary}
        railFillBorderColor={colors.colorPrimary}
        thumbIconImageSource={Images.iC_rightArrow}
        onSwipeSuccess={async () => {
          await swipeConfirm(destination, btcAmount?.toString())
          close()
        }}
      />
      {/* Footer */}
      <Text style={{ ...styles.subHeader, textAlign: 'center' }}>{Language.btc_transaction_permanent}</Text>

    </View>

  );
};

export default ConfirmSend;

const styles = StyleSheet.create({
  container: {
    padding: scaler(8),
    maxWidth: '90%',
  },
  heading: {
    fontFamily: 'Poppins',
    fontSize: scaler(14),
    fontWeight: '500',
    lineHeight: scaler(24),
    letterSpacing: scaler(0),
    textAlign: 'left'
  },
  subHeader: {
    fontFamily: 'Poppins',
    fontSize: scaler(12),
    fontWeight: '400',
    lineHeight: scaler(20),
    letterSpacing: scaler(0),
    textAlign: 'left',
    color: colors.colorPlaceholder,
  },
  back: {
    fontFamily: 'Poppins',
    fontSize: scaler(12),
    fontWeight: '400',
    lineHeight: scaler(20),
    letterSpacing: scaler(0),
    textAlign: 'left',
    marginBottom: scaler(20),
  },
  informationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: scaler(8)
  },
  divider: {
    alignSelf: 'center',
    height: scaler(1),
    width: '100%',
    borderTopWidth: scaler(0.5),
    borderTopColor: colors.colorGreyText
  }
});