export const CONNECTION = 'connection';

// EMITTER FOR client to server

//Groups Events
export const EMIT_SEND_GROUP_MESSAGE = 'sendGroupMessage';
export const EMIT_GROUP_CHAT = 'getGroupChat';
export const EMIT_GROUP_REPLY = 'groupMessageReply';
export const EMIT_GROUP_MESSAGE_DELETE = 'groupMessageDelete';
export const EMIT_GROUP_MESSAGE_TYPING = "groupMessageTyping";
export const EMIT_GROUP_DELETE = "groupDelete";
export const EMIT_GROUP_MEMBER_DELETE = "groupMemberDelete";

//Events Events
export const EMIT_SEND_EVENT_MESSAGE = 'sendEventMessage';
export const EMIT_EVENT_CHAT = 'getEventChat';
export const EMIT_EVENT_REPLY = 'eventMessageReply';
export const EMIT_EVENT_MESSAGE_DELETE = 'eventMessageDelete';
export const EMIT_EVENT_MESSAGE_TYPING = "eventMessageTyping";
export const EMIT_EVENT_DELETE = "eventDelete";
export const EMIT_EVENT_DELETE_BY_PUBLIC_GROUP_LEADER = "eventDeleteByGroupLeader"
export const EMIT_EVENT_MEMBER_DELETE = "eventMemberDelete";

//Common Events
export const EMIT_DISCONNECT = 'disconnect';
export const EMIT_JOIN = 'join';
export const EMIT_LEAVE_ROOM = "leaveRoom";
export const EMIT_JOIN_ROOM = "joinRoom";
export const EMIT_LIKE_UNLIKE = 'likeUnlike';
export const EMIT_SET_CHAT_BACKGROUND = 'setBackgroundColor'

// PERSONAL Messages Events

export const EMIT_SEND_PERSONAL_MESSAGE = 'sendMessage';
export const EMIT_PERSONAL_LIKE_UNLIKE = 'oneToOneLikeUnlike';
export const EMIT_PERSONAL_MESSAGE_DELETE = 'oneToOneDeleteMessage';
export const EMIT_JOIN_PERSONAL_ROOM = 'joinOneToOneRoom';
export const EMIT_READ_ONE_TO_ONE_MESSAGE = 'readOneToOneMessage';

/********************************************************************************************************/
/********************************************************************************************************/
/********************************************************************************************************/
/********************************************************************************************************/
/********************************************************************************************************/
/********************************************************************************************************/
/********************************************************************************************************/

//LISTENER from server to client

//Groups Events
export const ON_GROUP_MESSAGE_DELETE = 'onGroupMessageDelete';
export const ON_GROUP_MESSAGE = "onGroupMessage";//When New Message Is Created And Client Will Receive Posted Message 
export const ON_GROUP_MESSAGES = "onGroupMessages";//When Enter In A Group Chat Hence Get All Group Message
export const ON_GROUP_MESSAGE_TYPING = "onGroupMessageTyping";
export const ON_GROUP_DELETE = "onGroupDelete";
export const ON_GROUP_MEMBER_DELETE = "onGroupMemberDelete";

//Events Events
export const ON_EVENT_MESSAGE_DELETE = 'onEventMessageDelete';
export const ON_EVENT_MESSAGE = "onEventMessage";//When New Message Is Created And Client Will Receive Posted Message 
export const ON_EVENT_MESSAGES = "onEventMessages";//When Enter In A Event Chat Hence Get All Event Message
export const ON_EVENT_MESSAGE_TYPING = "onEventMessageTyping";
export const ON_EVENT_DELETE = "onEventDelete";
export const ON_EVENT_MEMBER_DELETE = "onEventMemberDelete";

//Common Events
export const ON_CONNECTION = 'onConnection';
export const ON_DISCONNECT = 'disconnect';
export const ON_RECONNECT = 'reconnect';
export const ON_CONNECT = 'connect';
export const ON_JOIN = 'onJoin';
export const ON_LEAVE_ROOM = "onLeaveRoom";
export const ON_JOIN_ROOM = "onJoinRoom";
export const ON_LIKE_UNLIKE = "onLikeUnlike";//When Message Is  Like/Un-liked
export const ON_SET_CHAT_BACKGROUND = 'onSetBackgroundColor'

// PERSONAL Messages Events
export const ON_PERSONAL_MESSAGE = 'onMessage';
export const ON_PERSONAL_LIKE_UNLIKE = 'onOneToOneLikeUnlike';
export const ON_PERSONAL_MESSAGE_DELETE = 'onOneToOneDeleteMessage';
export const ON_PERSONAL_JOIN_ROOM_REQUEST = 'onJoinOneToOneRoom';
