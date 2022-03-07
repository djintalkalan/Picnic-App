
import { reportResource } from 'app-store/actions';
import { RootState } from 'app-store/store';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { IBottomMenuButton } from 'custom-components/BottomMenu';
import { MemberListItem } from 'custom-components/ListItem/ListItem';
import React, { FC, useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { EMIT_EVENT_MEMBER_DELETE, SocketService } from 'socket';
import Language, { useLanguage } from 'src/language/Language';
import { getImageUrl, scaler, _hidePopUpAlert, _showBottomMenu, _showPopUpAlert } from 'utils';

export const EventMemberList: FC<any> = (props) => {
    const dispatch = useDispatch();
    const { members } = useSelector((state: RootState) => ({
        members: state?.eventDetails?.[props?.route?.params?.id]?.[props?.route?.params?.isCheckedIn ? 'eventMembersCheckedIn' : 'eventMembersNotCheckedIn'],
    }))

    const getButtons = useCallback((item: any) => {
        console.log('items', item)
        const buttons: Array<IBottomMenuButton> = []
        // buttons.push({
        //     title: Language.block_from_chat, onPress: () => {
        //         // dispatch(setActiveEvent(item))
        //         // setTimeout(() => {
        //         //     NavigationService.navigate('EditEvent', { id: _id })
        //         // }, 0);
        //     }
        // })
        buttons.push({
            title: Language.report_member, onPress: () => {
                _showPopUpAlert({
                    message: Language.are_you_sure_report_member,
                    onPressButton: () => {
                        dispatch(reportResource({ resource_id: item?.user_id, resource_type: 'user' }))
                        _hidePopUpAlert()
                    },
                    buttonText: Language.yes_report,
                    // cancelButtonText: Language.cancel
                })
            }
        })
        if (!props?.route?.params?.isCheckedIn) {
            buttons.push({
                title: Language.remove_from_event, textStyle: { color: colors.colorErrorRed }, onPress: () => {
                    _showPopUpAlert({
                        message: Language.are_you_sure_remove_member,
                        buttonStyle: { backgroundColor: colors.colorErrorRed },
                        onPressButton: () => {
                            SocketService.emit(EMIT_EVENT_MEMBER_DELETE, {
                                resource_id: item?.resource_id,
                                user_id: item?.user_id,
                            })
                            _hidePopUpAlert()
                        },
                        buttonText: Language.yes_remove,
                        // cancelButtonText: Language.cancel
                    })
                }
            })
        }

        return buttons
    }, [useLanguage()])



    const _renderEventMembers = useCallback(({ item, index }) => {
        return (
            <MemberListItem
                onLongPress={() => {
                    !item?.is_creator ? _showBottomMenu({
                        buttons: getButtons(item)
                    }) : undefined
                }}
                containerStyle={{ paddingHorizontal: scaler(0) }}
                title={item?.user?.first_name + " " + (item?.user?.last_name ?? "")}
                // customRightText={item?.is_admin ? Language?.admin : ""}
                icon={item?.user?.image ? { uri: getImageUrl(item?.user?.image, { type: 'users', width: scaler(50) }) } : null}
                defaultIcon={Images.ic_image_placeholder}
            />
        )
    }, [])


    return (
        <View style={styles.container}>
            <FlatList
                data={members}
                keyExtractor={(_, i) => i.toString()}
                ItemSeparatorComponent={() => <View style={{ flex: 1, height: 1, backgroundColor: '#EBEBEB' }} />}
                renderItem={_renderEventMembers} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: scaler(15),
        backgroundColor: colors.colorWhite
    }
})

export default EventMemberList;