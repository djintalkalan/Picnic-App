import { _authorizeMembership, _captureMembership, _getActiveMembership } from 'api';
import { setLoadingAction } from 'app-store/actions';
import { Images } from 'assets/Images';
import { Button, Text } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import Database, { useDatabase } from 'database/Database';
import { add } from 'date-fns';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { EmitterSubscription, Image, ImageBackground, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { clearTransactionIOS, endConnection, ErrorCode as IAPErrorCode, finishTransaction, getSubscriptions, initConnection, PurchaseError, purchaseErrorListener, purchaseUpdatedListener, requestSubscription, Subscription as TSubscription, SubscriptionPurchase } from 'react-native-iap';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { dateFormat, NavigationService, scaler, stringToDate, _showErrorMessage, _showSuccessMessage } from 'utils';

// const productIds = Platform.OS == 'ios' ? [
//     'y_subscription',
//     'm_subscription'
// ] : [
//     "y_payment",
//     "m_payment"
// ];

const subscriptionIds = [
    'yearly_subscription',
    'monthly_subscription'
];


const Subscription: FC = (props: any) => {

    const dispatch = useDispatch();
    const loadingRef = useRef(false)
    const [restorable, setRestorable] = useState(true)

    const [subscriptions, setSubscriptions] = useState<Array<TSubscription>>([])
    // const [products, setProducts] = useState<Array<Product>>()

    const initializeIAPConnection = useCallback(async () => {
        await initConnection()
            .then(async (connection) => {
                console.log('IAP connection result', connection);
                getItems();
            })
            .catch((err) => {
                console.log(`IAP connection ERROR ${err.code}`, err.message);
            });
    }, [])

    const closeConnection = useCallback(async () => {
        await endConnection()
            .then(async () => {
                console.log('IAP connection closed');
            })
            .catch((err) => {
                console.log(`IAP closing connection ERROR ${err.code}`, err.message);
            });
    }, [])

    const getItems = useCallback(async () => {
        try {
            const subscriptions = await getSubscriptions({ skus: subscriptionIds });
            console.log('ALL SUBSCRIPTIONS ', subscriptions);
            if (subscriptions?.length) {
                setSubscriptions(subscriptions)
            } else {
                setSubscriptions([])
            }
        } catch (err) {
            console.log("IAP error", err);
        }
    }, [])


    useEffect(() => {
        // InAppPurchases?.clearProductsIOS && InAppPurchases?.clearProductsIOS()?.finally(initializeIAPConnection);
        let purchaseUpdateSubscription: EmitterSubscription
        let purchaseErrorSubscription: EmitterSubscription
        setTimeout(async () => {
            try {
                await clearTransactionIOS();
            } catch (e) {
                console.log("Clearing transaction error ", e);
            }
            purchaseUpdateSubscription = purchaseUpdatedListener(handlePurchase);
            purchaseErrorSubscription = purchaseErrorListener(handleError);
        }, 1000);
        initializeIAPConnection();
        // Database.setUserData({ ...Database.getStoredValue("userData"), is_premium: false })
        return () => {
            closeConnection();
            purchaseUpdateSubscription?.remove && purchaseUpdateSubscription?.remove();
            purchaseErrorSubscription?.remove && purchaseErrorSubscription?.remove();
        }
    }, []);

    const handlePurchase = useCallback(async (purchase: SubscriptionPurchase | null) => {
        if (!purchase || loadingRef.current) return
        try {
            loadingRef.current = true
            dispatch(setLoadingAction(true))
            let payload: any = {
                transaction_receipt: purchase.transactionReceipt,
                device: Platform.OS
            }
            if (Platform.OS == 'android') {
                payload = {
                    ...payload,
                    transaction_id: purchase?.transactionId,
                    type: purchase?.productId == subscriptionIds[1] ? "monthly" : "yearly",
                    expire_at: dateFormat(add(new Date(), purchase?.productId == subscriptionIds[1] ? { months: 1 } : { years: 1 }), "YYYY-MM-DD"),
                    payment_date: dateFormat(new Date(), "YYYY-MM-DD"),
                }
            }
            console.log("payload", payload);

            _authorizeMembership(payload).then(async (res) => {
                if (res?.status == 200 && res?.data) {
                    await finishTransaction({ purchase }) // ,consumeItem);
                    _captureMembership({
                        _id: res?.data?._id
                    }).then((res) => {
                        if (res?.status == 200) {
                            continueToMemberShip(res?.message)
                        }
                    })
                } else {
                    if (res?.status == 400) {
                        _showErrorMessage(res?.message)
                    }
                }
                dispatch(setLoadingAction(false))
                loadingRef.current = false
            }).catch(e => {
                console.log(e)
                dispatch(setLoadingAction(false))
                loadingRef.current = false
            })

        } catch (ackErr) {
            console.log('ackErr IN-APP >>>>', ackErr);
            dispatch(setLoadingAction(false))
            loadingRef.current = false
        }
    }, [])

    const handleError = useCallback((error: PurchaseError) => {
        switch (error?.code) {
            case IAPErrorCode.E_DEFERRED_PAYMENT:
                console.log("User does not have permissions to buy but requested parental approval (iOS only)");
                break;
            case IAPErrorCode.E_NETWORK_ERROR:
            case IAPErrorCode.E_SERVICE_ERROR:
            case IAPErrorCode.E_REMOTE_ERROR:
                console.log("Lost internet connection. Try again with a stable connection.");
                break;
            case IAPErrorCode.E_BILLING_RESPONSE_JSON_PARSE_ERROR:
                console.log("Billing service was not reached. Check again later.");
                break;
            case IAPErrorCode.E_ITEM_UNAVAILABLE:
                console.log("Memberships are unavailable at the moment. Check again later.");
                break;
            case IAPErrorCode.E_DEVELOPER_ERROR:
                console.log("Email us! You found a mistake we did!");
                break;
            case IAPErrorCode.E_ALREADY_OWNED:
                continueToMemberShip(Language.you_are_already_a_member)
                console.log("You're already a member!");
                break;
            default:
                console.log("Something went wrong, try again later or contact our team.");
                break;
        }
        console.log('purchaseErrorListener IN-APP>>>>', error);
    }, [])

    // console.log('product', products)

    const restorePurchase = useCallback(() => {
        dispatch(setLoadingAction(true))
        _getActiveMembership().then(res => {
            dispatch(setLoadingAction(false))
            console.log("Res", res);

            if (res?.status == 200) {
                let thisDate = stringToDate(dateFormat(new Date(), "YYYY-MM-DD"));

                let expireAt = res?.data?.expire_at ? stringToDate(res?.data?.expire_at, "YYYY-MM-DD") : thisDate;
                if (res?.data?.expire_at_unix) {
                    expireAt = new Date(parseInt(res?.data?.expire_at_unix))
                    thisDate = new Date()
                }
                // if (expireAt >= new Date()) {
                if (expireAt >= thisDate && res?.data?.type == 'trial') {
                    return
                }
                if (expireAt < thisDate || !res.data || (res?.data?.is_premium != undefined && !res?.data?.is_premium)) {
                    _showErrorMessage(Language.you_are_not_a_member)
                } else continueToMemberShip(Language.purchase_successfully_restored)
            }
        }).catch(e => {
            console.log(e);
            dispatch(setLoadingAction(false))
        })
    }, [])

    const callPurchase = useCallback(async (i) => {
        dispatch(setLoadingAction(true))
        // let restorable = false
        // await getAvailablePurchases().then(async (products) => {
        //     console.log("getAvailablePurchases", products?.length);
        // const lastProduct = products?.length > 1 ? products.reduce((p, c) => {
        //     if (p.transactionDate > c.transactionDate) {
        //         return p
        //     } else return c
        // }) : products?.length == 1 ? products[0] : null
        // if (!lastProduct) return
        // const { expiryDateMs } = await getData(lastProduct)
        // if (expiryDateMs) {
        //     if (new Date(expiryDateMs) >= new Date()) {
        //         restorable = true
        //     }
        // }
        // })
        _getActiveMembership().then(res => {
            dispatch(setLoadingAction(false))
            if (res?.status == 200) {

                let thisDate = stringToDate(dateFormat(new Date(), "YYYY-MM-DD"));
                let expireAt = res?.data?.expire_at ? stringToDate(res?.data?.expire_at, "YYYY-MM-DD") : thisDate;

                if (res?.data?.expire_at_unix) {
                    expireAt = new Date(parseInt(res?.data?.expire_at_unix))
                    thisDate = new Date()
                }
                // if (expireAt >= new Date()) {
                console.log("Calculating purchase");
                // res.data = null
                if (expireAt >= thisDate && res?.data?.type == 'trial') {
                    requestSubscription({ sku: subscriptionIds[i], andDangerouslyFinishTransactionAutomaticallyIOS: false }).catch(e => {
                        console.log("E", e);
                    })
                    return
                }
                if ((expireAt < thisDate || !res.data || (res?.data?.is_premium != undefined && !res?.data?.is_premium))) {
                    console.log("Requesting purchase");
                    if (true) {
                        requestSubscription({ sku: subscriptionIds[i], andDangerouslyFinishTransactionAutomaticallyIOS: false }).catch(e => {
                            console.log("E", e);
                        })
                        // .then(handlePurchase, handleError).catch((r) => {
                        //     console.log("catch", r);
                        //     dispatch(setLoadingAction(false))
                        // }).finally(() => {
                        //     console.log("Complete");
                        //     dispatch(setLoadingAction(false))

                        // })
                    }
                } else if (res?.data?.type == 'monthly' && i == 0) {
                    requestSubscription({ sku: subscriptionIds[i], andDangerouslyFinishTransactionAutomaticallyIOS: false }).catch(e => {
                        console.log("E", e);
                    })
                } else {
                    continueToMemberShip(Language.you_are_already_a_member)
                }
            }
        }).catch(e => {
            console.log(e);
            dispatch(setLoadingAction(false))
        })
    }, [handlePurchase])


    const continueToMemberShip = useCallback((message?: string) => {
        _showSuccessMessage(message)
        Database.setUserData({ ...Database.getStoredValue("userData"), is_premium: true })
        if (props?.route?.params?.from == 'settings') {
            NavigationService.goBack();
            props?.route?.params?.onSuccess && props?.route?.params?.onSuccess();
        }
        else {
            (props?.route?.params?.onSubscription && props?.route?.params?.onSubscription())
        }
    }, [])

    const [userData] = useDatabase('userData');

    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} >
                <View style={{ flex: 1, marginHorizontal: scaler(16), marginVertical: scaler(20) }} >
                    <TouchableOpacity onPress={() => NavigationService.goBack()}>
                        <Image source={Images.ic_close_subscription} style={styles.cancelView} />
                    </TouchableOpacity>
                    <Text style={styles.joinText} >{Language.join_us}</Text>
                    <ImageBackground imageStyle={{ resizeMode: 'contain' }} source={Images.ic_oval_shape}
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
                {subscriptions?.length ? <>
                    <View style={{ margin: scaler(20), justifyContent: 'flex-end' }}>
                        <Button title={Language.join_now_at} onPress={() => callPurchase(0)} />
                        <Text onPress={() => callPurchase(1)} style={{ fontWeight: '600', fontSize: scaler(14), alignSelf: 'center', marginTop: scaler(15) }}>{Language.or_try_our_membership_at}</Text>
                    </View>
                </> :
                    subscriptions && <View style={{ flex: 1 }} >
                        <Text style={{ fontSize: scaler(14), textAlign: 'center', alignSelf: 'center', marginHorizontal: scaler(20), color: "rgba(2, 54, 60, 1)" }}>{Language.in_app_unavailable}</Text>
                    </View>
                }
                {/* {products?.length ? <>
                    <View style={{ margin: scaler(20), justifyContent: 'flex-end' }}>
                        <Button title={Language.join_now_at} onPress={() => callPurchase(0)} />
                        <Text onPress={() => callPurchase(1)} style={{ fontWeight: '600', fontSize: scaler(14), alignSelf: 'center', marginTop: scaler(15) }}>{Language.or_try_our_membership_at}</Text>
                    </View>
                </> :
                    products && <View style={{ flex: 1 }} >
                        <Text style={{ fontSize: scaler(14), textAlign: 'center', alignSelf: 'center', marginHorizontal: scaler(20), color: "rgba(2, 54, 60, 1)" }}>{Language.in_app_unavailable}</Text>
                    </View>
                } */}
                {!userData?.is_premium ?
                    <Button containerStyle={{ marginHorizontal: scaler(20), }} title={Language.restore_purchase} onPress={() => {
                        restorePurchase()
                    }} /> : null}

            </KeyboardAwareScrollView>

        </SafeAreaViewWithStatusBar>
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
        justifyContent: 'center',
        resizeMode: 'contain'
    }
})

export default Subscription;