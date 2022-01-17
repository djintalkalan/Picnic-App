import * as ApiProvider from 'api/APIProvider';
import ActionTypes, { action } from "app-store/action-types";
import { setLoadingAction, setSearchedData } from "app-store/actions";
import { defaultLocation } from "custom-components";
import { call, put, takeLatest } from "redux-saga/effects";
import Database from "src/database/Database";
import Language from "src/language/Language";
import { _showErrorMessage } from "utils";


function* _searchAtHome({ type, payload, }: action): Generator<any, any, any> {
    try {
        // yield put(setLoadingAction(true));
        const location = Database?.getStoredValue("selectedLocation", defaultLocation)
        let res = yield call(ApiProvider._searchAtHome, { ...payload, ...location });
        if (res.status == 200) {
            yield put(setSearchedData({ data: payload?.text ? res?.data?.data : null, type: payload?.type }))

        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error", error);
        yield put(setLoadingAction(false));
    }
}


export default function* watchHome() {
    yield takeLatest(ActionTypes.SEARCH_AT_HOME, _searchAtHome);
}