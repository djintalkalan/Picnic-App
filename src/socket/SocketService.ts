import { config } from "api";
import { deleteChatInEventSuccess, deleteChatInGroupSuccess, deleteEventSuccess, deleteGroupSuccess, leaveEventSuccess, leaveGroupSuccess, removeEventMemberSuccess, removeGroupMemberSuccess, setChatInEvent, setChatInGroup, updateChatInEvent, updateChatInEventSuccess, updateChatInGroup, updateChatInGroupSuccess } from "app-store/actions";
import Database from "database";
import { Dispatch } from "react";
import { io, Socket } from "socket.io-client";
import Language, { LanguageType } from "src/language/Language";
import { NavigationService, _showErrorMessage } from "utils";
import { EMIT_JOIN, ON_CONNECT, ON_CONNECTION, ON_DISCONNECT, ON_EVENT_DELETE, ON_EVENT_MEMBER_DELETE, ON_EVENT_MESSAGE, ON_EVENT_MESSAGES, ON_EVENT_MESSAGE_DELETE, ON_GROUP_DELETE, ON_GROUP_MEMBER_DELETE, ON_GROUP_MESSAGE, ON_GROUP_MESSAGES, ON_GROUP_MESSAGE_DELETE, ON_JOIN, ON_JOIN_ROOM, ON_LEAVE_ROOM, ON_LIKE_UNLIKE, ON_RECONNECT } from "./SocketEvents";

class Service {
    static instance?: Service;
    private socket?: Socket;
    private dispatch?: Dispatch<any>

    static getInstance = () => {
        if (!this.instance) {
            this.instance = new Service()
        }
        return this.instance;
    }

    init = (dispatch?: Dispatch<any>, emitData?: { e: string, data: any }) => {
        this.dispatch = dispatch
        const isLogin = Database.getStoredValue('isLogin')
        if (!this.socket) {
            if (isLogin) {
                const authToken = Database.getStoredValue('authToken')
                const selectedLanguage = Database.getStoredValue<LanguageType>('selectedLanguage') || "en"
                this.socket = io(config.SOCKET_URL + ":" + config?.SOCKET_PORT, {
                    // timeout: 5000,
                    // reconnection: true,
                    // autoConnect: false,
                    // reconnectionDelay: 5000,
                    transports: ['websocket', 'polling'],
                    extraHeaders: {
                        Authorization: authToken ? ("Bearer " + authToken) : "",
                        'Accept-Language': selectedLanguage
                    }
                });
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
        if (this.dispatch && e?.data && Array.isArray(e?.data) && e?.data?.length) {
            if (e?.data?.[0]?.group)
                this.dispatch(updateChatInGroup({
                    groupId: e?.data?.[0]?.resource_id,
                    chat: e?.data?.[0]
                }))
            else
                this.dispatch(updateChatInEvent({
                    eventId: e?.data?.[0]?.resource_id,
                    chat: e?.data?.[0]
                }))
        }
    }

    /************************************************   GROUPS   *********************************************/

    private onGroupMessageDelete = (e: any) => {
        console.log("Group Message Delete", e)
        if (this.dispatch && e?.data) {
            if (e?.data?.message) {
                this.dispatch(updateChatInGroupSuccess({
                    groupId: e?.data?.resource_id,
                    resourceId: e?.data?.message_id,
                    message: e?.data?.message?.[0]
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
        if (e?.data) {
            this.dispatch &&
                this.dispatch(setChatInGroup({
                    groupId: e?.data?.[0]?.resource_id,
                    chats: e?.data
                }))
        }

    }

    private onGroupMessages = (e: any) => {
        console.log("Group Messages received", e)
        console.log(e?.data)
        if (e?.data) {
            this.dispatch &&
                this.dispatch(setChatInGroup({
                    groupId: e?.data?.[0]?.resource_id,
                    chats: e?.data
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
            this.dispatch &&
                this.dispatch(deleteGroupSuccess(e?.data?.resource_id))
        }
    }

    private onGroupMemberDelete = (e: any) => {
        console.log("onGroupMemberDelete", e)
        if (this.dispatch && e?.data) {
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
                this.dispatch(removeGroupMemberSuccess({ groupId: e?.data?.resource_id, data: e?.data?.user_id }))
            }
            this.dispatch(setChatInGroup({
                groupId: e?.data?.resource_id,
                chats: e?.data?.message
            }))

            this.dispatch(setChatInGroup({
                groupId: e?.data?.resource_id,
                chats: e?.data?.message
            }))
        }
    }


    /************************************************   EVENTS   *********************************************/

    private onEventMessageDelete = (e: any) => {
        console.log("Event Message Delete", e)
        if (this.dispatch && e?.data) {
            if (e?.data?.message) {
                this.dispatch(updateChatInEventSuccess({
                    eventId: e?.data?.resource_id,
                    resourceId: e?.data?.message_id,
                    message: e?.data?.message?.[0]
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
        if (e?.data) {
            this.dispatch &&
                this.dispatch(setChatInEvent({
                    eventId: e?.data?.[0]?.resource_id,
                    chats: e?.data
                }))
        }

    }

    private onEventMessages = (e: any) => {
        console.log("Event Messages received", e)
        console.log(e?.data)
        if (e?.data) {
            this.dispatch &&
                this.dispatch(setChatInEvent({
                    eventId: e?.data?.[0]?.resource_id,
                    chats: e?.data
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
            this.dispatch &&
                this.dispatch(deleteEventSuccess(e?.data?.resource_id))
        }
    }

    private onEventMemberDelete = (e: any) => {
        console.log("onEventMemberDelete", e)
        if (this.dispatch && e?.data) {
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
            }
            this.dispatch(removeEventMemberSuccess({ eventId: e?.data?.resource_id, data: e?.data?.user_id }))
            this.dispatch(setChatInEvent({
                eventId: e?.data?.resource_id,
                chats: e?.data?.message
            }))
        }
    }

    private onEventMessageTyping = (e: any) => {

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
            console.log("connect_error", err); // prints the message associated with the error
        });

        this.socket?.on('reconnecting', function () {
            console.log("reconnecting", 'Attempting to re-connect to the server'); // prints the message associated with the error

        });

        this.socket?.io.on("reconnect_attempt", () => {
            console.log("reconnect_attempt", 'Attempting to re-connect to the server'); // prints the message associated with the error

        });

        this.socket?.on('error', function (e) {
            console.log("error error", e);
        });



    }
}

export const SocketService = Service.getInstance()
