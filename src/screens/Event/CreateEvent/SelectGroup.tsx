import { RootState } from 'app-store';
import { getMyGroups } from 'app-store/actions';
import { colors, Images } from 'assets';
import { MyHeader } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import { ListItem, ListItemSeparator } from 'custom-components/ListItem/ListItem';
import _, { isEqual } from 'lodash';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
    // ActivityIndicator,
    FlatList,
    // Image,
    StyleSheet, TextInput, View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Language from 'src/language/Language';
import { getCityOnly, getImageUrl, NavigationService, scaler } from 'utils';


const SelectGroup: FC<any> = (props) => {
    const [text, setText] = useState('')
    const inputRef = useRef<TextInput>(null)
    const [searchLoader, setSearchLoader] = useState(false)

    useEffect(() => {
        debounceSearch(text)
    }, [text])
    const dispatch = useDispatch()
    const debounceSearch = useCallback(_.debounce((text) => {
        console.log("text", text);
        dispatch(getMyGroups())
        setTimeout(() => {
            setSearchLoader(false)
        }, 2000);
    }, 500), [])

    const { myGroups } = useSelector((state: RootState) => ({
        myGroups: state?.group?.myGroups
    }))

    const { allGroups, searchedGroups } = useSelector<RootState, any>((state) => ({
        allGroups: state?.group?.allGroups,
    }), isEqual)


    const _renderItem = useCallback(({ item, index }) => {
        const { name, image, city, state, country } = item

        return (
            <ListItem
                defaultIcon={Images.ic_group_placeholder}
                title={name}
                //@ts-ignore
                icon={image ? { uri: getImageUrl(image, { width: scaler(50), type: 'groups' }) } : undefined}
                // subtitle={city + ", " + (state ? (state + ", ") : "") + country}
                subtitle={getCityOnly(city, state, country)}
                // isSelected={is_group_member}
                onPress={() => {
                    props?.route?.params?.onSelectGroup && props?.route?.params?.onSelectGroup(item)
                    NavigationService.goBack();
                }}
                onPressImage={() => {

                }}
            />
        )
    }, [])

    return (
        <SafeAreaViewWithStatusBar style={styles.container}>
            <MyHeader title={Language.select_group} />
            {/* <View style={{
                paddingVertical: scaler(15),
                borderBottomColor: 'rgba(0, 0, 0, 0.04)',
                borderBottomWidth: 2,
                marginBottom: scaler(2),
            }} >
                <TextInput
                    ref={inputRef}
                    autoCapitalize={'none'}
                    onChangeText={(text) => {
                        // console.log("Text is ", text);
                        setText(text?.toLowerCase())
                    }}
                    // autoFocus={true}
                    style={styles.searchInput}
                    // value={searchedText}
                    placeholder={Language.search_here}
                />
                <View style={styles.imagePlaceholderContainer} >
                    <Image style={styles.imagePlaceholder} source={Images.ic_lens} />
                </View>

                {searchLoader && <View style={[styles.imagePlaceholderContainer, { top: scaler(25), left: undefined, right: scaler(30), alignItems: 'center', justifyContent: 'center' }]} >
                    <ActivityIndicator color={colors.colorPrimary} size={scaler(24)} />
                </View>}
            </View> */}
            <View style={{ flex: 1, borderTopColor: 'rgba(0, 0, 0, 0.06)', borderTopWidth: scaler(1.5), marginTop: scaler(10) }} >
                <FlatList
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps={'handled'}
                    data={allGroups}
                    // extraData={chats?.length}
                    keyExtractor={_ => _?._id}
                    bounces={false}
                    ItemSeparatorComponent={ListItemSeparator}
                    renderItem={_renderItem}
                />
            </View>
        </SafeAreaViewWithStatusBar>

    )
}
export default SelectGroup;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.colorWhite
    },
    searchInput: {
        height: scaler(40),
        backgroundColor: colors.colorBackground,
        borderRadius: scaler(10),
        paddingHorizontal: scaler(45),
        paddingVertical: 0,
        marginVertical: 0,
        // marginTop: scaler(0),
        marginHorizontal: scaler(20),
        fontSize: scaler(11),
        fontWeight: '300',
        color: colors.colorBlackText,
    },
    imagePlaceholder: {
        height: scaler(19),
        // top: scaler(30),
        // left: scaler(25),
        resizeMode: 'contain',
    },
    imagePlaceholderContainer: {
        height: scaler(20),
        position: 'absolute',
        top: scaler(25),
        left: scaler(25),
    },
})