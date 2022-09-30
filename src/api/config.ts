import c, { ConfigVariables } from "react-native-ultimate-config";


interface IConfig extends Omit<ConfigVariables, 'APP_TYPE'> {
    APP_TYPE: 'dev' | 'production' | 'beta'
}

export const config = (c as IConfig)
