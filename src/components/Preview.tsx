import { LinkPreview, LinkPreviewProps, PreviewData } from '@flyerhq/react-native-link-preview'
import React, { FC, useCallback, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { openLink } from 'utils'

interface PreviewProps extends LinkPreviewProps {

}

const defaultRenderText = () => (null)

export const Preview: FC<PreviewProps> = (props) => {
    const dataRef = useRef<PreviewData>()
    const { containerStyle, onPreviewDataFetched, touchableWithoutFeedbackProps, renderText = defaultRenderText, ...rest } = props
    const _onPreviewDataFetched = useCallback((data) => {
        onPreviewDataFetched && onPreviewDataFetched(data)
        dataRef.current = data
    }, [])

    const _touchableWithoutFeedbackProps = useMemo(() => {
        return touchableWithoutFeedbackProps ?? {
            onPress: () => {
                if (dataRef?.current?.link) {
                    openLink(dataRef?.current?.link)
                }
            }
        }
    }, [touchableWithoutFeedbackProps])

    return (
        <LinkPreview
            renderText={renderText}
            touchableWithoutFeedbackProps={_touchableWithoutFeedbackProps}
            containerStyle={containerStyle ?? { backgroundColor: 'white' }}
            onPreviewDataFetched={_onPreviewDataFetched}
            {...rest}
        />
    )
}


const styles = StyleSheet.create({})