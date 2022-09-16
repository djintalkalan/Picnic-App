import * as ApiProvider from 'api/APIProvider';
import { addMutedResource, deleteChatInEventSuccess, deleteChatInGroupSuccess, deleteEventSuccess, deleteGroupSuccess, getGroupDetail, IResourceType, joinGroupSuccess, leaveGroupSuccess, removeFromBlockedMember, removeGroupMemberSuccess, removeMutedResource, setAllGroups, setBlockedMembers, setGroupDetail, setGroupMembers, setLoadingAction, setMutedResource, setPastEvents, setPrivacyState, setUpcomingEvents, updateGroupDetail } from "app-store/actions";
import { store } from 'app-store/store';
import { defaultLocation } from 'custom-components';
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { EMIT_GROUP_DELETE, EMIT_JOIN_ROOM, EMIT_LEAVE_ROOM, SocketService } from 'socket';
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
    const { groupId, eventId, ...rest } = payload?.data
    const { resource_type }: { resource_type: IResourceType } = rest
    yield put(setLoadingAction(true));
    console.log("DATA", payload?.data);

    try {
        let res = yield call(ApiProvider._muteUnmuteResource, rest);
        if (res.status == 200) {
            _showSuccessMessage(res.message)
            // if (payload.onSuccess) payload.onSuccess(res?.data)
            if (payload?.data?.is_mute == "1")
                switch (payload?.data?.resource_type) {
                    case 'message':
                        yield put((groupId ? deleteChatInGroupSuccess : deleteChatInEventSuccess)({
                            groupId, eventId,
                            resourceId: payload?.data?.resource_id
                        }))
                        break;
                    case 'group':
                        yield put(deleteGroupSuccess(payload?.data?.resource_id))
                    default:
                        yield put(deleteEventSuccess(payload?.data?.resource_id))
                        break;
                }
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
                yield put(updateGroupDetail({ groupId: payload?.data?._id, data: res?.data }))
            } else {
                SocketService?.emit(EMIT_JOIN_ROOM, {
                    resource_id: res?.data
                })
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
    if (!groupList?.length && payload?.setLoader) payload?.setLoader(true)

    // if (!groupList?.length)
    // yield put(setLoadingAction(true));
    try {
        const location = Database?.getStoredValue("selectedLocation", defaultLocation)
        let res = yield call(ApiProvider._getAllGroups, location, payload?.page);
        payload?.setLoader && payload?.setLoader(false)

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
            yield put(setAllGroups(res?.data?.data))

        } else if (res.status == 400) {
            _showErrorMessage(res.message);
        } else {
            _showErrorMessage(Language.something_went_wrong);
        }
    }
    catch (error) {
        console.log("Catch Error", error);
        payload?.setLoader && payload?.setLoader(false)
    }
}

function* _getGroupDetail({ type, payload, }: action): Generator<any, any, any> {
    // const state:RootState = 
    let group = store.getState()?.groupDetails?.[payload]?.group
    if (!group)
        yield put(setLoadingAction(true));
    try {
        let res = yield call(ApiProvider._getGroupDetail, payload);
        if (res.status == 200) {

            if (res?.data?.group?.status == 5) {
                console.log("SCREEN", NavigationService?.getCurrentScreen());
                const { name, params } = NavigationService?.getCurrentScreen() ?? {}
                if ((name == "GroupDetail" || name == "GroupChatScreen" || name == "Chats" || name == "UpcomingEventsChat") &&
                    params?.id == payload
                ) {
                    _showErrorMessage(Language.getString("this_group_is_deleted"), 5000)
                    NavigationService.navigate("Home")
                }
                yield put(deleteGroupSuccess(payload))
                return
            }


            res.data.group.is_group_member = res.data?.is_group_joined ? true : false
            res.data.group.is_group_admin = res.data?.group?.is_admin ? true : false
            // if (res?.data?.group?.is_admin)
            //     yield put(getGroupMembers(payload))
            yield put(setGroupDetail({ groupId: payload, data: res?.data }))
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
            yield put(setGroupMembers({ groupId: payload, data: res?.data }))
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
            yield put(removeGroupMemberSuccess({ groupId: payload?.resource_id, data: payload?.user_id }))
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
            SocketService?.emit(EMIT_JOIN_ROOM, {
                resource_id: payload
            })
            const name = NavigationService?.getCurrentScreen()?.name
            if (name != "HomeGroupTab" && name != "Home") {
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
            NavigationService?.navigate("Home")
            // if (NavigationService?.getCurrentScreen()?.name == "GroupDetail") {
            //     NavigationService.goBack()
            // }
            // yield put(deleteGroupSuccess(payload))
            SocketService.emit(EMIT_GROUP_DELETE, {
                resource_id: payload
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



function* _leaveGroup({ type, payload, }: action): Generator<any, any, any> {
    try {
        yield put(setLoadingAction(true));
        let res = yield call(ApiProvider._leaveGroup, payload);
        if (res.status == 200) {
            yield put(leaveGroupSuccess(payload))
            SocketService?.emit(EMIT_LEAVE_ROOM, {
                resource_id: payload
            })
            const name = NavigationService?.getCurrentScreen()?.name
            if (name != "HomeGroupTab" && name != "Home") {
                yield put(getGroupDetail(payload))
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
        if (!payload?.noLoader)
            yield put(setLoadingAction(true));
        let res = yield call(ApiProvider._getMyEvents, payload);
        if (res.status == 200) {
            for (const index in res?.data?.data) {
                if (res?.data?.data[index].ticket_type == 'multiple') {
                    const leastTicket = res?.data?.data[index]?.ticket_plans?.reduce((p: any, c: any) => ((Math.min(p.amount, c.amount)) == c.amount ? c : p))

                    res.data.data[index].event_fees = leastTicket.amount?.toString()
                    res.data.data[index].event_tax_rate = leastTicket.event_tax_rate?.toString()
                    res.data.data[index].event_currency = leastTicket.currency

                    // if (!res?.data?.data[index]?.capacity) {
                    const eventCapacityType = res?.data?.data[index]?.capacity_type
                    const totalCapacity = res?.data?.data[index]?.ticket_plans?.reduce((p: any, c: any) => (((c?.capacity_type || eventCapacityType) == 'unlimited' || (p?.capacity_type || eventCapacityType) == 'unlimited') ? { capacity_type: 'unlimited', capacity: 0 } : { capacity_type: 'limited', capacity: p?.capacity + c.capacity }))
                    // console.log("totalCapacity", totalCapacity);

                    res.data.data[index].capacity_type = totalCapacity?.capacity_type
                    res.data.data[index].capacity = totalCapacity?.capacity
                    // }
                }
            }
            yield put((payload?.type == 'upcoming' ? setUpcomingEvents : setPastEvents)({ groupId: payload?.groupId, data: res?.data?.data }))
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

function* _deleteGroupSuccess({ type, payload, }: action): Generator<any, any, any> {
    try {
        yield put(deleteEventSuccess({ groupId: payload }))
    }
    catch (error) {
        console.log("Catch Error", error);
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
    yield takeEvery(ActionTypes.DELETE_GROUP_SUCCESS, _deleteGroupSuccess);
    yield takeEvery(ActionTypes.GET_MY_EVENTS, _getMyEvents);

};