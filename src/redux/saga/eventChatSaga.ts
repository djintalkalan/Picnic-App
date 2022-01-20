import * as ApiProvider from 'api/APIProvider';
import { setChatInEvent, setLoadingAction } from "app-store/actions";
import { call, put, takeLeading } from "redux-saga/effects";
import Language from 'src/language/Language';
import { _showErrorMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* _getEventChat({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getEventChat, payload);
        if (res.status == 200) {
            yield put(setChatInEvent({ eventId: payload?.id, chats: res?.data?.data, message_id: payload?.message_id }))
        } else if (res.status == 400) {
            _showErrorMessage(res.message, 5000);
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
export default function* watchEventChat() {
    yield takeLeading(ActionTypes.GET_EVENT_CHAT, _getEventChat);

};