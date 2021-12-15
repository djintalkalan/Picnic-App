import React, { createContext, FC, useCallback, useContext, useRef, useState } from "react";
import { ColorValue, StatusBar as RNStatusBar, StatusBarProps as RNStatusBarProps, StatusBarStyle } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
interface StatusBarProviderProps extends RNStatusBarProps {
    initialColor?: ColorValue,
    initialBarStyle?: StatusBarStyle
}
interface IStatusBarContext {
    pushStatusBarStyle: (props: RNStatusBarProps, addInPrevious?: boolean) => number
    popStatusBarStyle: (index?: number) => void
    statusBarStyleStack: Array<RNStatusBarProps>
    currentStyle?: RNStatusBarProps
}

const StatusBarContext = createContext<IStatusBarContext>({
    pushStatusBarStyle: (props: RNStatusBarProps, addInPrevious?: boolean) => (0),
    popStatusBarStyle: (index?: number) => { },
    statusBarStyleStack: [],
    currentStyle: undefined
});

export const StatusBarProvider: FC<StatusBarProviderProps> = ({ children, initialColor, initialBarStyle, ...rest }) => {
    const [toggle, setToggle] = useState(false)
    const statusBarStyleStack = useRef<Array<RNStatusBarProps>>([{ backgroundColor: initialColor || undefined, barStyle: initialBarStyle || 'default', ...rest }])
    const currentStyle = statusBarStyleStack.current[statusBarStyleStack.current.length - 1]

    const pushStatusBarStyle = useCallback((props: RNStatusBarProps, addInPrevious: boolean = true) => {
        statusBarStyleStack.current = [...statusBarStyleStack.current, {
            ...(addInPrevious ? currentStyle : {}),
            ...props,
        }]
        setToggle(_ => !_)
        return statusBarStyleStack.current.length - 1
    }, [])

    const popStatusBarStyle = useCallback((index?: number) => {
        if (index) {
            statusBarStyleStack.current.splice(index, 1);
        } else {
            statusBarStyleStack.current.pop()
        }
        setToggle(_ => !_)
    }, [])


    return <StatusBarContext.Provider value={{
        pushStatusBarStyle, popStatusBarStyle, statusBarStyleStack: statusBarStyleStack.current,
        currentStyle
    }} >
        <RNStatusBar {...currentStyle} />
        {!currentStyle.translucent && <SafeAreaView edges={['top']} style={{ backgroundColor: currentStyle?.backgroundColor }} />}
        {children}
    </StatusBarContext.Provider>
}

export const useStatusBar = (): IStatusBarContext => useContext(StatusBarContext)

export const withStatusBar = (Component: any) => {
    return (props: any) => {
        const data: IStatusBarContext = useStatusBar()
        return <Component {...data} {...props} />;
    };
};

export const StatusBarProviderMemoized: FC<StatusBarProviderProps> = React.memo(StatusBarProvider)

