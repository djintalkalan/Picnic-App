import React, { createContext, FC, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

type KeyboardValues = {
    isKeyboard: boolean
    dismissKeyboard: () => void
    openKeyboardAccessory: (v: ReactNode) => void
    keyboardHeight: number
}
const KeyboardContext = createContext<KeyboardValues>({
    isKeyboard: false,
    dismissKeyboard: () => {

    },
    openKeyboardAccessory: () => { },
    keyboardHeight: 0
})

export const KeyboardProvider: FC<any> = ({ children }) => {
    const [isKeyboard, setKeyboard] = useState(false)
    const [toggle, setToggle] = useState(false)
    const keyboardHeight = useRef(0);
    const dismissKeyboard = useCallback(() => {
        Keyboard.dismiss()
    }, [])

    let accessoryView = useRef<ReactNode>(null)

    const openKeyboardAccessory = useCallback((MyView: ReactNode) => {
        console.log("opening", MyView)
        accessoryView.current = MyView
        setToggle(_ => !_)
    }, [])


    useEffect(() => {
        const willShow = Keyboard.addListener(Platform.OS == 'ios' ? 'keyboardWillShow' : "keyboardDidShow", (e) => {
            keyboardHeight.current = e.endCoordinates.height
            setKeyboard(true)
        })
        const willHide = Keyboard.addListener(Platform.OS == 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
            // if (accessoryView.current) {
            //     accessoryView.current = null
            // }
            keyboardHeight.current = 0
            setKeyboard(false)
        })

        return () => {
            willShow.remove()
            willHide.remove()
        }
    }, [])

    // console.log(accessoryView)

    return (
        <KeyboardContext.Provider value={{ openKeyboardAccessory, isKeyboard, dismissKeyboard, keyboardHeight: keyboardHeight.current }}  >
            {children}
            {isKeyboard && Platform.OS == 'android' && accessoryView.current}
        </KeyboardContext.Provider>)
}

export const useKeyboardService = (): KeyboardValues => useContext(KeyboardContext)

export const withKeyboardService = (Component: any) => {
    return (props: any) => {
        const data: KeyboardValues = useKeyboardService()
        return <Component {...data} {...props} />;
    };
};