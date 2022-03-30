import { BackButton, useKeyboardService } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import ImageLoader from 'custom-components/ImageLoader';
import React, { FC, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ImageOrVideo, openCropper } from 'react-native-image-crop-picker';
import Zoom from 'react-native-image-pan-zoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
//@ts-ignore
import Video from 'react-native-video-controls';
import Language from 'src/language/Language';
import { NavigationService, scaler } from 'utils';
import ChatInput from './ChatInput';
const { width, height } = Dimensions.get('screen')
const ImagePreview: FC<any> = (props) => {


    const { image, mediaType, _uploadImageOrVideo, repliedMessage, setRepliedMessage } = props?.route?.params ?? {}
    const { keyboardHeight, isKeyboard } = useKeyboardService();
    const { bottom } = useSafeAreaInsets()
    const [repliedMessageCurrent, setRepliedMessageCurrent] = useState<any>(repliedMessage);


    const textRef = useRef("")

    const [imageHeight, setImageHeight] = useState<number>()
    const [imageCurrent, setImageCurrent] = useState<ImageOrVideo>(image)
    return (
        <SafeAreaViewWithStatusBar edges={['top']} >
            <View style={{ flex: 1, }} >
                {mediaType != 'photos' ? <View style={{ flexDirection: 'row', alignItems: 'center', paddingEnd: scaler(10) }} >
                    <BackButton />
                    <View style={{ flex: 1, alignItems: 'flex-end' }} >
                        {mediaType == 'photo' ? <TouchableOpacity onPress={() => {
                            openCropper({
                                mediaType: 'photo',
                                compressImageQuality: 1,
                                freeStyleCropEnabled: true,
                                // forceJpg: true,
                                loadingLabelText: Language.processing,
                                path: image?.path
                            }).then((image: ImageOrVideo) => {
                                console.log("Cropped Image", image);
                                setImageCurrent(image)
                            }).catch(e => {
                                console.log("Error", e);
                            })
                        }} style={{ paddingVertical: scaler(5), paddingHorizontal: scaler(10), }} >
                            <MaterialIcons size={scaler(20)} name={'crop'} />
                        </TouchableOpacity> : null}
                    </View>
                </View> : null}
                {mediaType == 'photo' ? <Zoom style={{ flexShrink: 1 }} cropWidth={width}
                    cropHeight={imageHeight}
                    imageWidth={width}
                    imageHeight={imageHeight}
                >

                    <ImageLoader
                        source={{ uri: imageCurrent?.path }}
                        style={{ height: imageHeight, width }}
                        resizeMode={'contain'}
                    />

                </Zoom> :
                    <View style={[styles.backgroundVideo, { backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center' }]} >
                        <Video source={{ uri: imageCurrent?.path }}   // Can be a URL or a local file.
                            // ref={videoPlayerRef}
                            resizeMode={'contain'}
                            onBack={() => { NavigationService.goBack() }}
                            disableVolume
                            navigator={NavigationService.getNavigation()}
                            disableBack
                            // isFullScreen={true}
                            // toggleResizeModeOnFullscreen={false}
                            // repeat
                            controls={false}// Store reference
                            showOnStart={false}
                            onBuffer={(d: any) => {
                                // console.log("d", d)
                            }}                // Callback when remote video is buffering
                            // Callback when video cannot be loaded
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
                    </View>
                }

                <View onLayout={(e) => {
                    setImageHeight(height - e?.nativeEvent?.layout.height)
                }} style={{ bottom: isKeyboard && Platform.OS == 'ios' ? (keyboardHeight) : bottom, backgroundColor: 'transparent', justifyContent: 'flex-end' }} >
                    <ChatInput onChangeText={(text: string) => {
                        textRef.current = text
                    }} onPressSend={() => {
                        _uploadImageOrVideo(imageCurrent, mediaType, textRef.current);
                    }}
                        placeholder={Language.add_caption_here}


                    // repliedMessage={repliedMessageCurrent}
                    // setRepliedMessage={() => {
                    //     setRepliedMessageCurrent(null)
                    //     setRepliedMessage(null)
                    // }}


                    />
                </View>

            </View>


        </SafeAreaViewWithStatusBar>
    )
}

export default ImagePreview

const styles = StyleSheet.create({
    backgroundVideo: {
        flex: 1,
        // position: 'absolute',
        // top: 0,
        // left: 0,
        // bottom: 0,
        // right: 0,
        // zIndex: 10
    },
})