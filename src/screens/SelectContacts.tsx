import { setLoadingAction } from 'app-store/actions'
import { colors, Images } from 'assets'
import { MyHeader } from 'custom-components'
import { ListItem, ListItemSeparator } from 'custom-components/ListItem/ListItem'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import Contacts, { Contact, PhoneNumber } from 'react-native-contacts'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Language from 'src/language/Language'
import { scaler } from 'utils'
const SelectContacts: FC<any> = (props) => {
    const dispatch = useDispatch()

    const onChooseContacts = props?.route?.params?.onChooseContacts

    const [contacts, setContacts] = useState<Array<Contact>>([]);

    const getPhoneNumber = useCallback((phoneNumbers: PhoneNumber[]) => {
        try {
            return phoneNumbers?.map(_ => _?.number).join("\n")

        }
        catch (e) {
            return phoneNumbers?.[0]?.number || ""
        }
    }, [])

    const _renderItem = useCallback(({ item, index }: { item: Contact, index: number }) => {
        return <ListItem
            onPress={() => {
                onChooseContacts && onChooseContacts([item])
            }}
            title={item.givenName + (item?.familyName ? (" " + item?.familyName) : "")}
            defaultIcon={Images.ic_home_profile}
            icon={item?.thumbnailPath ? { uri: item?.thumbnailPath } : undefined}
            subtitle={getPhoneNumber(item?.phoneNumbers)}
            textContainerStyle={{ justifyContent: 'center' }}
            subtitleTextStyle={{ lineHeight: scaler(20) }}
        />
    }, [])

    const compare = useCallback((a, b) => {
        const aName = a.givenName + (a?.familyName ? (" " + a?.familyName) : "")
        const bName = b.givenName + (b?.familyName ? (" " + b?.familyName) : "")
        return aName < bName ? -1 : aName > bName ? 1 : 0;
    }, [])

    useEffect(() => {
        dispatch(setLoadingAction(true))
        Contacts.getAll()
            .then((contacts) => {
                // work with contacts
                contacts.sort(compare)
                setContacts(contacts)
                console.log(contacts)
                dispatch(setLoadingAction(false))
            })
            .catch((e) => {
                console.log(e)
                dispatch(setLoadingAction(false))
            })
    }, [])

    return (
        <SafeAreaView style={styles.container} >
            <MyHeader title={Language.select_contact} />
            <FlatList
                style={{ flex: 1 }}
                keyboardShouldPersistTaps={'handled'}
                keyExtractor={(_, i) => i.toString()}
                data={contacts}
                renderItem={_renderItem}
                ItemSeparatorComponent={ListItemSeparator}

            />
        </SafeAreaView>
    )
}

export default SelectContacts

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    }
})