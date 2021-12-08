import { all, fork } from 'redux-saga/effects';
import watchAuth from "./authSaga";
import watchGroups from './groupSaga';
import watchProfile from './profileSaga';

export function* rootSaga() {
  yield all([
    fork(watchAuth),
    fork(watchProfile),
    fork(watchGroups),
  ]);
}