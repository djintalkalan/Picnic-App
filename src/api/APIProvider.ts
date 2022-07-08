import { config } from 'api/config';
import axios, { AxiosResponse, Method } from 'axios';
import React, { MutableRefObject } from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import { Progress, Request, RNS3 } from 'react-native-aws3';
import Database from 'src/database/Database';
import { LanguageType } from 'src/language/Language';
import { _showErrorMessage } from 'utils';

interface header {
    Accept?: string;
    "Content-Type"?: string;
    Authorization?: string,
    "X-Platform-Type"?: string;
    "Accept-Language"?: LanguageType
}

interface IApiResponse {
    status: number
    message?: string
    data?: any
    [key: string]: any
}

let uploadRequest: Request

export const TOKEN_EXPIRED: MutableRefObject<boolean | null> = React.createRef()

function interceptResponse(this: AxiosResponse<any>): any {
    try {
        if (config.TERMINAL_CONSOLES) {
            console.log("-----------AXIOS  Api Response is----------- ");
            console.log("url string ", this.config?.url);
            console.log("header ", this.config?.headers);
            console.log("body ", this.config?.data);
            console.log("methodType ", this.config?.method)
        }
        if (JSON.stringify(this.data).startsWith("<") || JSON.stringify(this.data).startsWith("\"<")) {
            DeviceEventEmitter.emit("STOP_LOADER_EVENT");
            setTimeout(() => {
                _showErrorMessage("Internal Server Error")
            }, 500);
        } else if (this?.data?.status == 401) {
            if (!TOKEN_EXPIRED.current) {
                TOKEN_EXPIRED.current = true
                DeviceEventEmitter.emit("TOKEN_EXPIRED")
                _showErrorMessage(this?.data?.message)
            }
        }
        else {
            console.log(JSON.stringify(this?.data));
            return this?.data
        }
    } finally {

    }
}

const api = axios.create({
    baseURL: config.API_URL,
    timeout: 1000 * 30,
    headers: {
        'Accept': "application/json",
        'X-Platform-Type': 'app',
    }
});

api.interceptors.request.use(async function (requestConfig) {
    try {
        if (config.TERMINAL_CONSOLES) {
            console.log("-----------AXIOS  Api request is----------- ");
            console.log("url string ", requestConfig.url);
            console.log("header ", requestConfig?.headers);
            console.log("body ", requestConfig?.data);
            console.log("methodType ", requestConfig?.method)

        }

    } finally {
        return requestConfig;
    }
});


api.interceptors.response.use(
    async function (response) {
        return interceptResponse.call(response)
    },
    async function (error) {
        return interceptResponse.call(error?.response)
    },
);


async function callApi(url: string, header: header, body: any, method?: Method): Promise<IApiResponse> {
    return api.request({
        method: method,
        url: url,
        data: body,
        headers: header,
    })
}

