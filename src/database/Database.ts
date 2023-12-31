import { isEqual } from "lodash";
// import * as RNLocalize from "react-native-localize";
import { MMKVInstance, MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";
import { ILanguages, LanguageType } from "src/language/Language";
import { _showErrorMessage } from "utils";
import { ICurrency } from "utils/Constants";

export type LiteralUnion<T extends U, U = string> = T | (U & {});
export interface GooglePlaceData {
    description: string;
    id: string;
    matched_substrings: any;
    place_id: string;
    reference: string;
    structured_formatting: any;
}
interface GooglePlaceDetail {
    address_components: any[];
    adr_address: string;
    formatted_address: string;
    geometry: Geometry;
    icon: string;
    id: string;
    name: string;
    place_id: string;
    plus_code: any;
    reference: string;
    scope: 'GOOGLE';
    types: any[];
    url: string;
    utc_offset: number;
    vicinity: string;
}

interface Point {
    lat: number;
    lng: number;
}
interface Geometry {
    location: Point;
    viewport: {
        northeast: Point;
        southwest: Point;
    };
}


export interface IRecentSearches {
    data: GooglePlaceData,
    details?: GooglePlaceDetail | null,
    otherData: {
        city?: string
        state?: string
        country?: string
    } | null
}

export type StorageType = "userData" | "isLogin" | "firebaseToken" |
    "authToken" | "selectedLanguage" | "currentLocation" | "selectedLocation" |
    "recentSearches" | 'currencies' | 'socketConnected' | "searchHomeText" | "allLanguages" | "paypalConnection" |
    "greenlightCreds" | "mnemonic" | "inviteCode" | "selectedCurrency"
const StorageVariables = ["userData", "isLogin", "firebaseToken",
    "authToken", "selectedLanguage", "currentLocation", "selectedLocation",
    "recentSearches", "currencies", 'socketConnected', "searchHomeText", "allLanguages",
    "paypalConnection", "greenlightCreds", "mnemonic", "inviteCode", "selectedCurrency"]

export interface IPaypalConnection {
    paypal_merchant_id?: string
    paypal_primary_email?: string
    errorMessages?: any[]
    isPaypalConnected?: boolean
    actionUrl?: string
}

export interface ILocation {
    latitude: number
    longitude: number
    address?: {
        main_text: string,
        secondary_text: string
    } | null
    otherData?: {
        city?: string
        state?: string
        country?: string
    } | null
}

export interface IGreenlightCredentials {
    key?: Uint8Array
    certificate?: Uint8Array
}

type DataBaseType = {
    userData?: any
    isLogin?: boolean
    socketConnected?: boolean
    firebaseToken?: string
    authToken?: string
    mnemonic?: string
    inviteCode?: string
    selectedLanguage?: LanguageType
    currentLocation?: ILocation
    selectedLocation?: ILocation
    recentSearches?: Array<IRecentSearches>
    paypalConnection?: IPaypalConnection
    allLanguages?: ILanguages
    greenlightCreds?: IGreenlightCredentials
}

class Database {

    private static mInstance: Database

    static getInstance = () => {
        if (!this.mInstance) {
            this.mInstance = new Database()
        }
        return this.mInstance
    }


    static phoneStorage = new MMKVLoader().withEncryption().initialize();

    private socketStorage = new MMKVLoader().withEncryption().withInstanceID("socketStorage").initialize();
    private userDataStorage = new MMKVLoader().withEncryption().withInstanceID("userDataStorage").initialize();
    private otherDataStorage = new MMKVLoader().withEncryption().withInstanceID("otherDataStorage").initialize();
    private languageStorage = new MMKVLoader().withEncryption().withInstanceID("languageStorage").initialize();
    private currencyStorage = new MMKVLoader().withEncryption().withInstanceID("currencyStorage").initialize();
    private locationStorage = new MMKVLoader().withEncryption().withInstanceID("locationStorage").initialize();
    private lightningStorage = new MMKVLoader().withEncryption().withInstanceID("lightningStorage").initialize();


    DefaultCountry = 'US' // RNLocalize.getCountry() ?? 'US'

    public setLogin = (isLogin?: boolean) => {
        this.userDataStorage.setBool('isLogin', isLogin ?? false)
    }

    public setSocketConnected = (c?: boolean) => {
        this.socketStorage.setBool('socketConnected', c ?? false)
    }

    public setUserData = (userData?: any) => {
        this.userDataStorage.setMap('userData', userData ?? null)
    }

    public setAllLanguages = (languages: ILanguages) => {
        this.languageStorage.setMap('allLanguages', languages ?? null)
    }


    public setFirebaseToken = (token: string | null) => {
        this.userDataStorage.setString('firebaseToken', token ?? "")
    }

    public setAuthToken = (token: any) => {
        this.userDataStorage.setString('authToken', token ?? "")
    }

    public setSelectedLanguage = (language: LanguageType) => {
        this.languageStorage.setString('selectedLanguage', language)
    }

    public setSelectedCurrency = (currency: ICurrency) => {
        this.currencyStorage.setString('selectedCurrency', JSON.stringify(currency))
    }

    public setCurrentLocation = (location: ILocation) => {
        this.locationStorage.setMap('currentLocation', location)
    }

    public setSelectedLocation = (location: ILocation) => {
        this.locationStorage.setMap('selectedLocation', location)
    }

    public addInRecentSearches = (data: IRecentSearches) => {
        const oldData = (this.otherDataStorage.getArray("recentSearches") ?? []).filter((_: any) => !isEqual(_?.data?.place_id, data?.data?.place_id))
        this.otherDataStorage.setArray('recentSearches', [data, ...oldData])
    }

    public setMnemonic = (data: string) => {
        this.lightningStorage?.setString("mnemonic", data);
    }

    public setInviteCode = (data: string) => {
        this.lightningStorage?.setString("inviteCode", data);
    }

    public setGreenlightCreds = (data: IGreenlightCredentials) => {
        this.lightningStorage?.setMap("greenlightCreds", data)
    }

    public updatePaypalDetails = (data: IPaypalConnection) => {
        this.otherDataStorage?.setMap("paypalConnection", data)
    }

    /**
     * clear storage for lightning,
     * this is mostly for debugging purposes
     */
    public clearLightningStorage = () => {
        this.lightningStorage.clearStore()
    }


    getStorageForKey = (key?: StorageType): MMKVInstance => {
        switch (key) {
            case 'allLanguages':
            case 'selectedLanguage':
                return this.languageStorage

            case 'currentLocation':
            case 'selectedLocation':
                return this.locationStorage

            case 'authToken':
            case 'isLogin':
            case 'authToken':
            case 'userData':
            case 'firebaseToken':
                return this.userDataStorage

            case 'currencies':
            case 'recentSearches':
            case 'paypalConnection':
            case 'searchHomeText':
                return this.otherDataStorage

            case 'greenlightCreds':
            case 'mnemonic':
            case 'inviteCode':
                return this.lightningStorage

            case 'socketConnected':
                return this.socketStorage

            case 'selectedCurrency':
                return this.currencyStorage

            default:
                break;
        }
        return Database.phoneStorage
    }

    public setMultipleValues = (data: DataBaseType) => {
        Object.keys(data)?.forEach((key) => {
            switch (key) {
                case 'authToken':
                case 'firebaseToken':
                case 'selectedLanguage':
                    return this.getStorageForKey(key).setString(key, data[key] ?? "")

                case 'isLogin':
                case 'socketConnected':
                    return this.getStorageForKey(key).setBool(key, data[key] ?? false)

                case 'userData':
                case 'currentLocation':
                case 'selectedLocation':
                case 'allLanguages':
                case 'paypalConnection':
                    return this.getStorageForKey(key).setMap(key, data[key] ?? null)

                case 'recentSearches':
                    return this.getStorageForKey(key).setArray(key, data[key] ?? [])
            }
        })
    }

    public setOtherString = (key: string, value: string) => {
        this.otherDataStorage.setString(key, value)
    }

    public setOtherBool = (key: string, value: boolean) => {
        this.otherDataStorage.setBool(key, value)
    }


    public getOtherString = (key: string) => {
        return this.otherDataStorage.getString(key) ?? ""
    }

    public getOtherBool = (key: string) => {
        return this.otherDataStorage.getBool(key) ?? ""
    }

    //@ts-ignore
    public getStoredValue = <T = any>(key: StorageType, defaultValue?: T): T => {
        switch (key) {
            case 'authToken':
            case 'firebaseToken':
            case 'selectedLanguage':
            case 'inviteCode':
            case 'mnemonic':
                return (this.getStorageForKey(key).getString(key) || defaultValue) as T

            case 'isLogin':
            case 'socketConnected':
                return (this.getStorageForKey(key).getBool(key) || defaultValue) as T

            case 'userData':
            case 'currentLocation':
            case 'selectedLocation':
            case 'allLanguages':
            case 'paypalConnection':
            case 'greenlightCreds':
                return (this.getStorageForKey(key).getMap(key) || defaultValue) as T

            case 'recentSearches':
            case 'currencies':
                return (this.getStorageForKey(key).getArray(key) || (defaultValue ?? [])) as T

        }
    }

    public setValue = (key: StorageType, value: any) => {
        switch (key) {
            case 'authToken':
            case 'firebaseToken':
                return this.getStorageForKey(key).setString(key, value ?? "")

            case 'isLogin':
            case 'socketConnected':
            case 'paypalConnection':
                return this.getStorageForKey(key).setBool(key, value ?? false)

            case 'userData':
            case 'currentLocation':
            case 'selectedLocation':
            case 'allLanguages':
                return this.getStorageForKey(key).setMap(key, value ?? null)

            case 'recentSearches':
            case 'currencies':
                return this.getStorageForKey(key).setArray(key, value ?? [])
        }
    }

    public getCalenderEvent = (eventId: string) => {
        return this.otherDataStorage.getMap('calender_event_' + eventId) || null
    }

    public saveCalenderEvent = (eventId: string, data: any) => {
        this.otherDataStorage.setMap('calender_event_' + eventId, data)
    }

}

export const useDatabase = <T = any>(key: StorageType, defaultValue?: T):
    [T, (value: T | ((prevValue: T) => T)) => void] => {
    if (!StorageVariables.includes(key)) {
        _showErrorMessage("Wrong Key Used in UseDatabase")
        //@ts-ignore
        return [undefined, () => null]
    }
    const [value, setValue] = useMMKVStorage<T>(key, Database.getInstance().getStorageForKey(key), defaultValue, isEqual);
    return [value, key == 'selectedLanguage' ? () => null : setValue];
}

export const useOtherValues = <T = any>(key: string, defaultValue?: T):
    [T | null, (value: T | ((prevValue: T) => T)) => void] => {
    return useMMKVStorage<T>(key, Database.getInstance().getStorageForKey("searchHomeText"), defaultValue, isEqual);
}

export const mergeStorageInPersistedReducer = (persistReducer: any, persistConfig: any, rootReducer: any) => {
    return persistReducer({
        ...persistConfig,
        storage: Database.phoneStorage,
    }, rootReducer)
}

export default Database.getInstance()