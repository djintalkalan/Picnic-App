import { colors, Fonts, Images } from 'assets'
import { Text } from 'custom-components'
import React, { Dispatch, forwardRef, memo, SetStateAction, useCallback } from 'react'
import { Image, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker'
import Language from 'src/language/Language'
import { scaler } from 'utils'

interface ChatInputProps {
    value?: string,
    onChangeText: any
    onPressSend: () => void
    repliedMessage: any,
    disableButton: boolean,
    setRepliedMessage: (msg: any) => void | Dispatch<SetStateAction<null>>,
    onChooseImage?: (image: ImageOrVideo) => void
}

const ChatInput = forwardRef<TextInput, ChatInputProps>((props, ref) => {
    const { repliedMessage, disableButton, setRepliedMessage, value, onChangeText, onChooseImage, onPressSend } = props

    const pickImage = useCallback(() => {
        setTimeout(() => {
            ImagePicker.openPicker({
                width: 400,
                height: 400,
                compressImageQuality: 0.5,
                compressImageMaxWidth: 400,
                compressImageMaxHeight: 400,
                enableRotationGesture: true,
                cropping: true,
            }).then((image) => {
                onChooseImage && onChooseImage(image)
            }).catch(e => {
                console.log(e)
            });
        }, 200);

    }, [])

    if (repliedMessage) console.log(repliedMessage);

    return (
        <>
            {repliedMessage ? <View style={[styles.inputContainer, { flexDirection: 'row', alignItems: 'center' }]} >
                <View style={{ flex: 1, paddingVertical: scaler(5) }} >
                    <Text style={styles.replied_to} >{Language.replied_to} <Text>
                        {repliedMessage?.user?.display_name}
                    </Text></Text>
                    <Text numberOfLines={1} style={styles.message} >{repliedMessage?.message}</Text>
                </View>
                <TouchableOpacity onPress={() => setRepliedMessage(null)} >
                    <Image source={Images.ic_close} style={{ height: scaler(24), width: scaler(24) }} />
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
                    <TouchableOpacity onPress={pickImage} style={{ height: scaler(40), width: scaler(34), alignItems: 'center', justifyContent: 'center' }} >
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
