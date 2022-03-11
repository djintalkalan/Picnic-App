import { IAlertType, PopupAlert } from "custom-components";
import { BottomMenu, IBottomMenu } from "custom-components/BottomMenu";
import { ImageZoom } from "custom-components/ImageZoom";
import DropdownAlert from "dj-react-native-dropdown-alert";
import React from "react";

type AlertType = 'info' | 'warn' | 'error' | 'success'

export class StaticHolder {

  // Bottom Menu Holder
  static bottomMenu: BottomMenu | null | undefined;
  static modalBottomMenu: BottomMenu | null | undefined;
  static setBottomMenu(bottomMenu: BottomMenu | null | undefined) { this.bottomMenu = bottomMenu; }
  static setModalBottomMenu(popupAlert: BottomMenu | null | undefined) { this.modalBottomMenu = popupAlert; }
  static getBottomMenu() { return this.popupAlert; }
  static showBottomMenu(data: IBottomMenu) { (this.modalBottomMenu || this.bottomMenu)?.showBottomMenu(data) }

  // Drop Down Holder
  static dropDown: DropdownAlert | null | undefined;
  static modalDropDown: DropdownAlert | null | undefined;
  static setDropDown(dropDown: DropdownAlert | null | undefined) { this.dropDown = dropDown; }
  static setModalDropDown(dropDown: DropdownAlert | null | undefined) { this.modalDropDown = dropDown; }
  static getDropDown() { return this.dropDown; }
  static dropDownAlert(type: AlertType, title: string, message: string, time?: number) { if (message) (this.modalDropDown || this.dropDown)?.alertWithType(type, title, message, {}, time ?? 2000) }

  // PopupAlert Holder
  static popupAlert: PopupAlert | null | undefined;
  static modalPopupAlert: PopupAlert | null | undefined;
  static setPopupAlert(popupAlert: PopupAlert | null | undefined) { this.popupAlert = popupAlert }
  static setModalPopupAlert(popupAlert: PopupAlert | null | undefined) { this.modalPopupAlert = popupAlert }
  static getPopupAlert() { return this.popupAlert; }
  static alert(data: IAlertType) { (this.modalPopupAlert || this.popupAlert)?.showAlert(data) }
  static hide() { (this.modalPopupAlert || this.popupAlert)?.hideAlert() }

  // KeyboardAccessoryView Holder
  static keyboardAccessoryView: KeyboardAccessoryView | null | undefined;
  static modalKeyboardAccessoryView: KeyboardAccessoryView | null | undefined;
  static setKeyboardAccessoryView(keyboardAccessoryView: KeyboardAccessoryView | null | undefined) { this.keyboardAccessoryView = keyboardAccessoryView }
  static setModalKeyboardAccessoryView(modalKeyboardAccessoryView: KeyboardAccessoryView | null | undefined) { this.modalKeyboardAccessoryView = modalKeyboardAccessoryView }
  static getKeyboardAccessoryView() { return this.keyboardAccessoryView; }
  static showAccessoryView(data: any) { (this.modalKeyboardAccessoryView || this.keyboardAccessoryView)?.showView(data) }
  static hideAccessoryView() { (this.modalKeyboardAccessoryView || this.keyboardAccessoryView)?.hideView() }

  // Image ZoomHolder

  static imageZoom: (ImageZoom) | null | undefined;
  static setImageZoom(imageZoom: (ImageZoom) | null | undefined) { this.imageZoom = imageZoom; }
  static getImageZoom() { return this.imageZoom; }
  static showImage(imageUrl: string) { this.imageZoom?.showImage(imageUrl) }
  static hideImage() { this.imageZoom?.showImage("") }
}

export class KeyboardAccessoryView extends React.Component {
  accessoryView: any;
  state = {
    isAccessoryView: false
  }

  hideView() {
    this.accessoryView = null
    this.setState({ isAccessoryView: false })
  }

  showView(data: any) {
    this.accessoryView = data
    this.setState({ isAccessoryView: true })
  }
  render() {
    if (this.state.isAccessoryView)
      return this.accessoryView
    return null
  }
}