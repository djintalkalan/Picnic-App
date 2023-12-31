import { config } from "api";
import { deleteChatInEventSuccess, deleteChatInGroupSuccess, deleteEventSuccess, deleteGroupSuccess, getEventDetail, getGroupDetail, leaveEventSuccess, leaveGroupSuccess, removeEventMemberSuccess, removeGroupMemberSuccess, setChatBackgroundSuccess, setChatInEvent, setChatInGroup, setChatInPerson, updateChatInEvent, updateChatInEventSuccess, updateChatInGroup, updateChatInGroupSuccess, updateChatInPerson, updateChatInPersonSuccess } from "app-store/actions";
import Database from "database";
import { Dispatch } from "react";
import { DeviceEventEmitter } from "react-native";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import Language, { DefaultLanguage, LanguageType } from "src/language/Language";
import { getChatUsers, mergeMessageObjects, NavigationService, _showErrorMessage } from "utils";
import { EMIT_JOIN, EMIT_JOIN_PERSONAL_ROOM, EMIT_LEAVE_ROOM, ON_CONNECT, ON_CONNECTION, ON_DISCONNECT, ON_EVENT_DELETE, ON_EVENT_MEMBER_DELETE, ON_EVENT_MESSAGE, ON_EVENT_MESSAGES, ON_EVENT_MESSAGE_DELETE, ON_GROUP_DELETE, ON_GROUP_MEMBER_DELETE, ON_GROUP_MESSAGE, ON_GROUP_MESSAGES, ON_GROUP_MESSAGE_DELETE, ON_JOIN, ON_JOIN_ROOM, ON_LEAVE_ROOM, ON_LIKE_UNLIKE, ON_PERSONAL_JOIN_ROOM_REQUEST, ON_PERSONAL_LIKE_UNLIKE, ON_PERSONAL_MESSAGE, ON_PERSONAL_MESSAGE_DELETE, ON_RECONNECT, ON_SET_CHAT_BACKGROUND, ON_VOTE_CASTED } from "./SocketEvents";

class Service {
    static instance?: Service;
    private socket?: Socket;
    private dispatch!: Dispatch<any>;

    static getInstance = () => {
        if (!this.instance) {
            this.instance = new Service()
        }
        return this.instance;
    }

    init = (dispatch: Dispatch<any>) => {
        this.dispatch = dispatch
        const isLogin = Database.getStoredValue('isLogin')
        if (!this.socket) {
            if (isLogin) {
                const authToken = Database.getStoredValue('authToken')
                const selectedLanguage = Database.getStoredValue<LanguageType>('selectedLanguage') || DefaultLanguage

                const url = config.SOCKET_URL + (config?.SOCKET_PORT ? (":" + config?.SOCKET_PORT) : "")
                const options: Partial<ManagerOptions & SocketOptions> = {
                    // timeout: 5000,
                    // reconnection: true,
                    // autoConnect: false,
                    // reconnectionDelay: 5000,
                    secure: config.SOCKET_URL?.startsWith("https") || config.SOCKET_URL?.startsWith("wss"),
                    transports: ['websocket', 'polling'],
                    extraHeaders: {
                        Authorization: authToken ? ("Bearer " + authToken) : "",
                        'Accept-Language': selectedLanguage,
                        version: '1'
                    }
                }
                // console.log("SOCKET URL", url);
                // console.log("OPTIONS", options);
                this.socket = io(url, options);
                this.initListeners();
                console.log("connecting");
                this.socket.connect()
            }
        } else {
            if (isLogin) {
                this.socket?.connect()
            }
        }
    }

    closeSocket = () => {
        if (this.socket) {
            this.socket.disconnect();
            Database.setSocketConnected(false);
            this.socket.removeAllListeners();
            this.socket = undefined
        }
    }

    emit = (event: string, data?: any) => {
        console.log("Event Emit", event);
        console.log("Event Payload", data);
        this.socket?.emit(event, {
            event,
            payload: data
        })
    }

