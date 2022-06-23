import React, { Component } from "react";
import { BackHandler, Dimensions, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { SafeAreaViewWithStatusBar } from "./FocusAwareStatusBar";

const { height, width } = Dimensions.get('screen')
interface TouchAlertProps {

}

export interface TouchAlertType {
    alertComponent: React.FC<any>,
    placementStyle: StyleProp<ViewStyle>
    transparent?: boolean
}

export class TouchAlert extends Component<TouchAlertProps, any> {
    constructor(props: TouchAlertProps) {
        super(props)
        this.state = {
            alertVisible: false,
        }
        this.onBackPress = this.onBackPress.bind(this)
    }

    transparent = false

    showTouchAlert = (data: TouchAlertType) => {

        this.placementStyle = data.placementStyle
        this.AlertComponent = data.alertComponent
        this.transparent = data.transparent || false

        //@ts-ignore
        // this.state.alertVisible = true
        if (!this.state.alertVisible) {
            this.setState({ alertVisible: true })
        } else
            this.forceUpdate()
    }

    hideTouchAlert = () => {
        this.setState({ alertVisible: false })
    }

    AlertComponent: React.FC<any> = () => {
        return null
    }

    shouldComponentUpdate = (nextProps: Readonly<TouchAlertProps>, nextState: Readonly<{ alertVisible: boolean }>) => {
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

    placementStyle: StyleProp<ViewStyle> = {

    }

    render() {
        const { AlertComponent } = this
        if (this.state.alertVisible)
            return (
                <SafeAreaViewWithStatusBar barStyle={'light-content'} translucent style={[styles.absolute, this.transparent ? { backgroundColor: 'transparent' } : {}]}  >
                    <TouchableOpacity activeOpacity={1} onPress={this.hideTouchAlert} style={[styles.absolute, this.transparent ? { backgroundColor: 'transparent' } : {}]} >
                        <TouchableOpacity activeOpacity={1} style={[styles.alertContainer, this.placementStyle]} >
                            {AlertComponent ?
                                <AlertComponent /> : null
                            }
                        </TouchableOpacity>
                    </TouchableOpacity>
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
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    alertContainer: {
        position: "absolute",
        flexShrink: 1,
    },
})