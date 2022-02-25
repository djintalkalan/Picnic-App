import React, { createContext, FC, useContext, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Video from 'react-native-video-controls';
import { NavigationService } from 'utils';

export const VideoContext = createContext<{
    videoUrl: string,
    videoPlayerRef: React.MutableRefObject<undefined>,
    loadVideo: React.Dispatch<React.SetStateAction<string>>
}>({ videoUrl: "", videoPlayerRef: null, loadVideo: null });

export const VideoProvider: FC<any> = ({ children }) => {

    const [videoUrl, loadVideo] = useState("")
    const [isLoading, setLoader] = useState(false)
    const videoPlayerRef = useRef()



    useEffect(() => {
        loadVideo("")
        return () => {
            loadVideo("")
        }
    }, [])

    useEffect(() => {
        const listener = BackHandler.addEventListener('hardwareBackPress', function () {
            if (videoUrl) {
                loadVideo("")
                return true
            } else {
                return false
            }
        });
        if (videoUrl) setLoader(true)

        return () => {
            setLoader(false)
            listener.remove()
        }
    }, [videoUrl])


    return (
        <VideoContext.Provider value={{ videoUrl, videoPlayerRef, loadVideo }}  >
            {children}
            {videoUrl ?
                <View style={[styles.backgroundVideo, { backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center' }]} >
                    <Video source={{ uri: videoUrl }}   // Can be a URL or a local file.
                        ref={videoPlayerRef}
                        resizeMode={'contain'}
                        onBack={() => { loadVideo("") }}
                        disableVolume
                        navigator={NavigationService.getNavigation()}
                        // isFullScreen={true}
                        // toggleResizeModeOnFullscreen={false}
                        // repeat
                        controls={false}// Store reference
                        onBuffer={(d) => {
                            // console.log("d", d)
                        }}                // Callback when remote video is buffering
                        onLoad={() => {
                            setLoader(false)
                        }}
                        onError={(e) => {
                            // console.log(e, "e")
                            setLoader(false)
                        }}               // Callback when video cannot be loaded
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

