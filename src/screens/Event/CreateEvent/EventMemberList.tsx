
import { getEventMembers } from 'app-store/actions';
import { RootState } from 'app-store/store';
import { colors } from 'assets/Colors';
import React, { FC, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export const EventmemberList: FC<any> = (props) => {
    const dispatch = useDispatch();
    const { eventMembers } = useSelector((state: RootState) => ({
        eventMembers: state?.eventDetails?.[props?.route?.params?.id]?.eventMembers
    }))
    console.log('eventMembers', props)
    useEffect(() => {
        dispatch(getEventMembers(props?.route?.params?.id));
    }, [])


    return (
        <View style={styles.container}>
            {/* <FlatList data={props?.route?.params?.isCheckedIn }/> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.colorWhite }
})

export default EventmemberList;