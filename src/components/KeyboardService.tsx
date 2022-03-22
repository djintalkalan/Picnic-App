import { useIsFocused } from '@react-navigation/native'
import React, { ReactNode, useCallback, useEffect, useReducer } from 'react'
import { EmitterSubscription, Keyboard, Platform } from 'react-native'
import { StaticHolder } from 'utils/StaticHolder'

export interface KeyboardValues extends IKeyboardState {
    dismissKeyboard: () => void
    openKeyboardAccessory: (v: ReactNode) => void
}

const initialState = {
    isKeyboard: false,
    keyboardHeight: 0
}

interface IKeyboardState {
    isKeyboard: boolean,
    keyboardHeight: number
}

const keyboardReducer = (state: IKeyboardState = initialState, { type, payload }: { type: string, payload: any }): IKeyboardState => {
    switch (type) {
        case "SET_KEYBOARD":
            return payload ? { ...state, isKeyboard: true } : { isKeyboard: false, keyboardHeight: 0 }
        case "SET_KEYBOARD_HEIGHT":
            return { ...state, keyboardHeight: payload }
        case "SET_BOTH":
            return payload
        default:
            break;
    }

    return state
}

export const useKeyboardService = (): KeyboardValues => {
    const isFocused = useIsFocused()
    const [keyboardState, dispatch] = useReducer(keyboardReducer, initialState)

    const dismissKeyboard = useCallback(() => {
        Keyboard.dismiss()
    }, [])

    const openKeyboardAccessory = useCallback((MyView: ReactNode) => {
        StaticHolder.showAccessoryView(MyView)
    }, [])

    useEffect(() => {
        let willChange: EmitterSubscription;
        if (Platform.OS == 'ios' && keyboardState?.isKeyboard && isFocused) {
            willChange = Keyboard.addListener("keyboardDidShow", (e) => {
                if (keyboardState?.isKeyboard) {
                    setTimeout(() => {
                        dispatch({ type: "SET_KEYBOARD_HEIGHT", payload: e.endCoordinates.height })
                    }, 0);
                }
            })
        }
        return () => {
            willChange?.remove()
        }
    }, [keyboardState?.isKeyboard, isFocused])


    useEffect(() => {
        let willShow: EmitterSubscription;
        let willHide: EmitterSubscription;
        if (isFocused) {
            willShow = Keyboard.addListener(Platform.OS == 'ios' ? 'keyboardWillShow' : "keyboardDidShow", (e) => {
                dispatch({ type: "SET_BOTH", payload: { isKeyboard: true, keyboardHeight: Platform.OS == 'ios' ? e.endCoordinates.height : 0 } })
            })
            willHide = Keyboard.addListener(Platform.OS == 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
                StaticHolder.hideAccessoryView()
                dispatch({ type: "SET_KEYBOARD", payload: false })
            })
        }
        return () => {
            willShow?.remove()
            willHide?.remove()
        }
    }, [isFocused])

    return {
        openKeyboardAccessory,
        dismissKeyboard,
        ...keyboardState
    }
}

export const withKeyboardService = (Component: any) => {
    return (props: any) => {
        const data: KeyboardValues = useKeyboardService()
        return <Component {...data} {...props} />;
    };
};