import * as ApiProvider from 'api/APIProvider';
import { refreshChatInPerson, setChatInPerson } from "app-store/actions";
import { DeviceEventEmitter } from 'react-native';
import { call, put, takeLeading } from "redux-saga/effects";
import Language from 'src/language/Language';
import { _showErrorMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* _getPersonChat({ type, payload, }: action): Generator<any, any, any> {
    payload?.setChatLoader && payload?.setChatLoader(true)
    try {
        console.log("payload", payload);

        let res = yield call(ApiProvider._getPersonChat, { user_id: payload?.id, message_id: payload?.message_id, page: 1, limit: payload?.message_id ? 100 : 40 });
        if (res?.status == 200) {
            const chats = res?.data?.data // mergeMessageObjects(res?.data?.data, res?.data?.message_total_likes_count, res?.data?.is_message_liked_by_me)
            // merge()
            console.log("CHATS", chats);
            // return
            if (chats?.length) {
                let chat_room_id = payload?.chat_room_id
                if (!chat_room_id) {
                    chat_room_id = chats?.[0]?.chat_room_id
                    DeviceEventEmitter.emit("UpdateChatRoomId", { chat_room_id, person_id: payload?.id, })
                }
                yield put((payload?.message_id ? setChatInPerson : refreshChatInPerson)({ chatRoomUserId: payload?.id, chats: chats, message_id: payload?.message_id }))

            }
        } else if (res?.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
        payload?.setChatLoader && payload?.setChatLoader(false)
        // yield put(setLoadingAction(false));
    }
    catch (error) {
        console.log("Catch Error 56", error);
        payload?.setChatLoader && payload?.setChatLoader(false)
        // yield put(setLoadingAction(false));
    }
}

// Watcher: watch auth request
export default function* watchPersonChat() {
    // yield takeLeading(ActionTypes.GET_PERSON_CHAT, _getPersonChat);
    yield takeLeading(ActionTypes.GET_PERSON_CHAT, _getPersonChat);


};