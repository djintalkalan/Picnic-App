import { colors } from "assets";
import { Text } from "custom-components";
import React, { Component, FC } from "react";
import { BackHandler, Dimensions, GestureResponderEvent, ScrollView, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Language from "src/language/Language";
import { scaler } from "utils";
import Button from "./Button";
import { SafeAreaViewWithStatusBar } from "./FocusAwareStatusBar";
import { Picker } from '@react-native-picker/picker'
import { config } from 'api';

const { height, width } = Dimensions.get('screen')

interface InviteCodesProps {

}

export interface InviteCodesType {
    title?: string
    message?: string
    callback?: (inviteCode: string) => void
}

export class InviteCodes extends Component<InviteCodesProps, any> {
    constructor(props: InviteCodesProps) {
        super(props)
        this.state = {
            alertVisible: false,
            inviteCode: "0"
        }
        this.onBackPress = this.onBackPress.bind(this)
    }

    title: string = "Confirm payment method"
    message: string = "Are you sure you want to pay using CASH?"
    callback: (inviteCode: string) => void = () => { }

    showInviteCodes = ({ title, message, callback }: InviteCodesType) => {
        this.title = title || ""
        this.message = message || ""
        this.callback = callback || (() => { })

        if (!this.state.alertVisible) {
            this.setState({ alertVisible: true })
        } else
            this.forceUpdate()
    }

    onPressButton = () => {
        this.callback(this.state.inviteCode)
        this.setState({ alertVisible: false })
    }

    hideInviteCodes = () => {
        this.setState({ alertVisible: false })
    }

    shouldComponentUpdate = (nextProps: Readonly<InviteCodesProps>, nextState: Readonly<{ alertVisible: boolean }>) => {
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
                    <View style={[styles.alertContainer]}>
                        {this.title ? <Text>{this.title}</Text> : null}
                        {this.message ? <Text>{this.message}</Text> : null}
                        <Picker style={{ height: 50, width: "90%" }}
                            selectedValue={this.state.inviteCode}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({ inviteCode: itemValue })
                                this.forceUpdate()
                            }}>
                            <Picker.Item label="select an invite code" value="0" />
                            <Picker.Item label={config.INVITE_CODE} value="1" />
                            <Picker.Item label={config.INVITE_CODE_2} value="2" />
                            <Picker.Item label={config.INVITE_CODE_3} value="3" />
                            <Picker.Item label={config.INVITE_CODE_4} value="4" />
                        </Picker>

                        <Button
                            containerStyle={[styles.button, { alignSelf: 'center', }]}
                            title="Submit"
                            fontSize={scaler(13)}
                            paddingVertical={scaler(12)}
                            buttonStyle={[styles.buttonMain]}
                            radius={scaler(10)}
                            disabled={this.state.inviteCode == "0"}
                            onPress={this.onPressButton} />
                    </View>
                </SafeAreaViewWithStatusBar >
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
    button: {
        marginTop: scaler(20)
    },
    buttonMain: {
        minWidth: '70%',
    },

})