    private initListeners = () => {
        this.socket?.on(ON_CONNECTION, this.onConnection)
        this.socket?.on(ON_CONNECT, this.onConnect)
        this.socket?.on(ON_DISCONNECT, this.onDisconnect)
        this.socket?.io?.on(ON_RECONNECT, this.onReconnect)

        this.socket?.on(ON_JOIN, this.onJoin)
        this.socket?.on(ON_JOIN_ROOM, this.onJoinRoom)
        this.socket?.on(ON_LEAVE_ROOM, this.onLeaveRoom)

        this.socket?.on(ON_LIKE_UNLIKE, this.onLikeUnlike)
        this.socket?.on(ON_VOTE_CASTED, this.onVoteCasted)

        this.socket?.on(ON_GROUP_MESSAGE, this.onGroupMessage)
        this.socket?.on(ON_GROUP_MESSAGES, this.onGroupMessages)
        this.socket?.on(ON_GROUP_MESSAGE_DELETE, this.onGroupMessageDelete)
        this.socket?.on(ON_GROUP_DELETE, this.onGroupDelete)
        this.socket?.on(ON_GROUP_MEMBER_DELETE, this.onGroupMemberDelete)

        this.socket?.on(ON_EVENT_MESSAGE, this.onEventMessage)
        this.socket?.on(ON_EVENT_MESSAGES, this.onEventMessages)
        this.socket?.on(ON_EVENT_MESSAGE_DELETE, this.onEventMessageDelete)
        this.socket?.on(ON_EVENT_DELETE, this.onEventDelete)
        this.socket?.on(ON_EVENT_MEMBER_DELETE, this.onEventMemberDelete)

        this.socket?.on(ON_SET_CHAT_BACKGROUND, this.onSetChatBackground)


        this.socket?.on(ON_PERSONAL_MESSAGE, this.onPersonalMessage)
        this.socket?.on(ON_PERSONAL_LIKE_UNLIKE, this.onPersonalLikeUnlike)
        this.socket?.on(ON_PERSONAL_MESSAGE_DELETE, this.onPersonalMessageDelete)
        this.socket?.on(ON_PERSONAL_JOIN_ROOM_REQUEST, this.onJoinRequest)


        this.listenErrors();
        // this.socket?.on(ON_EVENT_MESSAGE_TYPING, this.onEventMessageTyping)
    }



    private onJoin = (e: any) => {

    }

    private onJoinRoom = (e: any) => {

    }

    private onLeaveRoom = (e: any) => {

    }

    private onLikeUnlike = (e: any) => {
        console.log("on Like Unlike", e)
        if (e?.status == 200) {
            if (e?.data?.data?.length && Array.isArray(e?.data?.data)) {
                const userId = Database.getStoredValue("userData")?._id
                const data = mergeMessageObjects(e?.data?.data, e?.data?.message_total_likes_count, [])
                console.log("data", data);

                if (e?.liked_by_users?.findIndex((e: any) => (e?.user_id == userId)) > -1) {
                    data[0].is_message_liked_by_me = true
                } else {
                    data[0].is_message_liked_by_me = false
                }
                // e?.liked_by_users?.some((e: any, index: number) => {
                //     if (e?.user_id == userId) {
                //         data[0].is_message_liked_by_me = true
                //         return true
                //     }
                // });
                if (data?.[0]?.group)
                    this.dispatch(updateChatInGroup({
                        groupId: data?.[0]?.resource_id,
                        chat: data?.[0]
                    }))
                else
                    this.dispatch(updateChatInEvent({
                        eventId: data?.[0]?.resource_id,
                        chat: data?.[0]
                    }))
            }
        }

        else if (e?.status == 400) {
            if (e?.data?.invalid_resource) {
                console.log("Invalid Resource Id");
                this.dispatch((e?.data?.resource_type == 'group' ? getGroupDetail : getEventDetail)(e?.data?.resource_id))
            }
        }
    }

