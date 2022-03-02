import { setLoadingAction } from 'app-store/actions'
import { colors, Images } from 'assets'
import { MyHeader } from 'custom-components'
import { ListItem, ListItemSeparator } from 'custom-components/ListItem/ListItem'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Alert, FlatList, InteractionManager, Platform, StyleSheet, Text, View } from 'react-native'
import Contacts, { Contact, PhoneNumber } from 'react-native-contacts'
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Language from 'src/language/Language'
import { scaler } from 'utils'
const SelectContacts: FC<any> = (props) => {
    const dispatch = useDispatch()

    const onChooseContacts = props?.route?.params?.onChooseContacts

    const [contacts, setContacts] = useState<Array<Contact>>([]);
    const [isLoaded, setLoaded] = useState<boolean>(false);

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
        InteractionManager.runAfterInteractions(async () => {
            startChecking()
        })
    }, [])


    const askedForBlocked = useCallback(() => {
        Alert.alert(Language.permission_required, Language.app_needs_contact_permission, [
            {
                text: Language.give_permission, onPress: async () => {
                    await openSettings().then(() => {
                    }).catch(e => console.log("Open Setting Error", e)).finally(() => {
                        startChecking()
                    })
                },

            },
            {
                text: Language.cancel,
            }

        ], { cancelable: true })
    }, [])

    let denyTime = useRef(0)
    const getPermissionResult = useCallback(async (result) => {
        console.log("result", result);
        switch (result) {
            case RESULTS.DENIED:
                console.log('The permission is DENIED: No actions is possible');
                setContactPermission(false)
                setLoaded(true)
                // _showErrorMessage("Contact Permission denied")
                if (denyTime.current) {
                    askedForBlocked()
                }
                else {
                    denyTime.current = denyTime.current + 1
                    await askContactPermission()
                }
                return false
            // return await checkContactPermission()
            case RESULTS.GRANTED:
                console.log('The permission is GRANTED: all actions are possible');
                setContactPermission(true)
                return true
            case RESULTS.BLOCKED:
                askedForBlocked()
                setLoaded(true)
                break;
            default:
                setContactPermission(false)
                break;
        }
    }, [])

    const checkContactPermission = useCallback(async () => {
        const result = await check(Platform.OS == 'android' ? PERMISSIONS.ANDROID.READ_CONTACTS : PERMISSIONS.IOS.CONTACTS)
        return await getPermissionResult(result)
    }, [])


    const askContactPermission = useCallback(async () => {
        Alert.alert(Language.permission_required, Language.app_needs_contact_permission, [
            {
                text: Language.give_permission, onPress: async () => {
                    const result = await request(Platform.OS == 'android' ? PERMISSIONS.ANDROID.READ_CONTACTS : PERMISSIONS.IOS.CONTACTS, {
                        title: Language.permission_required,
                        message: Language.app_needs_contact_permission,
                        buttonPositive: Language.give_permission,
                        buttonNegative: Language.deny,
                    })
                    await getPermissionResult(result);
                },

            },
            {
                text: Language.cancel,
            }

        ], { cancelable: true })
    }, [])

    const startChecking = useCallback(async () => {
        const hasPermissionAvailable = await checkContactPermission()
    }, [])

    const [isContactPermission, setContactPermission] = useState(false)


    useEffect(() => {
        if (isContactPermission) {
            console.log("isContactPermission", isContactPermission);
            // return
            dispatch(setLoadingAction(true))
            setLoaded(false)
            Contacts.getAll()
                .then((contacts) => {
                    // work with contacts
                    contacts.sort(compare)
                    setContacts(contacts)
                    console.log(contacts)
                    dispatch(setLoadingAction(false))
                    setLoaded(true)
                })
                .catch((e) => {
                    console.log(e)
                    dispatch(setLoadingAction(false))
                    setLoaded(true)
                })
        }
    }, [isContactPermission])

    return (
        <SafeAreaView style={styles.container} >
            <MyHeader title={Language.select_contact} />
            <FlatList
                style={{ flex: 1 }}
                bounces={false}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps={'always'}
                keyExtractor={(_, i) => i.toString()}
                data={contacts}
                renderItem={_renderItem}
                ListEmptyComponent={isLoaded ? () => {
                    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                        <Text>{isContactPermission ? Language.contacts_not_available : Language.contacts_permission_not_available}</Text>
                    </View>
                } : undefined}
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