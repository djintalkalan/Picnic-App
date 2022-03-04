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

export const refreshLanguage = (payload?: any): action => ({
  type: ActionTypes.REFRESH_LANGUAGE,
  payload
})
