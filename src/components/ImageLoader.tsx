import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ColorValue, GestureResponderEvent, Image, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import FastImage, { ImageStyle, ResizeMode, Source } from 'react-native-fast-image';


interface IImageLoader {
    isShowActivity?: boolean,
    style?: StyleProp<ImageStyle>,
    source: Source | null,
    resizeMode?: ResizeMode
    borderRadius?: number
    backgroundColor?: ColorValue
    children?: any
    loadingStyle?: any
    placeholderSource?: any
    placeholderStyle?: ViewStyle
    customImagePlaceholderDefaultStyle?: any
    reload?: boolean
    onPress?: (e?: GestureResponderEvent) => void
}
const ImageLoader = (props: IImageLoader) => {
    const { isShowActivity = true, source, resizeMode, borderRadius, backgroundColor, children,
        loadingStyle, placeholderSource, placeholderStyle,
        customImagePlaceholderDefaultStyle } = props

    const [loadingState, setLoadingState] = useState({
        loading: false,
        error: false,
        loaded: false
    })

    const currentRetry = useRef(0);
    const onLoadEnd = useCallback(() => {
        setLoadingState((_) => {
            return {
                ..._,
                loading: false,
                loaded: true
            }
        })
    }, [])

    const onLoadStart = useCallback(() => {
        setLoadingState((_) => {
            return {
                ..._,
                loading: true,
                loaded: false,
                error: false
            }
        })
    }, [])


    const onError = useCallback(() => {
        if (props.reload && currentRetry?.current < 10)
            setTimeout(() => {
                currentRetry.current++
                onLoadStart()
            }, 7000);
        setLoadingState((_) => {
            return {
                ..._,
                loading: false,
                error: true,
                loaded: true
            }
        })
    }, [props.reload])

    const styles = useMemo(() => StyleSheet.create({
        mainStyle: StyleSheet.flatten(props?.style),
        activityIndicator: {
            position: 'absolute',
            margin: 'auto',
            zIndex: 9,
            alignSelf: 'center'
        },
        viewImageStyles: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: borderRadius ?? undefined,
            backgroundColor: backgroundColor ?? undefined
        },
        imagePlaceholderStyles: {
            width: 40,
            height: 40,
            resizeMode: 'contain',
            justifyContent: 'center',
            alignItems: 'center',
            ...customImagePlaceholderDefaultStyle
            // overFlow: 'hidden'
        },
    }), [props?.style, borderRadius, backgroundColor, customImagePlaceholderDefaultStyle])

    const { loaded, loading, error } = loadingState
    return (
        <TouchableOpacity disabled={!props?.onPress} onPress={props?.onPress} activeOpacity={0.9} >
            <FastImage
                key={currentRetry.current}
                source={source ?? { uri: "" }}
                style={[styles.mainStyle]}
                onLoadEnd={onLoadEnd}
                onError={onError}
                onLoadStart={onLoadStart}
                resizeMode={resizeMode ?? "contain"}
            >
                {(loading || error || !source) ? <View style={styles.viewImageStyles} >
                    {source && loading ? <ActivityIndicator
                        style={styles.activityIndicator}
                        size={loadingStyle ? loadingStyle.size : 'small'}
                        color={loadingStyle ? loadingStyle.color : 'gray'}
                    /> : null}

                    {(loaded && placeholderSource && (!loading && error)) || !source ?
                        <Image
                            //@ts-ignore
                            style={placeholderStyle ?? styles?.mainStyle}
                            source={placeholderSource ?? null}
                        /> : null}
                </View> : null}

            </FastImage>
        </TouchableOpacity>
    );
}

export default ImageLoader