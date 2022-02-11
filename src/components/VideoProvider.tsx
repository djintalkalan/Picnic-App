import React, { createContext, FC, useContext, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';

export const VideoContext = createContext<{
    videoUrl: string,
    videoPlayerRef: React.MutableRefObject<undefined>,
    loadVideo: React.Dispatch<React.SetStateAction<string>>
}>({ videoUrl: "", videoPlayerRef: null, loadVideo: null });

export const VideoProvider: FC<any> = ({ children }) => {

    const [videoUrl, loadVideo] = useState("")
    const videoPlayerRef = useRef()

    useEffect(() => {
        loadVideo("")
        return () => {
            loadVideo("")
        }
    }, [])
    return (
        <VideoContext.Provider value={{ videoUrl, videoPlayerRef, loadVideo }}  >
            {children}
            {videoUrl ?
                <View style={[styles.backgroundVideo, { backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }]} >
                    <Video source={{ uri: videoUrl }}   // Can be a URL or a local file.
                        ref={videoPlayerRef}
                        resizeMode={'contain'}
                        // isFullScreen={true}
                        // toggleResizeModeOnFullscreen={false}
                        repeat
                        controls={true}// Store reference
                        onBuffer={(d) => {
                            console.log(d, "d")
                        }}                // Callback when remote video is buffering
                        onError={(e) => {
                            console.log(e, "e")

                        }}               // Callback when video cannot be loaded
                        style={styles.backgroundVideo} />
                    <View style={{ position: 'absolute', zIndex: 11, top: 20, alignSelf: 'center' }} >
                        <SafeAreaView />
                        <TouchableOpacity
                            onPress={() => loadVideo("")}
                            style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name={'close'} size={30} />
                        </TouchableOpacity>
                    </View>
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

