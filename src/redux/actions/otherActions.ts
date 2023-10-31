import ActionTypes, { action } from "../action-types"
import { store } from "../store"

export const setLoadingAction = (payload: boolean): action => {
  if (payload == false) {
    store.dispatch(setLoadingMsg("Loading . . ."))
  }
  return {
    type: ActionTypes.IS_LOADING,
    payload
  }
}

export const setLoadingMsg = (payload: string): action => {
  return {
    type: ActionTypes.LOADING_MSG,
    payload
  }
}

export const uploadFile = (payload: { image: any, onSuccess?: (url: string, thumbnail?: string) => void, prefixType: 'users' | 'events' | 'groups' | 'messages' | 'video' }): action => ({
  type: ActionTypes.UPLOAD_FILE,
  payload
})

export const uploadFileArray = (payload: { image: Array<any>, onSuccess?: (imageArray: Array<any>, profileImage?: string) => void, prefixType: 'users' | 'events' | 'groups' | 'messages' | 'video' }): action => ({
  type: ActionTypes.UPLOAD_FILE_ARRAY,
  payload
})

export const cancelUpload = (): action => ({
  type: ActionTypes.CANCEL_UPLOAD
})

export const refreshLanguage = (payload?: any): action => ({
  type: ActionTypes.REFRESH_LANGUAGE,
  payload
})

export const resetStateOnLogin = (payload?: any): action => ({
  type: ActionTypes.RESET_STATE_ON_LOGIN,
  payload
})

export const resetStateOnLogout = (payload?: any): action => ({
  type: ActionTypes.RESET_STATE_ON_LOGOUT,
  payload
})

export const updateDeviceLanguage = (payload?: any): action => ({
  type: ActionTypes.UPDATE_DEVICE_LANGUAGE,
  payload
})

export const updateDeviceFiat = (payload?: any): action => ({
  type: ActionTypes.UPDATE_DEVICE_FIAT,
  payload
})
