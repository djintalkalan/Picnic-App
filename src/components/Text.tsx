import { Fonts } from "assets/Fonts";
import React, { FC, useMemo } from "react";
import { Platform, StyleProp, StyleSheet, Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

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

export const InnerBoldText = ({ text: IText, style }: { text: string, style: StyleProp<TextStyle> }) => {
    const { arr, text } = useMemo(() => {
        const arr = IText.split(' ')
        return {
            arr,
            text: arr.reduce(reducer, [])
        }
    }, [IText])

    // console.log("text", text)

    return (
        <Text style={style} >
            {text.map((text: string, index: number) => {
                if (text.includes('**')) {
                    // console.log("index", index)
                    return (
                        <Text style={[StyleSheet.flatten(style), { fontWeight: '500' }]}>
                            {text.replaceAll('**', '')}{' '}
                        </Text>
                    );
                }
                return `${text} `;
            })}
        </Text>
    );
};

const reducer = (acc: any, cur: any, index: number) => {
    let previousVal = acc[acc.length - 1];
    if (
        previousVal &&
        previousVal.startsWith('**') &&
        !previousVal.endsWith('**')
    ) {
        acc[acc.length - 1] = previousVal + ' ' + cur;
    } else {
        acc.push(cur);
    }
    return acc;
}