import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ColorValue, GestureResponderEvent, Image, ImageBackground, ImageResizeMode, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import FastImage, { ImageStyle, Source } from 'react-native-fast-image';


interface IImageLoader {
    isShowActivity?: boolean,
    style?: StyleProp<ImageStyle>,
    source: Source,
    resizeMode?: ImageResizeMode
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
    const [isLoaded, setLoaded] = useState(false)
    const [isError, setError] = useState(false)
    const currentRetry = useRef(0);
    const onLoadEnd = useCallback(() => {
        setLoaded(true)
    }, [])


    const onError = useCallback(() => {
        if (props.reload && currentRetry?.current < 10)
            setTimeout(() => {
                currentRetry.current++
                setError(false)
                setLoaded(false)
            }, 7000);
        setError(true)
        setLoaded(true)
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

    return (
        <TouchableOpacity disabled={!props?.onPress} onPress={props?.onPress} activeOpacity={0.9} >
            <FastImage
                key={currentRetry.current}
                source={source}
                style={[styles.mainStyle, (isLoaded && !isError) ? {} : {}]}
                onLoadEnd={onLoadEnd}
                onError={onError}
                resizeMode={resizeMode}
                borderRadius={borderRadius}
            >
                {(isLoaded && !isError) ? null : <View style={styles.viewImageStyles} >
                    {!isLoaded && source && <ActivityIndicator
                        style={styles.activityIndicator}
                        size={loadingStyle ? loadingStyle.size : 'small'}
                        color={loadingStyle ? loadingStyle.color : 'gray'}
                    />}

                    {placeholderSource && !(isLoaded && !isError) ?
                        <Image
                            style={placeholderStyle ?? styles?.mainStyle}
                            source={placeholderSource ?? null}
                        /> : null}
                </View>}


            </FastImage>
        </TouchableOpacity>
    );
}

const ImageLoader2 = (props: IImageLoader) => {
    const { isShowActivity = true, source, resizeMode, borderRadius, backgroundColor, children,
        loadingStyle, placeholderSource, placeholderStyle,
        customImagePlaceholderDefaultStyle } = props
    const [isLoaded, setLoaded] = useState(false)
    const [isError, setError] = useState(false)
    const currentRetry = useRef(0);
    const onLoadEnd = () => {
        setLoaded(true)
    }

    const onError = () => {
        if (props.reload && currentRetry?.current < 10)
            setTimeout(() => {
                currentRetry.current++
                setError(false)
                setLoaded(false)
            }, 7000);
        setError(true)
    }
    const style = StyleSheet.flatten(props?.style)
    const styles = useMemo(() => StyleSheet.create({
        backgroundImage: {
            position: 'relative',
            overflow: 'hidden',
            ...style
        },
        activityIndicator: {
            position: 'absolute',
            margin: 'auto',
            zIndex: 9,
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
        viewChildrenStyles: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            position: 'absolute',
            backgroundColor: 'transparent'
        }
    }), [style, borderRadius, backgroundColor, customImagePlaceholderDefaultStyle])

    return (
        <ImageBackground
            key={currentRetry.current}
            onLoadEnd={onLoadEnd}
            onError={onError}
            style={styles.backgroundImage}
            source={source}
            resizeMode={resizeMode}
            borderRadius={borderRadius}
        >
            {
                (isLoaded && !isError) ? children :
                    <View style={styles.viewImageStyles} >
                        {
                            (isShowActivity && !isError) &&
                            <ActivityIndicator
                                style={styles.activityIndicator}
                                size={loadingStyle ? loadingStyle.size : 'small'}
                                color={loadingStyle ? loadingStyle.color : 'gray'}
                            />
                        }
                        <Image
                            style={placeholderStyle ?? style}
                            source={placeholderSource ?? null}
                        >
                        </Image>
                    </View>
            }
            {
                children &&
                <View style={styles.viewChildrenStyles}>
                    {children}
                </View>
            }
        </ImageBackground>
    );
}

export default ImageLoader