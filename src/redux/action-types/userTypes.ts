
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


  // Groups

  CREATE_GROUP: "CREATE_GROUP",
  UPDATE_GROUP: "UPDATE_GROUP",
  DELETE_GROUP: "DELETE_GROUP",
  JOIN_GROUP: "JOIN_GROUP",
  LEAVE_GROUP: "LEAVE_GROUP",
  GET_GROUP_DETAIL: "GET_GROUP_DETAIL",
  GET_GROUP_MEMBERS: "GET_GROUP_MEMBERS",
  REMOVE_GROUP_MEMBER: "REMOVE_GROUP_MEMBER",
  GET_ALL_GROUPS: "GET_ALL_GROUPS",
  SET_ALL_GROUPS: "SET_ALL_GROUPS",
  ADD_IN_GROUPS: "ADD_IN_GROUPS",

  GET_MUTED_REPORTED_COUNT: "GET_MUTED_REPORTED_COUNT",
  GET_BLOCKED_MEMBERS: "GET_BLOCKED_MEMBERS",
  GET_MUTED_RESOURCES: "GET_MUTED_RESOURCES",

  BLOCK_UNBLOCK_RESOURCE: "BLOCK_UNBLOCK_RESOURCE",

  // GROUP CHAT
  GET_GROUP_CHAT: "GET_GROUP_CHAT",
  GET_GROUP_MEDIA: "GET_GROUP_MEDIA",

  // Privacy Screen

  SET_PRIVACY_STATE: "SET_PRIVACY_STATE",

  SET_BLOCKED_MEMBERS: "SET_BLOCKED_MEMBERS",
  SET_MUTED_GROUPS: "SET_MUTED_GROUPS",
  SET_MUTED_EVENTS: "SET_MUTED_EVENTS",
  SET_MUTED_POSTS: "SET_MUTED_POSTS",





}


export default UserTypes