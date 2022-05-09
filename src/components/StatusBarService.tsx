import { createContext } from "react";
import { ColorValue, StatusBarProps as RNStatusBarProps, StatusBarStyle } from 'react-native';
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


