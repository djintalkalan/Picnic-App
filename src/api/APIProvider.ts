import { config } from 'api';
import { store } from 'app-store';
import { setLoadingAction } from 'app-store/actions';
import axios, { CancelToken, Method } from 'axios';
import React, { MutableRefObject } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { Progress, Request, RNS3 } from 'react-native-aws3';
import { CANCEL } from 'redux-saga';
import Database from 'src/database/Database';
import { LanguageType } from 'src/language/Language';
import { _showErrorMessage } from 'utils';

interface header {
    Accept: string;
    "Content-Type": string;
    Authorization?: string,
    "X-Platform-Type": string;
    "Accept-Language"?: LanguageType
}

let uploadRequest: Request

export const TOKEN_EXPIRED: MutableRefObject<boolean | null> = React.createRef()

const CancelTokenConstructor = axios.CancelToken;
async function callApi(urlString: string, header: header, body: any, methodType: Method, cancelToken?: CancelToken) {
    if (!config.REACTOTRON_STATUS) {
        console.log("-----------AXIOS  Api request is----------- ");
        console.log("url string " + urlString);
        console.log("header " + JSON.stringify(header));
        console.log("body " + JSON.stringify(body));
        console.log("methodType " + methodType)
    }
    return axios({
        method: methodType, //you can set what request you want to be
        url: urlString,
        data: methodType != "GET" && body ? body : undefined,// isMultipart ? body : (methodType != "GET" && body) ? body : undefined,
        headers: header,
        cancelToken: cancelToken
    }).then(res => {
        if (!config.REACTOTRON_STATUS) {
            console.log("-----------AXIOS  Api Response is----------- ");
            console.log("url string " + urlString);
            console.log("header " + JSON.stringify(header));
            console.log("body " + JSON.stringify(body));
            console.log("methodType " + methodType)
            console.log("\n ------ AXIOS RESPONSE " + urlString + " --------\n\n", res.data);
        }
        if (JSON.stringify(res.data).startsWith("<") || JSON.stringify(res.data).startsWith("\"<")) {
            DeviceEventEmitter.emit("STOP_LOADER_EVENT");
            setTimeout(() => {
                _showErrorMessage("A webpage is returned instead of a response")
            }, 500);
        } else if (res?.data?.status == 401) {
            if (!TOKEN_EXPIRED.current) {
                TOKEN_EXPIRED.current = true
                DeviceEventEmitter.emit("TOKEN_EXPIRED")
                _showErrorMessage(res?.data?.message)
            }
        }
        else
            return res.data
    }
    )
        .catch(e => {
            console.log("-----------AXIOS  Api catch is -----------\n" + urlString + "\n")
            console.log(e)
            console.log("catch Error" + JSON.stringify(e))
            if (e.response && e.response.data) {
                if (!config.REACTOTRON_STATUS) {
                    console.log("catch response", JSON.stringify(e.response.data))
                }
                if (JSON.stringify(e.response.data).startsWith("<") || JSON.stringify(e.response.data).startsWith("\"<")) {
                    DeviceEventEmitter.emit("STOP_LOADER_EVENT");
                    setTimeout(() => {
                        _showErrorMessage("A webpage is returned instead of a response")
                    }, 500);
                }
                else {
                    if (e.response.data?.status == 401) {
                        console.log("res.data.response", e.response.data);

                        if (!TOKEN_EXPIRED.current) {
                            TOKEN_EXPIRED.current = true
                            DeviceEventEmitter.emit("TOKEN_EXPIRED")
                            _showErrorMessage(e?.response?.data?.message)
                        }
                    }
                    return e.response.data
                }
            }
            else {
                DeviceEventEmitter.emit("STOP_LOADER_EVENT");
                store.dispatch(setLoadingAction(false));
                // return e
                throw e;
            }
        })
}

