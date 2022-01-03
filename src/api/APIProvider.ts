import { config } from 'api';
import { store } from 'app-store';
import { setLoadingAction } from 'app-store/actions';
import axios, { Method } from 'axios';
import { DeviceEventEmitter } from 'react-native';
import { RNS3 } from 'react-native-aws3';
import Database from 'src/database/Database';
import { LanguageType } from 'src/language/Language';
import { _showErrorMessage } from 'utils';
interface header {
    Accept: string;
    "Content-Type": string;
    Authorization?: string,
    "X-Platform-Type": string;
    accept_language?: LanguageType
}

async function callApi(urlString: string, header: header, body: any, methodType: Method, isMultipart: boolean | undefined) {
    if (config.REACTOTRON_STATUS == 'false') {
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
        headers: header
    }).then(res => {
        if (config.REACTOTRON_STATUS == 'false') {
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
        } else if (res.data?.status == config.UNAUTHORIZED_ERROR_CODE) {
            DeviceEventEmitter.emit("TOKEN_EXPIRED")
            _showErrorMessage("Invalid Session. Please Login Again")
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
                if (config.REACTOTRON_STATUS == 'false') {
                    console.log("catch response", JSON.stringify(e.response.data))
                }
                if (JSON.stringify(e.response.data).startsWith("<") || JSON.stringify(e.response.data).startsWith("\"<")) {
                    DeviceEventEmitter.emit("STOP_LOADER_EVENT");
                    setTimeout(() => {
                        _showErrorMessage("A webpage is returned instead of a response")
                    }, 500);
                }
                else {
                    if (e.response.data?.status == config.UNAUTHORIZED_ERROR_CODE) {
                        DeviceEventEmitter.emit("TOKEN_EXPIRED")
                        _showErrorMessage("Invalid Session. Please Login Again")
                    }
                    return e.response.data
                }
            }
            else {
                store.dispatch(setLoadingAction(false));
                throw new Error("Request Failed");
            }
        })
}

async function fetchApiData(urlString: string, body: any | null, methodType: Method) {
    const isMultipart = (body && body instanceof FormData) ? true : false
    const authToken = Database.getStoredValue('authToken')
    const selectedLanguage = Database.getStoredValue<LanguageType>('selectedLanguage') || "en"
    try {
        let header: header = {
            Accept: "application/json",
            "Content-Type": (isMultipart) ? "multipart/form-data" : "application/json",
            'X-Platform-Type': 'app',
            'Authorization': authToken ? ("Bearer " + authToken) : undefined,
            'accept_language': selectedLanguage
        }
        return callApi(urlString, header, body, methodType, isMultipart)
    } catch (error: any) {
        throw new Error(error)
    }
}

const callUploadFileAWS = async (file: { uri: string, name: string, type: any }, prefix: any) => {
    console.log("Body S3", JSON.stringify(file))

    const options = {
        keyPrefix: config.AWS3_KEY_PREFIX + prefix + "/",
        bucket: config.AWS3_BUCKET,
        region: config.AWS3_REGION,
        accessKey: config.AWS3_ACCESS_KEY,
        secretKey: config.AWS3_SECRET_KEY,
        successActionStatus: 201
    }
    return RNS3.put(file, options).then((response) => {
        console.log("response", response)
        if (response.status !== 201)
            throw new Error("Failed to upload image to S3");
        // console.log("res" + response.body);
        return response
    }).catch((error) => {
        console.log("AWS ERROR ", JSON.stringify(error));
    })
}

export const uploadFileAWS = async (body: any, prefix: any) => {
    return callUploadFileAWS(body, prefix)
}


export const _signUp = async (body: any) => {
    console.log("---------- new_signup OTP Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/signup', body, "POST")
}

export const _loginApi = async (body: any) => {
    console.log("---------- _loginApi Api Call ---------------")
    return fetchApiData(config.API_URL + 'auth/login', body, "POST")
}

export const _logoutApi = async () => {
    console.log("---------- Logout Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/logout', {}, "POST")
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
    console.log("---------- Reset Password Api Call ---------------")
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
    return fetchApiData(config.API_URL + 'group/get-all-groups?page=' + page + '&lat=' + body?.latitude + '&lng=' + body?.longitude + '&limit=20', null, "GET")
}

export const _getGroupChat = async (body: any) => {
    console.log("---------- _getGroupChat Api Call ---------------")
    return fetchApiData(config.API_URL + 'message/group-chat?load_more=0&page=' + (body?.message_id ? "" : 1) + '&id=' + (body?.id ?? "") + '&q=' + (body?.q ?? "") + '&limit=20&message_id=' + (body?.message_id || ""), null, "GET")
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
    return fetchApiData(config.API_URL + (body?.type == 'events' ? 'event/get-all-events' : 'group/get-all-groups') + '?page=' + 1 + '&lat=' + body?.latitude + '&lng=' + body?.longitude + '&limit=100000&q=' + body?.text, null, "GET")
}

export const _getMyEvents = async (body: any) => {
    console.log("---------- _getMyEvents Api Call ---------------")
    return fetchApiData(config.API_URL + 'user/get-my-events' + '?page=' + 1 + '&group_id=' + body?.groupId + '&event_filter_type=' + body?.type + '&limit=100000&q=' + (body?.text ?? ""), null, "GET")
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
    return fetchApiData(config.API_URL + 'event/get-all-events?page=' + page + '&lat=' + body?.latitude + '&lng=' + body?.longitude + '&limit=20', null, "GET")
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

