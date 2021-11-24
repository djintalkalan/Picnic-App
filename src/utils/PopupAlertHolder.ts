import { IAlertType, PopupAlert } from "custom-components/PopupAlert";

type AlertType = 'info' | 'warn' | 'error' | 'success'

export class PopupAlertHolder {
    static popupAlert: PopupAlert | null | undefined;
    static modalPopupAlert: PopupAlert | null | undefined;
    static setPopupAlert(popupAlert: PopupAlert | null | undefined) {
        this.popupAlert = popupAlert;
    }

    static setModalPopupAlert(popupAlert: PopupAlert | null | undefined) {
        this.modalPopupAlert = popupAlert;
    }

    static getPopupAlert() {
        return this.popupAlert;
    }

    static alert(data: IAlertType) {
        (this.modalPopupAlert || this.popupAlert)?.showAlert(data)
    }
}