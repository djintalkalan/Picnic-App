import React, { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

type KeyboardValues = {
    isKeyboard: boolean
    dismissKeyboard: () => void
    keyboardHeight: number
}
const KeyboardContext = createContext<KeyboardValues>({
    isKeyboard: false,
    dismissKeyboard: () => {

    },
    keyboardHeight: 0
})

export const KeyboardProvider: FC<any> = ({ children }) => {
    const [isKeyboard, setKeyboard] = useState(false)
    const keyboardHeight = useRef(0);
    const dismissKeyboard = useCallback(() => {
        Keyboard.dismiss()
    }, [])


    useEffect(() => {
        const willShow = Keyboard.addListener(Platform.OS == 'ios' ? 'keyboardWillShow' : "keyboardDidShow", (e) => {
            keyboardHeight.current = e.endCoordinates.height
            setKeyboard(true)
        })
        const willHide = Keyboard.addListener(Platform.OS == 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
            keyboardHeight.current = 0
            setKeyboard(false)
        })

        return () => {
            willShow.remove()
            willHide.remove()
        }
    }, [])

    return (
        <KeyboardContext.Provider value={{ isKeyboard, dismissKeyboard, keyboardHeight: keyboardHeight.current }}  >
            {children}
        </KeyboardContext.Provider>)
}

export const useKeyboardService = (): KeyboardValues => useContext(KeyboardContext)

export const withKeyboardService = (Component: any) => {
    return (props: any) => {
        const data: KeyboardValues = useKeyboardService()
        return <Component {...data} {...props} />;
    };
};