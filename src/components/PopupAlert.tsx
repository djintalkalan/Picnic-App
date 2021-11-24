import { BlurView } from "@react-native-community/blur";
import { colors } from "assets";
import { Text } from "custom-components";
import React, { Component } from "react";
import { Image, ImageURISource, StyleSheet, TouchableOpacity, View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { scaler } from "utils";
import Button from "./Button";

interface PopupAlertProps {

}
export interface IAlertType {
    onPressButton?: () => (undefined | null | void) | null | undefined
    title?: string
    image?: ImageURISource | null
    message?: string
    buttonText?: string
    isCloseButton?: boolean
    onPressCloseButton?: () => void
}

export class PopupAlert extends Component<PopupAlertProps, any> {
    constructor(props: PopupAlertProps) {
        super(props)
        this.state = {
            alertVisible: false,
        }
    }

    title: string = ""
    image: ImageURISource | null = null
    message: string = ""
    buttonText: string = ''
    isCloseButton = false
    onPressButton: () => (undefined | null | void) | undefined | null = () => this.setState({ alertVisible: false })
    onPressCloseButton: () => void = () => this.setState({ alertVisible: false })
    showAlert = ({ title, image, message, buttonText, onPressButton, isCloseButton, onPressCloseButton }: IAlertType) => {
        this.title = title || ""
        this.image = image || null
        this.message = message || ""
        this.buttonText = buttonText || ""
        this.isCloseButton = isCloseButton || false
        this.onPressButton = onPressButton || (() => this.setState({ alertVisible: false }));
        this.setState({ alertVisible: true })

    }

    render() {
        if (this.state.alertVisible)
            return (
                <BlurView style={styles.absolute}
                    blurType="dark"
                    blurAmount={5}
                    reducedTransparencyFallbackColor="white" >
                    <View style={styles.alertContainer} >
                        {this.isCloseButton && <TouchableOpacity style={{ padding: scaler(5), position: 'absolute', end: scaler(5), top: scaler(5) }} >
                            <AntDesign size={scaler(20)} name={'closecircle'} color={colors.colorPrimary} />

                        </TouchableOpacity>}

                        {this.image ?
                            <Image style={styles.image} source={this.image} /> : null}

                        {this.title ? <Text style={[styles.title, { marginTop: this.image ? scaler(10) : 0 }]} >{this.title}</Text> : null}
                        {this.message ? <Text style={[styles.message, { marginTop: (this.image || this.title) ? scaler(10) : 0 }]} >{this.message}</Text> : null}

                        {this.buttonText ?
                            <Button
                                containerStyle={styles.button}
                                title={this.buttonText}
                                paddingVertical={scaler(8)}
                                radius={scaler(7)}
                                onPress={this.onPressButton} /> : null}
                    </View>

                </BlurView>
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
        borderRadius: scaler(10)
    },
    title: {
        fontWeight: '600',
        fontSize: scaler(15),
        lineHeight: scaler(24),
        marginTop: scaler(10),
        textAlign: 'center',
        maxWidth: '80%'
    },
    message: {
        fontWeight: '400',
        fontSize: scaler(15),
        lineHeight: scaler(24),
        marginTop: scaler(10),
        textAlign: 'center',
        maxWidth: '80%'
    },
    button: {
        width: '80%',
        marginTop: scaler(20)
    },
    image: {
        alignSelf: 'center',
        width: scaler(60),
        height: scaler(60),
        resizeMode: 'contain'
    }
})