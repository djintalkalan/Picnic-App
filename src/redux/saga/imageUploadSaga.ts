import * as ApiProvider from 'api/APIProvider';
import { setLoadingAction } from "app-store/actions";
import { call, put, takeLatest } from 'redux-saga/effects';
import ActionTypes, { action } from "../action-types";


function* uploadImage({ type, payload }: action): Generator<any, any, any> {
    let fileName = "";
    const { image, onSuccess, prefixType } = payload
    if (!image?.path) return
    fileName = prefixType + "_" + image?.path?.substring(image?.path?.lastIndexOf('/') + 1, image?.path?.length)
    const file = {
        uri: image?.path,
        name: fileName,
        type: image?.mime ?? fileName?.toLowerCase().endsWith("png") ? 'image/jpeg' : 'image/png'
    }
    yield put(setLoadingAction(true))
    try {
        let res = yield call(ApiProvider.uploadFileAWS, file, prefixType);
        if (res && res.status == 200 && res.body && res.body.postResponse && res.body.postResponse.location) {
            onSuccess && onSuccess(res.body.postResponse.location)
        }
        yield put(setLoadingAction(false))
    }
    catch (e) {
        console.log("Error Catch", e)
        yield put(setLoadingAction(false))
    }

};
// Watcher: watch auth request
export default function* watchUploadSaga() {
    // Take Last Action Only
    yield takeLatest(ActionTypes.UPLOAD_FILE, uploadImage);
};