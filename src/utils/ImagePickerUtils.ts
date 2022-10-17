import ImageResizer, { Response } from '@bam.tech/react-native-image-resizer';
import { setLoadingAction } from 'app-store/actions';
import { store } from 'app-store/store';
import { colors } from 'assets/Colors';
import { isArray } from 'lodash';
import { Platform } from 'react-native';
import ImagePicker, { Options } from 'react-native-image-crop-picker';
import Language from 'src/language/Language';
import { WaitTill } from './utilities';

ImagePicker.clean().then(() => {
    console.log('removed all tmp images from tmp directory');
}).catch(console.log);

const PickerOptions = {
    PROFILE_IMAGE_PICKER_OPTIONS: {
        width: 800,
        height: 800,
        cropping: false,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        loadingLabelText: Language.getString("processing", Language.getLanguage()),
        cropperToolbarColor: colors.colorPrimary,
    },
    MULTIPLE_IMAGE_PICKER_OPTIONS: {
        multiple: true,
        mediaType: 'any',
        forceJpg: true,
        compressVideoPreset: "MediumQuality",
    },
    CHAT_IMAGE_PICKER_OPTIONS: {
        forceJpg: true,
        compressImageQuality: 0.8,
        loadingLabelText: Language.processing,
        enableRotationGesture: true,
        mediaType: 'photo'
    },
    CHAT_VIDEO_PICKER_OPTIONS: {
        compressImageQuality: 0.8,
        loadingLabelText: Language.processing,
        enableRotationGesture: true,
        compressVideoPreset: "MediumQuality",
        mediaType: 'video'
    }
}

const openImagePicker = async (type: 'PROFILE_IMAGE_PICKER_OPTIONS' | 'MULTIPLE_IMAGE_PICKER_OPTIONS', maxFiles?: number) => {
    try {
        const resizedImage = await openPickImageOrVideo(type, maxFiles)
        if (!resizedImage) return
        const s = Math.min(resizedImage?.width || 0, resizedImage?.height || 0)
        await WaitTill(100);
        const croppedImage = await ImagePicker.openCropper({
            path: (resizedImage as Response)?.uri,
            mediaType: 'photo',
            cropperCircleOverlay: true,
            compressImageQuality: 1,
            width: s,
            height: s
        })
        return croppedImage
    }
    catch (e) {
        console.log("Resizing Error", e)
    }
}

const openPickImageOrVideo = async (type: 'MULTIPLE_IMAGE_PICKER_OPTIONS' | 'PROFILE_IMAGE_PICKER_OPTIONS' | 'CHAT_IMAGE_PICKER_OPTIONS' | 'CHAT_VIDEO_PICKER_OPTIONS', maxFiles?: number) => {
    try {
        const options = { ...PickerOptions[type] } as Options
        if (type == 'MULTIPLE_IMAGE_PICKER_OPTIONS') {
            options.maxFiles = (maxFiles || 1)
        }

        const image = await ImagePicker.openPicker(options)
        console.log("Picked Original Image", image);
        if (type == 'CHAT_VIDEO_PICKER_OPTIONS') {
            return image
        }
        let images
        if (isArray(image)) {
            images = image
        } else {
            images = [image]
        }

        let index = 0;

        for (index = 0; index < images.length; index++) {
            const image = images[index];
            if (!(image?.mime?.includes('video') || image?.type == 'video')) {
                store.dispatch(setLoadingAction(true))
                let big = image.width
                let small = image.height
                let w
                let h
                if (big == small) {
                    w = 1080
                    h = 1080
                }
                else if (big < small) {
                    h = 1080
                    w = Math.ceil((h * big) / small)
                } else {
                    w = 1080;
                    h = Math.ceil(((w * small) / big))
                }
                try {
                    const resizedImage = await ImageResizer.createResizedImage(
                        "file://" + image.path,
                        w,
                        h,
                        'JPEG',
                        100,
                        0,
                        undefined,
                        false,
                        {
                            mode: 'cover',
                            onlyScaleDown: true,
                        }
                    )
                    console.log("resizedImage", resizedImage);
                    //@ts-ignore
                    resizedImage.mime = image.mime
                    if (Platform.OS == 'android') {
                        resizedImage.path = resizedImage.uri
                    }
                    images[index] = resizedImage

                }
                catch (e) {
                    console.log("Resizing Error", e)
                }
            }
        }
        console.log("All resized images", images);
        store.dispatch(setLoadingAction(false))
        return type == 'MULTIPLE_IMAGE_PICKER_OPTIONS' ? images : images[0]
    }
    catch (e) {
        console.log("Picker Error", e)
        store.dispatch(setLoadingAction(false))
    }
}

const ImagePickerUtils = {
    openImagePicker,
    openPickImageOrVideo
}
export default ImagePickerUtils