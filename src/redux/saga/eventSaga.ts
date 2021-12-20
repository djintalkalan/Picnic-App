import * as ApiProvider from 'api/APIProvider';
import { addMutedResource, deleteGroupSuccess, getGroupDetail, getGroupMembers, IResourceType, joinGroupSuccess, leaveGroupSuccess, removeFromBlockedMember, removeGroupMemberSuccess, removeMutedResource, setAllGroups, setBlockedMembers, setGroupDetail, setGroupMembers, setLoadingAction, setMutedResource, setMyGroups, setPrivacyState, updateGroupDetail } from "app-store/actions";
import { store } from 'app-store/store';
import { defaultLocation } from 'custom-components';
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import Database from 'src/database/Database';
import Language from 'src/language/Language';
import { navigationRef, NavigationService, _showErrorMessage, _showSuccessMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* _getMyGroups({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getMyGroups);
        if (res.status == 200) {
            yield put(setMyGroups(res.data))
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
export default function* watchEvents() {
    yield takeEvery(ActionTypes.GET_MY_GROUPS, _getMyGroups);


};