    private onVoteCasted = (e: any) => {
        console.log("on Vote Casted", e)
        if (e?.status == 200) {
            if (e?.data?.data?.length && Array.isArray(e?.data?.data)) {
                const userId = Database.getStoredValue("userData")?._id
                const data = e?.data?.data // mergeMessageObjects(e?.data?.data, e?.data?.message_total_likes_count, [])
                console.log("data", data);
                // e?.liked_by_users?.some((e: any, index: number) => {
                //     if (e?.user_id == userId) {
                //         data[0].is_message_liked_by_me = true
                //         return true
                //     }
                // });
                if (data?.[0]?.group)
                    this.dispatch(updateChatInGroup({
                        groupId: data?.[0]?.resource_id,
                        chat: data?.[0]
                    }))
                else
                    this.dispatch(updateChatInEvent({
                        eventId: data?.[0]?.resource_id,
                        chat: data?.[0]
                    }))
            }
        }

        else if (e?.status == 400) {
            if (e?.data?.invalid_resource) {
                console.log("Invalid Resource Id");
                this.dispatch((e?.data?.resource_type == 'group' ? getGroupDetail : getEventDetail)(e?.data?.resource_id))
            }
        }
    }

    private onSetChatBackground = (e: any) => {
        console.log("onSetChatBackground", e)
        if (e?.data) {
            this.dispatch(setChatBackgroundSuccess(e.data))
        }
    }

    /************************************************   GROUPS   *********************************************/

    private onGroupMessageDelete = (e: any) => {
        console.log("Group Message Delete", e)
        if (e?.data) {
            if (e?.data?.message?.data?.length) {
                const data = mergeMessageObjects(e?.data?.message?.data, e?.data?.message?.message_total_likes_count, e?.data?.message?.is_message_liked_by_me)
                this.dispatch(updateChatInGroupSuccess({
                    groupId: e?.data?.resource_id,
                    resourceId: e?.data?.message_id,
                    message: data?.[0]
                }))
            } else {
                this.dispatch(deleteChatInGroupSuccess({
                    groupId: e?.data?.resource_id,
                    resourceId: e?.data?.message_id,
                }))
            }
        }

    }

    private onGroupMessage = (e: any) => {
        console.log("Group Message received", e)
        if (e?.status == 200) {
            if (e?.data?.data?.length) {
                const data = mergeMessageObjects(e?.data?.data, e?.data?.message_total_likes_count, e?.data?.is_message_liked_by_me)
                try {
                    if (data[0]?.message_type == 'poll') {
                        if (NavigationService.getCurrentScreen()?.name == 'CreatePoll') {
                            DeviceEventEmitter.emit('CreatePoll', data[0])
                        }
                    }
                }
                catch (e) {

                }
                this.dispatch(setChatInGroup({
                    groupId: data[0]?.resource_id,
                    chats: data
                }))
            }
        }
        else if (e?.status == 400) {
            if (e?.data?.invalid_resource) {
                console.log("Invalid Resource Id");
                this.dispatch(getGroupDetail(e?.data?.resource_id))
            }
        }

    }

    private onGroupMessages = (e: any) => {
        console.log("Group Messages received", e)
        if (e?.data?.data?.length) {
            const data = mergeMessageObjects(e?.data?.data, e?.data?.message_total_likes_count, e?.data?.is_message_liked_by_me)
            this.dispatch(setChatInGroup({
                groupId: data?.[0]?.resource_id,
                chats: data
            }))
        }
    }

    private onGroupDelete = (e: any) => {
        console.log("onGroupDelete", e)
        if (e?.data) {
            console.log("SCREEN", NavigationService?.getCurrentScreen());
            const { name, params } = NavigationService?.getCurrentScreen() ?? {}
            if ((name == "GroupDetail" || name == "GroupChatScreen" || name == "Chats" || name == "UpcomingEventsChat") &&
                params?.id == e?.data?.resource_id
            ) {
                _showErrorMessage(Language.getString("this_group_is_deleted"), 5000)
                NavigationService.navigate("Home")
            }
            this.dispatch(deleteGroupSuccess(e?.data?.resource_id))
        }
    }

