import { colors } from 'assets'
import { Card } from 'custom-components'
import React, { FC, useCallback } from 'react'
import { FlatList, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { scaler } from 'utils'

interface IFixedDropdown {
    containerStyle?: StyleProp<ViewStyle>
    visible: boolean
    data: Array<IFixedDropdownItem>
    selectedId?: number
    onSelect?: (selectedItem: IFixedDropdownItem) => void
    relative?: boolean
    maxHeight?: number
}

interface IFixedDropdownItem {
    id: number,
    title: string,
    data: any,
    textStyle?: StyleProp<TextStyle>
}

export const FixedDropdown: FC<IFixedDropdown> = (props) => {
    const { containerStyle = {}, visible, data, selectedId, onSelect, relative = false, maxHeight = scaler(150) } = props

    const _renderDropdownItem = useCallback(({ item, index }) => {
        return <TouchableOpacity
            onPress={() => { onSelect && onSelect(item) }}
            style={{ paddingHorizontal: scaler(15), paddingVertical: scaler(8) }} >
            <Text style={[styles.title, (item?.textStyle || {})]} >{item?.title}</Text>
        </TouchableOpacity>
    }, [onSelect])

    return visible ? (
        <Card style={[relative ? styles.dropDownContainer : styles.fixDropDownContainer, { ...StyleSheet.flatten(containerStyle) }]}
            cardMaxElevation={3}
            cardElevation={2}
            cornerRadius={scaler(10)} >
            <FlatList
                style={{ maxHeight }}
                nestedScrollEnabled contentContainerStyle={{ paddingVertical: scaler(8) }}
                data={data}
                keyExtractor={(_, i) => i.toString()}
                renderItem={_renderDropdownItem}
            />
        </Card>
    )
        : null
}

const styles = StyleSheet.create({
    fixDropDownContainer: {
        left: scaler(4),
        position: 'absolute',
        top: scaler(62),
        zIndex: 10,
        // elevation: 3,
        backgroundColor: colors.colorWhite,
        width: '96%'
    },
    dropDownContainer: {
        backgroundColor: colors.colorWhite,

    },
    title: {
        color: colors.colorBlackText,
        fontWeight: '500',
        fontSize: scaler(12)
    }
})
