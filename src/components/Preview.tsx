import { LinkPreview, LinkPreviewProps, PreviewData } from '@flyerhq/react-native-link-preview'
import { colors, Images } from 'assets'
import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { openLink, scaler } from 'utils'
import ImageLoader from './ImageLoader'
const { width, height } = Dimensions.get('screen')

interface PreviewProps extends LinkPreviewProps {
    changeableLink?: boolean
}

const defaultRenderText = () => (null)

const PreviewLink: FC<PreviewProps> = (props) => {
    const [previewData, setPreviewData] = useState<PreviewData>()
    const { containerStyle, changeableLink = false, onPreviewDataFetched, touchableWithoutFeedbackProps, renderText = defaultRenderText, ...rest } = props
    const _onPreviewDataFetched = useCallback((data) => {
        console.log("_onPreviewDataFetched", data);

        onPreviewDataFetched && onPreviewDataFetched(data)
        if (!(!data?.image && !data?.description))
            setPreviewData(data)
    }, [])

    const _touchableWithoutFeedbackProps = useMemo(() => {
        return touchableWithoutFeedbackProps ?? {
            onPress: () => {
                if (previewData?.link) {
                    openLink(previewData?.link)
                }
            }
        }
    }, [touchableWithoutFeedbackProps, previewData])

    if (changeableLink)
        useEffect(() => {
            if (changeableLink) {
                setPreviewData(undefined)
            }
        }, [rest?.text])



    return (
        <LinkPreview
            renderText={renderText}
            touchableWithoutFeedbackProps={_touchableWithoutFeedbackProps}
            metadataContainerStyle={{ marginTop: 0 }}
            containerStyle={containerStyle ?? {
                backgroundColor: colors.colorFadedPrimary,
                ...(previewData?.link ? {
                    marginTop: scaler(5),
                    // paddingTop: scaler(5),
                    borderLeftColor: colors.colorGreyInactive,
                    borderLeftWidth: 2,
                    marginStart: scaler(5),
                    // borderBottomColor: 'grey', borderBottomWidth: 0.5
                } : { height: 0, width: 0, padding: 0 })
            }}
            onPreviewDataFetched={_onPreviewDataFetched}
            {...rest}
        />
    )
}

export const PreviewLink2 = memo((props: PreviewProps) => {
    const [previewData, setPreviewData] = useState<PreviewData>()
    const { containerStyle, changeableLink = false, onPreviewDataFetched, touchableWithoutFeedbackProps, renderText = defaultRenderText, ...rest } = props
    const _onPreviewDataFetched = useCallback((data) => {
        console.log("_onPreviewDataFetched", data);

        onPreviewDataFetched && onPreviewDataFetched(data)
        if (!(!data?.image && !data?.description))
            setPreviewData(data)
    }, [])

    const _touchableWithoutFeedbackProps = useMemo(() => {
        return touchableWithoutFeedbackProps ?? {
            onPress: () => {
                if (previewData?.link) {
                    openLink(previewData?.link)
                }
            }
        }
    }, [touchableWithoutFeedbackProps, previewData])

    if (changeableLink)
        useEffect(() => {
            if (changeableLink) {
                setPreviewData(undefined)
            }
        }, [rest?.text])

    const renderPreview = ({ aspectRatio, containerWidth, previewData }: { aspectRatio?: number, containerWidth: number, previewData?: PreviewData }) => {
        const { title, image, description } = previewData ?? {}
        if (!((image && image?.url) || title || description)) {
            return null
        }

        if (image?.url) {
            aspectRatio = (image?.width ?? 0) / (image?.height ?? 1) ?? aspectRatio
        }
        return <View style={{ width: width - scaler(13) - (width * 3 / 10), }} >
            {image?.url ? <ImageLoader
                placeholderSource={Images.ic_image_placeholder}
                resizeMode={'contain'}
                source={{ uri: image?.url }}
                //@ts-ignore
                style={{
                    alignSelf: 'center',
                    padding: scaler(5),
                    // width: '100%',
                    width: '100%',
                    aspectRatio,
                    paddingBottom: scaler(10),
                    // // width: image?.width,
                    // height: width / 3
                }} /> : null}
            {title ? <Text style={{ paddingTop: scaler(5), paddingHorizontal: scaler(4), fontWeight: '500' }} >{title}</Text> : null}
            {description ? <Text style={{ paddingTop: scaler(5), paddingHorizontal: scaler(4), fontWeight: '400' }} >{description}</Text> : null}
        </View>
    }

    return (
        <LinkPreview
            renderText={renderText}
            touchableWithoutFeedbackProps={_touchableWithoutFeedbackProps}
            metadataContainerStyle={{ marginTop: 0 }}
            renderLinkPreview={renderPreview}
            containerStyle={containerStyle ?? {
                backgroundColor: colors.colorFadedPrimary,
                ...(previewData?.link ? {
                    flex: 1,
                    marginBottom: scaler(10)
                    // paddingTop: scaler(5),
                    // borderBottomColor: 'grey', borderBottomWidth: 0.5
                } : { height: 0, width: 0, padding: 0 })
            }}
            onPreviewDataFetched={_onPreviewDataFetched}
            {...rest}
        />
    )
})


export const Preview = memo(PreviewLink)


const styles = StyleSheet.create({})