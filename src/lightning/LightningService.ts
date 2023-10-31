import {
    BreezEvent,
    EnvironmentType,
    LnInvoice,
    NodeState,
    Rate,
    defaultConfig,
    fetchFiatRates,
    mnemonicToSeed,
    nodeInfo,
    receiveOnchain,
    receivePayment,
    parseInvoice,
    sendPayment,
    Payment,
    listPayments,
    PaymentTypeFilter,
    NodeConfig,
    NodeConfigVariant,
    inProgressSwap,
    connect,
    SwapInfo,
    fetchReverseSwapFees,
    ReverseSwapPairInfo,
    inProgressReverseSwaps,
    sendOnchain,
    ReverseSwapInfo,
    recommendedFees,
    RecommendedFees,
    ReceivePaymentResponse
} from "@breeztech/react-native-breez-sdk";
import { config } from 'api';
import { _requestAmountOwed, _submitBolt11, _requestBip39 } from 'api/APIProvider';
import { ca, mn } from "date-fns/locale";
// import Payment from "screens/Event/Payment";
import Database, { IGreenlightCredentials } from 'src/database/Database';
import { Buffer } from 'buffer';

const MNEMONIC = "mnemonic"
const GREENLIGHT_CREDENTIALS = "greenlightCreds"

/**
 * this is a service that incapsulates the brez sdk
 */
