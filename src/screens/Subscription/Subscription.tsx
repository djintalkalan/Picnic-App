import { Button, Text } from 'custom-components';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { EmitterSubscription, Linking, Platform, View } from 'react-native';
import * as InAppPurchases from 'react-native-iap';
import { requestSubscription } from 'react-native-iap';

const productIds = [
    'ct_member',
];


const Subscription: FC = () => {
    const [subscriptions, setSubscriptions] = useState<Array<InAppPurchases.Subscription>>([])

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
            const subscriptions = await InAppPurchases.getSubscriptions(productIds);
            console.log('ALL SUBSCRIPTIONS ', subscriptions);
            if (subscriptions?.length) {
                setSubscriptions(subscriptions)
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
                await InAppPurchases.finishTransaction(purchase, consumeItem);
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


    // console.log('product', products)

    return (
        <View style={{ flex: 1 }} >
            <Text >Subscribe here</Text>
            {subscriptions?.map((subscription, index) => {
                return <View key={index} style={{ flex: 1 }} >
                    <Text>{subscription?.productId}</Text>
                    <Button title='Subscribe now' onPress={() => requestSubscription(subscription?.productId, true)} />
                </View>
            })}
            <Button title='Cancel Subscription' onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')} />

        </View>
    );
}

export default Subscription;