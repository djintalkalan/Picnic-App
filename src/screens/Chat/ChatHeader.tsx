import { colors, Images } from 'assets'
import { Text, useKeyboardService } from 'custom-components'
import ImageLoader from 'custom-components/ImageLoader'
import React, { FC, ReactElement, useMemo } from 'react'
import { GestureResponderEvent, Image, ImageSourcePropType, StyleProp, StyleSheet, TouchableHighlight, TouchableOpacity, View, ViewStyle } from 'react-native'
import { NavigationService, scaler } from 'utils'
interface IChatHeader {
    title: string
    subtitle: string
    icon?: ImageSourcePropType
    defaultIcon: ImageSourcePropType
    rightView?: FC<any> | ReactElement<any, any> | null
    onPress?: (e?: GestureResponderEvent) => void
    containerStyle?: StyleProp<ViewStyle>
}
export const ChatHeader: FC<IChatHeader> = (props) => {

    const { isKeyboard, dismissKeyboard } = useKeyboardService()

    const { defaultIcon, subtitle, title, containerStyle, icon, onPress, rightView: RightView, } = props
    const styles = useMemo(() => StyleSheet.create({
        ...defaultStyles,
        container: {
            ...defaultStyles.container,
            ...StyleSheet.flatten(containerStyle),
            flexDirection: 'row',
            alignItems: 'center',
            elevation: 2,
        },
    }), [props])


    return (
        <View style={styles.container} >
            <TouchableOpacity onPress={() => {
                if (isKeyboard) {
                    dismissKeyboard()
                } else
                    NavigationService.goBack()
            }} style={styles.backButton} >
                <Image source={Images.ic_left} style={{ tintColor: colors.colorBlack, height: scaler(20), width: scaler(20), resizeMode: 'contain' }} />
            </TouchableOpacity>

            <TouchableHighlight style={{ alignSelf: 'center', paddingHorizontal: scaler(3) }} onPress={onPress} underlayColor={colors.colorWhite} >
                <ImageLoader
                    placeholderSource={defaultIcon}
                    source={icon ?? defaultIcon} style={styles.iconStyle} />
            </TouchableHighlight>
            <TouchableOpacity onPress={onPress} style={{ paddingLeft: scaler(5), flexShrink: 1, }} >
                <Text style={styles.title} >{title}</Text>
                <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'flex-end', flexGrow: 1 }} >
                {RightView ? React.isValidElement(RightView) ?
                    RightView : <RightView /> : null}
            </View>
        </View>
    )
}

const defaultStyles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: scaler(10),
        paddingVertical: scaler(10),
    },
    backButton: {

    },
    iconStyle: {
        height: scaler(35),
        width: scaler(35),
        borderRadius: scaler(30),
        resizeMode: 'cover'
    },
    title: {
        color: "#272727",
        fontWeight: '600',
        fontSize: scaler(13)
    },
    subtitle: {
        color: colors.colorGreyInactive,
        fontWeight: '400',
        fontSize: scaler(11),
    },
})