    private onGroupMemberDelete = (e: any) => {
        console.log("onGroupMemberDelete", e)
        if (e?.data) {
            const id = Database.getStoredValue('userData')?._id
            if (id == e?.data?.user_id) {
                console.log("SCREEN", NavigationService?.getCurrentScreen());
                const { name, params } = NavigationService?.getCurrentScreen() ?? {}
                if ((name == "GroupDetail" || name == "GroupChatScreen" || name == "Chats" || name == "UpcomingEventsChat") &&
                    params?.id == e?.data?.resource_id
                ) {
                    _showErrorMessage(Language.getString("you_have_been_removed_from_group"), 5000)
                    NavigationService.navigate("Home")
                }
                this.dispatch(leaveGroupSuccess(e?.data?.resource_id))
                this?.emit(EMIT_LEAVE_ROOM, {
                    resource_id: e?.data?.resource_id
                })
            }
            this.dispatch(removeGroupMemberSuccess({ groupId: e?.data?.resource_id, data: e?.data?.user_id }))
            this.dispatch(setChatInGroup({
                groupId: e?.data?.resource_id,
                chats: e?.data?.message
            }))

            // this.dispatch(setChatInGroup({
            //     groupId: e?.data?.resource_id,
            //     chats: e?.data?.message
            // }))
        }
    }

    /************************************************   EVENTS   *********************************************/

    private onEventMessageDelete = (e: any) => {
        console.log("Event Message Delete", e)
        if (e?.data) {
            if (e?.data?.message?.data?.length) {
                const data = mergeMessageObjects(e?.data?.message?.data, e?.data?.message?.message_total_likes_count, e?.data?.message?.is_message_liked_by_me)
                this.dispatch(updateChatInEventSuccess({
                    eventId: e?.data?.resource_id,
                    resourceId: e?.data?.message_id,
                    message: data?.[0]
                }))
            } else {
                this.dispatch(deleteChatInEventSuccess({
                    eventId: e?.data?.resource_id,
                    resourceId: e?.data?.message_id,
                }))
            }
        }

    }

    private onEventMessage = (e: any) => {
        console.log("Event Message received", e)
        if (e?.status == 200) {
            if (e?.data?.data?.length) {
                const data = mergeMessageObjects(e?.data?.data, e?.data?.message_total_likes_count, e?.data?.is_message_liked_by_me)
                try {
                    if (data[0]?.message_type == 'poll') {
                        if (NavigationService.getCurrentScreen()?.name == 'CreatePoll') {
                            DeviceEventEmitter.emit('CreatePoll', data[0])
                        }
                    }
                }
                catch (e) {

                }
                this.dispatch(setChatInEvent({
                    eventId: data?.[0]?.resource_id,
                    chats: data
                }))
            }
        }
        else if (e?.status == 400) {
            if (e?.data?.invalid_resource) {
                console.log("Invalid Resource Id");
                this.dispatch(getEventDetail(e?.data?.resource_id))
            }
        }

    }

    private onEventMessages = (e: any) => {
        console.log("Event Messages received", e)
        if (e?.data?.data?.length) {
            const data = mergeMessageObjects(e?.data?.data, e?.data?.message_total_likes_count, e?.data?.is_message_liked_by_me)
            this.dispatch(setChatInEvent({
                eventId: data?.[0]?.resource_id,
                chats: data
            }))
        }
    }

    private onEventDelete = (e: any) => {
        console.log("onEventDelete", e)
        if (e?.data) {
            console.log("SCREEN", NavigationService?.getCurrentScreen());

            const { name, params } = NavigationService?.getCurrentScreen() ?? {}
            if ((name == "EventDetail" || name == "EventChats") &&
                params?.id == e?.data?.resource_id
            ) {
                _showErrorMessage(Language.getString("this_event_is_deleted"), 5000)
                NavigationService.navigate("Home")
            }
            this.dispatch(deleteEventSuccess(e?.data?.resource_id))
        }
    }

    private onEventMemberDelete = (e: any) => {
        console.log("onEventMemberDelete", e)
        if (e?.data) {
            const id = Database.getStoredValue('userData')?._id
            if (id == e?.data?.user_id) {
                console.log("SCREEN", NavigationService?.getCurrentScreen());
                const { name, params } = NavigationService?.getCurrentScreen() ?? {}
                console.log('data is', name, e?.data, params?.id);
                if ((name == "EventDetail" || name == "EventChats") &&
                    params?.id == e?.data?.resource_id
                ) {
                    _showErrorMessage(Language.getString("you_have_been_removed_from_event"), 5000)
                    NavigationService.navigate("Home")
                }
                this.dispatch(leaveEventSuccess(e?.data?.resource_id))
                this?.emit(EMIT_LEAVE_ROOM, {
                    resource_id: e?.data?.resource_id
                })
            }
            this.dispatch(removeEventMemberSuccess({ eventId: e?.data?.resource_id, data: e?.data?.user_id }))
            this.dispatch(setChatInEvent({
                eventId: e?.data?.resource_id,
                chats: e?.data?.message
            }))
        }
    }


