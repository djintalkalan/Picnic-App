import * as ApiProvider from 'api/APIProvider';
import { addMutedResource, deleteEventSuccess, deleteGroupSuccess, getGroupDetail, getGroupMembers, IResourceType, joinGroupSuccess, leaveGroupSuccess, removeFromBlockedMember, removeGroupMemberSuccess, removeMutedResource, setAllGroups, setBlockedMembers, setGroupDetail, setGroupMembers, setLoadingAction, setMutedResource, setPrivacyState, setUpcomingEvents, updateGroupDetail } from "app-store/actions";
import { store } from 'app-store/store';
import { defaultLocation } from 'custom-components';
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import Database from 'src/database/Database';
import Language from 'src/language/Language';
import { navigationRef, NavigationService, _showErrorMessage, _showSuccessMessage } from "utils";
import ActionTypes, { action } from "../action-types";

function* _mutedBlockedReportedCount({ type, payload, }: action): Generator<any, any, any> {
    // yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._mutedBlockedReportedCount, payload);
        if (res.status == 200) {
            let data = {
                events: res?.data?.muted?.events || 0,
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
            if (payload?.data?.resource_type == 'user' && payload?.data?.is_blocked == "0")
                yield put(removeFromBlockedMember(payload?.data?.resource_id))
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

function* _muteUnmuteResource({ type, payload, }: action): Generator<any, any, any> {
    const { resource_type }: { resource_type: IResourceType } = payload?.data
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._muteUnmuteResource, payload?.data);
        if (res.status == 200) {
            _showSuccessMessage(res.message)
            // if (payload.onSuccess) payload.onSuccess(res?.data)
            if (payload?.data?.is_mute == "1")
                yield put(payload?.data?.resource_type == 'group' ?
                    deleteGroupSuccess(payload?.data?.resource_id) :
                    deleteEventSuccess(payload?.data?.resource_id)
                )
            else {
                yield put(removeMutedResource({ data: payload?.data?.resource_id, type: resource_type }))
            }
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

function* _reportResource({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._reportResource, { ...payload, is_reported: "1" });
        if (res.status == 200) {
            _showSuccessMessage(res.message)
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
    const { resource_type, page }: { resource_type: IResourceType, page: number } = payload
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getMutedResources, resource_type, page);
        if (res.status == 200) {
            if (payload.onSuccess) payload.onSuccess({
                pagination: {
                    currentPage: res?.data?.pagination?.currentPage,
                    totalPages: res?.data?.pagination?.totalPages,
                    perPage: res?.data?.pagination?.limit
                },
            })
            if (res?.data?.pagination?.currentPage == 1) {
                yield put(setMutedResource({ data: res?.data?.data, type: resource_type }))
            } else
                yield put(addMutedResource({ data: res?.data?.data, type: resource_type }))

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
                yield put(updateGroupDetail(res?.data))
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
    let group = store.getState()?.group?.groupDetail?.group
    if (!group)
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

function* _removeGroupMember({ type, payload, }: action): Generator<any, any, any> {
    yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._removeGroupMember, payload);
        if (res.status == 200) {
            // yield put(setGroupMembers([...res?.data, ...res?.data, ...res?.data, ...res?.data]))
            yield put(removeGroupMemberSuccess(payload?.user_id))
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



function* _joinGroup({ type, payload, }: action): Generator<any, any, any> {
    try {
        yield put(setLoadingAction(true));
        let res = yield call(ApiProvider._joinGroup, payload);
        if (res.status == 200) {
            yield put(joinGroupSuccess(payload))
            if (navigationRef.current?.getCurrentRoute()?.name == "GroupDetail") {
                yield put(getGroupDetail(payload))
            }
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

function* _deleteGroup({ type, payload, }: action): Generator<any, any, any> {
    try {
        yield put(setLoadingAction(true));
        let res = yield call(ApiProvider._deleteGroup, payload);
        if (res.status == 200) {
            if (navigationRef.current?.getCurrentRoute()?.name == "GroupDetail") {
                NavigationService.goBack()
            }
            yield put(deleteGroupSuccess(payload))
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



function* _leaveGroup({ type, payload, }: action): Generator<any, any, any> {
    try {
        yield put(setLoadingAction(true));
        let res = yield call(ApiProvider._leaveGroup, payload);
        if (res.status == 200) {
            yield put(leaveGroupSuccess(payload))
            if (navigationRef.current?.getCurrentRoute()?.name == "GroupDetail") {
                NavigationService.goBack()
            }
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

function* _getMyEvents({ type, payload, }: action): Generator<any, any, any> {
    try {
        yield put(setLoadingAction(true));
        let res = yield call(ApiProvider._getMyEvents, payload);
        if (res.status == 200) {
            if (payload?.type == 'upcoming') {
                yield put(setUpcomingEvents(res?.data?.data))
            }
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
    yield takeEvery(ActionTypes.GET_MUTED_RESOURCES, _getMutedResources);
    yield takeLatest(ActionTypes.BLOCK_UNBLOCK_RESOURCE, _blockUnblockResource);
    yield takeLatest(ActionTypes.MUTE_UNMUTE_RESOURCE, _muteUnmuteResource);
    yield takeLatest(ActionTypes.REPORT_RESOURCE, _reportResource);
    yield takeLatest(ActionTypes.CREATE_GROUP, _createGroup);
    yield takeLatest(ActionTypes.GET_ALL_GROUPS, _getAllGroups);
    yield takeLatest(ActionTypes.GET_GROUP_DETAIL, _getGroupDetail);
    yield takeLatest(ActionTypes.GET_GROUP_MEMBERS, _getGroupMembers);
    yield takeLatest(ActionTypes.REMOVE_GROUP_MEMBER, _removeGroupMember);
    yield takeLatest(ActionTypes.JOIN_GROUP, _joinGroup);
    yield takeLatest(ActionTypes.LEAVE_GROUP, _leaveGroup);
    yield takeLatest(ActionTypes.GET_MUTED_REPORTED_COUNT, _mutedBlockedReportedCount);
    yield takeLatest(ActionTypes.GET_BLOCKED_MEMBERS, _getBlockedMembers);
    yield takeLatest(ActionTypes.DELETE_GROUP, _deleteGroup);
    yield takeLatest(ActionTypes.GET_MY_EVENTS, _getMyEvents);


};