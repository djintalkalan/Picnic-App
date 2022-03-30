import { config } from 'api';
import Database from 'database/Database';
import { Platform } from 'react-native';
import { Client, Configuration } from 'rollbar-react-native';

const isDev = __DEV__
class RollbarService {
    private rollbar?: Client
    private static mInstance: RollbarService

    static getInstance = () => {
        if (!this.mInstance && !isDev) {
            this.mInstance = new RollbarService()
        }
        return this.mInstance
    }

    init = () => {
        if (isDev) return
        const isLogin = Database.getStoredValue("isLogin")
        const userData = Database.getStoredValue("userData")
        const authToken = Database.getStoredValue("authToken")
        const firebaseToken = Database.getStoredValue("firebaseToken")
        const configurations = new Configuration('8d2372e9ae69491ab962b57e355e843c', {
            // endpoint: 'https://api.rollbar.com/api/1/item/',
            // logLevel: 'info',

            payload: {
                ...Platform.OS == 'android' ? { ANDROID_VERSION_NAME: config.ANDROID_VERSION_NAME, ANDROID_VERSION_CODE: config.ANDROID_VERSION_CODE, }
                    :
                    { IOS_VERSION: config.IOS_VERSION, IOS_BUILD_NUMBER: config.IOS_BUILD_NUMBER, },
                ...isLogin ? {
                    phone: userData?.phone_number,
                    dialCode: userData?.dial_code,
                    authToken,
                } : {},
                firebaseToken,
            }
        });
        this.rollbar = new Client(configurations);
        this.rollbar?.clearPerson()
        if (userData && isLogin) {
            this.rollbar?.setPerson(userData?._id, userData?.first_name + " " + userData?.last_name, userData?.email)
        }
        this.rollbar.captureUncaughtExceptions();
        this.rollbar.captureUnhandledRejections();
    }

    exit = () => {
        this.rollbar = undefined
    }

    reStart = () => {
        if (isDev) return
        this.exit();
        this.init();
    }

    showCustomError = (error: any) => {
        this.rollbar?.warning(error || "Test Error")
    }
}

export const Rollbar = RollbarService.getInstance()
