import { config } from "api";
import { deleteChatInGroupSuccess, deleteGroupSuccess, leaveGroupSuccess, removeGroupMemberSuccess, setChatInGroup, updateChatInGroup, updateChatInGroupSuccess } from "app-store/actions";
import Database from "database";
import { debounce } from "lodash";
import { Dispatch } from "react";
import { io, Socket } from "socket.io-client";
import { LanguageType } from "src/language/Language";
import { NavigationService } from "utils";
import { EMIT_JOIN, ON_CONNECT, ON_CONNECTION, ON_DISCONNECT, ON_EVENT_MESSAGE, ON_EVENT_MESSAGES, ON_EVENT_MESSAGE_DELETE, ON_GROUP_DELETE, ON_GROUP_MEMBER_DELETE, ON_GROUP_MESSAGE, ON_GROUP_MESSAGES, ON_GROUP_MESSAGE_DELETE, ON_JOIN, ON_JOIN_ROOM, ON_LEAVE_ROOM, ON_LIKE_UNLIKE, ON_RECONNECT } from "./SocketEvents";

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

    init = (dispatch?: Dispatch<any>, emitData?: { event: string, data: any }) => {
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
        }
    }

    emit = (event: string, data?: any) => {
        console.log("Event Emit", event);
        console.log("Event Payload", data);

        // if (!this.socket?.connected) {
        //     console.log("Connecting Socket Again for Emitting");

        //     // this.socket?.connect()
        // } else {
        //     console.log("Socket is Connected");

        // }

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
        this.listenErrors();
        // this.socket?.on(ON_EVENT_MESSAGE_TYPING, this.onEventMessageTyping)
    }

    private onConnection = (event: any) => {
        console.log("Connection Successful", event)
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

    private onJoin = (event: any) => {

    }

    private onJoinRoom = (event: any) => {

    }

    private onLeaveRoom = (event: any) => {

    }

    private onLikeUnlike = (event: any) => {
        console.log("on Like Unlike", event)
        if (event?.data) {
            this.dispatch &&
                this.dispatch(updateChatInGroup({
                    groupId: event?.data?.[0]?.resource_id,
                    chat: event?.data?.[0]
                }))
        }
    }

    private onGroupMessageDelete = (event: any) => {
        console.log("Group Message Delete", event)
        if (this.dispatch && event?.data) {
            if (event?.data?.message) {
                this.dispatch(updateChatInGroupSuccess({
                    groupId: event?.data?.resource_id,
                    resourceId: event?.data?.message_id,
                    message: event?.data?.message?.[0]
                }))
            } else {
                this.dispatch(deleteChatInGroupSuccess({
                    groupId: event?.data?.resource_id,
                    resourceId: event?.data?.message_id,
                }))
            }
        }

    }

    private onGroupMessage = (event: any) => {
        console.log("Group Message received", event)
        if (event?.data) {
            this.dispatch &&
                this.dispatch(setChatInGroup({
                    groupId: event?.data?.[0]?.resource_id,
                    chats: event?.data
                }))
        }

    }

    private onGroupMessages = (event: any) => {
        console.log("Group Messages received", event)
        console.log(event?.data)
        if (event?.data) {
            this.dispatch &&
                this.dispatch(setChatInGroup({
                    groupId: event?.data?.[0]?.resource_id,
                    chats: event?.data
                }))
        }
    }

    private onGroupDelete = (event: any) => {
        console.log("onGroupDelete", event)
        if (event?.data) {
            console.log("SCREEN", NavigationService?.getCurrentScreen());

            const { name, params } = NavigationService?.getCurrentScreen() ?? {}
            if ((name == "GroupDetail" || name == "GroupChatScreen" || name == "Chats" || name == "UpcomingEventsChat") &&
                params?.id == event?.data?.resource_id
            ) {
                NavigationService.navigate("Home")
            }
            this.dispatch &&
                this.dispatch(deleteGroupSuccess(event?.data?.resource_id))
        }
    }

    private onGroupMemberDelete = (event: any) => {
        console.log("onGroupMemberDelete", event)
        if (this.dispatch && event?.data) {
            const id = Database.getStoredValue('userData')?._id
            if (id == event?.data?.user_id) {
                console.log("SCREEN", NavigationService?.getCurrentScreen());
                const { name, params } = NavigationService?.getCurrentScreen() ?? {}
                if ((name == "GroupDetail" || name == "GroupChatScreen" || name == "Chats" || name == "UpcomingEventsChat") &&
                    params?.id == event?.data?.resource_id
                ) {
                    NavigationService.navigate("Home")
                }
                this.dispatch(leaveGroupSuccess(event?.data?.resource_id))
                this.dispatch(removeGroupMemberSuccess({ groupId: event?.data?.resource_id, data: event?.data?.user_id }))

            }
            this.dispatch(setChatInGroup({
                groupId: event?.data?.resource_id,
                chats: event?.data?.message
            }))

            this.dispatch(setChatInGroup({
                groupId: event?.data?.resource_id,
                chats: event?.data?.message
            }))


            // const { name, params } = NavigationService?.getCurrentScreen() ?? {}
            // if ((name == "GroupDetail" || name == "GroupChatScreen" || name == "Chats" || name == "UpcomingEventsChat") &&
            //     params?.id == event?.data?.resource_id
            // ) {
            //     console.log("onGroupDelete", event)
            //     NavigationService.navigate("Home")
            // }
            // this.dispatch &&
            //     this.dispatch(deleteGroupSuccess(event?.data?.resource_id))
        }
    }

    private onEventMessageDelete = (event: any) => {

    }

    private onEventMessage = (event: any) => {

    }

    private onEventMessages = (event: any) => {

    }

    private onEventMessageTyping = (event: any) => {

    }

    private reset = () => {
        return debounce(() => {
            this.socket?.disconnect()
            setTimeout(() => {
                this.init(this.dispatch)
            }, 5000);
        }, 5000)
    }

    private listenErrors = () => {
        this.socket?.on("connect_error", (err: Error) => {
            console.log("connect_error", err); // prints the message associated with the error
            // this.socket?.disconnect()
            // this.reset();

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
