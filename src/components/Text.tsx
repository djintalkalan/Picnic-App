import { Fonts } from "assets/Fonts";
import React, { FC, useMemo } from "react";
import { Platform, StyleSheet, Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
    type?: "black" | "blackItalic" | "bold" | "boldItalic" | "extraBold" | "extraBoldItalic" | "extraLight" | "extraLightItalic" | "italic" | "light" | "lightItalic" | "medium" | "mediumItalic" | "regular" | "semiBold" | "semiBoldItalic" | "thin" | "thinItalic"
}

export const Text: FC<TextProps> = (props) => {

    const { style, type = "regular", ...rest } = props
    const styles = useMemo(() => {
        const styles = StyleSheet.flatten(style)
        let fontType = type;
        if (styles?.fontWeight) {
            switch (styles?.fontWeight) {
                case "500":
                    fontType = "medium"
                    break;

                case "600":
                    fontType = "semiBold"
                    break;

                case "700":
                    fontType = "bold"
                    break;

                case "800":
                    fontType = "extraBold"
                    break;

            }
        }

        return StyleSheet.create({
            textStyle: {
                fontFamily: Fonts?.[Platform.OS == 'android' ? fontType : type],
                ...styles
            }
        })
    }, [style, type])

    return (
        <RNText {...rest}
            style={styles.textStyle}
            allowFontScaling={false}
            suppressHighlighting={true}
        >
            {props.children}
        </RNText>
    )
}