import { colors } from 'assets/Colors'
import { Button, Card, MyHeader, Text } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import React, { FC, memo, useCallback, useState } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import Language from 'src/language/Language'
import { getSymbol, NavigationService, scaler } from 'utils'
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
                id={item?._id}
                currency={item.currency}
                description={item.description}
                isSelected={item?._id == selectedTicket?._id}
                price={item.amount}
                title={item.name}
                onPress={() => onTicketSelect(item)}
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

interface TicketProps {
    id: string;
    title: string;
    price: string;
    currency: string;
    description: string;
    isSelected: boolean;
    onPress: () => void;
}

const TicketView = memo(({ id, title, currency, description, isSelected = false, price, onPress }: TicketProps) => {
    const _renderTruncatedFooter = (handlePress: any) => {
        return (
            <Text style={{ color: isSelected ? colors.colorBlack : colors.colorPrimary, marginTop: 5 }} onPress={handlePress}>
                Read more
            </Text>
        );
    }

    const _renderRevealedFooter = (handlePress: any) => {
        return (
            <Text style={{ color: isSelected ? colors.colorBlack : colors.colorPrimary, marginTop: 5 }} onPress={handlePress}>
                Show less
            </Text>
        );
    }

    const _handleTextReady = () => {
        // ...
    }

    return (
        <Card cardElevation={2} cornerRadius={scaler(8)}>
            <TouchableOpacity style={[styles.renderView, isSelected ? { backgroundColor: colors.colorPrimary } : {}]} activeOpacity={0.7} onPress={onPress}>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={[styles.mainText, { flex: 1 }, isSelected ? { color: colors.colorWhite } : {}]}>{title}</Text>
                    <Text style={[styles.mainText, isSelected ? { color: colors.colorWhite } : {}]}>{getSymbol(currency)}{price}</Text>
                </View>
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

