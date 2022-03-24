import React, { createContext, FC, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
//@ts-ignore
import Video from 'react-native-video-controls';
import { NavigationService } from 'utils';

export const VideoContext = createContext<{
    videoUrl: string,
    videoPlayerRef?: React.MutableRefObject<any>,
    loadVideo?: (url: string) => void
}>({ videoUrl: "" });

interface IState {
    isLoading: boolean, videoUrl: string
}
const initialState: IState = {
    isLoading: false,
    videoUrl: ""
}

const actions = {
    SET_VIDEO_URL: "SET_VIDEO_URL",
    CLOSE_PLAYER: "CLOSE_PLAYER",
    SET_LOADER: "SET_LOADER",
}

const reducer = (state: IState = initialState, { type, payload }: any): IState => {
    switch (type) {
        case actions?.SET_LOADER:
            return { ...state, isLoading: payload }
        case actions?.SET_VIDEO_URL:
            return { videoUrl: payload, isLoading: false }
            return { videoUrl: payload, isLoading: true }
        case actions?.CLOSE_PLAYER:
            return initialState

    }
    return state
}
export const VideoProvider: FC<any> = ({ children }) => {
    const [{ videoUrl }, dispatch] = useReducer(reducer, initialState)
    const videoPlayerRef = useRef(null)
    useEffect(() => {
        dispatch({ type: actions.CLOSE_PLAYER })
        return () => {
            dispatch({ type: actions.CLOSE_PLAYER })
        }
    }, [])

    useEffect(() => {
        const listener = BackHandler.addEventListener('hardwareBackPress', function () {
            if (videoUrl) {
                dispatch({ type: actions.CLOSE_PLAYER })
                return true
            } else {
                return false
            }
        });
        return () => {
            listener.remove()
        }
    }, [videoUrl])

    const loadVideo = useCallback((url) => {
        dispatch({ type: actions.SET_VIDEO_URL, payload: url })
    }, [])

    return (
        <VideoContext.Provider value={{ videoUrl, videoPlayerRef, loadVideo }}  >
            {children}
            {videoUrl ?
                <View style={[styles.backgroundVideo, { backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center' }]} >
                    <Video source={{ uri: videoUrl }}   // Can be a URL or a local file.
                        ref={videoPlayerRef}
                        resizeMode={'contain'}
                        onBack={() => { dispatch({ type: actions.CLOSE_PLAYER }) }}
                        disableVolume
                        navigator={NavigationService.getNavigation()}
                        // isFullScreen={true}
                        // toggleResizeModeOnFullscreen={false}
                        // repeat
                        controls={false}// Store reference
                        onBuffer={(d: any) => {
                            // console.log("d", d)
                        }}                // Callback when remote video is buffering
                        // onLoad={() => {
                        //     dispatch({ type: actions.SET_LOADER, payload: false })
                        // }}
                        // onError={(e: any) => {
                        //     // console.log(e, "e")
                        //     dispatch({ type: actions.SET_LOADER, payload: false })
                        // }}               // Callback when video cannot be loaded
                        style={styles.backgroundVideo} />

                    {/* <View style={{ position: 'absolute', zIndex: 11, top: 20, alignSelf: 'center' }} >
                        <SafeAreaView />
                        <TouchableOpacity
                            onPress={() => loadVideo("")}
                            style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name={'close'} size={30} />
                        </TouchableOpacity>
                    </View>
                    <Spinner
                        visible={isLoading}
                        color={colors.colorPrimary}
                        overlayColor={'rgba(0, 0, 0, 0.6)'}
                    /> */}
                </View> : null}
        </VideoContext.Provider>
    )
}

const styles = StyleSheet.create({
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 10
    },
})

export const useVideoPlayer = () => (useContext(VideoContext))

