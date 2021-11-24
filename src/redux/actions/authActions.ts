
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

export const tokenExpired = (payload?: any) => {
  return {
    type: ActionTypes.TOKEN_EXPIRED,
    payload
  };
}