const LightningService = {

    /** 
     * load the Breez SDK with the production certificate 
     * 
     * @certificate: the certificate
     * @privateKey: the private key
     * 
     * @returns nodeInfo | null
     */
    initWithProductionCertificate: async (certificate: string, privateKey: string): Promise<NodeState | null> => {
        console.log("----- initWithProductionCertificate -----")


        // get mnemonic
        let mnemonic = Database.getStoredValue(MNEMONIC, '')
        if (!mnemonic) {
            let res = await _requestBip39();
            mnemonic = res.data.mnemonic;
            Database.setMnemonic(mnemonic)
        }
        // let mnemonic = "fiction bleak picture wrong maple draft monitor energy morning enact napkin farm buddy blame net";
        console.log("mnemonic: " + mnemonic);


        // get seed
        const seed = await mnemonicToSeed(mnemonic)
        console.log("seed: " + seed);


        console.log("certificate: " + certificate);
        console.log("privateKey: " + privateKey);

        let deviceCert: number[] = Array.from(new Uint8Array(Buffer.from(certificate, 'base64')));
        let deviceKey: number[] = Array.from(new Uint8Array(Buffer.from(privateKey, 'base64')))

        console.log("deviceCertificate: ", deviceCert);
        console.log("deviceKey: ", deviceKey);

        // setup a NodeConfig
        const nodeConfig: NodeConfig = {
            type: NodeConfigVariant.GREENLIGHT,
            config: {
                partnerCredentials: {
                    deviceCert,
                    deviceKey
                }
            }
        }

        console.log("nodeConfig: ", nodeConfig);

        let breezConfig = await defaultConfig(EnvironmentType.PRODUCTION, config.BREEZ_API_KEY, nodeConfig)

        console.log("breezConfig: ", breezConfig);

        // start breez service
        try {
            await connect(breezConfig, seed, (event: BreezEvent) => {
                console.log(`breez skd received event ${event.type}`)
            });
            console.log("----- Breez service started -----");
        }
        catch (error) {
            console.error("breez service failed to start")
            console.error(error);
        }

        try {
            let nodeinfo = await nodeInfo();
            console.log("nodeinfo: ", nodeinfo);

            return nodeinfo;
        }
        catch (error) {
            console.error("failed to get Lightning Node Info")
            console.error(error);
        }

        return null;
    },


    /**
     * initialize breez sdk 
     * 
     * @inviteCode: the invite code
     * @mnemonic: the mnemonic
     * 
     * @returns nodeInfo | null
     */
    initWithInviteCode: async (inviteCode: string, mnemonic: string): Promise<NodeState | null> => {
        // Database.clearLightningStorage();

        console.log("mnemonic: " + mnemonic);

        // get seed
        const seed = await mnemonicToSeed(mnemonic)
        console.log("seed: " + seed);

        // setup a NodeConfig
        const nodeConfig: NodeConfig = {
            type: NodeConfigVariant.GREENLIGHT,
            config: {
                inviteCode: inviteCode,
            }
        }

        console.log("nodeConfig: ", nodeConfig);

        let breezConfig = await defaultConfig(EnvironmentType.PRODUCTION, config.BREEZ_API_KEY, nodeConfig)

        console.log("breezConfig: ", breezConfig);


        // start breez service
        try {
            const sdkServices = await connect(breezConfig, seed, (event: BreezEvent) => {
                console.log(`breez skd received event ${event.type}`)
            });
            console.log("sdkServices: ", sdkServices);
            console.log("----- Breez service started -----");
        }
        catch (error) {
            console.error("breez service failed to start")
            console.error(error);
        }

        let res = await LightningService.getNodeInfo();
        console.log("nodeInfo: ", res);

        return null;
    },


    getNodeInfo: async (): Promise<NodeState | null> => {
        try {
            let nodeinfo = await nodeInfo();
            return nodeinfo;
        }
        catch (error) {
            console.error("failed to get Lightning Node Info")
            console.error(error);
            return null;
        }
    },

    requestMnemonic: (): string => {
        var mnemonic: string = Database.getStoredValue(MNEMONIC, '')

        return mnemonic;
    },

    /* request payment owed */
    requestPayments: async (): Promise<any> => {
        try {
            let res = await _requestAmountOwed();
            console.log("requestPayments: ", res.data)
            let total = 0;
            let ids: string[] = [];
            let memo = "";
            console.log("res.data: ", res.data);
            for (let data of res.data) {
                console.log("data: ", data);
                total += data.total;
                memo += `${data.event_name[0]}: ${data.ids.length}, `;
                ids = [...ids, ...data.ids]
            }
            console.log("total: ", total);
            console.log("memo: ", memo);
            console.log("ids: ", ids);

            if (total > 0) {
                let bolt11 = await LightningService.generateBolt11Invoice(total, memo);
                console.log("bolt11: ", bolt11);
                let res = await _submitBolt11({ bolt11, ids });
                console.log("submitBolt11: ", res);
            }
        }
        catch (error) {
            return 0
        }
    },

    requestAmountOwedInSats: async (): Promise<any> => {
        try {
            let res = await _requestAmountOwed();
            console.log("requestAmountOwedInSats: ", res);
            return res.data;
        }
        catch (error) {
            return 0
        }
    },

    /**
     * return the current balance 
     * @returns balace
     */
    getBalance: async (): Promise<number> => {
        try {
            return (await nodeInfo()).channelsBalanceMsat;
        } catch (error) {
            console.log(JSON.stringify(error));
        }
        // just for safety if the error occurs
        return 0;
    },

    /**
     * get the BTC exchange rate
     * @returns exchange rate
     */
    fetchBTCToUSD: async (): Promise<number> => {
        // we add this try catch
        try {

            let currencies: Rate[] = await fetchFiatRates();
            console.log(`Currencies ${JSON.stringify(currencies)}`);
            const rate: number = currencies.find((currency) => currency.coin === "USD")?.value || 0;
            return rate

        } catch (error) {
            return 0
        }

    },

    fetchExchangeRate: async (currency: string): Promise<number> => {
        try {

            let currencieRates: Rate[] = await fetchFiatRates();
            console.log("currency:", currency.toUpperCase());
            console.log("currencies:", JSON.stringify(currencieRates));
            const rate = currencieRates.find((currencyRate) => {
                return currencyRate.coin === currency.toUpperCase()
            })

            if (rate) {
                return rate.value
            }
            return 0

        } catch (error) {
            return 0
        }

    },

    /**
     * generate a bolt11
     * @param amountSats: amount in sats 
     * @param description: memo 
     * @returns bolt11 
     */
    generateBolt11Invoice: async (amountSats: number, description: string): Promise<string> => {
        let invoice: ReceivePaymentResponse = await receivePayment({ amountSats, description });
        return invoice.lnInvoice.bolt11
    },

    pendingSwapIn: async (): Promise<SwapInfo | null> => {
        try {
            const swapInfo = await inProgressSwap()
            return swapInfo
        } catch (error) {
            console.log(JSON.stringify(error));
            return null;
        }
    },

    pendingSwapOut: async (): Promise<ReverseSwapInfo[] | null> => {
        try {
            const swaps = await inProgressReverseSwaps()
            return swaps;
        } catch (error) {
            console.log(error)
            return null;
        }
    },

    getSwapFees: async (sendAmountSat: number): Promise<ReverseSwapPairInfo | null> => {
        try {
            const currentFees: ReverseSwapPairInfo = await fetchReverseSwapFees({ sendAmountSat })
            return currentFees;
        } catch (error) {
            console.log(error)
            return null
        }
    },

    getFees: async (): Promise<RecommendedFees | null> => {
        try {
            const fees = await recommendedFees()
            return fees;
        } catch (error) {
            console.log(error)
            return null
        }
    },

    /**
     * generate a bitcoin address for receiving onchain payment 
     * @returns a bitcoin address
     */
    generateBitcoinAddress: async (): Promise<string> => {
        let swapInfo = await receiveOnchain({});
        return swapInfo.bitcoinAddress;
    },

    parseInvoice: async (bolt11: string): Promise<LnInvoice> => {
        return await parseInvoice(bolt11);
    },

    sendPayment: async (bolt11: string): Promise<Payment> => {
        return await sendPayment(bolt11);
    },

    sendOnChain: async (amount: number, address: string, feeInfo: ReverseSwapPairInfo, satPerVbyte: number): Promise<ReverseSwapInfo> => {
        const reverseSwapInfo: ReverseSwapInfo = await sendOnchain(amount, address, feeInfo.feesHash, satPerVbyte)
        return reverseSwapInfo;
    },

    /**
     * list all payments
     */
    listPayments: async (): Promise<Payment[]> => {
        let filter = PaymentTypeFilter.ALL
        let res = await listPayments({
            filter
        });
        return res;
    }
}

export default LightningService

