import { isEqual } from "lodash";
import * as RNLocalize from "react-native-localize";
import MMKVStorage, { useMMKVStorage } from "react-native-mmkv-storage";
import { LanguageType } from "src/language/Language";
import { _showErrorMessage } from "utils";

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
    "recentSearches" | 'currencies'
const StorageVariables = ["userData", "isLogin", "firebaseToken",
    "authToken", "selectedLanguage", "currentLocation", "selectedLocation",
    "recentSearches", "currencies"]
type DataBaseType = {
    userData?: any
    isLogin?: boolean
    firebaseToken?: string
    authToken?: string
    selectedLanguage?: LanguageType
    currentLocation?: ILocation
    selectedLocation?: ILocation
    recentSearches?: Array<IRecentSearches>
}

export interface ILocation {
    latitude: number
    longitude: number
    address?: {
        main_text: string,
        secondary_text: string
    }
    otherData?: {
        city?: string
        state?: string
        country?: string
    } | null
}


class Database {

    private static mInstance: Database

    static getInstance = () => {
        if (!this.mInstance) {
            this.mInstance = new Database()
        }
        return this.mInstance
    }

    static phoneStorage = new MMKVStorage.Loader().withEncryption().initialize();

    DefaultCountry = RNLocalize.getCountry()

    public setLogin = (isLogin?: boolean) => {
        Database.phoneStorage.setBool('isLogin', isLogin ?? false)
    }

    public setUserData = (userData?: any) => {
        Database.phoneStorage.setMap('userData', userData ?? null)
    }

    public setFirebaseToken = (token: string | null) => {
        Database.phoneStorage.setString('firebaseToken', token ?? "")
    }

    public setAuthToken = (token: any) => {
        Database.phoneStorage.setString('authToken', token ?? "")
    }

    public setSelectedLanguage = (language: LanguageType) => {
        Database.phoneStorage.setString('selectedLanguage', language)
    }

    public setCurrentLocation = (location: ILocation) => {
        Database.phoneStorage.setMap('currentLocation', location)
    }

    public setSelectedLocation = (location: ILocation) => {
        Database.phoneStorage.setMap('selectedLocation', location)
    }

    public addInRecentSearches = (data: IRecentSearches) => {
        const oldData = (Database.phoneStorage.getArray("recentSearches") ?? []).filter((_) => !isEqual(_?.data?.place_id, data?.data?.place_id))
        Database.phoneStorage.setArray('recentSearches', [data, ...oldData])
    }

    public setMultipleValues = (data: DataBaseType) => {
        Object.keys(data).forEach((key) => {
            switch (key) {
                case 'authToken':
                case 'firebaseToken':
                case 'selectedLanguage':
                    return Database.phoneStorage.setString(key, data[key] ?? "")

                case 'isLogin':
                    return Database.phoneStorage.setBool(key, data[key] ?? false)

                case 'userData':
                case 'currentLocation':
                case 'selectedLocation':
                    return Database.phoneStorage.setMap(key, data[key] ?? null)

                case 'recentSearches':
                    return Database.phoneStorage.setArray(key, data[key] ?? [])
            }
        })
    }

    public getStoredValue = <T = any>(key: StorageType, defaultValue?: any): T | any => {
        switch (key) {
            case 'authToken':
            case 'firebaseToken':
            case 'selectedLanguage':
                return Database.phoneStorage.getString(key) || defaultValue

            case 'isLogin':
                return Database.phoneStorage.getBool(key) || defaultValue

            case 'userData':
            case 'currentLocation':
            case 'selectedLocation':
                return Database.phoneStorage.getMap(key) || defaultValue

            case 'recentSearches':
            case 'currencies':
                return Database.phoneStorage.getArray(key) || (defaultValue ?? [])
        }
    }

    public setValue = (key: StorageType, value: any) => {
        switch (key) {
            case 'authToken':
            case 'firebaseToken':
                return Database.phoneStorage.setString(key, value ?? "")

            case 'isLogin':
                return Database.phoneStorage.setBool(key, value ?? false)

            case 'userData':
            case 'currentLocation':
            case 'selectedLocation':
                return Database.phoneStorage.setMap(key, value ?? null)

            case 'recentSearches':
            case 'currencies':
                return Database.phoneStorage.setArray(key, value ?? [])
        }
    }
}

export const useDatabase = <T = any>(key: StorageType, defaultValue?: T):
    [T | null, (value: T | ((prevValue: T) => T)) => void] => {
    if (!StorageVariables.includes(key)) {
        _showErrorMessage("Wrong Key Used in UseDatabase")
        return [null, () => null]
    }
    const [value, setValue] = useMMKVStorage<T>(key, Database.phoneStorage, defaultValue);
    return [value, key == 'selectedLanguage' ? () => null : setValue];
    // return [value, setValue];
}

export const mergeStorageInPersistedReducer = (persistReducer: any, persistConfig: any, rootReducer: any) => {
    return persistReducer({
        ...persistConfig,
        storage: Database.phoneStorage,
    }, rootReducer)
}

export default Database.getInstance()