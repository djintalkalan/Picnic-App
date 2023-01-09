import firestore from '@react-native-firebase/firestore';
import { config } from "api";
import { AxiosResponse } from "axios";
import Database from "database/Database";
import CryptoJS from "react-native-crypto-js";
import UUIDService from 'src/uuid/UUIDService';

let logs_availability = false

const listenLogsAvailability = async () => {
    const uuid = UUIDService.getUUID();
    if (!uuid) {
        setTimeout(() => {
            listenLogsAvailability();
        }, 100);
        return
    }
    try {
        const doc = firestore().collection('logs_availability').doc(uuid);
        doc.onSnapshot(_ => {
            logs_availability = _?.exists && _?.data()?.value
            if (!_?.exists) {
                doc.set({
                    uuid,
                    value: false
                })
            }
        })
    }
    catch (e) {
        console.log("Error in getting logs_availability", e);
    }
}

listenLogsAvailability();

const saveApiLogs = (response: AxiosResponse<any>) => {
    try {
        if (logs_availability) {
            let requestData = response.config.data;
            try {
                if (requestData) {
                    requestData = JSON.parse(requestData);
                    ['password', 'old_password', 'password_confirmation'].forEach(_ => {
                        if (requestData[_]) {
                            requestData[_] = CryptoJS.AES.encrypt(requestData[_], UUIDService.getUUID()?.replace(/-/g, '')).toString();
                        }
                    })
                }
            } catch (e) {
                console.log("Error in data parsing", e);
            }
            const data: any = {
                uuid: UUIDService.getUUID(),
                date: new Date(),
                environment: config.APP_TYPE,
                full_url: (response.config?.baseURL || '') + response.config.url,
                url: response.config.url,
                request: JSON.stringify({
                    data: requestData,
                    method: response.config?.method,
                    headers: response.config.headers,
                }),
                // response: JSON.stringify({
                //     headers: response.headers,
                //     data: response.data,
                // }),
                response: JSON.stringify(response.data),
            }
            if (Database.getStoredValue('isLogin')) {
                data.user_id = Database.getStoredValue('userData')?._id
                firestore()
                    .collection('logged_in_api_logs')
                    .doc(new Date()?.toISOString())
                    .set(data)
                    .then(() => {
                    });
            } else {
                firestore()
                    .collection('logged_out_api_logs')
                    .doc(new Date()?.toISOString())
                    .set(data)
                    .then(() => {
                    });
            }
        }
    }
    catch (e) {

    }
}

export default {
    saveApiLogs,
}