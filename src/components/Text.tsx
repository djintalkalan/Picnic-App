import { colors, Fonts } from "assets";
import { Match } from 'autolinker/dist/es2015';
import React, { FC, Fragment, isValidElement, useMemo } from "react";
import { Linking, Platform, StyleProp, StyleSheet, Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import Autolink, { AutolinkProps } from 'react-native-autolink';
import { openLink } from "utils";
interface TextProps extends RNTextProps {
    type?: "black" | "blackItalic" | "bold" | "boldItalic" | "extraBold" | "extraBoldItalic" | "extraLight" | "extraLightItalic" | "italic" | "light" | "lightItalic" | "medium" | "mediumItalic" | "regular" | "semiBold" | "semiBoldItalic" | "thin" | "thinItalic",
    autoLink?: boolean,
    autoLinkProps?: Omit<AutolinkProps, 'text'>,
}

const _onAutoLinkPress = (url: string, match: Match) => {
    switch (match.getType()) {
        case 'phone':
        case 'email':
            Linking.openURL(url)
            break;
        default:
            const dynamicDomains = ['picnicbeta.page.link', 'picnicdev.page.link', 'picnicgroups.page.link']
            const i = dynamicDomains.findIndex(_ => url?.includes(_))
            if (i >= 0)
                return Linking.openURL(url)
            openLink(url?.toLowerCase())
            break;
    }
}

const getChildren = (children: React.ReactNode) => {
    let text = "";
    if (typeof children == 'string') {
        text = children
    } else if (Array.isArray(children)) {
        text = ""
        children?.forEach(_ => {
            // console.log("typeof _", typeof _);
            // console.log("isValidElement(_)", isValidElement(_));
            if (typeof _ == 'string') {
                text += _
                //@ts-ignore
            } else if (isValidElement(_) && _?.props?.children) {
                //@ts-ignore
                text += getChildren(_?.props?.children)
            }
        })
    }
    return text
}

export const Text: FC<TextProps> = (props) => {
    const { style, type = "regular", autoLink = false, autoLinkProps, ...rest } = props
    const styles = useMemo(() => {
        const styles = StyleSheet.flatten(style ?? {})
        let fontType = type
        if (Platform.OS == 'android') {
            fontType = type;
            if (styles?.fontWeight) {
                switch (styles?.fontWeight) {
                    case "500":
                        fontType = `medium`
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
            if (styles?.fontStyle == 'italic' && fontType != 'regular') {
                //@ts-ignore
                fontType = fontType?.replace("Italic", '') + "Italic"
                console.log("fontType", fontType);
                delete styles.fontStyle
            }
        }

        return StyleSheet.create({
            textStyle: {
                color: colors.colorBlackText,
                fontFamily: Fonts?.[Platform.OS == 'android' ? fontType : type],
                fontWeight: Platform.OS == 'android' ? undefined : styles?.fontWeight,
                ...styles
            }
        })
    }, [style, type])

    const text = useMemo<string>(() => {
        try {
            if (props?.autoLink) {
                return getChildren(rest?.children)
            }
        } catch (e) {
            console.log("text error", e)
        }
        return ""
    }, [rest?.children, props?.autoLink])

    if (props?.autoLink) {
        return <Autolink
            email
            hashtag="instagram"
            mention="twitter"
            phone="text"
            textProps={{ style: styles.textStyle, onLongPress: rest?.onLongPress }}
            url
            linkStyle={{ color: colors.colorLink, textDecorationLine: 'underline' }}
            {...autoLinkProps}
            text={(typeof text == 'string') ? text : "Please remove nested Texts"}
            onPress={_onAutoLinkPress}
            //@ts-ignore
            onLongPress={props?.onLongPress}
        />
    }

    return (
        <RNText {...rest}
            style={styles.textStyle}
            allowFontScaling={false}
            suppressHighlighting={true}
        />
    )
}

type IFontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | undefined;


export const InnerBoldText = ({ text: IText, style, fontWeight = "500" }: { text: string, style: StyleProp<TextStyle>, fontWeight?: IFontWeight }) => {
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
                    return (
                        <Text key={index} style={[StyleSheet.flatten(style), { fontWeight: fontWeight }]}>
                            {text?.replace('**', '')?.replace('**', '')}{' '}
                        </Text>
                    );
                }
                return `${text} `;
            })}
        </Text>
    );
};

