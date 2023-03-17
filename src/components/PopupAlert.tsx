import { colors } from "assets";
import { Text } from "custom-components";
import React, { Component, FC } from "react";
import { BackHandler, Dimensions, GestureResponderEvent, ScrollView, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Language from "src/language/Language";
import { scaler } from "utils";
import Button from "./Button";
import { SafeAreaViewWithStatusBar } from "./FocusAwareStatusBar";

const { height, width } = Dimensions.get('screen')
interface PopupAlertProps {

}

export interface IAlertType {
    onPressButton?: (e?: GestureResponderEvent) => any
    title?: string
    customView?: FC<any>
    message?: string
    buttonText?: string
    buttonStyle?: StyleProp<ViewStyle>
    cancelButtonText?: string | null
    onPressCancel?: () => void
    leftTitle?: boolean
    isClose?: boolean
}

export class PopupAlert extends Component<PopupAlertProps, any> {
    constructor(props: PopupAlertProps) {
        super(props)
        this.state = {
            alertVisible: false,
        }
        this.onBackPress = this.onBackPress.bind(this)
    }

    title: string = "Confirm payment method"
    customView?: FC
    message: string = "Are you sure you want to pay using CASH?"
    buttonText: string = 'Pay ‭$2'
    buttonStyle: StyleProp<ViewStyle> = {}
    cancelButtonText = Language.close
    onPressCancel: any = null
    onPressButton: any = null
    fullWidthMessage: boolean = false
    leftTitle = false;
    isClose = false;

    showAlert = ({ title, message, buttonText, onPressButton, buttonStyle, cancelButtonText, customView, onPressCancel, leftTitle, isClose }: IAlertType) => {
        this.title = title || ""
        this.message = message || ""
        this.buttonText = buttonText || ""
        this.buttonStyle = StyleSheet.flatten(buttonStyle) || {}
        this.cancelButtonText = cancelButtonText === null ? "" : (cancelButtonText || Language.close)
        this.customView = customView
        this.leftTitle = leftTitle || false
        this.onPressCancel = () => {
            onPressCancel && onPressCancel()
            this.hideAlert()
        }
        this.onPressButton = onPressButton
        if (this.message?.length > 70) {
            this.fullWidthMessage = true
        } else {
            this.fullWidthMessage = false
        }

        this.isClose = isClose || false

        if (this.isClose) {
            this.cancelButtonText = ""
        }

        if (this.leftTitle) {
            this.fullWidthMessage = true
        }

        // if (this.cancelButtonText == Language.close || this.cancelButtonText == Language.cancel) {
        //     this.cancelButtonText = ""
        //     this.isClose = true;
        //     this.fullWidthMessage = true
        // } else {
        //     this.isClose = false;
        // }


        //@ts-ignore
        // this.state.alertVisible = true
        if (!this.state.alertVisible) {
            this.setState({ alertVisible: true })
        } else
            this.forceUpdate()
    }

    hideAlert = () => {
        this.setState({ alertVisible: false })
    }

    shouldComponentUpdate = (nextProps: Readonly<PopupAlertProps>, nextState: Readonly<{ alertVisible: boolean }>) => {
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
        // this.setState({ alertVisible: false })
        return true
    }

    render() {
        if (this.state.alertVisible)
            return (
                <SafeAreaViewWithStatusBar translucent style={styles.absolute}  >
                    <View style={[styles.alertContainer, this.leftTitle ? { alignItems: 'flex-start' } : {}]} >
                        {this.isClose ?
                            <TouchableOpacity onPress={this.hideAlert} style={styles.crossIcon}>
                                <MaterialIcons
                                    color={colors.colorBlack}
                                    size={scaler(25)}
                                    name="close" />
                            </TouchableOpacity>
                            : null}
                        {this.title ? <Text style={[styles.title]} >{this.title}</Text> : null}
                        {this.message ?
                            <ScrollView bounces={false} overScrollMode={'never'} contentContainerStyle={[styles.scrollViewContainerStyle, this?.fullWidthMessage ? { marginHorizontal: scaler(30) } : {}, this.leftTitle ? { alignItems: 'flex-start' } : {}]} style={styles.scrollViewStyle} >
                                <Text style={[styles.message, this.leftTitle ? { textAlign: 'left' } : {}]} >{this.message}</Text>
                            </ScrollView>
                            : null}

                        {this.customView ?
                            <this.customView />
                            : null}

                        {this.buttonText ?
                            <Button
                                containerStyle={[styles.button, { alignSelf: 'center', }]}
                                title={this.buttonText}
                                fontSize={scaler(13)}
                                paddingVertical={scaler(12)}
                                buttonStyle={[styles.buttonMain, this.buttonStyle]}
                                radius={scaler(10)}
                                onPress={this.onPressButton} /> : null}
                        {this.cancelButtonText ?
                            <Text onPress={this.onPressCancel} style={[styles.cancelText, this.leftTitle ? { alignSelf: 'center', } : {}]} >{this.cancelButtonText}</Text> : null}
                    </View>
                </SafeAreaViewWithStatusBar>
            )
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: scaler(20),
        paddingVertical: scaler(30),
        alignItems: 'center',
        justifyContent: 'center'
    },
    alertContainer: {
        backgroundColor: colors.colorWhite,
        padding: scaler(26),
        width: '100%',
        flexShrink: 1,
        elevation: 3,
        alignItems: 'center',
        borderRadius: scaler(20)
    },
    title: {
        fontWeight: '500',
        fontSize: scaler(14),
        lineHeight: scaler(24),
        marginBottom: scaler(10),
        textAlign: 'center',
        maxWidth: '80%'
    },
    message: {
        fontWeight: '400',
        fontSize: scaler(14),
        lineHeight: scaler(24),
        color: "#7D7F85",
        textAlign: 'center',
        // flex: 1,
    },

    scrollViewContainerStyle: {
        alignItems: 'center',
        marginHorizontal: scaler(30) + (width / 10),
        // maxWidth: width - scaler(60) - (width / 5),
        // backgroundColor: 'yellow',
        // flex: 1,
    },
    scrollViewStyle: {
        marginBottom: scaler(10),

        marginHorizontal: -scaler(30),

        // maxWidth: '80%',
        // backgroundColor: 'red',
        // flex: 1,
    },
    button: {
        marginTop: scaler(20)
    },
    buttonMain: {
        minWidth: '70%',
    },
    cancelText: {
        fontWeight: '400',
        fontSize: scaler(13),
        lineHeight: scaler(24),
        marginTop: scaler(10),
        color: colors.colorBlackText,
    },
    crossIcon: {
        position: 'absolute',
        padding: scaler(10),
        top: scaler(10),
        right: scaler(10)
    }
})