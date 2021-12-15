import { colors } from "assets";
import { Text } from "custom-components";
import React, { PureComponent } from "react";
import { FlatList, GestureResponderEvent, StyleProp, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Language from "src/language/Language";
import { scaler } from "utils";

interface BottomMenuProps {

}

export interface IBottomMenuButton {
    title: string,
    textStyle?: StyleProp<TextStyle>
    buttonContainerStyle?: StyleProp<ViewStyle>
    onPress?: (e?: GestureResponderEvent) => void
}

export interface IBottomMenu {
    buttons: Array<IBottomMenuButton>
    onPressCloseButton?: () => void
    cancelButtonText?: string
    cancelTextStyle?: StyleProp<TextStyle>
    cancelButtonContainerStyle?: StyleProp<ViewStyle>
}

export class BottomMenu extends PureComponent<BottomMenuProps, { alertVisible: boolean }> {
    constructor(props: BottomMenuProps) {
        super(props)
        this.state = {
            alertVisible: false,
        }
    }

    shouldComponentUpdate = (nextProps: Readonly<BottomMenuProps>, nextState: Readonly<{ alertVisible: boolean }>) => {
        return this.state.alertVisible != nextState.alertVisible
    }

    buttons: Array<IBottomMenuButton> = []
    cancelButtonText = "Cancel"
    cancelTextStyle = {}
    cancelButtonContainerStyle = {}
    onPressCloseButton = () => { }

    showBottomMenu = ({ buttons, onPressCloseButton, cancelButtonText, cancelTextStyle, cancelButtonContainerStyle }: IBottomMenu) => {
        this.cancelButtonText = cancelButtonText || Language.cancel
        this.buttons = buttons || []
        this.cancelButtonContainerStyle = StyleSheet.flatten(cancelButtonContainerStyle)
        this.cancelTextStyle = StyleSheet.flatten(cancelTextStyle)
        this.onPressCloseButton = () => {
            this.setState({ alertVisible: false })
            onPressCloseButton && onPressCloseButton()
        }
        this.setState({ alertVisible: true })
    }

    _renderButtonItem = ({ item, index }: { item: IBottomMenuButton, index: number }) => {
        return <>
            {index > 0 && <View style={{ height: 1, width: '100%', backgroundColor: colors.colorD }} />}
            <TouchableOpacity onPress={() => {
                item?.onPress && item?.onPress()
                this.setState({ alertVisible: false })

            }} style={[{ paddingVertical: scaler(15) }, item?.buttonContainerStyle]} >
                <Text style={[styles.title, item?.textStyle]} >{item?.title}</Text>
            </TouchableOpacity>
        </>
    }

    render() {
        if (this.state.alertVisible && this.buttons?.length)
            return (
                <SafeAreaView style={styles.absolute}  >
                    <View style={styles.alertContainer} >
                        <FlatList
                            style={{ width: '100%' }}
                            data={this.buttons}
                            renderItem={this._renderButtonItem}
                        />
                    </View>

                    <TouchableOpacity onPress={this.onPressCloseButton} activeOpacity={0.9} style={[styles.alertContainer, { paddingVertical: scaler(15) }, this.cancelButtonContainerStyle]} >
                        <Text style={[styles.title, this.cancelTextStyle]} >{this.cancelButtonText}</Text>
                    </TouchableOpacity>

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
        paddingHorizontal: scaler(15),
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    alertContainer: {
        backgroundColor: colors.colorWhite,
        paddingVertical: scaler(5),
        width: '100%',
        elevation: 3,
        alignItems: 'center',
        borderRadius: scaler(12),
        marginVertical: scaler(3),
    },
    title: {
        fontWeight: '400',
        fontSize: scaler(15),
        color: colors.colorBlackText,
        textAlign: 'center'
    },
    button: {
        width: '80%',
        marginTop: scaler(20)
    },
    closeButtonContainer: {

    }
})