    private onPersonalMessage = (e: any) => {
        console.log("Personal message received", e);
        if (e?.data?.data) {
            const data = e?.data?.data
            const users = e?.data?.users
            if (users?.length == 2) {
                const { chatUser } = getChatUsers(users)
                this.dispatch(setChatInPerson({
                    chatRoomUserId: chatUser?._id,
                    chats: [data]
                }))
            }

        }

    }

    private onPersonalLikeUnlike = (e: any) => {
        console.log("PersonalLikeUnlike", e);

        if (e?.data?.data?.chat_room_id) {


            const data = e?.data?.data
            const users = e?.data?.users
            if (users?.length == 2) {
                const { chatUser, loggedInUser } = getChatUsers(users)
                if (data?.message_liked_by_users?.findIndex((e: any) => (e?.user_id == loggedInUser?._id)) > -1) {
                    data.is_message_liked_by_me = true
                } else {
                    data.is_message_liked_by_me = false
                }
                // e?.liked_by_users?.some((e: any, index: number) => {
                //     if (e?.user_id == userId) {
                //         data[0].is_message_liked_by_me = true
                //         return true
                //     }
                // });
                // console.log("data", data);

                this.dispatch(updateChatInPerson({
                    chatRoomUserId: chatUser?._id,
                    chat: data
                }))
            }
        }

    }

    private onPersonalMessageDelete = (e: any) => {
        console.log("PersonalMessage Deleted", e);
        if (e?.data?.data) {
            const data = e?.data?.data
            const users = e?.data?.users
            if (users?.length == 2) {
                const { chatUser } = getChatUsers(users)
                this.dispatch(updateChatInPersonSuccess({
                    chatRoomUserId: chatUser?._id,
                    resourceId: data?._id,
                    message: data
                }))
            }
        }
    }

    private onJoinRequest = (e: any) => {
        console.log("room join request", e);
        if (e?.user_id == Database.getStoredValue('userData')?._id) {
            this?.emit(EMIT_JOIN_PERSONAL_ROOM, e)
            DeviceEventEmitter.emit("UpdateChatRoomId", {
                chat_room_id: e?.chat_room_id,
                person_id: e?.sender_id
            })
            // e.data.users = [{ _id: e?.user_id }, e?.e?.sender_id]
            this.onPersonalMessage(e?.data)
        }
        if (e?.sender_id == Database.getStoredValue('userData')?._id) {
            DeviceEventEmitter.emit("UpdateChatRoomId", {
                chat_room_id: e?.chat_room_id,
                person_id: e?.user_id
            })
        }
    }





    /////  connection and error

    private onConnection = (e: any) => {
        console.log("Connection Successful", e)
        this.emit(EMIT_JOIN)
        Database.setSocketConnected(true);
    }

    private onConnect = () => {
        console.log("Socket Connect")
    }

    private onReconnect = () => {
        console.log("Socket Re-Connect")
        // this.emit(EMIT_JOIN)
    }

    private onDisconnect = (reason: Socket.DisconnectReason) => {
        console.log("Connection Closed", reason)
        Database.setSocketConnected(false);
        switch (reason) {
            case 'io server disconnect':

                break;
            case 'io client disconnect':

                break;

            case 'ping timeout':

                break;

            case 'transport close':

                break;

            case 'transport error':

                break;

            default:
                break;
        }
    }

    private listenErrors = () => {
        this.socket?.on("connect_error", (err: Error) => {
            // console.log("connect_error", err); // prints the message associated with the error
        });

        this.socket?.on('reconnecting', function () {
            console.log("reconnecting", 'Attempting to re-connect to the server'); // prints the message associated with the error

        });

        this.socket?.io.on("reconnect_attempt", () => {
            // console.log("reconnect_attempt", 'Attempting to re-connect to the server'); // prints the message associated with the error

        });

        this.socket?.on('error', function (e) {
            console.log("error error", e);
        });



    }
}

export const SocketService = Service.getInstance()
