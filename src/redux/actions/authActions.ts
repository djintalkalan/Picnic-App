
import ActionTypes from '../action-types';

export const doLogin = (payload?: any) => {
  return {
    type: ActionTypes.DO_LOGIN,
    payload
  };
}

export const forgotPassword = (payload?: any) => {
  return {
    type: ActionTypes.FORGOT_PASSWORD,
    payload
  };
}

export const resetPassword = (payload?: any) => {
  return {
    type: ActionTypes.RESET_PASSWORD,
    payload
  };
}

export const verifyOtp = (payload?: any) => {
  return {
    type: ActionTypes.VERIFY_OTP,
    payload
  };
}

export const doSignUp = (payload?: any) => {
  return {
    type: ActionTypes.DO_SIGN_UP,
    payload
  };
}

export const doLogout = (payload?: any) => {
  return {
    type: ActionTypes.DO_LOGOUT,
    payload
  };
}

export const checkEmail = (payload: any) => {
  return {
    type: ActionTypes.CHECK_EMAIL,
    payload
  };
}

export const tokenExpired = (payload?: any) => {
  return {
    type: ActionTypes.TOKEN_EXPIRED,
    payload
  };
}


export const getProfile = () => {
  return {
    type: ActionTypes.GET_PROFILE,

  };
}

export const updateProfile = (payload: any) => ({
  type: ActionTypes.UPDATE_PROFILE,
  payload
})

export const updateNotificationSettings = (payload: any) => ({
  type: ActionTypes.UPDATE_NOTIFICATION_SETTINGS,
  payload
})

export const deleteAccount = (payload: any) => ({
  type: ActionTypes.DELETE_ACCOUNT,
  payload
})

export const updatePassword = (payload: any) => ({
  type: ActionTypes.UPDATE_PASSWORD,
  payload
})

export const restorePurchase = (payload?: any) => ({
  type: ActionTypes.RESTORE_PURCHASE,
  payload
})