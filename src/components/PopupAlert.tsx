import { colors } from "assets";
import { Text } from "custom-components";
import React, { Component, FC } from "react";
import { GestureResponderEvent, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Language from "src/language/Language";
import { scaler } from "utils";
import Button from "./Button";

interface PopupAlertProps {

}

export interface IAlertType {
    onPressButton?: (e?: GestureResponderEvent) => any
    title?: string
    customView?: FC<any>
    message?: string
    buttonText: string
    buttonStyle?: StyleProp<ViewStyle>
    cancelButtonText?: string
    onPressCancel?: () => void
}

export class PopupAlert extends Component<PopupAlertProps, any> {
    constructor(props: PopupAlertProps) {
        super(props)
        this.state = {
            alertVisible: false,
        }
    }

    title: string = "Confirm payment method"
    customView?: FC
    message: string = "Are you sure you want to pay using CASH?"
    buttonText: string = 'Pay ‭$2'
    buttonStyle: StyleProp<ViewStyle> = {}
    cancelButtonText = Language.close
    onPressCancel: any = null
    onPressButton: any = null

    showAlert = ({ title, message, buttonText, onPressButton, buttonStyle, cancelButtonText, customView, onPressCancel }: IAlertType) => {
        this.title = title || ""
        this.message = message || ""
        this.buttonText = buttonText || ""
        this.buttonStyle = StyleSheet.flatten(buttonStyle) || {}
        this.cancelButtonText = cancelButtonText || Language.close
        this.customView = customView
        this.onPressCancel = () => {
            onPressCancel && onPressCancel()
            this.hideAlert()
        }
        this.onPressButton = onPressButton
        this.state.alertVisible = true
        this.forceUpdate()
    }

    hideAlert = () => {
        this.setState({ alertVisible: false })
    }

    shouldComponentUpdate = (nextProps: Readonly<PopupAlertProps>, nextState: Readonly<{ alertVisible: boolean }>) => {
        return this.state.alertVisible != nextState.alertVisible
    }

    render() {
        if (this.state.alertVisible)
            return (
                <SafeAreaView style={styles.absolute}  >
                    <View style={styles.alertContainer} >


                        {this.title ? <Text style={[styles.title]} >{this.title}</Text> : null}
                        {this.message ? <Text style={[styles.message]} >{this.message}</Text> : null}

                        {this.customView ?
                            <this.customView />
                            : null}

                        {this.buttonText ?
                            <Button
                                containerStyle={styles.button}
                                title={this.buttonText}
                                paddingVertical={scaler(10)}
                                buttonStyle={this.buttonStyle}
                                radius={scaler(10)}
                                onPress={this.onPressButton} /> : null}
                        {this.cancelButtonText ?
                            <Text onPress={this.onPressCancel} style={styles.cancelText} >{this.cancelButtonText}</Text> : null}
                    </View>
                </SafeAreaView>
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
        alignItems: 'center',
        justifyContent: 'center'
    },
    alertContainer: {
        backgroundColor: colors.colorWhite,
        padding: scaler(20),
        width: '100%',
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
        marginBottom: scaler(10),
        textAlign: 'center',
        maxWidth: '80%'
    },
    button: {
        width: '90%',
        marginTop: scaler(20)
    },
    cancelText: {
        fontWeight: '400',
        fontSize: scaler(13),
        lineHeight: scaler(24),
        marginTop: scaler(10),
        color: colors.colorBlackText,
    }
})