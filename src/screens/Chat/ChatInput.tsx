import { config } from 'api'
import { colors, Fonts, Images, MapStyle } from 'assets'
import { Preview, Text } from 'custom-components'
import ImageLoader from 'custom-components/ImageLoader'
import Database, { ILocation } from 'database/Database'
import React, { Dispatch, ForwardedRef, forwardRef, memo, SetStateAction, useCallback, useMemo } from 'react'
import { Dimensions, Image, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker'
import MapView, { Marker } from 'react-native-maps'
import Language from 'src/language/Language'
import { getDisplayName, getImageUrl, NavigationService, scaler, _showBottomMenu } from 'utils'

interface ChatInputProps {
    value?: string
    link?: string
    onChangeText: any
    onPressSend: () => void
    repliedMessage?: any,
    disableButton?: boolean,
    setRepliedMessage?: (msg: any) => void | Dispatch<SetStateAction<null>>,
    onChooseImage?: (image: ImageOrVideo, mediaType: 'photo' | 'video') => void,
    onChooseLocation?: (location: ILocation) => void,
    onChooseContacts?: (contacts: Array<any>) => void,
    placeholder?: string
}
const { height, width } = Dimensions.get('screen')

const ASPECT_RATIO = width / height;
const DefaultDelta = {
    latitudeDelta: 0.05,
    longitudeDelta: 0.05 * ASPECT_RATIO,
}

const ChatInput = forwardRef<TextInput, ChatInputProps>((props, ref: ForwardedRef<TextInput>) => {
    const { repliedMessage, link, placeholder = Language.type_a_message, disableButton = false, setRepliedMessage, value, onChangeText, onChooseImage, onChooseLocation, onChooseContacts, onPressSend } = props

    const chooseMediaType = useCallback(() => {
        _showBottomMenu({
            buttons: [
                { title: Language.photo, onPress: () => pickImage("photo") },
                { title: Language.video, onPress: () => pickImage("video") },
                {
                    title: Language.contact, onPress: () => {
                        NavigationService.navigate("SelectContacts", {
                            onChooseContacts: (contacts: Array<any>) => {
                                onChooseContacts && onChooseContacts(contacts)
                                NavigationService.goBack()
                            }
                        })
                    }
                },
                {
                    title: Language.location, onPress: () => {
                        NavigationService.navigate("SelectLocation", {
                            type: 'currentLocation',
                            prevSelectedLocation: Database.getStoredValue("currentLocation"),
                            onSelectLocation: onChooseLocation
                        })
                    }
                }
            ]
        })
    }, [onChooseLocation, onChooseContacts, onChooseImage])
    const pickImage = useCallback((mediaType: 'photo' | 'video') => {
        console.log("media", mediaType);
        setTimeout(() => {
            ImagePicker.openPicker({
                // width: 400,
                // height: 400,
                forceJpg: true,
                // freeStyleCropEnabled: true,
                compressImageQuality: 0.8,
                loadingLabelText: Language.processing,
                // compressImageMaxWidth: 400,
                // compressImageMaxHeight: 400,
                enableRotationGesture: true,
                // cropping: mediaType == 'photo' ? true : undefined,
                compressVideoPreset: mediaType == 'photo' ? undefined : "MediumQuality",
                mediaType
            }).then((image) => {
                onChooseImage && onChooseImage(image, mediaType)
            }).catch(e => {
                console.log(e)
            });
        }, 200);

    }, [onChooseImage])

    if (repliedMessage) console.log(repliedMessage);

    const region = useMemo(() => {
        return repliedMessage?.message_type == 'location' ? {
            latitude: parseFloat(repliedMessage?.coordinates?.lat),
            longitude: parseFloat(repliedMessage?.coordinates?.lng),
            ...DefaultDelta
        } : {
            latitude: 12,
            longitude: 12,
            ...DefaultDelta
        }
    }, [repliedMessage?.coordinates, repliedMessage?.message_type])

    return (
        <>
            {repliedMessage ? <View style={[styles.inputContainer, { flexDirection: 'row', alignItems: 'flex-start' }]} >
                <View style={{ flex: 1, paddingVertical: scaler(5) }} >
                    <Text style={styles.replied_to} >{Language.replied_to} <Text>
                        {getDisplayName(repliedMessage?.user?.username, repliedMessage?.user?.first_name, repliedMessage?.user?.last_name)}
                    </Text>
                    </Text>
                    {repliedMessage?.message_type == 'image' || repliedMessage?.message_type == 'file' ?
                        <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                            <ImageLoader
                                placeholderSource={Images.ic_image_placeholder}
                                //@ts-ignore
                                style={{ resizeMode: 'cover', borderRadius: scaler(10), height: scaler(60), width: width - scaler(30), marginTop: scaler(10) }}
                                source={{
                                    uri: (repliedMessage?.message_type == 'file') ?
                                        config.VIDEO_URL + (repliedMessage?.message?.substring(0, repliedMessage?.message?.lastIndexOf("."))) + "-00001.png"
                                        : getImageUrl(repliedMessage?.message, { width: width - scaler(30), height: scaler(60), type: 'messages' })
                                }} />
                            {/* <Text numberOfLines={1} type='mediumItalic' style={styles.message} >{"IMAGE"}</Text> */}

                        </View>

                        : repliedMessage?.message_type == 'contact' ?
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: colors.colorGreyText, borderWidth: 1, padding: scaler(5), paddingBottom: scaler(5), borderRadius: scaler(10), marginTop: scaler(5) }} >
                                <View style={{ height: scaler(40), width: scaler(40), alignItems: 'center', justifyContent: 'center', borderRadius: scaler(30), marginRight: scaler(10), backgroundColor: colors.colorBlackText }} >
                                    <Text style={{ color: colors.colorWhite, fontSize: scaler(16), fontWeight: '500' }} >{repliedMessage?.contacts[0]?.givenName?.[0]?.toUpperCase()}</Text>
                                </View>
                                <Text style={{ flex: 1, marginRight: scaler(10) }} >{repliedMessage?.contacts[0]?.givenName + (repliedMessage?.contacts[0]?.familyName ? (" " + repliedMessage?.contacts[0]?.familyName) : "")}</Text>
                            </View>
                            : repliedMessage?.message_type == 'location' ?
                                <View style={{ width: '100%', height: scaler(60), borderRadius: scaler(10), overflow: 'hidden' }} >
                                    <MapView
                                        style={{ flex: 1, overflow: 'hidden' }}
                                        minZoomLevel={2}
                                        customMapStyle={MapStyle}
                                        provider={'google'}
                                        cacheEnabled
                                        showsMyLocationButton={false}
                                        initialRegion={region} >
                                        <Marker coordinate={region} >
                                            <Image style={{ height: scaler(20), width: scaler(20), resizeMode: 'contain' }} source={Images.ic_marker} />
                                        </Marker>

                                    </MapView>
                                </View>
                                : <Text numberOfLines={1} style={styles.message} >{repliedMessage?.message}</Text>}

                </View>
                <TouchableOpacity onPress={() => setRepliedMessage && setRepliedMessage(null)} >
                    <Image source={Images.ic_close} style={{ height: scaler(24), width: scaler(24), paddingVertical: scaler(5) }} />
                </TouchableOpacity>
            </View> : null}
            {link ?
                <Preview
                    changeableLink
                    text={link} /> : null
            }
            <View pointerEvents={disableButton ? 'none' : undefined} style={styles.inputContainer} >
                <View style={styles.iContainer} >
                    <TextInput
                        ref={ref}
                        value={value}
                        spellCheck={true}
                        onChangeText={onChangeText}
                        inputAccessoryViewID={'done'}
                        numberOfLines={1}
                        multiline={true}
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor={colors.colorGreyInactive}
                    />

                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', end: scaler(20), top: scaler(5) }} >
                    <TouchableOpacity onPress={onPressSend} style={{ height: scaler(40), width: scaler(34), alignItems: 'center', justifyContent: 'center' }} >
                        <Image source={Images.ic_send} style={{ height: scaler(25), width: scaler(25), resizeMode: 'contain', tintColor: disableButton ? colors.colorGreyInactive : undefined }} />
                    </TouchableOpacity>
                    {onChooseImage ? <TouchableOpacity onPress={chooseMediaType} style={{ height: scaler(40), width: scaler(34), alignItems: 'center', justifyContent: 'center' }} >
                        <Image source={Images.ic_add_circle} style={{ height: scaler(25), width: scaler(25), resizeMode: 'contain', tintColor: disableButton ? colors.colorGreyInactive : undefined }} />
                    </TouchableOpacity> : null}
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