async function fetchApiData(url: string, method?: Method, body?: any) {
    const isMultipart = (body && body instanceof FormData) ? true : false
    const authToken = Database.getStoredValue('authToken')
    const selectedLanguage = Database.getStoredValue<LanguageType>('selectedLanguage') || "en"
    try {
        const header = {
            "Content-Type": (isMultipart) ? "multipart/form-data" : "application/json",
            'Authorization': authToken ? ("Bearer " + authToken) : undefined,
            'Accept-Language': selectedLanguage
        }
        return callApi(url, header, body, method)
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
    return fetchApiData('auth/signup', "POST", body)
}

export const _loginApi = async (body: any) => {
    console.log("---------- _loginApi Api Call ---------------")
    return fetchApiData('auth/login', "POST", body)
}

export const _logoutApi = async (body: any) => {
    console.log("---------- Logout Api Call ---------------")
    return fetchApiData('user/logout', "POST", body)
}

export const _forgotPassword = async (body: any) => {
    console.log("---------- Forgot Password Api Call ---------------")
    return fetchApiData('auth/forgot-password', "POST", body)
}

export const _resetPassword = async (body: any) => {
    console.log("---------- Reset Password Api Call ---------------")
    return fetchApiData('auth/reset-password', "POST", body)
}

export const _checkEmail = async (body: any) => {
    console.log("---------- check email Api Call ---------------")
    return fetchApiData('auth/check-email', "POST", body)
}


export const _verifyOtp = async (body: any) => {
    console.log("---------- Verify Otp Api Call ---------------")
    return fetchApiData('auth/verify-otp', "POST", body)
}

export const _getProfile = async () => {
    console.log("---------- _getProfile Api Call ---------------")
    return fetchApiData('user/profile')
}

export const _updateNotificationSetting = async (body: any) => {
    console.log("---------- _updateNotificationSetting Api Call ---------------")
    return fetchApiData('user/notification-settings', "POST", body)
}

export const _updateProfile = async (body: any) => {
    console.log("---------- _updateProfile Api Call ---------------")
    return fetchApiData('user/update-profile', "POST", body)
}

export const _deleteAccount = async (body: any) => {
    console.log("---------- _deleteAccount Api Call ---------------")
    return fetchApiData('user/delete-account', "POST", body)
}

export const _updatePassword = async (body: any) => {
    console.log("---------- _updatePassword Api Call ---------------")
    return fetchApiData('user/change-password', "POST", body)
}

export const _mediaUpload = async (body: FormData) => {
    console.log("---------- _mediaUpload Api Call ---------------")
    return fetchApiData('media/upload', "POST", body)
}

export const _mutedBlockedReportedCount = async (body: any) => {
    console.log("---------- _mutedBlockedReportedCount Api Call ---------------")
    return fetchApiData('common/muted-blocked-reported-count')
}

export const _getBlockedMembers = async (page: number) => {
    console.log("---------- _getBlockedMembers Api Call ---------------")
    return fetchApiData('common/blocked-resources?page=' + page + '&limit=20')
}

export const _blockUnblockResource = async (body: any) => {
    console.log("---------- _blockUnblockResource Api Call ---------------")
    return fetchApiData('common/block-unblock-resource', "POST", body)
}

export const _getMutedResources = async (body: any, page: number) => {
    console.log("---------- _getMutedResources Api Call ---------------")
    return fetchApiData('common/muted-resources?resource_type=' + body + '&page=' + page + '&limit=20')
}

export const _getAllGroups = async (body: any, page: number) => {
    console.log("---------- _getAllGroups Api Call ---------------")
    return fetchApiData('group/get-all-groups-new?page=' + page + '&lat=' + body?.latitude + '&lng=' + body?.longitude + '&limit=50000')
}

export const _getGroupChat = async (body: any) => {
    console.log("---------- _getGroupChat Api Call ---------------")
    return fetchApiData('message/group-chat?load_more=0&page=' + (body?.message_id ? 1 : 1) + '&id=' + (body?.id ?? "") + '&q=' + (body?.q ?? "") + '&limit=40&message_id=' + (body?.message_id || ""))
}

export const _createGroup = async (body: any) => {
    console.log("---------- _createGroup Api Call ---------------")
    return fetchApiData('group/create', "POST", body)
}

export const _updateGroup = async (body: any) => {
    console.log("---------- _updateGroup Api Call ---------------")
    return fetchApiData('group/update', "POST", body)
}


export const _getGroupMembers = async (body: string) => {
    console.log("---------- _getGroupMembers Api Call ---------------")
    return fetchApiData('group/members?id=' + body)
}

export const _getGroupDetail = async (body: string) => {
    console.log("---------- _getGroupDetail Api Call ---------------")
    return fetchApiData('group/detail/' + body)
}

export const _joinGroup = async (body: string) => {
    console.log("---------- _joinGroup Api Call ---------------")
    return fetchApiData('group/join/' + body, "PUT")
}

export const _leaveGroup = async (body: any) => {
    console.log("---------- _leaveGroup Api Call ---------------")
    return fetchApiData('group/leave/' + body, "PUT")
}

export const _removeGroupMember = async (body: any) => {
    console.log("---------- _removeGroupMember Api Call ---------------")
    return fetchApiData('group/delete-group-member', "DELETE", body)
}

export const _deleteGroup = async (body: any) => {
    console.log("---------- _deleteGroup Api Call ---------------")
    return fetchApiData('group/delete-group/' + body, "DELETE")
}

export const _muteUnmuteResource = async (body: any) => {
    console.log("---------- _muteUnmuteResource Api Call ---------------")
    return fetchApiData('common/mute-unmute-resource', "POST", body)
}

export const _reportResource = async (body: any) => {
    console.log("---------- _reportResource Api Call ---------------")
    return fetchApiData('common/report-resource', "POST", body)
}

export const _searchAtHome = async (body: any) => {
    console.log("---------- _searchAtHome Api Call ---------------")
    return fetchApiData((body?.type == 'events' ? 'event/get-all-events-new' : 'group/get-all-groups-new') + '?page=' + 1 + '&lat=' + body?.latitude + '&lng=' + body?.longitude + '&limit=100000&q=' + body?.text)
}

export const _getMyEvents = async (body: any) => {
    console.log("---------- _getMyEvents Api Call ---------------")
    return fetchApiData('user/get-my-events' + '?page=' + 1 + '&group_id=' + body?.groupId + '&event_filter_type=' + (body?.type ?? "") + '&limit=100000&q=' + (body?.text ?? ""))
}
export const _getMyGroups = async () => {
    console.log("---------- _getMyGroups Api Call ---------------")
    return fetchApiData('event/get-my-groups')
}

export const _getAllCurrencies = async () => {
    console.log("---------- _getAllCurrencies Api Call ---------------")
    return fetchApiData('user/get-currencies')
}

export const _createEvent = async (body: any) => {
    console.log("---------- _createEvent Api Call ---------------")
    return fetchApiData('event/create', "POST", body)
}

export const _getAllEvents = async (body: any, page: number) => {
    console.log("---------- _getAllEvents Api Call ---------------")
    return fetchApiData('event/get-all-events-new?page=' + page + '&lat=' + body?.latitude + '&lng=' + body?.longitude + '&limit=50000')
}

export const _getEventDetails = async (id: string) => {
    console.log("---------- _getEventDetails Api Call ---------------")
    return fetchApiData('event/detail/' + id)
}

export const _getEventDetail = async (body: string) => {
    console.log("---------- _getEventDetail Api Call ---------------")
    return fetchApiData('event/detail/' + body)
}

export const _updateEvent = async (body: any) => {
    console.log("---------- _updateEvent Api Call ---------------")
    return fetchApiData('event/update', "POST", body)
}

export const _deleteEvent = async (body: any) => {
    console.log("---------- _deleteEvent Api Call ---------------")
    return fetchApiData('event/cancel-event/' + body, "DELETE")
}

export const _pinUnpinEvent = async (body: any) => {
    console.log("---------- _pinUnpinEvent Api Call ---------------")
    return fetchApiData('event/pin-unpin', "PUT", body)
}

export const _likeUnlikeMessage = async (body: any) => {
    console.log("---------- _likeUnlikeMessage Api Call ---------------")
    return fetchApiData('message/like-unlike-message', "POST", body)
}

export const _joinEvent = async (body: string) => {
    console.log("---------- _joinEvent Api Call ---------------")
    return fetchApiData('payment/confirm-reservation', "POST", body)
}

export const _getEventChat = async (body: any) => {
    console.log("---------- _getEventChat Api Call ---------------")
    return fetchApiData('message/event-chat?load_more=0&page=' + (body?.message_id ? 1 : 1) + '&id=' + (body?.id ?? "") + '&q=' + (body?.q ?? "") + '&limit=40&message_id=' + (body?.message_id || ""))
}

export const _leaveEvent = async (body: any) => {
    console.log("---------- _leaveEvent Api Call ---------------")
    return fetchApiData('payment/cancel-reservation/' + body, "PUT")
}

export const _authorizeMembership = async (body: any) => {
    console.log("---------- _authorizeMembership Api Call ---------------")
    return fetchApiData(Platform.OS == 'ios' ? 'membership/authorise' : 'membership/authrise', "POST", body)
}

export const _captureMembership = async (body: any) => {
    console.log("---------- _captureMembership Api Call ---------------")
    return fetchApiData('membership/capture', "POST", body)
}

export const _getActiveMembership = async () => {
    console.log("---------- _getActiveMembership Api Call ---------------")
    return fetchApiData('membership/get-active-membership')
}

export const _getEventMembers = async (body: string) => {
    console.log("---------- _getEventMembers Api Call ---------------")
    return fetchApiData('event/members?id=' + body)
}

export const _removeEventMember = async (body: any) => {
    console.log("---------- _removeEventMember Api Call ---------------")
    return fetchApiData('event/delete-event-member', "DELETE", body)
}

export const _scanTicket = async (body: any) => {
    console.log("---------- scan ticket Api Call ---------------")
    return fetchApiData('event/scan-ticket', "POST", body)
}

export const _getUpcomingPastEvents = async (body: any, page: number) => {
    console.log("---------- _getUpcomingPastEvents Api Call ---------------")
    return fetchApiData('user/get-my-upcoming-past-events?page=' + page + '&event_filter_type=' + body?.event_filter_type + '&q=' + (body?.q ?? "") + '&limit=8')
}

export const _getMyAllGroups = async (body: any, page: number) => {
    console.log("---------- _getMyAllGroups Api Call ---------------")
    return fetchApiData('user/get-my-groups?page=' + page + '&q=' + (body?.q ?? "") + '&limit=20')
}

export const _authorizePayment = async (body: any) => {
    console.log("---------- _authorizePayment Api Call ---------------")
    return fetchApiData('payment/authorise-paypal', "POST", body)
}

export const _capturePayment = async (body: any) => {
    console.log("---------- _capturePayment Api Call ---------------")
    return fetchApiData('payment/capture-paypal', "POST", body)
}

export const _whatsappImport = async (body: FormData, type: string) => {
    console.log("---------- whatsappImport Api Call ---------------")
    return fetchApiData(type + '/import', "POST", body)
}

export const _getGroupChatNew = async (body: any) => {
    console.log("---------- _getGroupChatNew Api Call ---------------")
    return fetchApiData('message/group-chat-new?load_more=0&page=1&id=' + (body?.id ?? "") + '&q=' + (body?.q ?? "") + '&limit=' + (body?.message_id ? "30" : "10") + '&message_id=' + (body?.message_id || ""))
}

export const _getEventChatNew = async (body: any) => {
    console.log("---------- _getEventChatNew Api Call ---------------")
    return fetchApiData('message/event-chat-new?load_more=0&page=1&id=' + (body?.id ?? "") + '&q=' + (body?.q ?? "") + '&limit=' + (body?.message_id ? "30" : "10") + '&message_id=' + (body?.message_id || ""))
}

export const _searchChat = async (body: any) => {
    console.log("---------- _searchChat Api Call ---------------")
    return fetchApiData('message/search?resource_id=' + (body?.id ?? "") + '&q=' + (body?.q ?? ""))
}

export const _searchPersonChat = async (body: any) => {
    console.log("---------- _searchPersonChat Api Call ---------------")
    return fetchApiData('chat/search?chat_room_id=' + (body?.id ?? "") + '&q=' + (body?.q ?? ""))
}

export const _refreshLanguage = async () => {
    console.log("---------- _refreshLanguage Api Call ---------------")
    return fetchApiData('language/labels')
}

export const _getAppVersion = async () => {
    console.log("---------- get app version Api Call ---------------")
    return fetchApiData('common/app-version')
}

export const _getPersonChat = async (body: any) => {
    console.log("---------- getPersonChat Api Call ---------------")
    const params = objectToParamString(body)
    return fetchApiData('chat/get-conversation?' + params)
}

export const _setLanguage = async (body: any) => {
    console.log("---------- set language Api Call ---------------")
    return fetchApiData('user/set-language', "POST", body)
}

export const _sendOtp = async (body: any) => {
    console.log("---------- send otp Api Call ---------------")
    return fetchApiData('auth/send-signup-otp', "POST", body)
}

export const _verifySignupOtp = async (body: any) => {
    console.log("---------- verify email otp Api Call ---------------")
    return fetchApiData('auth/verify-signup-otp', "POST", body)
}

export const _restoreAccount = async (body: any) => {
    console.log("---------- restore account otp Api Call ---------------")
    return fetchApiData('auth/restore', "POST", body)
}

export const _copyEvent = async (body: any) => {
    console.log("---------- copy event Api Call ---------------")
    return fetchApiData('event/copy-event', "POST", body)
}

export const _checkUsername = async (body: any) => {
    console.log("---------- Check Username Api Call ---------------")
    return fetchApiData('auth/check-username', "POST", body)
}

export const _getMerchantInfo = async () => {
    console.log("---------- _getMerchantInfo Api Call ---------------")
    return fetchApiData('event/get-merchant-info')
}

export const _setChatBackground = async (body: any) => {
    console.log("---------- _setChatBackground Api Call ---------------")
    return fetchApiData('message/set-background-color', "POST", body)
}

