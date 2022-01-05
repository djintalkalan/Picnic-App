import { config } from "api";
import { setChatInGroup, updateChatInGroup } from "app-store/actions";
import Database from "database";
import { Dispatch } from "react";
import { io, Socket } from "socket.io-client";
import { LanguageType } from "src/language/Language";
import { EMIT_JOIN, ON_CONNECT, ON_CONNECTION, ON_DISCONNECT, ON_EVENT_MESSAGE, ON_EVENT_MESSAGES, ON_EVENT_MESSAGE_DELETE, ON_GROUP_MESSAGE, ON_GROUP_MESSAGES, ON_GROUP_MESSAGE_DELETE, ON_JOIN, ON_JOIN_ROOM, ON_LEAVE_ROOM, ON_LIKE_UNLIKE } from "./Events";

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

    init = (dispatch?: Dispatch<any>) => {
        this.dispatch = dispatch
        if (!this.socket) {
            const isLogin = Database.getStoredValue('isLogin')
            if (isLogin) {
                const authToken = Database.getStoredValue('authToken')
                const selectedLanguage = Database.getStoredValue<LanguageType>('selectedLanguage') || "en"
                this.socket = io(config.SOCKET_URL + ":" + config?.SOCKET_PORT, {
                    timeout: 25000,
                    transports: ['websocket'],
                    extraHeaders: {
                        Authorization: authToken ? ("Bearer " + authToken) : "",
                        'Accept-Language': selectedLanguage
                    }
                });
                this.initListeners();
                this.socket.connect()
            }
        }
    }

    closeSocket = () => {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    emit = (event: string, data?: any) => {
        this.socket?.emit(event, {
            event,
            payload: data
        })
    }

    private initListeners = () => {
        this.socket?.on(ON_CONNECTION, this.onConnection)
        this.socket?.on(ON_CONNECT, this.onConnect)
        this.socket?.on(ON_DISCONNECT, this.onDisconnect)
        this.socket?.on(ON_JOIN, this.onJoin)
        this.socket?.on(ON_JOIN_ROOM, this.onJoinRoom)
        this.socket?.on(ON_LEAVE_ROOM, this.onLeaveRoom)
        this.socket?.on(ON_LIKE_UNLIKE, this.onLikeUnlike)
        this.socket?.on(ON_GROUP_MESSAGE, this.onGroupMessage)
        this.socket?.on(ON_GROUP_MESSAGES, this.onGroupMessages)
        this.socket?.on(ON_GROUP_MESSAGE_DELETE, this.onGroupMessageDelete)
        // this.socket?.on(ON_GROUP_MESSAGE_TYPING, this.onGroupMessageTyping)
        this.socket?.on(ON_EVENT_MESSAGE, this.onEventMessage)
        this.socket?.on(ON_EVENT_MESSAGES, this.onEventMessages)
        this.socket?.on(ON_EVENT_MESSAGE_DELETE, this.onEventMessageDelete)
        // this.socket?.on(ON_EVENT_MESSAGE_TYPING, this.onEventMessageTyping)
    }

    private onConnection = (event: any) => {
        console.log("Connection Successful", event)
    }

    private onConnect = () => {
        console.log("Socket Connect")
        this.emit(EMIT_JOIN)
    }

    private onDisconnect = (event: any) => {
        console.log("Connection Closed", event)
        this.socket = undefined
        this.init(this.dispatch)
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

    private onGroupMessageTyping = (event: any) => {

    }

    private onEventMessageDelete = (event: any) => {

    }

    private onEventMessage = (event: any) => {

    }

    private onEventMessages = (event: any) => {

    }

    private onEventMessageTyping = (event: any) => {

    }
}

export const SocketService = Service.getInstance()
