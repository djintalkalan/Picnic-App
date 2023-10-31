import * as ApiProvider from 'api/APIProvider';
import { refreshChatInEvent, setChatInEvent, setLoadingAction } from "app-store/actions";
import { call, put, takeLeading } from "redux-saga/effects";
import Language from 'src/language/Language';
import { mergeMessageObjects, _showErrorMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* _getEventChat({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getEventChat, payload);
        if (res?.status == 200) {
            yield put(setChatInEvent({ eventId: payload?.id, chats: res?.data?.data, message_id: payload?.message_id }))
        } else if (res?.status == 400) {
            _showErrorMessage(res.message, 5000);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 11", error);
        yield put(setLoadingAction(false));
    }
}

function* _getEventChatNew({ type, payload, }: action): Generator<any, any, any> {
    payload?.setChatLoader && payload?.setChatLoader(true)
    try {
        let res = yield call(ApiProvider._getEventChatNew, payload);
        if (res?.status == 200) {
            const chats = mergeMessageObjects(res?.data?.data, res?.data?.message_total_likes_count, res?.data?.is_message_liked_by_me)
            // merge()
            console.log("CHATS", chats);
            // return
            yield put((payload?.message_id ? setChatInEvent : refreshChatInEvent)({ eventId: payload?.id, chats: chats, message_id: payload?.message_id }))
        } else if (res?.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        payload?.setChatLoader && payload?.setChatLoader(false)
        // yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 12", error);
        payload?.setChatLoader && payload?.setChatLoader(false)
        // yield put(setLoadingAction(false));
    }
}

// Watcher: watch auth request
export default function* watchEventChat() {
    // yield takeLeading(ActionTypes.GET_EVENT_CHAT, _getEventChat);
    yield takeLeading(ActionTypes.GET_EVENT_CHAT, _getEventChatNew);


};