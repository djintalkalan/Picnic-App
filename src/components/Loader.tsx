import { RootState } from 'app-store';
import { isEqual } from 'lodash';
import React, { FC } from 'react';
import Spinner from "react-native-loading-spinner-overlay";
import { useSelector } from 'react-redux';

interface LoaderProps {
    customLoadingMsg?: string;
    loading?: boolean;
}

export const Loader: FC<LoaderProps> = (props) => {
    const { isLoading } = useSelector((state: RootState) => ({
        isLoading: state.isLoadingReducer,
        // loadingMsg: state.loadingMsgReducer,
        // isLogin: state.isLoginReducer
    }), isEqual);

    if (props?.loading || isLoading)
        return (
            <Spinner
                visible={props?.loading || isLoading}
                color={'#fc9f04'}
                overlayColor={'rgba(0, 0, 0, 0.6)'}
            />
        )
    return null
}


