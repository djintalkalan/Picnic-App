import { useFocusEffect } from '@react-navigation/native';
import { _authorizeMembership, _captureMembership, _getActiveMembership } from 'api';
import { setLoadingAction } from 'app-store/actions';
import { Images } from 'assets/Images';
import { Button, Text, useStatusBar } from 'custom-components';
import Database, { useDatabase } from 'database/Database';
import { add } from 'date-fns';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { EmitterSubscription, Image, ImageBackground, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as InAppPurchases from 'react-native-iap';
import { requestPurchase } from 'react-native-iap';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { dateFormat, NavigationService, scaler, stringToDate, _showSuccessMessage } from 'utils';

const productIds = [
    'y_payment',
    'm_payment'
];

const subscriptionIds = [
    'ct_member',
];


const Subscription: FC = (props: any) => {

    const dispatch = useDispatch();

    const [subscriptions, setSubscriptions] = useState<Array<InAppPurchases.Subscription>>([])
    const [products, setProducts] = useState<Array<InAppPurchases.Product>>([])
    const { pushStatusBarStyle, popStatusBarStyle } = useStatusBar()
    const [userData] = useDatabase("userData")


    const initializeIAPConnection = useCallback(async () => {
        await InAppPurchases.initConnection()
            .then(async (connection) => {
                console.log('IAP connection result', connection);
                getItems();
            })
            .catch((err) => {
                console.log(`IAP connection ERROR ${err.code}`, err.message);
            });
    }, [])

    const closeConnection = useCallback(async () => {
        await InAppPurchases.endConnection()
            .then(async () => {
                console.log('IAP connection closed');
            })
            .catch((err) => {
                console.log(`IAP closing connection ERROR ${err.code}`, err.message);
            });
    }, [])

    const getItems = useCallback(async () => {
        try {
            const subscriptions = await InAppPurchases.getSubscriptions(subscriptionIds);
            console.log('ALL SUBSCRIPTIONS ', subscriptions);
            if (subscriptions?.length) {
                setSubscriptions(subscriptions)
            }

            const products = await InAppPurchases.getProducts(productIds);
            console.log('ALL PRODUCTS ', products);
            if (products?.length) {
                setProducts(products)
            }
        } catch (err) {
            console.log("IAP error", err);
        }

    }, [])


    useEffect(() => {
        const purchaseUpdateSubscription: EmitterSubscription = InAppPurchases.purchaseUpdatedListener(handlePurchase);
        const purchaseErrorSubscription: EmitterSubscription = InAppPurchases.purchaseErrorListener(handleError);
        initializeIAPConnection();
        return () => {
            closeConnection();
            purchaseUpdateSubscription?.remove();
            purchaseErrorSubscription?.remove();
        }
    }, []);

    const handlePurchase = useCallback(async (purchase: InAppPurchases.ProductPurchase) => {
        console.log("purchase", purchase);
        const receipt = purchase?.transactionReceipt;
        if (receipt) {
            try {
                const consumeItem = Platform.OS === "ios";
                dispatch(setLoadingAction(true))
                _authorizeMembership({
                    transaction_id: purchase?.transactionId,
                    transaction_receipt: purchase?.transactionReceipt,
                    type: purchase?.productId == 'm_payment' ? "monthly" : "yearly",
                    expire_at: dateFormat(add(new Date(), purchase?.productId == 'm_payment' ? { months: 1 } : { years: 1 }), "YYYY-MM-DD"),
                    payment_date: dateFormat(new Date(), "YYYY-MM-DD"),
                    // transaction_date:purchase?.transactionDate,
                    device: Platform.OS
                }).then(async (res) => {
                    if (res?.status == 200 && res?.data) {
                        await InAppPurchases.finishTransaction(purchase, consumeItem);
                        _captureMembership({
                            _id: res?.data?._id
                        }).then((res) => {
                            if (res?.status == 200) {
                                continueToMemberShip(res?.message)
                            }
                        })
                        dispatch(setLoadingAction(false))
                    }
                }).catch(e => {
                    console.log(e)
                    dispatch(setLoadingAction(false))
                })

            } catch (ackErr) {
                console.log('ackErr IN-APP >>>>', ackErr);
            }
        }
    }, []
    )

    const handleError = useCallback((error: InAppPurchases.PurchaseError) => {
        switch (error) {
            case InAppPurchases.IAPErrorCode.E_DEFERRED_PAYMENT:
                console.log("User does not have permissions to buy but requested parental approval (iOS only)");
                break;
            case InAppPurchases.IAPErrorCode.E_NETWORK_ERROR:
            case InAppPurchases.IAPErrorCode.E_SERVICE_ERROR:
            case InAppPurchases.IAPErrorCode.E_REMOTE_ERROR:
                console.log("Lost internet connection. Try again with a stable connection.");
                break;
            case InAppPurchases.IAPErrorCode.E_BILLING_RESPONSE_JSON_PARSE_ERROR:
                console.log("Billing service was not reached. Check again later.");
                break;
            case InAppPurchases.IAPErrorCode.E_ITEM_UNAVAILABLE:
                console.log("Memberships are unavailable at the moment. Check again later.");
                break;
            case InAppPurchases.IAPErrorCode.E_DEVELOPER_ERROR:
                console.log("Email us! You found a mistake we did!");
                break;
            case InAppPurchases.IAPErrorCode.E_ALREADY_OWNED:
                console.log("You're already a member!");
                break;
            default:
                console.log("Something went wrong, try again later or contact our team.");
                break;
        }
        console.log('purchaseErrorListener IN-APP>>>>', error);
    }, [])

    useFocusEffect(useCallback(() => {
        pushStatusBarStyle({ backgroundColor: '#E9FFF3', barStyle: 'dark-content' })
        return () => {
            popStatusBarStyle()
        }
    }, []))

    // console.log('product', products)

    const callPurchase = useCallback((i) => {
        dispatch(setLoadingAction(true))
        _getActiveMembership().then(res => {
            dispatch(setLoadingAction(false))
            if (res?.status == 200) {

                const expireAt = stringToDate(res?.data?.expire_at, "YYYY-MM-DD");
                // if (expireAt >= new Date()) {
                if (expireAt < new Date() || !res.data) {
                    requestPurchase(productIds[i], false)
                } else continueToMemberShip("Your are already a member")

            }
        }).catch(e => {
            console.log(e);
            dispatch(setLoadingAction(false))
        })
    }, [])

    const continueToMemberShip = useCallback((message: string) => {
        _showSuccessMessage(message)
        Database.setUserData({ ...Database.getStoredValue("userData"), is_premium: true })
        props?.route?.params?.data?.isFreeEvent ?
            props?.route?.params?.onSubscription(props?.route?.params?.data) :
            NavigationService.replace('CreateEvent3', { data: props?.route?.params?.data })
        /// rest thing


    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, marginHorizontal: scaler(16), marginVertical: scaler(20) }} >
                <TouchableOpacity onPress={() => NavigationService.goBack()}>
                    <Image source={Images.ic_close_subscription} style={styles.cancelView} />
                </TouchableOpacity>
                <Text style={styles.joinText} >{Language.join_us}</Text>
                <ImageBackground source={Images.ic_oval_shape}
                    style={styles.ovalStyle} resizeMode='contain'>
                    <Text style={[styles.joinText, { fontStyle: 'italic' }]} >{Language.here}</Text>
                    {/* </View> */}
                </ImageBackground>
                <View style={[styles.listStyle, { marginTop: scaler(30) }]}>
                    <Image source={Images.ic_list_dot} style={styles.dotView} />
                    <Text style={styles.listText}> {Language.members_can_host_events},</Text>
                </View>
                <View style={styles.listStyle}>
                    <Image source={Images.ic_list_dot} style={styles.dotView} />
                    <Text style={styles.listText}> {Language.get_access_to_premium_features}</Text>
                </View>
                <View style={styles.listStyle}>
                    <Image source={Images.ic_list_dot} style={styles.dotView} />
                    <Text style={styles.listText}> {Language.and_other_exclusive_offers}</Text>
                </View>
            </View>

            {/* {subscriptions?.map((subscription, index) => {
                return <View key={index} style={{ flex: 1 }} >
                    <Text>{subscription?.productId}</Text>
                    <Button title='Subscribe now' onPress={() => requestSubscription(subscription?.productId, true)} />
                </View>
            })} */}
            <View style={{ margin: scaler(20) }}>
                <Button title='Join now for $18 a year' onPress={() => callPurchase(0)} />
                <Text onPress={() => callPurchase(1)} style={{ fontWeight: '700', fontSize: scaler(14), alignSelf: 'center', marginTop: scaler(15) }}>or try membership at $1.99 a month</Text>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9FFF3',
        overflow: 'hidden',
    },
    cancelView: {
        height: scaler(36),
        width: scaler(36),
        alignSelf: 'flex-end',
        marginBottom: scaler(10)
    },
    listStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: scaler(15),
        marginBottom: scaler(16)
    },
    dotView: {
        height: scaler(8),
        width: scaler(8),
        marginRight: scaler(10)
    },
    listText: {
        fontWeight: '400',
        fontSize: scaler(17),
        color: 'rgba(2, 54, 60, 1)'
    },
    joinText: {
        fontSize: scaler(70),
        fontWeight: '500',
        alignSelf: 'center',
        color: 'rgba(2, 54, 60, 1)'
    },
    ovalStyle: {
        height: scaler(130),
        width: scaler(250),
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    }
})

export default Subscription;

