import { Images } from 'assets'
import { colors } from 'assets/Colors'
import { Text } from 'custom-components'
import ImageLoader from 'custom-components/ImageLoader'
import { isFunction } from 'lodash'
import React, { FC, memo, ReactElement, useMemo } from 'react'
import { GestureResponderEvent, Image, ImageSourcePropType, StyleProp, StyleSheet, TextStyle, TouchableHighlight, View, ViewStyle } from 'react-native'
import { Source } from 'react-native-fast-image'
import Language from 'src/language/Language'
import { scaler } from 'utils'

interface EventProps {
    title: string
    subtitle: string
    icon?: Source
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
    is_donation_enabled?: boolean
    free_tickets?: number
}

const EventItemS: FC<EventProps> = ({ title, subtitle, is_donation_enabled, date, currency, price, free_tickets = 0, icon, defaultIcon, onPressImage, onPress, isSelected = false, customView: CustomView, containerStyle, textContainerStyle }) => {
    const style = useMemo(() => StyleSheet.create({
        containerStyle: { ...styles.container, ...StyleSheet.flatten(containerStyle) },
        textContainer: { ...styles.textContainer, ...StyleSheet.flatten(textContainerStyle) }
    }), [containerStyle])

    return (
        <TouchableHighlight onPress={onPressImage} underlayColor={colors.colorPrimary} >
            <View style={style.containerStyle} >
                <View style={style.textContainer} >
                    <Text style={styles.title} ellipsizeMode='tail' numberOfLines={2} >{title}</Text>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={styles.subtitle}>{subtitle}</Text>


                    <View style={{ flex: 1, marginVertical: scaler(5), justifyContent: 'flex-end' }} >

                        {free_tickets > 0 ?
                            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                <Image style={{ width: scaler(18), aspectRatio: 1 }} source={Images.ic_free_ticket_icon} />
                                <Text style={{ color: colors.colorPrimary, fontSize: scaler(12) }} > {free_tickets} {Language.x_free_ticket_available}</Text>
                            </View>

                            : null}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }} >
                            <View>

                                {price ? <Text style={{ color: colors.colorBlack, fontWeight: '600', fontSize: scaler(14) }} >{price ? currency : ""}{price}</Text> : null}
                                <Text style={{ color: price ? colors.colorGreyInactive : colors.colorBlackText, marginTop: scaler(2), fontSize: scaler(price ? 11 : 13) }} >{price ? Language.per_person : Language.free_event}</Text>
                                {is_donation_enabled ? <Text style={{ color: colors.colorGreyInactive, marginTop: scaler(2), fontSize: scaler(11) }} >{Language.donation_accepted}</Text> : null}
                            </View>
                            <View style={{ flexShrink: 1, alignItems: 'flex-end' }}>
                                <View  >
                                    {CustomView ? React.isValidElement(CustomView) ?
                                        CustomView : isFunction(CustomView) ? <CustomView /> : null : null}
                                </View>
                                <Text style={styles.date} >{date}</Text>
                            </View>

                        </View>
                    </View>

                </View>

                <View style={{ backgroundColor: "#DEDEDE" }} >
                    <ImageLoader
                        placeholderSource={defaultIcon}
                        source={icon}
                        resizeMode={'cover'}
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
        height: scaler(140),
        width: scaler(120),
        // borderRadius: scaler(30),
        // backgroundColor: 'red',
        resizeMode: 'cover'
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
        fontSize: scaler(13.5),
        // marginTop: scaler(4)
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
        fontSize: scaler(10.5),
        maxWidth: '90%',
        marginTop: scaler(2)
        // minHeight: scaler(31)
    }
})
