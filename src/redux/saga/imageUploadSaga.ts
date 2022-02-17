import { config } from 'api';
import * as ApiProvider from 'api/APIProvider';
import { setLoadingAction } from "app-store/actions";
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import { call, put, takeLatest } from 'redux-saga/effects';
import ActionTypes, { action } from "../action-types";

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
                { presetId: '1351620000000-100080' }
            ]
        }
    }
})

const transcoder = new AWS.ElasticTranscoder();

function* uploadImage({ type, payload }: action): Generator<any, any, any> {
    let fileName = "";
    const { image, onSuccess, prefixType } = payload
    if (!image?.path) return
    fileName = image?.path?.substring(image?.path?.lastIndexOf('/') + 1, image?.path?.length)
    const file = {
        uri: image?.path,
        name: fileName,
        type: image?.mime ?? fileName?.toLowerCase().endsWith("png") ? 'image/jpeg' : 'image/png'
    }
    yield put(setLoadingAction(true))
    try {
        let res = yield call(ApiProvider.uploadFileAWS, file, prefixType);
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
            "PresetId": "1351620000000-100080",
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
};