import notifee, { AndroidProgress } from "@notifee/react-native";
import { config } from 'api';
import * as ApiProvider from 'api/APIProvider';
import { setLoadingAction, setLoadingMsg } from "app-store/actions";
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import { random } from "lodash";
import { Platform } from "react-native";
import { Progress } from 'react-native-aws3';
import { call, put, takeLatest } from 'redux-saga/effects';
import { dateFormat } from "utils";
import { store } from "..";
import ActionTypes, { action } from "../action-types";

let activeUploads: Array<string> = []

const isAndroid = Platform.OS == 'android'

AWS.config.update({
    accessKeyId: config.AWS3_ACCESS_K + config.AWS3_ACCESS_E + config.AWS3_ACCESS_Y,
    secretAccessKey: config.AWS3_SECRET_K + config.AWS3_SECRET_E + config.AWS3_SECRET_Y,
    region: config.AWS3_REGION,
    videoBucket: config.AWS3_VIDEO_BUCKET,
    transcode: {
        video: {
            pipelineId: config.AWS3_PIPELINE_ID,
            outputKeyPrefix: '', // put the video into the transcoded folder
            presets: [ // Comes from AWS console
                { presetId: '1351620000001-000001' }
            ]
        }
    }
})

const transcoder = new AWS.ElasticTranscoder();

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
                    let res = yield call(transcodeVideo, fileName, (res) => {
                        console.log("Completed", res);
                    });
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

function* cancelUpload({ type, payload }: action): Generator<any, any, any> {
    ApiProvider._cancelUpload()
    yield put(setLoadingAction(false))
}



const uploadProgress = async (progress: Progress, id: string) => {
    console.log("Progress", progress);
    await showNotification(id, progress)
}



const showNotification = async (id: string, p: Progress) => {
    let title = "Uploading file"
    let progress: AndroidProgress = {
        indeterminate: true,
    }
    let finalize = p?.loaded == p?.total
    if (!activeUploads.includes(id)) {
        store.dispatch(setLoadingAction(true))
        activeUploads.push(id)
        title = "Starting upload..."

    } else if (finalize) {
        title = "Finalizing upload..."
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

const transcodeVideo = async (key: string, callback: (obj: any) => void) => {
    // presets: http://docs.aws.amazon.com/elastictranscoder/latest/developerguide/system-presets.html
    let params = {
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

    transcoder.createJob(params, function (err: any, data: any) {
        if (!!err) {
            console.log("Error", err);
            return;
        }
        let jobId = data.Job.Id;
        console.log('AWS transcoder job created (' + jobId + ')');
        transcoder.waitFor('jobComplete', { Id: jobId }, callback);
    });
}
// Watcher: watch auth request
export default function* watchUploadSaga() {
    // Take Last Action Only
    yield takeLatest(ActionTypes.UPLOAD_FILE, uploadImage);
    yield takeLatest(ActionTypes.CANCEL_UPLOAD, cancelUpload);
};