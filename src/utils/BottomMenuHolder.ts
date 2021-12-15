import { BottomMenu, IBottomMenu } from "custom-components/BottomMenu";

type AlertType = 'info' | 'warn' | 'error' | 'success'

export class BottomMenuHolder {
    static popupAlert: BottomMenu | null | undefined;
    static modalBottomMenu: BottomMenu | null | undefined;
    static setBottomMenu(popupAlert: BottomMenu | null | undefined) {
        this.popupAlert = popupAlert;
    }

    static setModalBottomMenu(popupAlert: BottomMenu | null | undefined) {
        this.modalBottomMenu = popupAlert;
    }

    static getBottomMenu() {
        return this.popupAlert;
    }

    static show(data: IBottomMenu) {
        (this.modalBottomMenu || this.popupAlert)?.showBottomMenu(data)
    }
}