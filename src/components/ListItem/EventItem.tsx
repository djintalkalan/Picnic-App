import { colors } from 'assets/Colors'
import ImageLoader from 'custom-components/ImageLoader'
import React, { FC, ReactElement, useMemo } from 'react'
import { GestureResponderEvent, ImageSourcePropType, StyleProp, StyleSheet, Text, TextStyle, TouchableHighlight, View, ViewStyle } from 'react-native'
import { scaler } from 'utils'

interface EventProps {
    title: string
    subtitle: string
    icon?: ImageSourcePropType
    defaultIcon: ImageSourcePropType
    isSelected?: boolean
    customView?: FC<any> | ReactElement<any, any> | null
    onPressImage?: (e?: GestureResponderEvent) => void
    onPress?: (e?: GestureResponderEvent) => void
    containerStyle?: StyleProp<ViewStyle>
    textContainerStyle?: StyleProp<TextStyle>
}

export const EventItem: FC<EventProps> = ({ title, subtitle, icon, defaultIcon, onPressImage, onPress, isSelected = false, customView: CustomView, containerStyle, textContainerStyle }) => {
    const style = useMemo(() => StyleSheet.create({
        containerStyle: { ...styles.container, ...StyleSheet.flatten(containerStyle) },
        textContainer: { ...styles.textContainer, ...StyleSheet.flatten(textContainerStyle) }
    }), [containerStyle])

    return (
        <TouchableHighlight onPress={onPressImage} underlayColor={colors.colorPrimary} >
            <View style={style.containerStyle} >
                <View style={style.textContainer} >
                    <Text style={styles.date} >{"SUN, FEB 20 @ 11:00 EST"}</Text>
                    <Text style={styles.title} >{title}</Text>
                    <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>
                    <View style={{ flex: 1, marginVertical: scaler(5), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }} >
                        <Text style={{ color: colors.colorErrorRed }} >15 $</Text>
                        {CustomView ? React.isValidElement(CustomView) ?
                            CustomView : <CustomView /> : null}
                    </View>

                </View>

                <View style={{ backgroundColor: "#DEDEDE" }} >
                    <ImageLoader
                        placeholderSource={defaultIcon}
                        source={icon ?? defaultIcon}
                        style={styles.iconStyle} />
                </View>
            </View>
        </TouchableHighlight>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        // padding: scaler(15),
        backgroundColor: colors.colorWhite,
    },
    iconStyle: {
        height: scaler(120),
        width: scaler(120),
        // borderRadius: scaler(30),
        resizeMode: 'stretch'
    },
    textContainer: {
        flex: 1,
        paddingHorizontal: scaler(10),
        paddingTop: scaler(10),
        // justifyContent: 'space-between',
        // backgroundColor: 'red',
        // marginHorizontal: scaler(10)
    },
    title: {
        color: "#272727",
        fontWeight: '600',
        fontSize: scaler(14),
        marginTop: scaler(4)
    },
    date: {
        color: "rgb(136,115,84)",
        // color: colors.colorPrimary,

        fontWeight: '600',
        fontSize: scaler(13)
    },
    subtitle: {
        color: colors.colorGreyInactive,
        fontWeight: '400',
        fontSize: scaler(11),
        maxWidth: '90%',
        marginTop: scaler(2)
        // minHeight: scaler(31)
    }
})