async function fetchApiData(urlString: string, body: any | null, methodType: Method, cancelToken?: CancelToken) {
    const isMultipart = (body && body instanceof FormData) ? true : false
    const authToken = Database.getStoredValue('authToken')
    const selectedLanguage = Database.getStoredValue<LanguageType>('selectedLanguage') || "en"
    try {
        let header: header = {
            Accept: "application/json",
            "Content-Type": (isMultipart) ? "multipart/form-data" : "application/json",
            'X-Platform-Type': 'app',
            'Authorization': authToken ? ("Bearer " + authToken) : undefined,
            'Accept-Language': selectedLanguage
        }
        const source = CancelTokenConstructor.source();
        const promise = callApi(urlString, header, body, methodType, source.token)
        //@ts-ignore
        promise[CANCEL] = () => source.cancel();
        return promise
    } catch (error: any) {
        throw new Error(error)
    }
}

export const _cancelUpload = () => {
    return uploadRequest?.abort();
}

const callUploadFileAWS = async (file: { uri: string, name: string, type: any, }, prefix: any, progressCallback: (progress: Progress, id: string) => any) => {
    console.log("Body S3", JSON.stringify(file))
    const options = {
        keyPrefix: prefix == 'video' ? "" : (config.AWS3_KEY_PREFIX + prefix + "/"),
        bucket: prefix == 'video' ? config.AWS3_VIDEO_BUCKET : config.AWS3_IMAGE_BUCKET,
        region: config.AWS3_REGION,
        accessKey: config.AWS3_ACCESS_K + config.AWS3_ACCESS_E + config.AWS3_ACCESS_Y,
        secretKey: config.AWS3_SECRET_K + config.AWS3_SECRET_E + config.AWS3_SECRET_Y,
        successActionStatus: 201
    }
    uploadRequest = RNS3.put(file, options)
    uploadRequest.progress((progress) => progressCallback(progress, file?.name.substring(0, file?.name?.indexOf(".")))).then((response) => {
        console.log("response", response)
        if (response.status !== 201)
            throw new Error("Failed to upload image to S3");
        // console.log("res" + response.body);
        return response
    })
        .catch((error) => {
            console.log("AWS ERROR ", JSON.stringify(error));
        })
    return uploadRequest

}

export const uploadFileAWS = async (body: any, prefix: any, progressCallback: (progress: Progress, id: string) => any) => {
    return callUploadFileAWS(body, prefix, progressCallback)
}

const objectToParamString = (body: any) => {
    let s = ""
    Object.keys(body).some((d: string, index: number) => {
        if (body?.[d]?.toString().trim()) s += ((index ? "&" : "") + d + "=" + body?.[d]?.toString()?.trim())
    })
    return s
}

