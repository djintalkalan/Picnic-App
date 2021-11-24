import DropdownAlert from 'dj-react-native-dropdown-alert'
import React, { FC, useEffect, useRef } from 'react'
import { Modal as RNModal, ModalProps, View } from 'react-native'
import { DropDownHolder } from 'utils/DropdownHolder'
import { PopupAlertHolder } from 'utils/PopupAlertHolder'
import { PopupAlert } from './PopupAlert'
export const Modal: FC<ModalProps> = (props) => {
    const dropDownRef = useRef<DropdownAlert>()
    const modelAlertRef = useRef()
    useEffect(() => {
        if (props?.visible) {
            setTimeout(() => {
                DropDownHolder.setModalDropDown(dropDownRef.current);
                PopupAlertHolder.setModalPopupAlert(modelAlertRef.current);
            }, 0);
        }
        return () => {
            DropDownHolder.setModalDropDown(null);
            PopupAlertHolder.setModalPopupAlert(null);
        }
    }, [props?.visible])

    return (
        <RNModal {...props} >
            <View style={{ flex: 1 }} >
                <View style={{ flex: 1 }} >
                    {props.children}
                </View>
                <DropdownAlert ref={dropDownRef} />
                <PopupAlert ref={modelAlertRef} />
            </View>
        </RNModal>
    )
}