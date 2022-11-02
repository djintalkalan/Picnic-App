import { leaveGroup } from 'app-store/actions'
import { colors, Images } from 'assets'
import { Button, MyHeader, Text } from 'custom-components'
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar'
import { ListItemSeparator, MemberListItem } from 'custom-components/ListItem/ListItem'
import { isEqual } from 'lodash'
import React, { FC, useCallback, useState } from 'react'
import { FlatList, Image, StyleSheet, View } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useDispatch, useSelector } from 'react-redux'
import { useDatabase } from 'src/database/Database'
import Language from 'src/language/Language'
import { getImageUrl, scaler } from 'utils'

const SelectAdmin: FC<any> = (props) => {

    const [userData] = useDatabase("userData")

    const { isLoading, groupMembers, } = useSelector(state => ({
        isLoading: state.isLoading,
        groupMembers: (state?.groupDetails?.[props?.route?.params?.id]?.groupMembers ?? [])?.filter(_ => (!_?.is_admin)),
    }), isEqual)

    const [selectedMember, setSelectedMember] = useState<string>("")


    const dispatch = useDispatch()



    const _renderItem = useCallback(({ item, index }) => (
        <MemberListItem
            containerStyle={{}}
            title={item?.user?.first_name + " " + (item?.user?.last_name ?? "")}
            icon={item?.user?.image ? { uri: getImageUrl(item?.user?.image, { type: 'users', width: scaler(50) }) } : null}
            defaultIcon={Images.ic_home_profile}
            onPress={() => setSelectedMember(selectedMember == item?.user?._id ? '' : item?.user?._id)}
            customRightText={
                <View style={{ width: scaler(20), height: scaler(20) }}>
                    {selectedMember == item?.user?._id ?
                        <Image style={{ alignSelf: 'center', marginHorizontal: scaler(2), width: '100%', height: '100%', resizeMode: 'contain' }} source={Images?.ic_member_tick} />
                        : <MaterialIcons
                            style={{ width: '100%', height: '100%' }}
                            size={scaler(20)}
                            color={colors.colorPrimary}
                            name='radio-button-off' />}
                </View>}
        />
    ), [selectedMember])



    return (
        <SafeAreaViewWithStatusBar style={styles.container} >

            <MyHeader title={Language.select_admin} />

            <Text style={{ color: '#9A9A9A', fontSize: scaler(13), marginHorizontal: scaler(20), marginTop: scaler(5) }} >{Language.you_need_to_assign_new_leader}</Text>

            <View style={{ flex: 1, width: '100%', paddingVertical: scaler(5), }} >

                <FlatList
                    keyExtractor={(_, i) => i.toString()}
                    data={groupMembers}
                    renderItem={_renderItem}
                    ItemSeparatorComponent={ListItemSeparator}
                />
            </View>

            <Button
                containerStyle={{ marginHorizontal: scaler(20) }}
                disabled={!selectedMember}
                title={Language.confirm}
                onPress={() => {
                    dispatch(leaveGroup({ groupId: props?.route?.params?.id, userId: selectedMember }))
                }}
            />

        </SafeAreaViewWithStatusBar>
    )
}

export default SelectAdmin

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite,
        justifyContent: 'center'
    },
    heading: {
        fontSize: scaler(18),
        marginTop: scaler(10),
        // marginHorizontal: scaler(5),
        fontWeight: '600',
    },
    content: {
        fontSize: scaler(12),
        marginTop: scaler(5),
        marginBottom: scaler(10),
        fontWeight: '400',
        // marginHorizontal: scaler(5),
        color: colors.colorPlaceholder
    },
    divider: {
        backgroundColor: '#EBEBEB',
        height: 1,
        width: '100%'
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingVertical: scaler(20),
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: '400',
        fontSize: scaler(12.5),
        marginLeft: scaler(10)
    },
    alertContainer: {
        backgroundColor: colors.colorWhite,
        padding: scaler(20),
        width: '100%',
        elevation: 3,
        alignItems: 'center',
        borderRadius: scaler(20)
    },
})