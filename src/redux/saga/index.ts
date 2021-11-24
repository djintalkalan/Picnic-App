import { all, fork } from 'redux-saga/effects';
import watchAuth from "./authSaga";

export function* rootSaga() {
  yield all([
    fork(watchAuth),
  ]);
}