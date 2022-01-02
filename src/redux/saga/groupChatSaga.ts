import * as ApiProvider from 'api/APIProvider';
import { setChatInGroup, setLoadingAction } from "app-store/actions";
import { call, put, takeEvery } from "redux-saga/effects";
import Language from 'src/language/Language';
import { _showErrorMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* _getGroupChat({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getGroupChat, payload);
        if (res.status == 200) {
            yield put(setChatInGroup({ groupId: payload?.id, chats: res?.data?.data }))
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


// Watcher: watch auth request
export default function* watchGroupChat() {
    yield takeEvery(ActionTypes.GET_GROUP_CHAT, _getGroupChat);
};