import { _totalSoldTickets } from 'api/APIProvider'
import { colors, Images } from 'assets'
import { Button, Card, MyHeader, Text } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { isEqual } from 'lodash'
import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import Language from 'src/language/Language'
import { formatAmount, NavigationService, scaler } from 'utils'
//@ts-ignore
import ReadMore from 'react-native-read-more-text'
import { useSelector } from 'react-redux'

const SelectTicket: FC = (props: any) => {
    const [selectedTicket, setSelectedTicket] = useState<any>()

    const onTicketSelect = useCallback((item: any) => {
        setSelectedTicket(item)
    }, [])
    const [allPlans, setAllPlans] = useState<any[]>([])

    const { event } = useSelector(state => ({
        event: state?.eventDetails?.[props?.route?.params?.id]?.event,
    }), isEqual)


    useEffect(() => {
        _totalSoldTickets({ resource_id: props?.route?.params?.id }).then(res => {
            if (res?.status == 200) {
                console.log('res', res);
                setAllPlans(res?.data?.tickets?.filter((_: any) => { return _?.status != 2 }))
            } else console.log(res);
        }).catch(e => console.log(e))
    }, [])

    const onNextPress = useCallback(() => {
        if (selectedTicket) NavigationService.navigate('BookEvent', { id: props?.route?.params.id, selectedTicket: selectedTicket })
    }, [selectedTicket])

    const renderTicket = useCallback(({ item, index }) => {
        return (
            <TicketView
                isSelected={item?._id == selectedTicket?._id}
                onPress={() => onTicketSelect(item)}
                {...item}
                eventDate={new Date(event?.event_start_date_time)}
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
                    data={allPlans}
                    renderItem={renderTicket}
                    ItemSeparatorComponent={() => (
                        <View style={{ flex: 1, height: scaler(10) }} />
                    )}
                />
            </View>
            {selectedTicket ?
                <View style={{ marginHorizontal: scaler(10) }}>
                    <Button title={Language.next} onPress={onNextPress} />
                </View> : undefined}

        </SafeAreaViewWithStatusBar>
    )
}

const TicketView = memo(({ _id: id, name: title, currency, description,
    isSelected = false, amount: price, onPress,
    total_free_tickets = 0, total_free_tickets_consumed = 0,
    sales_ends_on, capacity_type, capacity, total_sold_tickets, eventDate
}: any) => {

    const endSales = sales_ends_on ? new Date(sales_ends_on) : eventDate;

    const isDisabled = new Date() > endSales || (capacity_type == 'limited' && capacity <= total_sold_tickets)


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
    // const free_tickets = (total_free_tickets || 0) - (total_free_tickets_consumed || 0)

    const free_tickets = useMemo(() => {
        const freeTicket = (total_free_tickets || 0) - (total_free_tickets_consumed || 0)
        return Math.max((freeTicket || 0), 0)
    }, [total_free_tickets, total_free_tickets_consumed])

    return (
        <Card cardElevation={2} cornerRadius={scaler(8)}  >
            {isDisabled ?
                <View style={styles.disableContainer} >
                    <Image source={new Date() > endSales ? Images.ic_no_longer_available : Images.ic_sold_out} style={styles.disableImage} resizeMode={'contain'} />
                </View>
                : undefined}
            <TouchableOpacity disabled={isDisabled} style={[styles.renderView, isSelected ? { backgroundColor: colors.colorPrimary } : {}]} activeOpacity={0.7} onPress={onPress}>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={[styles.mainText, { flex: 1 }, isSelected ? { color: colors.colorWhite } : isDisabled ? { color: colors.colorGreyText } : {}]}>{title}</Text>
                    <Text style={[styles.mainText, isSelected ? { color: colors.colorWhite } : isDisabled ? { color: colors.colorGreyText } : {}]}>{formatAmount(currency, price)}</Text>
                </View>
                {free_tickets > 0 ? <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaler(3), marginBottom: scaler(6) }} >
                    <Image style={{ width: scaler(18), aspectRatio: 1, tintColor: isSelected ? colors.colorWhite : isDisabled ? colors.colorGreyText : undefined }} source={Images.ic_free_ticket_icon} />
                    <Text style={{ color: isSelected ? colors.colorWhite : isDisabled ? colors.colorGreyText : colors.colorPrimary, fontSize: scaler(14) }} > {free_tickets} {Language.x_free_ticket_available}</Text>
                </View> : null}
                <ReadMore
                    key={id}
                    numberOfLines={3}
                    renderTruncatedFooter={_renderTruncatedFooter}
                    renderRevealedFooter={_renderRevealedFooter}
                    onReady={_handleTextReady}>
                    <Text style={[styles.description, isSelected ? { color: colors.colorWhite } : isDisabled ? { color: colors.colorGreyText } : {}]}>{description}</Text>
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
    },
    disableImage: {
        height: scaler(70),
        // width: scaler(140),
        // maxHeight: '100%',
        // opacity: 0.9,
        resizeMode: 'contain',
        // transform: [{
        //     rotate: '28.32deg'
        // }]
    },
    disableContainer: {
        position: 'absolute',
        zIndex: 1,
        justifyContent: 'center',
        // backgroundColor: 'green',
        alignSelf: 'center',
        height: '100%'
    }

})

export default SelectTicket;

