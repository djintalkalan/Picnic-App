import { colors } from 'assets/Colors'
import { Text } from 'custom-components'
import ImageLoader from 'custom-components/ImageLoader'
import React, { FC, memo, ReactElement, useMemo } from 'react'
import { GestureResponderEvent, ImageSourcePropType, StyleProp, StyleSheet, TextStyle, TouchableHighlight, View, ViewStyle } from 'react-native'
import Language from 'src/language/Language'
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
    date: string
    currency: string
    price?: string
}

const EventItemS: FC<EventProps> = ({ title, subtitle, date, currency, price, icon, defaultIcon, onPressImage, onPress, isSelected = false, customView: CustomView, containerStyle, textContainerStyle }) => {
    const style = useMemo(() => StyleSheet.create({
        containerStyle: { ...styles.container, ...StyleSheet.flatten(containerStyle) },
        textContainer: { ...styles.textContainer, ...StyleSheet.flatten(textContainerStyle) }
    }), [containerStyle])

    return (
        <TouchableHighlight onPress={onPressImage} underlayColor={colors.colorPrimary} >
            <View style={style.containerStyle} >
                <View style={style.textContainer} >
                    <Text style={styles.title} >{title}</Text>
                    <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>

                    <View style={{ flex: 1, marginVertical: scaler(5), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }} >
                        <View>
                            <Text style={{ color: colors.colorBlack, fontWeight: '600', fontSize: scaler(14) }} >{price ? currency : ""}{price}</Text>
                            <Text style={{ color: price ? colors.colorGreyInactive : colors.colorBlackText, marginTop: scaler(2), fontSize: scaler(price ? 11 : 13) }} >{price ? Language.per_person : Language.free_event}</Text>
                        </View>
                        <View style={{ flexShrink: 1, alignItems: 'flex-end' }}>
                            <View  >
                                {CustomView ? React.isValidElement(CustomView) ?
                                    CustomView : <CustomView /> : null}
                            </View>
                            <Text style={styles.date} >{date}</Text>
                        </View>

                    </View>

                </View>

                <View style={{ backgroundColor: "#DEDEDE" }} >
                    <ImageLoader
                        placeholderSource={defaultIcon}
                        source={icon}
                        style={styles.iconStyle} />
                </View>
            </View>
        </TouchableHighlight>
    )
}

export const EventItem = memo(EventItemS)
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
        // backgroundColor: 'red',
        resizeMode: 'stretch'
    },
    textContainer: {
        flex: 1,
        paddingHorizontal: scaler(10),
        paddingTop: scaler(10),
        // borderTopColor: colors.colorD,
        // borderTopWidth: 1
        // justifyContent: 'space-between',
        // backgroundColor: 'red',
        // marginHorizontal: scaler(10)
    },
    title: {
        color: colors.colorBlack,
        fontWeight: '600',
        fontSize: scaler(14),
        marginTop: scaler(4)
    },
    date: {
        // color: "rgb(136,115,84)",
        color: colors.colorGreyInactive,
        // color: '#272727',
        // textAlign: 'right',
        // fontWeight: '400',
        marginTop: scaler(4),
        fontSize: scaler(11)
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
