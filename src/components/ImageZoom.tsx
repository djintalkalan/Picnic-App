import { colors, Images } from 'assets';
import React, { Component } from 'react';
import { BackHandler, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Zoom from 'react-native-image-pan-zoom';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scaler } from 'utils';
import { SafeAreaViewWithStatusBar } from './FocusAwareStatusBar';
import ImageLoader from './ImageLoader';

const { width, height } = Dimensions.get('window')

export class ImageZoom extends Component<any, { imageUrl: string, toggle: boolean }> {

    constructor(props: any) {
        super(props)
        this.state = {
            imageUrl: "",
            toggle: false
        }
        this.onBackPress = this.onBackPress.bind(this)
    }

    shouldComponentUpdate = (nextProps: Readonly<any>, nextState: Readonly<{ imageUrl: string, toggle: boolean }>) => {
        if (nextState?.imageUrl && this.state.imageUrl !== nextState.imageUrl) {
            setTimeout(() => {
                BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
            }, 100);
        } else {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
        }
        return this.state.imageUrl !== nextState.imageUrl || this.state.toggle !== nextState.toggle
    }

    onBackPress = () => {
        this.setState({ imageUrl: "" })
        return true
    }


    showImage = (imageUrl = "") => {
        this.setState({ imageUrl })
    }

    insets = { h: 0, w: 0 }

    render() {
        if (!this.state.imageUrl) return null
        const { h = 0, w = 0 } = this?.insets
        return <SafeAreaViewWithStatusBar style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.colorWhite }} >
            <View onLayout={(e) => {
                if (!this?.insets?.w) {
                    this.insets = {
                        h: e?.nativeEvent?.layout?.height,
                        w: width
                    }
                    this.setState({ toggle: !this.state?.toggle })
                }

            }} style={{ flex: 1 }} >
                <Zoom cropWidth={w}
                    cropHeight={h}
                    imageWidth={w}
                    imageHeight={h}
                >
                    <ImageLoader resizeMode='contain' style={{
                        width: w,
                        height: h
                    }}
                        source={{ uri: this.state.imageUrl }} />
                </Zoom>
                <TouchableOpacity onPress={() => this.setState({ imageUrl: "" })} style={[styles.backButton, { top: scaler(10), right: scaler(10) }]} >
                    <Image style={styles.imgBack} source={Images.ic_close} />
                </TouchableOpacity>
            </View>
        </SafeAreaViewWithStatusBar>

        const { top = 0, bottom = 0, left = 0, right = 0 } = this.props?.insets
        return (
            <SafeAreaView style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: colors.colorWhite }} >

                <Zoom style={{ flex: 1 }} cropWidth={width}
                    cropHeight={height - (top + bottom)}
                    imageWidth={width}
                    imageHeight={height - top + bottom}
                >
                    <ImageLoader resizeMode='contain' style={{
                        width: width,
                        height: height - top + bottom
                    }}
                        source={{ uri: this.state.imageUrl }} />
                </Zoom>
                <TouchableOpacity onPress={() => this.setState({ imageUrl: "" })} style={[styles.backButton, { top: top + scaler(10), left: scaler(10) }]} >
                    <Image style={styles.imgBack} source={Images.ic_back_group} />
                </TouchableOpacity>
            </SafeAreaView>
        )

    }
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        borderRadius: scaler(20), height: scaler(35), width: scaler(35),
        alignItems: 'center', justifyContent: 'center'
    },
    imgBack: {
        width: '100%',
        height: '100%', resizeMode: 'contain'
    },
})