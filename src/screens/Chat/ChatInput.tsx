import { colors, Fonts, Images } from 'assets'
import { Text } from 'custom-components'
import ImageLoader from 'custom-components/ImageLoader'
import { ILocation } from 'database/Database'
import React, { Dispatch, forwardRef, memo, SetStateAction, useCallback } from 'react'
import { Dimensions, Image, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker'
import Language from 'src/language/Language'
import { getImageUrl, NavigationService, scaler, _showBottomMenu } from 'utils'

interface ChatInputProps {
    value?: string,
    onChangeText: any
    onPressSend: () => void
    repliedMessage: any,
    disableButton: boolean,
    setRepliedMessage: (msg: any) => void | Dispatch<SetStateAction<null>>,
    onChooseImage?: (image: ImageOrVideo, mediaType: 'photo' | 'video') => void,
    onChooseLocation: (location: any) => void,
    onChooseContacts: (contacts: Array<any>) => void,
}
const { height, width } = Dimensions.get('screen')

const ChatInput = forwardRef<TextInput, ChatInputProps>((props, ref) => {
    const { repliedMessage, disableButton, setRepliedMessage, value, onChangeText, onChooseImage, onChooseLocation, onChooseContacts, onPressSend } = props

    const chooseMediaType = useCallback(() => {
        _showBottomMenu({
            buttons: [
                { title: "Photo", onPress: () => pickImage("photo") },
                { title: "Video", onPress: () => pickImage("video") },
                {
                    title: "Contact", onPress: () => {
                        NavigationService.navigate("SelectContacts", {
                            onChooseContacts: (contacts: Array<any>) => {
                                onChooseContacts(contacts)
                                NavigationService.goBack()
                            }
                        })
                    }
                },
                {
                    title: "Location", onPress: () => {
                        NavigationService.navigate("SelectLocation", {
                            type: 'currentLocation',
                            prevSelectedLocation: Database.getStoredValue("currentLocation"),
                            onSelectLocation: (location: ILocation) => {

                            }
                        })
                    }
                }
            ]
        })
    }, [])
    const pickImage = useCallback((mediaType: 'photo' | 'video') => {
        console.log("media", mediaType);
        setTimeout(() => {
            ImagePicker.openPicker({
                // width: 400,
                // height: 400,
                forceJpg: true,
                freeStyleCropEnabled: true,
                compressImageQuality: 0.5,
                compressImageMaxWidth: 400,
                // compressImageMaxHeight: 400,
                enableRotationGesture: true,
                cropping: mediaType == 'photo' ? true : undefined,
                compressVideoPreset: mediaType == 'photo' ? undefined : "MediumQuality",
                mediaType
            }).then((image) => {
                onChooseImage && onChooseImage(image, mediaType)
            }).catch(e => {
                console.log(e)
            });
        }, 200);

    }, [])

    if (repliedMessage) console.log(repliedMessage);

    return (
        <>
            {repliedMessage ? <View style={[styles.inputContainer, { flexDirection: 'row', alignItems: 'flex-start' }]} >
                <View style={{ flex: 1, paddingVertical: scaler(5) }} >
                    <Text style={styles.replied_to} >{Language.replied_to} <Text>
                        {repliedMessage?.user?.display_name}
                    </Text>
                    </Text>
                    {repliedMessage?.message_type == 'image' ?
                        <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                            <ImageLoader
                                placeholderSource={Images.ic_image_placeholder}
                                style={{ borderRadius: scaler(10), height: scaler(60), width: width - scaler(30), marginTop: scaler(10) }} source={{ uri: getImageUrl(repliedMessage?.message, { width: width - scaler(30), height: scaler(60), type: 'messages' }) }} />
                            {/* <Text numberOfLines={1} type='mediumItalic' style={styles.message} >{"IMAGE"}</Text> */}

                        </View>

                        :
                        <Text numberOfLines={1} style={styles.message} >{repliedMessage?.message}</Text>}
                </View>
                <TouchableOpacity onPress={() => setRepliedMessage(null)} >
                    <Image source={Images.ic_close} style={{ height: scaler(24), width: scaler(24), paddingVertical: scaler(5) }} />
                </TouchableOpacity>
            </View> : null}
            <View pointerEvents={disableButton ? 'none' : undefined} style={styles.inputContainer} >
                <View style={styles.iContainer} >
                    <TextInput
                        ref={ref}
                        value={value}
                        onChangeText={onChangeText}
                        inputAccessoryViewID={'done'}
                        numberOfLines={1}
                        multiline={true}
                        style={styles.input}
                        placeholder={Language.type_a_message}
                        placeholderTextColor={colors.colorGreyInactive}
                    />

                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', end: scaler(20), top: scaler(5) }} >
                    <TouchableOpacity onPress={onPressSend} style={{ height: scaler(40), width: scaler(34), alignItems: 'center', justifyContent: 'center' }} >
                        <Image source={Images.ic_send} style={{ height: scaler(25), width: scaler(25), resizeMode: 'contain', tintColor: disableButton ? colors.colorGreyInactive : undefined }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={chooseMediaType} style={{ height: scaler(40), width: scaler(34), alignItems: 'center', justifyContent: 'center' }} >
                        <Image source={Images.ic_add_circle} style={{ height: scaler(25), width: scaler(25), resizeMode: 'contain', tintColor: disableButton ? colors.colorGreyInactive : undefined }} />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
})

export default memo(ChatInput)

const styles = StyleSheet.create({
    inputContainer: {
        width: '100%',
        // flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.colorWhite,
        paddingHorizontal: scaler(15),
        paddingVertical: scaler(5),
        bottom: Platform.OS == 'ios' ? -1 : 0
    },
    input: {
        // minHeight: scaler(40),
        // lineHeight: scaler(20),
        // maxHeight: scaler(120),
        // textAlignVertical: 'center',
        paddingBottom: Platform.OS == 'ios' ? scaler(5) : 0,
        includeFontPadding: false,
        paddingVertical: 0,
        marginVertical: 0,
        fontSize: scaler(14),
        fontFamily: Fonts.regular,
        fontWeight: '500',
        color: colors.colorBlackText,
    },
    iContainer: {
        minHeight: scaler(40),
        maxHeight: scaler(120),
        width: '100%',
        justifyContent: 'center',
        backgroundColor: colors.colorBackground,
        borderRadius: scaler(20),
        paddingLeft: scaler(15),
        paddingRight: scaler(77),
    },
    replied_to: {
        // marginTop: scaler(5),
        fontSize: scaler(11.5),
        color: "#656565",
    },
    name: {
        // marginTop: scaler(5),
        fontSize: scaler(11.5),
        color: colors.colorBlack,
    },
    message: {
        fontSize: scaler(15),
        color: colors.colorBlackText,
        marginTop: scaler(4),
    }

})
