import { useIsFocused } from '@react-navigation/native'
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { EmitterSubscription, Keyboard, Platform } from 'react-native'
import { StaticHolder } from 'utils/StaticHolder'

export type KeyboardValues = {
    isKeyboard: boolean
    dismissKeyboard: () => void
    openKeyboardAccessory: (v: ReactNode) => void
    keyboardHeight: number
}
const defaultContextValues = {
    isKeyboard: false,
    dismissKeyboard: () => {

    },
    openKeyboardAccessory: () => { },
    keyboardHeight: 0
}

const KeyboardContext = createContext<KeyboardValues>(defaultContextValues)



export const useKeyboardServiceOld = (isFocused: boolean = true): KeyboardValues => {
    const returnValue = useContext(KeyboardContext)
    return isFocused ? returnValue : defaultContextValues
}

export const useKeyboardService = (): KeyboardValues => {
    const isFocused = useIsFocused()
    const [isKeyboard, setKeyboard] = useState(false)
    const keyboardHeight = useRef(0);
    const dismissKeyboard = useCallback(() => {
        Keyboard.dismiss()
    }, [])

    const openKeyboardAccessory = useCallback((MyView: ReactNode) => {
        StaticHolder.showAccessoryView(MyView)
    }, [])

    // useEffect(() => {
    //     let willChange: EmitterSubscription;
    //     if (Platform.OS == 'ios' && isKeyboard && isFocused) {
    //         willChange = Keyboard.addListener("keyboardDidShow", (e) => {
    //             if (isKeyboard) {
    //                 setTimeout(() => {
    //                     keyboardHeight.current = e.endCoordinates.height
    //                     setToggle(_ => !_)
    //                 }, 200);
    //             }
    //         })
    //     }
    //     return () => {
    //         willChange?.remove()
    //     }
    // }, [isKeyboard, isFocused])


    useEffect(() => {
        let willShow: EmitterSubscription;
        let willHide: EmitterSubscription;
        if (isFocused) {
            willShow = Keyboard.addListener(Platform.OS == 'ios' ? 'keyboardDidShow' : "keyboardDidShow", (e) => {
                if (Platform.OS == 'ios' && isFocused) {
                    setTimeout(() => {
                        keyboardHeight.current = e.endCoordinates.height
                    }, 200);
                }
                setKeyboard(true)

            })
            willHide = Keyboard.addListener(Platform.OS == 'ios' ? 'keyboardDidHide' : 'keyboardDidHide', () => {
                keyboardHeight.current = 0
                StaticHolder.hideAccessoryView()
                setKeyboard(false)
            })
        }
        return () => {
            willShow?.remove()
            willHide?.remove()
        }
    }, [isFocused])

    return {
        openKeyboardAccessory,
        isKeyboard,
        dismissKeyboard,
        keyboardHeight: keyboardHeight.current
    }
}

export const withKeyboardService = (Component: any) => {
    return (props: any) => {
        const data: KeyboardValues = useKeyboardService()
        return <Component {...data} {...props} />;
    };
};