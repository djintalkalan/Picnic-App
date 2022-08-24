import { RootState } from 'app-store';
import { cancelUpload } from 'app-store/actions';
import { colors } from 'assets';
import { isEqual, round, toNumber } from 'lodash';
import React, { FC } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { Progress as S3Progress } from 'react-native-aws3';
//@ts-ignore
import Spinner from "react-native-loading-spinner-overlay";
import * as Progress from 'react-native-progress';
import { useDispatch, useSelector } from 'react-redux';
import Language from 'src/language/Language';
import { scaler } from 'utils';
import Button from './Button';
import { Text } from './Text';

const { width } = Dimensions.get("window")
const size = Platform.OS == 'ios' ? undefined : scaler(50)
interface LoaderProps {
    customLoadingMsg?: string;
    loading?: boolean;
}

export interface IProgress extends S3Progress {
    currentCount: number
    length: number
}

export const Loader: FC<LoaderProps> = (props) => {
    const { isLoading, loadingMsg, type } = useSelector((state: RootState) => ({
        isLoading: state.isLoading,
        loadingMsg: state?.loadingMsg.replace("%", ""),
        type: state?.loadingMsg?.includes("%") ? 'progress' : "normal",
        // isLoading: true,
        // loadingMsg: JSON.stringify({ loaded: 260334432, total: 182334432, percent: 0.43630166169578183 }),
        // type: 'progress',
        // isLogin: state.isLoginReducer
    }), isEqual);

    if (props?.loading || isLoading)
        return (
            <Spinner

                visible={props?.loading || isLoading}
                // visible
                size={size}
                color={colors.colorPrimary}
                overlayColor={'rgba(0, 0, 0, 0.7)'}
                children={
                    type == 'progress' ?
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                            <ProgressIndicator progress={JSON.parse(loadingMsg)} />
                        </View>
                        : undefined
                }
            />
        )
    return null
}

const ProgressIndicator = ({ progress: { loaded, total, percent, currentCount = 0, length = 0 } }: { progress: IProgress }) => {
    percent = percent * 100
    let stringText = "Byte"
    let divider = 1
    if (total >= 1000000000) {
        stringText = "Gb"
        divider = 1000000000
    } else if (total >= 1000000) {
        stringText = "Mb"
        divider = 1000000
    } else if (total >= 1000) {
        stringText = "Kb"
        divider = 1000
    }
    console.log("divider", divider);
    const dispatch = useDispatch()

    return <>
        <View style={{ alignItems: 'center', flexDirection: 'row', width: width / 1.5, paddingHorizontal: scaler(5), justifyContent: 'space-between' }} >
            <Text style={{ fontSize: scaler(12), fontWeight: '500', color: colors.colorPrimary, marginBottom: scaler(5) }} >{
                round(percent, 2)
            }%</Text>
            <Text style={{ fontSize: scaler(12), fontWeight: '400', color: colors.colorPrimary, marginBottom: scaler(5) }} >{
                round((loaded / divider), 2)
            } {stringText} /{round((total / divider), 2)} {stringText}</Text>
        </View>

        <Progress.Bar width={width / 1.5} height={scaler(10)} animated
            indeterminateAnimationDuration={900}
            indeterminate={toNumber(percent) < 2 || toNumber(percent) == 100}
            useNativeDriver
            color={colors.colorPrimary}
            progress={toNumber(percent) / 100} />
        <View style={{ alignItems: 'center', flexDirection: 'row', width: width / 1.5, paddingHorizontal: scaler(5), justifyContent: currentCount ? 'space-between' : 'center' }} >
            <Text style={{ fontSize: scaler(14), fontWeight: '500', color: colors.colorPrimary, marginTop: scaler(10) }} >{
                toNumber(percent) < 10 ? "Starting upload" : toNumber(percent) == 100 ? "Finalizing upload" : Language.getString('uploading_file')
            }</Text>
            {currentCount ? <Text style={{ fontSize: scaler(12), fontWeight: '500', color: colors.colorPrimary, marginTop: scaler(10) }} >{
                currentCount + "/" + length
            }</Text> : undefined}
        </View>

        <Button containerStyle={{ marginTop: scaler(20) }} textStyle={{ fontWeight: '400' }} paddingVertical={scaler(5)} paddingHorizontal={scaler(10)} fontSize={scaler(12)}
            onPress={() => dispatch(cancelUpload())}
            title={Language.cancel_upload} />
    </>
}


