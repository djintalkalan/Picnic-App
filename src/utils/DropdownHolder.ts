import DropdownAlert from "dj-react-native-dropdown-alert";
type AlertType = 'info' | 'warn' | 'error' | 'success'
export class DropDownHolder {
    static dropDown: DropdownAlert | null | undefined;
    static modalDropDown: DropdownAlert | null | undefined;
    // static statusBarStyle: any;
    static setDropDown(dropDown: DropdownAlert | null | undefined) {
        this.dropDown = dropDown;
    }

    static setModalDropDown(dropDown: DropdownAlert | null | undefined) {
        this.modalDropDown = dropDown;
    }

    static getDropDown() {
        return this.dropDown;
    }
    static alert(type: AlertType, title: string, message: string, time?: number) {
        if (message) {

            (this.modalDropDown || this.dropDown)?.alertWithType(type, title, message, {}, time ?? 2000)
        }
    }
}