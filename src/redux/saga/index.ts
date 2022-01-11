import { all, fork } from 'redux-saga/effects';
import watchAuth from "./authSaga";
import watchEventChat from './eventChatSaga';
import watchEvents from './eventSaga';
import watchGroupChat from './groupChatSaga';
import watchGroups from './groupSaga';
import watchHome from './homeSaga';
import watchUploadSaga from './imageUploadSaga';
import watchProfile from './profileSaga';

export function* rootSaga() {
  yield all([
    fork(watchAuth),
    fork(watchProfile),
    fork(watchGroups),
    fork(watchUploadSaga),
    fork(watchHome),
    fork(watchEvents),
    fork(watchGroupChat),
    fork(watchEventChat),
  ]);
}