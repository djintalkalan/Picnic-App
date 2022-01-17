
import { RootState } from 'app-store/store';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { MemberListItem } from 'custom-components/ListItem/ListItem';
import React, { FC, useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getImageUrl, scaler } from 'utils';

export const EventmemberList: FC<any> = (props) => {
    const { members } = useSelector((state: RootState) => ({
        members: state?.eventDetails?.[props?.route?.params?.id]?.[props?.route?.params?.isCheckedIn ? 'eventMembersCheckedIn' : 'eventMembersNotCheckedIn'],
    }))


    const _renderEventMembers = useCallback(({ item, index }) => {
        return (
            <MemberListItem
                // onLongPress={item?.is_admin ? undefined : () => {
                //     _showBottomMenu({
                //         buttons: getBottomMenuButtons(item)
                //     })
                // }}
                containerStyle={{ paddingHorizontal: scaler(0) }}
                title={item?.user?.first_name + " " + (item?.user?.last_name ?? "")}
                // customRightText={item?.is_admin ? Language?.admin : ""}
                icon={item?.user?.image ? { uri: getImageUrl(item?.user?.image, { type: 'users', width: scaler(50) }) } : null}
                defaultIcon={Images.ic_profile_image}
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

export default EventmemberList;