import { RootState } from 'app-store';
import { getEventMembers } from 'app-store/actions';
import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { MyHeader } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import TopTab from 'custom-components/TopTab';
import { isEqual } from 'lodash';
import React, { FC, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Language from 'src/language/Language';
import { NavigationService } from 'utils';
import EventMemberList from './EventMemberList';

const EventMembers: FC<any> = (props) => {

    const dispatch = useDispatch()

    const { count1, count2 } = useSelector((state: RootState) => ({
        count1: state?.eventDetails?.[props?.route?.params?.id]?.eventMembersNotCheckedIn?.length,
        count2: state?.eventDetails?.[props?.route?.params?.id]?.eventMembersCheckedIn?.length,
    }), isEqual)

    const tabs = useMemo(() => {
        return [{
            title: Language.not_checked_in + (count1 ? "(" + count1 + ")" : ""),
            name: "NotCheckedIn",
            Screen: EventMemberList,
            initialParams: { isCheckedIn: false, id: props?.route?.params?.id }
        },
        {
            title: Language.checked_in + (count2 ? "(" + count2 + ")" : ""),
            name: "CheckedIn",
            Screen: EventMemberList,
            initialParams: { isCheckedIn: true, id: props?.route?.params?.id }

        }];
    }, [count1, count2])

    useEffect(() => {
        dispatch(getEventMembers(props?.route?.params?.id));
    }, [])

    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={Language.members}
                backEnabled
                rightIcon={Images.ic_scan}
                onPressRight={() => NavigationService.navigate('Scanner', { id: props?.route?.params?.id })}
            />
            <TopTab tabs={tabs} activeTitleColor={colors.colorPrimary}
                disableTitleColor={'rgba(6, 29, 50, 0.5)'} swipeEnabled={false} />
        </SafeAreaViewWithStatusBar>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.colorWhite },
})

export default EventMembers;