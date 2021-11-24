import MMKVStorage, { useMMKVStorage } from "react-native-mmkv-storage";
import { LanguageType } from "src/language/Language";
import { _showErrorMessage } from "utils";

export type LiteralUnion<T extends U, U = string> = T | (U & {});
export type StorageType = "userData" | "isLogin" | "firebaseToken" | "authToken" | "selectedLanguage"
const StorageVariables = ["userData", "isLogin", "firebaseToken", "authToken", "selectedLanguage"]
type DataBaseType = {
    userData?: any
    isLogin?: boolean
    firebaseToken?: string
    authToken?: string
    selectedLanguage?: LanguageType
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
                    return Database.phoneStorage.setMap(key, data[key] ?? null)
            }
        })
    }

    public getStoredValue = <T = any>(key: StorageType): T | any => {
        switch (key) {
            case 'authToken':
            case 'firebaseToken':
            case 'selectedLanguage':
                return Database.phoneStorage.getString(key)

            case 'isLogin':
                return Database.phoneStorage.getBool(key)

            case 'userData':
                return Database.phoneStorage.getMap(key)
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
                return Database.phoneStorage.setMap(key, value ?? null)
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