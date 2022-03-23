import { LinkPreview, LinkPreviewProps, PreviewData } from '@flyerhq/react-native-link-preview'
import { colors } from 'assets'
import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet } from 'react-native'
import { openLink, scaler } from 'utils'

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

export const Preview = memo(PreviewLink)


const styles = StyleSheet.create({})