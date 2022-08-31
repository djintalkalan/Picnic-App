import { CreateJobCommand, CreateJobCommandInput, ElasticTranscoderClient, waitUntilJobComplete } from "@aws-sdk/client-elastic-transcoder";
import notifee, { AndroidProgress } from "@notifee/react-native";
import { config } from 'api';
import * as ApiProvider from 'api/APIProvider';
import { setLoadingAction, setLoadingMsg } from "app-store/actions";
import { random } from "lodash";
import { Platform } from "react-native";
import { Progress } from 'react-native-aws3';
import { call, put, takeLatest } from 'redux-saga/effects';
import Language from "src/language/Language";
import { dateFormat } from "utils";
import { store } from "..";
import ActionTypes, { action } from "../action-types";

let activeUploads: Array<string> = []

const isAndroid = Platform.OS == 'android'

const transcoderClient = new ElasticTranscoderClient({
    credentials: {
        accessKeyId: config.AWS3_ACCESS_K + config.AWS3_ACCESS_E + config.AWS3_ACCESS_Y,
        secretAccessKey: config.AWS3_SECRET_K + config.AWS3_SECRET_E + config.AWS3_SECRET_Y,
    },
    region: config.AWS3_REGION,
});

function* uploadImage({ type, payload }: action): Generator<any, any, any> {
    let fileName = "";
    const { image, onSuccess, prefixType } = payload
    if (!image?.path) return
    const date = new Date()
    // fileName = image?.path?.substring(image?.path?.lastIndexOf('/') + 1, image?.path?.length)
    fileName = (prefixType == 'video' ? "VID-" : "IMG-") + dateFormat(date, "YYYYMMDD") + "-PG" + Date.now() + "" + random(111, 999) + image?.path?.substring(image?.path?.lastIndexOf('.'));
    const file = {
        uri: image?.path,
        name: fileName,
        type: image?.mime ?? (prefixType != 'video' ? (fileName?.toLowerCase().endsWith("png") ? 'image/png' : 'image/jpeg') : "*/*")
    }
    yield put(setLoadingAction(true))
    try {
        let res = yield call(ApiProvider.uploadFileAWS, file, prefixType, uploadProgress);
        console.log("Upload", res);

        if (res && res.status == 201) {
            let location: string = res?.body?.postResponse?.location ?? res?.headers?.Location
            if (location) {
                // console.log("location.substring(location?.lastIndexOf(prefixType))", location.substring(location?.lastIndexOf(prefixType)))
                // return
                if (prefixType == 'video') {
                    let res = yield call(transcodeVideo, fileName)
                    console.log("Completed", res);
                    onSuccess && onSuccess(fileName, fileName.substring(0, fileName.lastIndexOf(".")) + "-00001.png")
                    return
                }
                onSuccess && onSuccess(fileName,)
            }
        } else {
            yield put(setLoadingAction(false))
        }
    }
    catch (e) {
        console.log("Error Catch", e)
        yield put(setLoadingAction(false))
    }

};


function* uploadImageArray({ type, payload }: action): Generator<any, any, any> {
    let fileName = "";
    let imageArray: Array<any> = [];
    let profileImage: string = '';
    let { image, onSuccess, prefixType } = payload


    if (!Array.isArray(image)) image = [image];

    for (let i = 0; i < image.length; i++) {
        if (!image[i]?.path) return
        const isImage = image[i]?.mime?.includes("image")
        const date = new Date()
        // fileName = image?.path?.substring(image?.path?.lastIndexOf('/') + 1, image?.path?.length)
        fileName = (!isImage ? "VID-" : "IMG-") + dateFormat(date, "YYYYMMDD") + "-PG" + Date.now() + "" + random(111, 999) + image[i]?.path?.substring(image[i]?.path?.lastIndexOf('.'));
        const file = {
            uri: image[i]?.path,
            name: fileName,
            type: image[i]?.mime || "*/*"
        }
        yield put(setLoadingAction(true))
        try {
            let res = yield call(ApiProvider.uploadFileAWS, file, isImage ? prefixType : 'video', (p, id) => uploadProgress(p, id, i + 1, image?.length));
            console.log("Upload", res);

            if (res && res.status == 201) {
                let location: string = res?.body?.postResponse?.location ?? res?.headers?.Location
                if (location) {
                    // console.log("location.substring(location?.lastIndexOf(prefixType))", location.substring(location?.lastIndexOf(prefixType)))
                    // return
                    if (!isImage) {
                        let res = yield call(transcodeVideo, fileName)
                        console.log("Completed", res);
                        imageArray = [...imageArray, { type: 'video', name: fileName }]
                        // onSuccess && onSuccess(fileName, fileName.substring(0, fileName.lastIndexOf(".")) + "-00001.png")
                        // return
                    } else {
                        if (image[i]?.isProfile) profileImage = fileName;
                        else imageArray = [...imageArray, { type: !isImage ? 'video' : 'image', name: fileName }];
                        // onSuccess && onSuccess(fileName, image[i]?.isProfile ?? false)
                    }
                }
            } else {
                yield put(setLoadingAction(false))
            }
        }
        catch (e) {
            console.log("Error Catch", e)
            yield put(setLoadingAction(false))
        }
    }
    onSuccess && onSuccess(imageArray, profileImage)
    yield put(setLoadingAction(false))
};



