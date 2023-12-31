
const UserTypes = {
  DO_LOGOUT: "DO_LOGOUT",
  DO_LOGIN: "DO_LOGIN",
  DO_SIGN_UP: "DO_SIGN_UP",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  RESET_PASSWORD: "RESET_PASSWORD",
  VERIFY_OTP: "VERIFY_OTP",
  CHECK_EMAIL: "CHECK_EMAIL",

  // Profile

  GET_PROFILE: "GET_PROFILE",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  UPDATE_NOTIFICATION_SETTINGS: "UPDATE_NOTIFICATION_SETTINGS",
  DELETE_ACCOUNT: "DELETE_ACCOUNT",
  UPDATE_PASSWORD: "UPDATE_PASSWORD",
  SET_NOTIFICATION_SETTINGS: "SET_NOTIFICATION_SETTINGS",
  RESTORE_PURCHASE: "RESTORE_PURCHASE",
  // GET_USER_EVENTS: 'GET_USER_EVENTS',
  // SET_USER_EVENTS: 'SET_USER_EVENTS',
  SET_USER_GROUPS: 'SET_USER_GROUPS',
  GET_USER_GROUPS: 'GET_USER_GROUPS',
  SET_USER_UPCOMING_PAST_EVENTS: 'SET_USER_UPCOMING_PAST_EVENTS',
  GET_USER_UPCOMING_PAST_EVENTS: 'GET_USER_UPCOMING_PAST_EVENTS',

  // Groups

  CREATE_GROUP: "CREATE_GROUP",
  UPDATE_GROUP: "UPDATE_GROUP",
  DELETE_GROUP: "DELETE_GROUP",
  DELETE_GROUP_SUCCESS: "DELETE_GROUP_SUCCESS",
  JOIN_GROUP: "JOIN_GROUP",
  JOIN_GROUP_SUCCESS: "JOIN_GROUP_SUCCESS",
  LEAVE_GROUP: "LEAVE_GROUP",
  LEAVE_GROUP_SUCCESS: "LEAVE_GROUP_SUCCESS",
  GET_GROUP_DETAIL: "GET_GROUP_DETAIL",
  SET_GROUP_DETAIL: "SET_GROUP_DETAIL",
  UPDATE_GROUP_DETAIL: "UPDATE_GROUP_DETAIL",
  GET_GROUP_MEMBERS: "GET_GROUP_MEMBERS",
  SET_GROUP_MEMBERS: "SET_GROUP_MEMBERS",
  REMOVE_GROUP_MEMBER: "REMOVE_GROUP_MEMBER",
  REMOVE_GROUP_MEMBER_SUCCESS: "REMOVE_GROUP_MEMBER_SUCCESS",
  GET_ALL_GROUPS: "GET_ALL_GROUPS",
  SET_ALL_GROUPS: "SET_ALL_GROUPS",
  SET_MY_GROUPS: "SET_MY_GROUPS",
  ADD_IN_GROUPS: "ADD_IN_GROUPS",
  SET_ACTIVE_GROUP: "SET_ACTIVE_GROUP",
  LEAD_GROUP: "LEAD_GROUP",
  LEAD_GROUP_SUCCESS: "LEAD_GROUP_SUCCESS",


  GET_MUTED_REPORTED_COUNT: "GET_MUTED_REPORTED_COUNT",
  GET_BLOCKED_MEMBERS: "GET_BLOCKED_MEMBERS",
  GET_MUTED_RESOURCES: "GET_MUTED_RESOURCES",

  BLOCK_UNBLOCK_RESOURCE: "BLOCK_UNBLOCK_RESOURCE",
  MUTE_UNMUTE_RESOURCE: "MUTE_UNMUTE_RESOURCE",
  REPORT_RESOURCE: "REPORT_RESOURCE",
  // GROUP CHAT
  GET_GROUP_MEDIA: "GET_GROUP_MEDIA",

  // Privacy Screen

  SET_PRIVACY_STATE: "SET_PRIVACY_STATE",

  REMOVE_BLOCKED_MEMBER: "REMOVE_BLOCKED_MEMBER",
  SET_BLOCKED_MEMBERS: "SET_BLOCKED_MEMBERS",
  SET_MUTED_GROUPS: "SET_MUTED_GROUPS",
  SET_MUTED_EVENTS: "SET_MUTED_EVENTS",
  SET_MUTED_POSTS: "SET_MUTED_POSTS",
  ADD_MUTED_RESOURCE: "ADD_MUTED_RESOURCE",
  SET_MUTED_RESOURCE: "SET_MUTED_RESOURCE",
  REMOVE_MUTED_RESOURCE: "REMOVE_MUTED_RESOURCE",

  // Events

  GET_MY_GROUPS: 'GET_MY_GROUPS',
  GET_ALL_CURRENCIES: 'GET_ALL_CURRENCIES',
  SET_ALL_CURRENCIES: 'SET_ALL_CURRENCIES',
  CREATE_EVENT: "CREATE_EVENT",
  UPDATE_EVENT: "UPDATE_EVENT",
  DELETE_EVENT: "DELETE_EVENT",
  DELETE_EVENT_AS_PUBLIC_ADMIN: "DELETE_EVENT_AS_PUBLIC_ADMIN",
  DELETE_EVENT_SUCCESS: "DELETE_EVENT_SUCCESS",
  JOIN_EVENT: "JOIN_EVENT",
  // for bolt11
  BOLT11_EVENT: "BOLT_EVENT",
  JOIN_EVENT_SUCCESS: "JOIN_EVENT_SUCCESS",
  PIN_EVENT: "PIN_EVENT",
  PIN_EVENT_SUCCESS: "PIN_EVENT_SUCCESS",
  LEAVE_EVENT: "LEAVE_EVENT",
  LEAVE_EVENT_SUCCESS: "LEAVE_EVENT_SUCCESS",
  GET_ALL_EVENTS: "GET_ALL_EVENTS",
  SET_ALL_EVENTS: "SET_ALL_EVENTS",
  SET_MY_EVENTS: "SET_MY_EVENTS",
  ADD_IN_EVENTS: "ADD_IN_EVENTS",
  GET_EVENT_DETAIL: "GET_EVENT_DETAIL",
  GET_EDIT_EVENT_DETAIL: "GET_EDIT_EVENT_DETAIL",
  SET_EVENT_DETAIL: "SET_EVENT_DETAIL",
  UPDATE_EVENT_DETAIL: "UPDATE_EVENT_DETAIL",
  GET_EVENT_MEMBERS: "GET_EVENT_MEMBERS",
  SET_EVENT_MEMBERS: "SET_EVENT_MEMBERS",
  REMOVE_EVENT_MEMBER: "REMOVE_EVENT_MEMBER",
  REMOVE_EVENT_MEMBER_SUCCESS: "REMOVE_EVENT_MEMBER_SUCCESS",
  SET_ACTIVE_EVENT: "SET_ACTIVE_EVENT",
  VERIFY_QR_CODE: "VERIFY_QR_CODE",
  UNDO_CHECK_IN: "UNDO_CHECK_IN",

  AUTHORIZE_PAYMENT: "AUTHORIZE_PAYMENT",
  CAPTURE_PAYMENT: "CAPTURE_PAYMENT",


  SEARCH_AT_HOME: "SEARCH_AT_HOME",
  SET_SEARCHED_DATA: "SET_SEARCHED_DATA",


  GET_MY_EVENTS: "GET_MY_EVENTS",
  SET_UPCOMING_EVENTS: "SET_UPCOMING_EVENTS",
  SET_PAST_EVENTS: "SET_PAST_EVENTS",


  ///  EVENTS FOR CHECK IN
  GET_EVENTS_FOR_CHECK_IN: "GET_EVENTS_FOR_CHECK_IN",
  ON_FETCH_EVENT_FOR_CHECK_IN: "ON_FETCH_EVENT_FOR_CHECK_IN",

  SET_EVENT_MEMBERS_LIST: "SET_EVENT_MEMBERS_LIST",
  GET_EVENT_MEMBERS_LIST: 'GET_EVENT_MEMBERS_LIST,',


  CONNECT_PAYPAL: 'CONNECT_PAYPAL',
  PAYPAL_TRACK_SELLER: "PAYPAL_TRACK_SELLER",

  PAY_WITH_BITCOIN: 'PAY_WITH_BITCOIN'

}


export default UserTypes