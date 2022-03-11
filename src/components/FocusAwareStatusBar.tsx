import { useIsFocused } from '@react-navigation/native';
import { colors } from 'assets';
import * as React from 'react';
import { ColorValue, StatusBar, StatusBarProps, StatusBarStyle, StyleSheet, View } from 'react-native';
import { NativeSafeAreaViewProps, SafeAreaView } from 'react-native-safe-area-context';

const defaultProps = {}

interface SafeAreaViewWithStatusBarProps extends NativeSafeAreaViewProps {
    barStyle?: null | StatusBarStyle | undefined
    translucent?: boolean;
    backgroundColor?: ColorValue
}

export const FocusAwareStatusBar: React.FC<StatusBarProps> = ({ backgroundColor = colors.colorWhite, barStyle = 'dark-content', ...rest }) => {
    const isFocused = useIsFocused();
    return isFocused ? <StatusBar
        backgroundColor={backgroundColor}
        barStyle={barStyle}
        {...rest} /> : null;
}

export const SafeAreaViewWithStatusBar: React.FC<SafeAreaViewWithStatusBarProps> = ({
    style,
    barStyle = 'dark-content',
    translucent = false,
    ...rest }) => {
    const styles = React.useMemo(() => {
        style = StyleSheet.flatten(style)
        return StyleSheet.create({
            container: {
                flex: 1,
                ...style,
                backgroundColor: translucent ? 'transparent' : (style?.backgroundColor ?? colors.colorWhite),
            },
            inner: {
                backgroundColor: style?.backgroundColor ?? colors.colorWhite,
            }
        })
    }, [style])
    return (
        <SafeAreaView style={styles.container} {...rest}  >
            <FocusAwareStatusBar backgroundColor={styles?.container?.backgroundColor} barStyle={barStyle} translucent={translucent} />
            {translucent ? <View style={[styles.container, styles.inner]} >
                {rest.children}
            </View> : rest?.children}
        </SafeAreaView>
    )
}