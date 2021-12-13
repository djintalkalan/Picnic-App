import { colors } from 'assets/Colors'
import { Text } from 'custom-components'
import React, { FC, useState } from 'react'
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native'
import { scaler } from 'utils'

interface ListItemProps {
    title: string
    subtitle: string
    icon?: ImageSourcePropType
    defaultIcon: ImageSourcePropType
    isSelected: boolean
}

interface MemberListItemProps {
    title: string
    icon: ImageSourcePropType
    defaultIcon: ImageSourcePropType
    isSelected: boolean
}

export const ListItem: FC<ListItemProps> = ({ title, subtitle, icon, defaultIcon, isSelected = false }) => {
    const [isError, setError] = useState(false)
    console.log("ICON", icon)
    return (
        <View style={styles.container} >
            <Image onError={() => {
                setError(true)
            }} source={(isError || !icon) ? defaultIcon : icon} style={styles.iconStyle} />
            <View style={styles.textContainer} >
                <Text style={styles.title} >{title}</Text>
                <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>
            </View>
        </View>
    )
}

export const MemberListItem: FC<MemberListItemProps> = ({ title, icon, defaultIcon, isSelected = false }) => {
    const [isError, setError] = useState(false)
    return (
        <View style={styles.container} >
            <Image onError={() => {
                setError(true)
            }} source={(isError || !icon) ? defaultIcon : icon} style={[styles.iconStyle, {
                height: scaler(40),
                width: scaler(40),
            }]} />
            <View style={[styles.textContainer, { justifyContent: 'center' }]} >
                <Text style={styles.memberListTitle} >{title}</Text>
            </View>
        </View>
    )
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
    textContainer: { flex: 1, paddingVertical: scaler(5), justifyContent: 'space-between', marginHorizontal: scaler(10) },
    title: {
        color: "#272727",
        fontWeight: '600',
        fontSize: scaler(13)
    },
    memberListTitle: {
        color: "#272727",
        fontWeight: '400',
        fontSize: scaler(14)
    },
    subtitle: {
        color: colors.colorGreyInactive,
        fontWeight: '400',
        fontSize: scaler(11),
        maxWidth: '80%'
    }
})
