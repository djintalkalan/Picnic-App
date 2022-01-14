import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { MyHeader } from 'custom-components';
import TopTab from 'custom-components/TopTab';
import React, { FC, useMemo } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Language from 'src/language/Language';
import EventmemberList from './CreateEvent/EventMemberList';



const EventMembers: FC<any> = (props) => {

    const tabs = useMemo(() => {
        return [{
            title: Language.not_checked_in,
            name: "NotCheckedIn",
            screen: EventmemberList,
            initialParams: { isCheckedIn: false, id: props?.route?.params?.id }
        },
        {
            title: Language.checked_in,
            name: "CheckedIn",
            // screen: (() => <View />),
            screen: EventmemberList,
            initialParams: { isCheckedIn: true, id: props?.route?.params?.id }

        }];
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <MyHeader title={Language.members} backEnabled rightIcon={Images.ic_scan} />
            <TopTab tabs={tabs} activeTitleColor={colors.colorPrimary}
                disableTitleColor={'rgba(6, 29, 50, 0.5)'} swipeEnabled={false} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.colorWhite },
})

export default EventMembers;