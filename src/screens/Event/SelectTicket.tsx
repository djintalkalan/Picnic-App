import { colors, Images } from 'assets'
import { Button, Card, MyHeader, Text } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import React, { FC, memo, useCallback, useState } from 'react'
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import Language from 'src/language/Language'
import { formatAmount, NavigationService, scaler } from 'utils'
//@ts-ignore
import ReadMore from 'react-native-read-more-text'

const SelectTicket: FC = (props: any) => {
    const [selectedTicket, setSelectedTicket] = useState<any>()

    const ticketArray = (props?.route?.params.data || [])

    const onTicketSelect = useCallback((item: any) => {
        setSelectedTicket(item)
    }, [])

    const onNextPress = useCallback(() => {
        NavigationService.navigate('BookEvent', { id: props?.route?.params.id, selectedTicket: selectedTicket })
    }, [selectedTicket])

    const renderTicket = useCallback(({ item, index }) => {
        return (
            <TicketView
                isSelected={item?._id == selectedTicket?._id}
                onPress={() => onTicketSelect(item)}
                {...item}
            />
        )
    }, [selectedTicket])
    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={Language.select_ticket} backEnabled />
            <View style={{ flex: 1, }}>
                <FlatList
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: scaler(15) }}
                    keyExtractor={_ => _?._id}
                    data={ticketArray}
                    renderItem={renderTicket}
                    ItemSeparatorComponent={() => (
                        <View style={{ flex: 1, height: scaler(10) }} />
                    )}
                />
            </View>
            <View style={{ marginHorizontal: scaler(10) }}>
                <Button title={Language.next} onPress={onNextPress} />
            </View>

        </SafeAreaViewWithStatusBar>
    )
}

const TicketView = memo(({ _id: id, name: title, currency, description,
    isSelected = false, amount: price, onPress,
    total_free_tickets = 0, total_free_tickets_consumed = 0
}: any) => {
    const _renderTruncatedFooter = (handlePress: any) => {
        return (
            <Text style={{ color: isSelected ? colors.colorBlack : colors.colorPrimary, marginTop: 5 }} onPress={handlePress}>
                {Language.read_more}
            </Text>
        );
    }

    const _renderRevealedFooter = (handlePress: any) => {
        return (
            <Text style={{ color: isSelected ? colors.colorBlack : colors.colorPrimary, marginTop: 5 }} onPress={handlePress}>
                {Language.show_less}
            </Text>
        );
    }

    const _handleTextReady = () => {
        // ...
    }
    const free_tickets = (total_free_tickets || 0) - (total_free_tickets_consumed || 0)

    return (
        <Card cardElevation={2} cornerRadius={scaler(8)}>
            <TouchableOpacity style={[styles.renderView, isSelected ? { backgroundColor: colors.colorPrimary } : {}]} activeOpacity={0.7} onPress={onPress}>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={[styles.mainText, { flex: 1 }, isSelected ? { color: colors.colorWhite } : {}]}>{title}</Text>
                    <Text style={[styles.mainText, isSelected ? { color: colors.colorWhite } : {}]}>{formatAmount(currency, price)}</Text>
                </View>
                {free_tickets ? <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(3), marginBottom: scaler(6) }} >
                    <Image style={{ width: scaler(18), aspectRatio: 1, tintColor: isSelected ? colors.colorWhite : undefined }} source={Images.ic_free_ticket_icon} />
                    <Text style={{ color: isSelected ? colors.colorWhite : colors.colorPrimary, fontSize: scaler(14) }} > {free_tickets} {Language.x_free_ticket_available}</Text>
                </View> : null}
                <ReadMore
                    key={id}
                    numberOfLines={3}
                    renderTruncatedFooter={_renderTruncatedFooter}
                    renderRevealedFooter={_renderRevealedFooter}
                    onReady={_handleTextReady}>
                    <Text style={[styles.description, isSelected ? { color: colors.colorWhite } : {}]}>{description}</Text>
                </ReadMore>
            </TouchableOpacity>
        </Card>
    )
})
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
    },
    renderView: {
        backgroundColor: '#F5F5F5',
        padding: scaler(15),
        borderRadius: scaler(8),
        // marginBottom: scaler(15)
    },
    mainText: {
        fontSize: scaler(17),
        fontWeight: '600',
        color: '#272727'
    },
    description: {
        color: '#6D6D6F',
        fontSize: scaler(13),
        marginTop: scaler(10),
        flex: 1,
    }

})

export default SelectTicket;

