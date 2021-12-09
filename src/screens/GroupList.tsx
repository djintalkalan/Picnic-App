import { colors } from 'assets/Colors';
import { Images } from 'assets/Images';
import { ListItem, ListItemSeparator } from 'custom-components/ListItem/ListItem';
import React, { FC, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';
import { scaler } from 'utils';


const GroupList: FC<any> = (props) => {

    const _renderItem = useCallback((data, rowMap) => (
        <ListItem
            title={"Soccer meetup"}
            icon={Images.ic_profile_image}
            subtitle={"Los Angeles, USA "}
            isSelected={false}
        />
    ), [])

    const _renderHiddenItem = useCallback((data, rowMap) => (
        <View style={{
            alignItems: 'center',
            backgroundColor: '#DDD',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 15,
        }}>


        </View>
    ), [])
    return (
        <SafeAreaView style={styles.container} >
            <SwipeListView
                data={[1, 2, 3, 4, 5, 6]}
                renderItem={_renderItem}
                renderHiddenItem={_renderHiddenItem}
                leftOpenValue={scaler(80)}
                rightOpenValue={-scaler(80)}
                ItemSeparatorComponent={ListItemSeparator}

                keyExtractor={(_, i) => i.toString()}
                useFlatList
                useNativeDriver

                closeOnRowOpen={true}
            />
        </SafeAreaView>
    )
}

export default GroupList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    }
})
