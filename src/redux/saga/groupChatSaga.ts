import * as ApiProvider from 'api/APIProvider';
import { setChatInGroup, setLoadingAction } from "app-store/actions";
import { call, put, takeLeading } from "redux-saga/effects";
import Language from 'src/language/Language';
import { mergeMessageObjects, _showErrorMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* _getGroupChat({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getGroupChat, payload);
        if (res.status == 200) {
            yield put(setChatInGroup({ groupId: payload?.id, chats: res?.data?.data, message_id: payload?.message_id }))
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

function* _getGroupChatNew({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getGroupChatNew, payload);
        if (res.status == 200) {
            const chats = mergeMessageObjects(res?.data?.data, res?.data?.message_total_likes_count, res?.data?.is_message_liked_by_me)
            // merge()
            console.log("CHATS", chats);
            // return

            yield put(setChatInGroup({ groupId: payload?.id, chats: chats, message_id: payload?.message_id }))
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
    // yield takeLeading(ActionTypes.GET_GROUP_CHAT, _getGroupChat);
    yield takeLeading(ActionTypes.GET_GROUP_CHAT, _getGroupChatNew);

};