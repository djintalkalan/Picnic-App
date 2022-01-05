import { Button, Text } from 'custom-components';
import React, { FC, useEffect, useState } from 'react';
import { EmitterSubscription, SafeAreaView, View } from 'react-native';
import * as RNIap from 'react-native-iap';

const productIds = [
    'ct_member',
];
let purchaseUpdateSubscription: EmitterSubscription | null = null;

let purchaseErrorSubscription: EmitterSubscription | null = null;

const Subscription: FC = () => {
    const [products, setProducts] = useState([])

    // useEffect(() => {
    //     console.log(productId)
    //     IAP.getProducts(productId).then(
    //         res => setProducts(res)
    //     ).catch((err) => console.log(err))

    //     const purchaseUpdateSubscription = IAP.purchaseUpdatedListener((purchase) => {
    //         const receipt = purchase.transactionReceipt;
    //         if (receipt) {
    //             //backend call
    //             IAP.finishTransaction(purchase);
    //         }
    //     })

    //     return () => {
    //         purchaseUpdateSubscription.remove();
    //     }
    // }, [])

    useEffect(() => {
        initilizeIAPConnection();
    }, []);

    const initilizeIAPConnection = async () => {
        await RNIap.initConnection()
            .then(async (connection) => {
                console.log('IAP result', connection);
                getItems();
            })
            .catch((err) => {
                console.warn(`IAP ERROR ${err.code}`, err.message);
            });
    }

    const getItems = async () => {
        try {
            console.log("itemSubs ", productIds);
            const Products = await RNIap.getSubscriptions(productIds);
            console.log(' IAP Su', Products);
            if (Products.length !== 0) {
                setProducts(Products)
            }
        } catch (err) {
            console.warn("IAP error", err?.code, err.message, err);
            //   setError(err.message);
        }

    };


    useEffect(() => {
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
            async (purchase) => {
                console.log("purchase", purchase);
                const receipt = purchase.transactionReceipt;
                if (receipt) {
                    try {
                        await RNIap.finishTransaction(purchase, true);
                    } catch (ackErr) {
                        console.log('ackErr INAPP>>>>', ackErr);
                    }
                }
            },
        );

        purchaseErrorSubscription = RNIap.purchaseErrorListener(
            (error) => {
                console.log('purchaseErrorListener INAPP>>>>', error);
            },
        );

        return (() => {
            if (purchaseUpdateSubscription) {
                purchaseUpdateSubscription.remove();
                purchaseUpdateSubscription = null;
            }
            if (purchaseErrorSubscription) {
                purchaseErrorSubscription.remove();
                purchaseErrorSubscription = null;
            }
        });
    }, []);


    // console.log('product', products)

    return (
        <SafeAreaView>
            <View>
                <Text >Subscribe here</Text>
                {products?.map(product => {
                    <View>
                        <Text>{product}</Text>
                        <Button title='Subscribe now' onPress={() => IAP.requestSubscription(product?.productId)} />
                    </View>
                })}
            </View>
        </SafeAreaView>
    );
}

export default Subscription;