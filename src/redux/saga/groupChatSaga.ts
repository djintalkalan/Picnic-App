import * as ApiProvider from 'api/APIProvider';
import { likeUnlikeMessageSuccess, setChatInGroup, setLoadingAction } from "app-store/actions";
import { call, put, takeLatest, takeLeading } from "redux-saga/effects";
import Language from 'src/language/Language';
import { _showErrorMessage } from "utils";
import { store } from '..';
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

function* _likeUnlikeMessage({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    const activeGroup = store.getState().groupChat?.activeGroup
    try {
        let res = yield call(ApiProvider._likeUnlikeMessage, payload);
        if (res.status == 200) {
            yield put(likeUnlikeMessageSuccess({ groupId: activeGroup?._id, ...payload }))
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
    yield takeLeading(ActionTypes.GET_GROUP_CHAT, _getGroupChat);
    yield takeLatest(ActionTypes.LIKE_UNLIKE_MESSAGE, _likeUnlikeMessage);

};