function* cancelUpload({ type, payload }: action): Generator<any, any, any> {
    ApiProvider._cancelUpload()
    yield put(setLoadingAction(false))
}

interface IProgress extends Progress {
    currentCount: number
    length: number
}

const uploadProgress = async (progress: Progress, id: string, currentCount = 0, length = 0) => {
    console.log("Progress", progress);
    await showNotification(id, progress as IProgress, currentCount, length)
}



const showNotification = async (id: string, p: IProgress, currentCount: number, length: number) => {
    let title = Language.getString('uploading_file')
    if (currentCount) {
        p.currentCount = currentCount
        p.length = length
    }

    let progress: AndroidProgress = {
        indeterminate: true,
    }
    let finalize = p?.loaded == p?.total && currentCount == length
    if (!activeUploads.includes(id)) {
        store.dispatch(setLoadingAction(true))
        activeUploads.push(id)
        title = Language.getString('starting_upload') + "..."

    } else if (finalize) {
        title = Language.getString('finalizing_upload') + "..."
    } else progress = { max: p?.total, current: p?.loaded, }
    store.dispatch(setLoadingMsg(JSON.stringify(p) + "%"))
    isAndroid && await notifee.displayNotification({
        id,
        title,
        android: {
            onlyAlertOnce: true,
            progress,
            channelId: "upload",
        },
        ios: {

        }
    })
    if (finalize) {
        setTimeout(async () => {
            store.dispatch(setLoadingMsg(""))
            isAndroid && await notifee.cancelNotification(id);
        }, 1000);
    }
}

export const transcodeVideo = async (key: string) => {
    // presets: http://docs.aws.amazon.com/elastictranscoder/latest/developerguide/system-presets.html
    const params: CreateJobCommandInput = {
        PipelineId: config.AWS3_PIPELINE_ID, // specifies output/input buckets in S3 
        Input: {
            Key: key,
        },
        OutputKeyPrefix: 'transcoded/',
        Outputs: [{
            "Key": key,
            "Rotate": "0",
            "PresetId": "1351620000001-000001",
            "ThumbnailPattern": `${key.substring(0, key.lastIndexOf("."))}-{count}`
        }]
    };

    const command = new CreateJobCommand(params)
    try {
        console.log("Starting transcode");

        const res = await transcoderClient.send(command)
        const jobId = res.Job?.Id
        console.log('AWS transcoder job created (' + jobId + ')');
        waitForCompleteJob(res?.Job?.Id)
    }
    catch (e) {
        console.log("Error in transcoding", e);
    }
}

const waitForCompleteJob = async (id?: string) => {
    waitUntilJobComplete({
        client: transcoderClient,
        minDelay: 4,
        maxDelay: 10,
        maxWaitTime: 30
    }, {
        Id: id
    }).then((waiterResult) => {
        console.log("Transcoding complete", waiterResult);

    }).catch((reason) => {
        console.log("Reason", reason);
    })
}
// Watcher: watch auth request
export default function* watchUploadSaga() {
    // Take Last Action Only
    yield takeLatest(ActionTypes.UPLOAD_FILE, uploadImage);
    yield takeLatest(ActionTypes.UPLOAD_FILE_ARRAY, uploadImageArray);
    yield takeLatest(ActionTypes.CANCEL_UPLOAD, cancelUpload);
};