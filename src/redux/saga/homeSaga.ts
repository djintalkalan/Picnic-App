import * as ApiProvider from 'api/APIProvider';
import ActionTypes, { action } from "app-store/action-types";
import { setSearchedData } from "app-store/actions";
import { defaultLocation } from "custom-components";
import Localize from 'react-native-localize';
import { call, put, takeLatest } from "redux-saga/effects";
import Database from "src/database/Database";
import Language, { DefaultLanguage, DefaultLanguages } from "src/language/Language";
import { _showErrorMessage } from "utils";


function* _searchAtHome({ type, payload, }: action): Generator<any, any, any> {
    try {
        // yield put(setLoadingAction(true));
        payload?.setSearchLoader && payload?.setSearchLoader(true)
        const location = Database?.getStoredValue("selectedLocation", defaultLocation)
        let res = yield call(ApiProvider._searchAtHome, { ...payload, ...location });
        if (res.status == 200) {
            if (payload?.type == 'events') {
                for (const index in res?.data?.data) {
                    if (res?.data?.data[index].ticket_type == 'multiple') {
                        const leastTicket = res?.data?.data[index]?.ticket_plans?.reduce((p: any, c: any) => ((Math.min(p.amount, c.amount)) == c.amount ? c : p))

                        res.data.data[index].event_fees = leastTicket.amount?.toString()
                        res.data.data[index].event_tax_rate = leastTicket.event_tax_rate?.toString()
                        res.data.data[index].event_currency = leastTicket.currency

                        // if (!res?.data?.data[index]?.capacity) {
                        const eventCapacityType = res?.data?.data[index]?.capacity_type
                        const totalCapacity = res?.data?.data[index]?.ticket_plans?.reduce((p: any, c: any) => ((c?.capacity_type || eventCapacityType) == 'unlimited' || (p?.capacity_type || eventCapacityType) == 'unlimited' ? { capacity_type: 'unlimited', capacity: 0 } : { capacity_type: 'limited', capacity: p?.capacity + c.capacity }))
                        res.data.data[index].capacity_type = totalCapacity?.capacity_type
                        res.data.data[index].capacity = totalCapacity?.capacity
                        // }
                    }
                }
            }
            yield put(setSearchedData({ data: Database.getOtherString("searchHomeText") ? res?.data?.data : null, type: payload?.type }))
        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        payload?.setSearchLoader && payload?.setSearchLoader(false)
    }
    catch (error) {
        console.log("Catch Error", error);
        payload?.setSearchLoader && payload?.setSearchLoader(false)
    }
}

function* _refreshLanguage({ type, payload, }: action): Generator<any, any, any> {
    try {
        let res = yield call(ApiProvider._refreshLanguage);
        if (res.status == 200) {
            const currentLanguage = Database?.getStoredValue("selectedLanguage") ?? DefaultLanguage
            const allLanguages = DefaultLanguages
            const newLanguages = res?.data
            Object.keys(allLanguages).forEach((l: string) => {
                Object.keys(allLanguages[l]).forEach((k: string) => {
                    // @ts-ignore
                    allLanguages[l][k] = newLanguages?.[l]?.[k] || allLanguages[l][k] || allLanguages['en'][k]
                })
            })
            Database.setAllLanguages(allLanguages)
            Language.setContent(allLanguages)
            Language.setLanguage(currentLanguage);
            Database.setSelectedLanguage(currentLanguage);
            // Database.setSelectedLanguage()
        } else if (res.status == 400) {
            // _showErrorMessage(res.message);
        } else {
            // _showErrorMessage(Language.something_went_wrong);
        }
    }
    catch (error) {
        console.log("Catch Error", error);
    }
}

function* _updateDeviceLanguage({ type, payload, }: action): Generator<any, any, any> {
    try {
        let res = yield call(ApiProvider._updateDeviceLanguage, { default_device_language: Localize?.getLocales()?.[0]?.languageCode });
        if (res.status == 200) {

            // Database.setSelectedLanguage()
        } else if (res.status == 400) {
            // _showErrorMessage(res.message);
        } else {
            // _showErrorMessage(Language.something_went_wrong);
        }
    }
    catch (error) {
        console.log("Catch Error", error);
    }
}


export default function* watchHome() {
    yield takeLatest(ActionTypes.SEARCH_AT_HOME, _searchAtHome);
    yield takeLatest(ActionTypes.REFRESH_LANGUAGE, _refreshLanguage);
    yield takeLatest(ActionTypes.UPDATE_DEVICE_LANGUAGE, _updateDeviceLanguage);
}