export const _signUp = async (body: any) => {
    console.log("---------- new_signup OTP Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/signup', body, "POST")
}

export const _loginApi = async (body: any) => {
    console.log("---------- _loginApi Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/login', body, "POST")
}

export const _logoutApi = async (body: any) => {
    console.log("---------- Logout Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/logout', body, "POST")
}

export const _forgotPassword = async (body: any) => {
    console.log("---------- Forgot Password Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/forgot-password', body, "POST")
}

export const _resetPassword = async (body: any) => {
    console.log("---------- Reset Password Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/reset-password', body, "POST")
}

export const _checkEmail = async (body: any) => {
    console.log("---------- check email Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/check-email', body, "POST")
}


export const _verifyOtp = async (body: any) => {
    console.log("---------- Verify Otp Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/verify-otp', body, "POST")
}

export const _getProfile = async () => {
    console.log("---------- _getProfile Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/profile', null, "GET")
}

export const _updateNotificationSetting = async (body: any) => {
    console.log("---------- _updateNotificationSetting Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/notification-settings', body, "POST")
}

export const _updateProfile = async (body: any) => {
    console.log("---------- _updateProfile Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/update-profile', body, "POST")
}

export const _deleteAccount = async (body: any) => {
    console.log("---------- _deleteAccount Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/delete-account', body, "POST")
}

export const _updatePassword = async (body: any) => {
    console.log("---------- _updatePassword Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/change-password', body, "POST")
}

export const _mediaUpload = async (body: FormData) => {
    console.log("---------- _mediaUpload Api Call ---------------")
    return fetchApiData(config.API_URL + 'media/upload', body, "POST")
}

export const _mutedBlockedReportedCount = async (body: any) => {
    console.log("---------- _mutedBlockedReportedCount Api Call ---------------")
    return fetchApiData(config.API_URL + 'common/muted-blocked-reported-count', null, "GET")
}

export const _getBlockedMembers = async (page: number) => {
    console.log("---------- _getBlockedMembers Api Call ---------------")
    return fetchApiData(config.API_URL + 'common/blocked-resources?page=' + page + '&limit=20', null, "GET")
}

export const _blockUnblockResource = async (body: any) => {
    console.log("---------- _blockUnblockResource Api Call ---------------")
    return fetchApiData(config.API_URL + 'common/block-unblock-resource', body, "POST")
}

export const _getMutedResources = async (body: any, page: number) => {
    console.log("---------- _getMutedResources Api Call ---------------")
    return fetchApiData(config.API_URL + 'common/muted-resources?resource_type=' + body + '&page=' + page + '&limit=20', null, "GET")
}

export const _getAllGroups = async (body: any, page: number) => {
    console.log("---------- _getAllGroups Api Call ---------------")
    return fetchApiData(config.API_URL + 'group/get-all-groups-new?page=' + page + '&lat=' + body?.latitude + '&lng=' + body?.longitude + '&limit=50000', null, "GET")
}

export const _getGroupChat = async (body: any) => {
    console.log("---------- _getGroupChat Api Call ---------------")
    return fetchApiData(config.API_URL + 'message/group-chat?load_more=0&page=' + (body?.message_id ? 1 : 1) + '&id=' + (body?.id ?? "") + '&q=' + (body?.q ?? "") + '&limit=40&message_id=' + (body?.message_id || ""), null, "GET")
}

export const _createGroup = async (body: any) => {
    console.log("---------- _createGroup Api Call ---------------")
    return fetchApiData(config.API_URL + 'group/create', body, "POST")
}

export const _updateGroup = async (body: any) => {
    console.log("---------- _updateGroup Api Call ---------------")
    return fetchApiData(config.API_URL + 'group/update', body, "POST")
}


export const _getGroupMembers = async (body: string) => {
    console.log("---------- _getGroupMembers Api Call ---------------")
    return fetchApiData(config.API_URL + 'group/members?id=' + body, null, "GET")
}

export const _getGroupDetail = async (body: string) => {
    console.log("---------- _getGroupDetail Api Call ---------------")
    return fetchApiData(config.API_URL + 'group/detail/' + body, null, "GET")
}

export const _joinGroup = async (body: string) => {
    console.log("---------- _joinGroup Api Call ---------------")
    return fetchApiData(config.API_URL + 'group/join/' + body, null, "PUT")
}

export const _leaveGroup = async (body: any) => {
    console.log("---------- _leaveGroup Api Call ---------------")
    return fetchApiData(config.API_URL + 'group/leave/' + body, null, "PUT")
}

export const _removeGroupMember = async (body: any) => {
    console.log("---------- _removeGroupMember Api Call ---------------")
    return fetchApiData(config.API_URL + 'group/delete-group-member', body, "DELETE")
}

export const _deleteGroup = async (body: any) => {
    console.log("---------- _deleteGroup Api Call ---------------")
    return fetchApiData(config.API_URL + 'group/delete-group/' + body, null, "DELETE")
}

export const _muteUnmuteResource = async (body: any) => {
    console.log("---------- _muteUnmuteResource Api Call ---------------")
    return fetchApiData(config.API_URL + 'common/mute-unmute-resource', body, "POST")
}

export const _reportResource = async (body: any) => {
    console.log("---------- _reportResource Api Call ---------------")
    return fetchApiData(config.API_URL + 'common/report-resource', body, "POST")
}

export const _searchAtHome = async (body: any) => {
    console.log("---------- _searchAtHome Api Call ---------------")
    return fetchApiData(config.API_URL + (body?.type == 'events' ? 'event/get-all-events-new' : 'group/get-all-groups-new') + '?page=' + 1 + '&lat=' + body?.latitude + '&lng=' + body?.longitude + '&limit=100000&q=' + body?.text, null, "GET")
}

export const _getMyEvents = async (body: any) => {
    console.log("---------- _getMyEvents Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/get-my-events' + '?page=' + 1 + '&group_id=' + body?.groupId + '&event_filter_type=' + (body?.type ?? "") + '&limit=100000&q=' + (body?.text ?? ""), null, "GET")
}
export const _getMyGroups = async () => {
    console.log("---------- _getMyGroups Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/get-my-groups', null, "GET")
}

export const _getAllCurrencies = async () => {
    console.log("---------- _getAllCurrencies Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/get-currencies', null, "GET")
}

export const _createEvent = async (body: any) => {
    console.log("---------- _createEvent Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/create', body, "POST")
}

export const _getAllEvents = async (body: any, page: number) => {
    console.log("---------- _getAllEvents Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/get-all-events-new?page=' + page + '&lat=' + body?.latitude + '&lng=' + body?.longitude + '&limit=50000', null, "GET")
}

export const _getEventDetails = async (id: string) => {
    console.log("---------- _getEventDetails Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/detail/' + id, null, "GET")
}

export const _getEventDetail = async (body: string) => {
    console.log("---------- _getEventDetail Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/detail/' + body, null, "GET")
}

export const _updateEvent = async (body: any) => {
    console.log("---------- _updateEvent Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/update', body, "POST")
}

export const _deleteEvent = async (body: any) => {
    console.log("---------- _deleteEvent Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/cancel-event/' + body, null, "DELETE")
}

export const _pinUnpinEvent = async (body: any) => {
    console.log("---------- _pinUnpinEvent Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/pin-unpin', body, "PUT")
}

export const _likeUnlikeMessage = async (body: any) => {
    console.log("---------- _likeUnlikeMessage Api Call ---------------")
    return fetchApiData(config.API_URL + 'message/like-unlike-message', body, "POST")
}

export const _joinEvent = async (body: string) => {
    console.log("---------- _joinEvent Api Call ---------------")
    return fetchApiData(config.API_URL + 'payment/confirm-reservation', body, "POST")
}

export const _getEventChat = async (body: any) => {
    console.log("---------- _getEventChat Api Call ---------------")
    return fetchApiData(config.API_URL + 'message/event-chat?load_more=0&page=' + (body?.message_id ? 1 : 1) + '&id=' + (body?.id ?? "") + '&q=' + (body?.q ?? "") + '&limit=40&message_id=' + (body?.message_id || ""), null, "GET")
}

export const _leaveEvent = async (body: any) => {
    console.log("---------- _leaveEvent Api Call ---------------")
    return fetchApiData(config.API_URL + 'payment/cancel-reservation/' + body, null, "PUT")
}

export const _authorizeMembership = async (body: any) => {
    console.log("---------- _authorizeMembership Api Call ---------------")
    return fetchApiData(config.API_URL + 'membership/authrise', body, "POST")
}

export const _captureMembership = async (body: any) => {
    console.log("---------- _captureMembership Api Call ---------------")
    return fetchApiData(config.API_URL + 'membership/capture', body, "POST")
}

export const _getActiveMembership = async () => {
    console.log("---------- _getActiveMembership Api Call ---------------")
    return fetchApiData(config.API_URL + 'membership/get-active-membership', null, "GET")
}

export const _getEventMembers = async (body: string) => {
    console.log("---------- _getEventMembers Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/members?id=' + body, null, "GET")
}

export const _removeEventMember = async (body: any) => {
    console.log("---------- _removeEventMember Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/delete-event-member', body, "DELETE")
}

export const _scanTicket = async (body: any) => {
    console.log("---------- scan ticket Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/scan-ticket', body, "POST")
}

export const _getUpcomingPastEvents = async (body: any, page: number) => {
    console.log("---------- _getUpcomingPastEvents Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/get-my-upcoming-past-events?page=' + page + '&event_filter_type=' + body?.event_filter_type + '&q=' + (body?.q ?? "") + '&limit=8', null, "GET")
}

export const _getMyAllGroups = async (body: any, page: number) => {
    console.log("---------- _getMyAllGroups Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/get-my-groups?page=' + page + '&q=' + (body?.q ?? "") + '&limit=20', null, "GET")
}

export const _authorizePayment = async (body: any) => {
    console.log("---------- _authorizePayment Api Call ---------------")
    return fetchApiData(config.API_URL + 'payment/authorise-paypal', body, "POST")
}

export const _capturePayment = async (body: any) => {
    console.log("---------- _capturePayment Api Call ---------------")
    return fetchApiData(config.API_URL + 'payment/capture-paypal', body, "POST")
}

export const _whatsappImport = async (body: FormData, type: string) => {
    console.log("---------- whatsappImport Api Call ---------------")
    return fetchApiData(config.API_URL + type + '/import', body, "POST")
}

export const _getGroupChatNew = async (body: any) => {
    console.log("---------- _getGroupChatNew Api Call ---------------")
    return fetchApiData(config.API_URL + 'message/group-chat-new?load_more=0&page=1&id=' + (body?.id ?? "") + '&q=' + (body?.q ?? "") + '&limit=' + (body?.message_id ? "30" : "10") + '&message_id=' + (body?.message_id || ""), null, "GET")
}

export const _getEventChatNew = async (body: any) => {
    console.log("---------- _getEventChatNew Api Call ---------------")
    return fetchApiData(config.API_URL + 'message/event-chat-new?load_more=0&page=1&id=' + (body?.id ?? "") + '&q=' + (body?.q ?? "") + '&limit=' + (body?.message_id ? "30" : "10") + '&message_id=' + (body?.message_id || ""), null, "GET")
}

export const _searchChat = async (body: any) => {
    console.log("---------- _searchChat Api Call ---------------")
    return fetchApiData(config.API_URL + 'message/search?resource_id=' + (body?.id ?? "") + '&q=' + (body?.q ?? ""), null, "GET")
}

export const _searchPersonChat = async (body: any) => {
    console.log("---------- _searchPersonChat Api Call ---------------")
    return fetchApiData(config.API_URL + 'chat/search?chat_room_id=' + (body?.id ?? "") + '&q=' + (body?.q ?? ""), null, "GET")
}

export const _refreshLanguage = async (body?: any) => {
    console.log("---------- _refreshLanguage Api Call ---------------")
    return fetchApiData(config.API_URL + 'language/labels', null, "GET")
}

export const _getAppVersion = async () => {
    console.log("---------- get app version Api Call ---------------")
    return fetchApiData(config.API_URL + 'common/app-version', null, "GET")
}

export const _getPersonChat = async (body: any) => {
    console.log("---------- getPersonChat Api Call ---------------")
    const params = objectToParamString(body)
    return fetchApiData(config.API_URL + 'chat/get-conversation?' + params, null, "GET")
}

export const _setLanguage = async (body: any) => {
    console.log("---------- set language Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/set-language', body, "POST")
}

export const _sendOtp = async (body: any) => {
    console.log("---------- send otp Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/send-signup-otp', body, "POST")
}

export const _verifyEmailOtp = async (body: any) => {
    console.log("---------- verify email otp Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/verify-signup-otp', body, "POST")
}

export const _restoreAccount = async (body: any) => {
    console.log("---------- restore account otp Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/restore', body, "POST")
}
export const _copyEvent = async (body: any) => {
    console.log("---------- copy event Api Call ---------------")
    return fetchApiData(config.API_URL + 'event/copy-event', body, "POST")
}

