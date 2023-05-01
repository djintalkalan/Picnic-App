import { updateLikeInLocal } from "app-store/actions";
import { store } from "app-store/store";
import { colors } from "assets/Colors";
import { Images } from "assets/Images";
import React, { Component } from "react";
import { BackHandler, Dimensions, Image, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { EMIT_LIKE_UNLIKE, SocketService } from "socket";
import { scaler } from "utils";
import { Card } from "./Card";
import { SafeAreaViewWithStatusBar } from "./FocusAwareStatusBar";

const { height, width } = Dimensions.get('screen')
interface EmojiAlertProps {

}

export interface EmojiAlertType {
    placementStyle: StyleProp<ViewStyle>
    transparent?: boolean
    current_like_type: string
    message: any
}

export class EmojiAlert extends Component<EmojiAlertProps, any> {
    constructor(props: EmojiAlertProps) {
        super(props)
        this.state = {
            alertVisible: false,
        }
        this.onBackPress = this.onBackPress.bind(this)
    }

    transparent = false
    current_like_type = ''
    message: any = {}

    showEmojiAlert = (data: EmojiAlertType) => {
        this.placementStyle = data.placementStyle
        this.transparent = data.transparent || false
        this.current_like_type = data.current_like_type
        this.message = data.message

        //@ts-ignore
        // this.state.alertVisible = true
        if (!this.state.alertVisible) {
            this.setState({ alertVisible: true })
        } else
            this.forceUpdate()
    }

    hideEmojiAlert = () => {
        this.setState({ alertVisible: false }, () => {
            this.message = {}
            this.placementStyle = {}
            this.current_like_type = ''
        })
    }

    shouldComponentUpdate = (nextProps: Readonly<EmojiAlertProps>, nextState: Readonly<{ alertVisible: boolean }>) => {
        if (nextState?.alertVisible) {
            setTimeout(() => {
                BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
            }, 100);
        } else {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
        }
        return this.state.alertVisible != nextState.alertVisible
    }

    onBackPress = () => {
        this.hideEmojiAlert()
        return true
    }

    placementStyle: StyleProp<ViewStyle> = {

    }


    render() {

        if (this.state.alertVisible) {
            const emojis = ['like', 'love', 'not_sure', 'surprised', 'maybe', 'question']
            const onPressEmoji = (emoji: string) => {
                SocketService?.emit(EMIT_LIKE_UNLIKE, {
                    ...this.message,
                    is_like: this.current_like_type == emoji ? "0" : '1',
                    like_type: this.current_like_type == emoji ? '' : emoji,
                })
                store.dispatch(updateLikeInLocal({
                    groupId: this.message?.resource_id,
                    resourceType: this.message?.resource_type,
                    message_id: this.message?.message_id,
                    like_type: this.current_like_type == emoji ? '' : emoji
                }))

                setTimeout(() => {
                    this.hideEmojiAlert()
                }, 100)
            }

            return (
                <SafeAreaViewWithStatusBar barStyle={'dark-content'} translucent style={[styles.absolute, this.transparent ? { backgroundColor: 'transparent' } : {}]}  >
                    <TouchableOpacity activeOpacity={1} onPress={this.hideEmojiAlert} style={[styles.absolute, this.transparent ? { backgroundColor: 'transparent' } : {}]} >
                        <TouchableOpacity activeOpacity={1} style={[styles.alertContainer, this.placementStyle]} >
                            <Card cardElevation={3} style={styles.emojiContainer} cornerRadius={scaler(8)} >
                                <View style={styles.emojiContainer} >
                                    {emojis.map(_ => {
                                        return <TouchableOpacity
                                            key={_}
                                            onPress={() => onPressEmoji(_)}
                                            style={[styles.emojiButton, {
                                                backgroundColor: this.current_like_type == _ ? 'rgba(0,0,0,0.25)' : undefined,
                                            }]}>
                                            {/*@ts-ignore*/}
                                            <Image style={{ height: scaler(30), width: scaler(30), resizeMode: 'contain' }} source={Images['ic_emoji_' + _] || undefined} />
                                        </TouchableOpacity>
                                    })}
                                </View>
                            </Card>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </SafeAreaViewWithStatusBar>
            )
        }
        return null
    }
}

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    alertContainer: {
        position: "absolute",
        flexGrow: 1,
        width: '100%',
    },
    emojiContainer: {
        flexDirection: 'row',
        paddingHorizontal: scaler(4),
        paddingVertical: scaler(4),
        borderRadius: scaler(8),
        backgroundColor: colors.colorWhite,
        elevation: 3
    },
    emojiButton: {
        paddingHorizontal: scaler(9),
        paddingVertical: scaler(6),
        borderRadius: scaler(5),
    }
})