import * as ApiProvider from 'api/APIProvider';
import { getGroupMembers, setAllGroups, setGroupDetail, setGroupMembers, setLoadingAction } from "app-store/actions";
import { setBlockedMembers, setPrivacyState } from 'app-store/actions/profileActions';
import { store } from 'app-store/store';
import { defaultLocation } from 'custom-components';
import { call, put, takeLatest } from "redux-saga/effects";
import Database from 'src/database/Database';
import Language from 'src/language/Language';
import { NavigationService, _showErrorMessage, _showSuccessMessage } from "utils";
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

function* _createGroup({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        let res = yield call(payload?.data?._id ? ApiProvider._updateGroup : ApiProvider._createGroup, payload?.data);
        if (res.status == 200) {
            _showSuccessMessage(res.message);
            if (payload?.data?._id) {
                const groupDetail = store.getState().group?.groupDetail
                yield put(setGroupDetail({ ...groupDetail, group: { ...groupDetail?.group, ...res?.data } }))
            }
            NavigationService.goBack()
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

function* _getAllGroups({ type, payload, }: action): Generator<any, any, any> {
    // const state:RootState = 
    let groupList = store.getState()?.group?.allGroups
    if (!groupList?.length)
        yield put(setLoadingAction(true));
    try {
        const location = Database?.getStoredValue("selectedLocation", defaultLocation)
        let res = yield call(ApiProvider._getAllGroups, location, payload?.page);
        if (res.status == 200) {
            if (payload.onSuccess) payload.onSuccess({
                pagination: {
                    currentPage: res?.data?.pagination?.currentPage,
                    totalPages: res?.data?.pagination?.totalPages,
                    perPage: res?.data?.pagination?.limit
                },
                data: res?.data?.data
            })
            if (res?.data?.pagination?.currentPage == 1) groupList = []
            yield put(setAllGroups([...groupList, ...res?.data?.data]))

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

function* _getGroupDetail({ type, payload, }: action): Generator<any, any, any> {
    // const state:RootState = 
    let groupDetail = store.getState()?.group?.groupDetail
    if (!groupDetail)
        yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getGroupDetail, payload);
        if (res.status == 200) {
            if (res?.data?.group?.is_admin)
                yield put(getGroupMembers(payload))
            yield put(setGroupDetail(res?.data))
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

function* _getGroupMembers({ type, payload, }: action): Generator<any, any, any> {
    try {
        let res = yield call(ApiProvider._getGroupMembers, payload);
        if (res.status == 200) {
            // yield put(setGroupMembers([...res?.data, ...res?.data, ...res?.data, ...res?.data]))
            yield put(setGroupMembers(res?.data))
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

    yield takeLatest(ActionTypes.CREATE_GROUP, _createGroup);
    yield takeLatest(ActionTypes.GET_ALL_GROUPS, _getAllGroups);
    yield takeLatest(ActionTypes.GET_GROUP_DETAIL, _getGroupDetail);
    yield takeLatest(ActionTypes.GET_GROUP_MEMBERS, _getGroupMembers);


};