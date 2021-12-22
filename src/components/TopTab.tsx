import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors } from 'assets';
import { Text } from 'custom-components';
import React, { useEffect } from 'react';
import { ColorValue, Image, ImageSourcePropType, TouchableOpacity, View } from 'react-native';
import { scaler } from 'utils';

export interface TabProps {
    title: string,
    name: string,
    icon?: ImageSourcePropType,
    disable?: boolean,
    screen: React.ComponentType<any>,
    initialParams?: any
}

export interface TopTabProps {
    tabs: TabProps[],
    swipeEnabled?: boolean
    activeTitleColor?: ColorValue
    disableTitleColor?: ColorValue
    onChangeIndex?: (i: number) => void
}

export const TopTab = (props: TopTabProps) => {
    const Tab = createMaterialTopTabNavigator();
    const { tabs, swipeEnabled = true, disableTitleColor = colors.colorGreyInactive, activeTitleColor = colors.colorBlackText } = props
    // useScrollToTop(tabs[0].initialParams?.scrollRef);
    return (
        <Tab.Navigator backBehavior={'none'} keyboardDismissMode={'auto'}
            tabBar={(tabBarProps: any) => <MyTabBar {...tabBarProps} onChangeIndex={props?.onChangeIndex} />}
            screenOptions={{ tabBarAllowFontScaling: false, swipeEnabled }} >
            {tabs && tabs.map((tab, index) => {
                const { title, name, screen, initialParams, ...rest } = tab
                return <Tab.Screen key={index} options={{ title, activeTitleColor, disableTitleColor, ...rest }} initialParams={initialParams} name={name} component={screen} />
            })}
        </Tab.Navigator>
    )
}

const MyTabBar = ({ state, descriptors, navigation, onChangeIndex }: any) => {
    useEffect(() => {
        onChangeIndex && onChangeIndex(state.index)
    }, [state?.index])
    return (
        <View style={{
            flexDirection: 'row',
            overflow: 'hidden',
            backgroundColor: colors.transparent,
            minHeight: scaler(44),
            justifyContent: "center",
            alignItems: "center"
        }}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <TouchableOpacity
                        key={index}
                        disabled={options?.disable ? true : false}
                        // accessibilityRole="button"
                        // accessibilityStates={isFocused ? ['selected'] : []}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={{ flex: 1 }}
                    >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}  >
                            {options?.icon ?
                                <Image style={{
                                    tintColor: isFocused ? colors.colorPrimary : colors.colorGreyInactive,
                                    height: scaler(25),
                                    width: scaler(25),
                                    resizeMode: 'contain',
                                    marginRight: scaler(7),
                                }} source={options?.icon} /> : null}
                            <Text
                                style={{
                                    fontSize: scaler(12),
                                    textAlign: 'center',
                                    fontWeight: isFocused ? '500' : '400',
                                    color: isFocused ? options?.activeTitleColor : options?.disableTitleColor
                                }}
                            >{label}
                            </Text>
                        </View>
                        <View style={{ width: '100%', height: 1, backgroundColor: isFocused ? colors.colorPrimary : '#DBDBDB' }} ></View>

                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default TopTab