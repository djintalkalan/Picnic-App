import DropdownAlert from 'dj-react-native-dropdown-alert'
import React, { FC, useEffect, useRef } from 'react'
import { Modal as RNModal, ModalProps, View } from 'react-native'
import { StaticHolder } from 'utils/StaticHolder'
import { BottomMenu } from './BottomMenu'
import { PopupAlert } from './PopupAlert'
export const Modal: FC<ModalProps> = (props) => {
    const dropDownRef = useRef<DropdownAlert>(null)
    const modelAlertRef = useRef<PopupAlert>(null)
    const bottomMenuRef = useRef<BottomMenu>(null)
    useEffect(() => {
        if (props?.visible) {
            setTimeout(() => {
                StaticHolder.setModalDropDown(dropDownRef.current);
                StaticHolder.setModalPopupAlert(modelAlertRef.current);
                StaticHolder.setModalBottomMenu(bottomMenuRef.current);
            }, 0);
        }
        return () => {
            StaticHolder.setModalDropDown(null);
            StaticHolder.setModalPopupAlert(null);
            StaticHolder.setModalBottomMenu(null);
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
                <BottomMenu ref={bottomMenuRef} />
            </View>
        </RNModal>
    )
}