export const SingleBoldText = ({ text: IText, style, fontWeight = "500" }: { text: string, style: StyleProp<TextStyle>, fontWeight?: IFontWeight }) => {
    let startBoldIndex = IText?.indexOf("**")
    let endBoldIndex = IText?.lastIndexOf("**")
    return <Text style={style} >
        {IText?.substring(0, startBoldIndex)}
        <Text style={[StyleSheet.flatten(style), { fontWeight: fontWeight }]}>
            {IText?.substring(startBoldIndex, endBoldIndex + 2)?.replace(/\**/g, '')}
        </Text>
        {IText?.substring(endBoldIndex + 2)}
    </Text>
}

export const MultiBoldText = ({ text: IText, style, fontWeight = "500" }: { text: string, style: StyleProp<TextStyle>, fontWeight?: IFontWeight }) => {
    if (!IText?.trim()) {
        return null
    }

    const thisStyle = useMemo(() => {
        const flatten = StyleSheet.flatten(style)
        return StyleSheet.create({
            style: flatten,
            boldStyle: StyleSheet.flatten([flatten, {
                fontWeight
            }])
        })
    }, [style, fontWeight])
    let isStart = true
    let arr = Array.from(IText)
    // console.log("arr", arr);

    const finalStrings: any[] = []

    let boldString = ""
    let normalString = ""
    arr?.forEach((s: string, i: number) => {
        if (isStart == false)
            boldString += s
        else {
            normalString += s
        }
        if ((s + (arr?.[i + 1] || "")) == "**") {
            if (isStart) {
                isStart = false
                finalStrings.push(<Text style={thisStyle.style} key={i}>{normalString?.replace(/\*/g, "")}</Text>)
                normalString = ""
            }
            else {
                isStart = true
                finalStrings.push(<Text style={thisStyle.boldStyle} key={i}>{boldString?.replace(/\*/g, "")}</Text>)
                boldString = ""
            }
        }
    })
    finalStrings.push(<Text key={arr?.length + 1}>{normalString?.replace(/\*/g, "")}</Text>)
    return <Text children={finalStrings} style={style} />

};

export const MultiBoldTextOld = ({ text: IText, style, fontWeight = "500" }: { text: string, style: StyleProp<TextStyle>, fontWeight?: IFontWeight }) => {

    let isStart = true
    let arr = Array.from(IText)
    const indexArray: any[] = []
    arr.forEach((s: string, i: number) => {
        if ((s + (arr?.[i + 1] || "")) == "**") {
            if (isStart) {
                indexArray.push({
                    start: i,
                    end: null
                })
                isStart = false
            }
            else {
                indexArray[(indexArray.length) - 1].end = i
                isStart = true
            }
        }
    })
    return <Text style={style} >

        {indexArray.map(({ start: startBoldIndex, end: endBoldIndex }, i) => {
            return <Fragment key={i.toString()} >
                {IText?.substring(i == 0 ? 0 : indexArray[i - 1].end, startBoldIndex)?.replace('**', '')}
                <Text style={[StyleSheet.flatten(style), { fontWeight: fontWeight }]}>
                    {IText?.substring(startBoldIndex, endBoldIndex + 2)?.replace(/\**/g, '')}
                </Text>
                {IText?.substring(endBoldIndex + 2, i == indexArray.length - 1 ? undefined : endBoldIndex + 2)?.replace('**', '')}
            </Fragment>
        })}
    </Text>
};

const reducer = (acc: any, cur: any, index: number) => {
    let previousVal = acc[acc.length - 1];
    if (
        previousVal &&
        previousVal?.startsWith('**') &&
        !previousVal?.endsWith('**')
    ) {
        acc[acc.length - 1] = previousVal + ' ' + cur;
    } else {
        acc.push(cur);
    }
    return acc;
}