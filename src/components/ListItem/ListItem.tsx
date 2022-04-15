import { colors } from 'assets/Colors'
import { Images } from 'assets/Images'
import { Text } from 'custom-components'
import ImageLoader from 'custom-components/ImageLoader'
import React, { FC, ReactElement, useMemo } from 'react'
import { GestureResponderEvent, Image, ImageSourcePropType, StyleProp, StyleSheet, TextStyle, TouchableHighlight, View, ViewStyle } from 'react-native'
import Language from 'src/language/Language'
import { scaler } from 'utils'

interface ListItemProps {
    title: string
    subtitle: string
    icon?: ImageSourcePropType
    defaultIcon: ImageSourcePropType
    isSelected?: boolean
    customView?: FC<any> | ReactElement<any, any> | null
    onPressImage?: (e?: GestureResponderEvent) => void
    onPress?: (e?: GestureResponderEvent) => void
    containerStyle?: StyleProp<ViewStyle>
    textContainerStyle?: StyleProp<ViewStyle>
    titleTextStyle?: StyleProp<TextStyle>
    subtitleTextStyle?: StyleProp<TextStyle>
}

export const ListItem: FC<ListItemProps> = ({ title, subtitle, titleTextStyle, subtitleTextStyle, icon, defaultIcon, onPressImage, onPress, isSelected = false, customView: CustomView, containerStyle, textContainerStyle }) => {
    const style = useMemo(() => StyleSheet.create({
        containerStyle: { ...styles.container, ...StyleSheet.flatten(containerStyle) },
        textContainer: { ...styles.textContainer, ...StyleSheet.flatten(textContainerStyle) },
        title: { ...styles.title, ...StyleSheet.flatten(titleTextStyle) },
        subtitle: { ...styles.subtitle, ...StyleSheet.flatten(subtitleTextStyle) },
    }), [containerStyle])

    return (
        <TouchableHighlight onPress={onPress} underlayColor={colors.colorPrimary} >
            <View style={style.containerStyle} >
                <TouchableHighlight style={{ alignSelf: 'center' }} onPress={onPressImage} underlayColor={colors.colorWhite} >
                    <ImageLoader
                        placeholderSource={defaultIcon}
                        source={icon}
                        style={styles.iconStyle} />
                </TouchableHighlight>
                <View style={style.textContainer} >
                    <Text style={style.title} >{title}</Text>
                    <Text numberOfLines={2} style={style.subtitle}>{subtitle}</Text>
                </View>
                {CustomView ? React.isValidElement(CustomView) ?
                    CustomView : <CustomView /> : null}
            </View>
        </TouchableHighlight>
    )
}

interface MemberListItemProps {
    title: string
    icon?: ImageSourcePropType | null
    defaultIcon: ImageSourcePropType
    isSelected?: boolean,
    containerStyle?: StyleProp<ViewStyle>
    customRightTextStyle?: StyleProp<ViewStyle>
    customRightText?: string | Element
    onPressImage?: (e?: GestureResponderEvent) => void
    onPress?: (e?: GestureResponderEvent) => void
    onLongPress?: (e?: GestureResponderEvent) => void
}

export const MemberListItem: FC<MemberListItemProps> = ({ onPress, onLongPress, onPressImage, title, customRightText, customRightTextStyle, icon, defaultIcon, containerStyle, isSelected = false }) => {
    return (
        <TouchableHighlight onLongPress={onLongPress} onPress={onPressImage} underlayColor={colors.colorWhite} >
            <View style={[styles.container, { ...StyleSheet.flatten(containerStyle) }]} >
                <TouchableHighlight style={{ alignSelf: 'center' }} onPress={onPressImage} underlayColor={colors.colorFadedPrimary} >
                    <ImageLoader
                        placeholderSource={defaultIcon}
                        source={icon}
                        style={[styles.iconStyle, {
                            height: scaler(40),
                            width: scaler(40),
                        }]} />
                </TouchableHighlight>
                <View style={[styles.textContainer, { justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' }]} >
                    <Text style={styles.memberListTitle} >{title}</Text>
                    {customRightText ?
                        <Text style={[styles.rightText, { ...StyleSheet.flatten(customRightTextStyle) }]} >{customRightText}</Text>
                        : null}
                </View>

            </View>
        </TouchableHighlight>
    )
}

interface ITicketView {
    capacity_type: 'limited' | 'unlimited',
    is_event_admin: boolean,
    total_sold_tickets: number | string,
    capacity: number | string
    is_event_member: boolean,
    size: 'small' | 'normal'
}

export const TicketView: FC<ITicketView> = ({ size = 'normal', capacity_type, is_event_admin = false, capacity = 0, is_event_member = false, total_sold_tickets = 0 }) => {
    const styles = useMemo(() => {
        const color = (is_event_member && !is_event_admin) ? colors.colorPrimary : "#DBDBDB"
        const tintColor = (is_event_member && !is_event_admin) ? colors.colorPrimary : colors.colorBlackText
        return StyleSheet.create({
            container: {
                padding: scaler(size == 'small' ? 6 : 7),
                paddingVertical: scaler(size == 'small' ? 6 : 7),
                borderRadius: scaler(50),
                flexDirection: 'row',
                alignSelf: size == 'small' ? undefined : 'center',
                alignItems: 'center',
                justifyContent: 'center',
                // minWidth: scaler(60),
                borderWidth: 0.8,
                borderColor: color
            },
            image: {
                height: scaler(size == 'small' ? 12 : 14),
                width: scaler(size == 'small' ? 12 : 14),
                marginRight: scaler(6),
                tintColor: tintColor
            },
            unlimited: {
                fontSize: scaler(size == 'small' ? 9 : 9),
                color: colors.colorBlackText
            }
        })

    }, [is_event_member, is_event_admin, size])



    return <View style={styles?.container} >
        <Image style={styles.image} source={is_event_admin ? Images.ic_crown : Images.ic_ticket_2} />
        <Text style={styles.unlimited} >{capacity_type == 'limited' ? (total_sold_tickets + "/" + capacity) : Language.unlimited}</Text>
    </View>
}

export const ListItemSeparator = () => (
    <View style={{ flex: 1, marginHorizontal: scaler(15), height: 1, backgroundColor: '#EBEBEB' }} />
)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: scaler(15),
        backgroundColor: colors.colorWhite,
    },
    iconStyle: {
        height: scaler(50),
        width: scaler(50),
        borderRadius: scaler(30),
        resizeMode: 'cover'
    },
    textContainer: {
        flex: 1,
        paddingVertical: scaler(5),
        justifyContent: 'space-between',
        // backgroundColor: 'red',
        marginHorizontal: scaler(10)
    },
    title: {
        color: "#272727",
        fontWeight: '600',
        fontSize: scaler(13)
    },
    memberListTitle: {
        color: "#272727",
        flex: 1,
        fontWeight: '400',
        fontSize: scaler(14)
    },
    subtitle: {
        color: colors.colorGreyInactive,
        fontWeight: '400',
        fontSize: scaler(11),
        maxWidth: '90%',
        // minHeight: scaler(31)
    },
    rightText: {
        color: colors.colorPrimary,
        fontWeight: '500',
        fontSize: scaler(11),
    }
})
