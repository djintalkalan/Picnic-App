import { getLikeDetails } from "app-store/actions";
import { colors, Images } from "assets";
import { MyHeader, Text } from "custom-components";
import { SafeAreaViewWithStatusBar } from "custom-components/FocusAwareStatusBar";
import { MemberListItem } from "custom-components/ListItem/ListItem";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import Language from "src/language/Language";
import { getImageUrl, scaler } from "utils";

const emojis = ['all', 'like', 'love', 'not_sure', 'surprised', 'maybe', 'question']

const LikeDetails: FC<any> = ({ route }) => {
    const { message_id } = route?.params || {}
    const dispatch = useDispatch();

    const [selectedType, setSelectedType] = useState('all');

    const [reactions, setReactions] = useState(Object.assign({}, emojis.reduce((acc: any, curr) => (acc[curr] = [], acc), {})))

    useEffect(() => {
        const reactions = { ...emojis.reduce((acc: any, curr) => (acc[curr] = [], acc), {}) }
        dispatch(getLikeDetails({
            message_id, onSuccess: (data) => {
                data?.message_liked_by_users?.forEach((_: any) => {
                    reactions['all'].push(_)
                    reactions[_?.like_type].push(_)
                })
                setReactions(reactions)
            }
        }))
    }, [])

    const _renderItem = useCallback(({ item, index }: { item: any, index: number }) => (
        <MemberListItem
            title={item?.username}
            icon={item?.image ? { uri: getImageUrl(item?.image, { type: 'users', width: scaler(50) }) } : undefined}
            defaultIcon={Images.ic_home_profile}
            //@ts-ignore
            customRightText={<Image style={{ height: scaler(20), width: scaler(20), resizeMode: 'contain' }} source={Images['ic_emoji_' + item?.like_type] || undefined} />}
            isSelected={false}
        />
    ), [])

    const _data = useMemo(() => {
        const _data = Object.keys(reactions).filter(_ => reactions[_]?.length).sort((a, b) => reactions[b]?.length || 0 - reactions[a]?.length || 0)
        if (!_data?.length) return [emojis[0]]
        return _data
    }, [reactions])

    return <SafeAreaViewWithStatusBar style={styles.container} >
        <MyHeader title={Language.people_who_reacted} />
        <View style={styles.emojiContainer}>
            <FlatList
                contentContainerStyle={{ flexShrink: 1 }}
                horizontal
                data={_data}
                renderItem={({ item: _, index }) => {
                    return <TouchableOpacity
                        key={_}
                        onPress={() => { setSelectedType(_) }}
                        style={[styles.emojiButton, {
                            backgroundColor: selectedType == _ ? colors.colorFadedPrimary : undefined,
                        }]}>
                        {_ == 'all' ?
                            <Text style={{ color: selectedType == _ ? colors.colorPrimary : undefined }} >All</Text>
                            :
                            //@ts-ignore
                            <Image style={{ height: scaler(20), width: scaler(20), resizeMode: 'contain' }} source={Images['ic_emoji_' + _] || undefined} />

                        }
                        <Text style={{ marginLeft: scaler(5), color: selectedType == _ ? colors.colorPrimary : colors.colorGreyMore }} >{reactions[_]?.length}</Text>
                    </TouchableOpacity>
                }}
            />
        </View>
        <View style={{ flex: 1 }} >
            <FlatList
                data={reactions[selectedType]}
                keyExtractor={(_: any, i) => i + selectedType}
                renderItem={_renderItem} />
        </View>


    </SafeAreaViewWithStatusBar>
}

export default LikeDetails


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    },
    emojiContainer: {
        paddingHorizontal: scaler(4),
        paddingVertical: scaler(4),
        borderRadius: scaler(8),
        backgroundColor: colors.colorWhite,
        // borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.colorPrimary,

    },
    emojiButton: {
        // height: scaler(60),
        paddingHorizontal: scaler(9),
        paddingVertical: scaler(6),
        borderRadius: scaler(5),
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row',
    }
})