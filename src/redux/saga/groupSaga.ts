import * as ApiProvider from 'api/APIProvider';
import { setLoadingAction } from "app-store/actions";
import { setBlockedMembers, setPrivacyState } from 'app-store/actions/profileActions';
import { store } from 'app-store/store';
import { call, put, takeLatest } from "redux-saga/effects";
import Language from 'src/language/Language';
import { _showErrorMessage, _showSuccessMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* _mutedBlockedReportedCount({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));

    try {
        let res = yield call(ApiProvider._mutedBlockedReportedCount, payload);
        if (res.status == 200) {
            let data = {
                events: res?.data?.muted?.messages || 0,
                users: res?.data?.blocked?.users || 0,
                groups: res?.data?.muted?.groups || 0,
                posts: res?.data?.muted?.messages || 0,
            }
            yield put(setPrivacyState(data))
            payload?.onSuccess && payload?.onSuccess(res?.data)
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

function* _getBlockedMembers({ type, payload, }: action): Generator<any, any, any> {
    let blockedUsers = store.getState()?.privacyData?.blockedUsers || []
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getBlockedMembers, payload?.page,);
        if (res.status == 200) {
            if (payload.onSuccess) payload.onSuccess({
                pagination: {
                    currentPage: res?.data?.pagination?.currentPage,
                    totalPages: res?.data?.pagination?.totalPages,
                    perPage: res?.data?.pagination?.limit
                },
                data: res?.data?.data
            })
            if (res?.data?.pagination?.currentPage == 1) blockedUsers = []
            yield put(setBlockedMembers([...blockedUsers, ...res?.data?.data]))

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

function* _blockUnblockResource({ type, payload, }: action): Generator<any, any, any> {

    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._blockUnblockResource, payload?.data);
        if (res.status == 200) {
            _showSuccessMessage(res.message);

            if (payload.onSuccess) payload.onSuccess(res?.data)
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

function* _getMutedResources({ type, payload, }: action): Generator<any, any, any> {

    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._blockUnblockResource, payload?.data);
        if (res.status == 200) {
            if (payload.onSuccess) payload.onSuccess({
                pagination: {
                    currentPage: res?.data?.pagination?.currentPage,
                    totalPages: res?.data?.pagination?.totalPages,
                    perPage: res?.data?.pagination?.limit
                },
                data: res?.data?.data
            })
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
export default function* watchGroups() {
    yield takeLatest(ActionTypes.GET_MUTED_REPORTED_COUNT, _mutedBlockedReportedCount);
    yield takeLatest(ActionTypes.GET_BLOCKED_MEMBERS, _getBlockedMembers);
    yield takeLatest(ActionTypes.GET_MUTED_RESOURCES, _getMutedResources);
    yield takeLatest(ActionTypes.BLOCK_UNBLOCK_RESOURCE, _blockUnblockResource);

};