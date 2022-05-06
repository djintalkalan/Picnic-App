import { config } from 'api';
import Database from 'database/Database';
import { Platform } from 'react-native';
import { Client, Configuration } from 'rollbar-react-native';

class RollbarService {
    private rollbar?: Client
    private static mInstance: RollbarService

    static getInstance = () => {
        if (!this.mInstance && !__DEV__) {
            this.mInstance = new RollbarService()
        }
        return this.mInstance
    }

    init = () => {
        if (__DEV__) return
        const isLogin = Database.getStoredValue("isLogin")
        const userData = Database.getStoredValue("userData")
        const authToken = Database.getStoredValue("authToken")
        const firebaseToken = Database.getStoredValue("firebaseToken")
        const configurations = new Configuration(config.ROLLBAR_CLIENT_ITEM_ACCESS_TOKEN, {
            environment: config.APP_TYPE == 'dev' ? "development" : config.APP_TYPE,
            // endpoint: 'https://api.rollbar.com/api/1/item/',
            // logLevel: 'info',

            payload: {
                ...Platform.OS == 'android' ? { ANDROID_VERSION_NAME: config.APP_VERSION, ANDROID_VERSION_CODE: config.BUILD_NUMBER_CODE, }
                    :
                    { APP_STORE_VERSION: config.APP_STORE_VERSION, IOS_APP_VERSION: config.APP_VERSION, IOS_BUILD_NUMBER: config.BUILD_NUMBER_CODE, },
                ...isLogin ? {
                    phone: userData?.phone_number,
                    dialCode: userData?.dial_code,
                    authToken,
                } : {},
                firebaseToken,
                'Application-Environment': config.APP_TYPE == 'dev' ? "development" : config.APP_TYPE
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
        this.exit();
        this.init();
    }

    showCustomError = (error: any) => {
        this.rollbar?.warning(error || "Test Error")
    }
}

export const Rollbar = RollbarService.getInstance()
