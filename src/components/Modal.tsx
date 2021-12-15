import DropdownAlert from 'dj-react-native-dropdown-alert'
import React, { FC, useEffect, useRef } from 'react'
import { Modal as RNModal, ModalProps, View } from 'react-native'
import { BottomMenuHolder } from 'utils/BottomMenuHolder'
import { DropDownHolder } from 'utils/DropdownHolder'
// import { PopupAlertHolder } from 'utils/PopupAlertHolder'
import { BottomMenu } from './BottomMenu'
// import { PopupAlert } from './PopupAlert'
export const Modal: FC<ModalProps> = (props) => {
    const dropDownRef = useRef<DropdownAlert>(null)
    // const modelAlertRef = useRef<PopupAlert>(null)
    const bottomMenuRef = useRef<BottomMenu>(null)
    useEffect(() => {
        if (props?.visible) {
            setTimeout(() => {
                DropDownHolder.setModalDropDown(dropDownRef.current);
                // PopupAlertHolder.setModalPopupAlert(modelAlertRef.current);
                BottomMenuHolder.setModalBottomMenu(bottomMenuRef.current);
            }, 0);
        }
        return () => {
            DropDownHolder.setModalDropDown(null);
            // PopupAlertHolder.setModalPopupAlert(null);
            BottomMenuHolder.setModalBottomMenu(null);
        }
    }, [props?.visible])

    return (
        <RNModal {...props} >
            <View style={{ flex: 1 }} >
                <View style={{ flex: 1 }} >
                    {props.children}
                </View>
                <DropdownAlert ref={dropDownRef} />
                {/* <PopupAlert ref={modelAlertRef} /> */}
                <BottomMenu ref={bottomMenuRef} />
            </View>
        </RNModal>
    )
}