
import { config } from 'api';
import { IPaginationState } from 'app-store/actions';
import { IAlertType } from 'custom-components/PopupAlert';
import { format as FNSFormat } from 'date-fns';
import { Share } from 'react-native';
import Geocoder from 'react-native-geocoding';
import { ILocation } from 'src/database/Database';
import { DropDownHolder } from './DropdownHolder';
import { PopupAlertHolder } from './PopupAlertHolder';
Geocoder.init(config.GOOGLE_MAP_API_KEY);

// export const launchMap = (address: string | { lat: string | number, long: string | number },) => {
//     if (address && typeof address === 'string') {
//         LaunchNavigator.navigate(address)
//             .then(() => console.log('Launched navigator'))
//             .catch((err) => console.error('Error launching navigator: ', err));
//     } else if (
//         address &&
//         typeof address === 'object' &&
//         address?.lat &&
//         address?.long
//     ) {
//         LaunchNavigator.navigate([address?.lat, address?.long])
//             .then(() => console.log('Launched navigator'))
//             .catch((err: any) => console.log('Error launching navigator: ', err));
//     } else {
//     }
// };

export const share = (title: string, message: string, url?: string | undefined) => {
    try {
        Share.share({
            title, message, url
        })
    } catch (e) {
        console.log(e)
    }
};

export const htmlToPlainText = (text: string): string => {
    if (text) {
        text = text.replace(/[&]nbsp[;]/g, " ");
        text = text.replace(/[<]br[>]/g, "\n");
        text = text.replace(/<[^>]+>/g, '')
    }
    return text
}

export const stringToDate = (_date: string, _format: string = "YYYY-MM-DD", _delimiter: "-" | "/" | "." = "-"): Date => {
    try {
        _format = _format.toLowerCase();
        let _time: Array<any> = []
        if (_date.includes(":")) {
            const arr = _date.split(" ")
            if (arr[0].includes(":")) {
                _date = arr[1]
                _time = arr[0].split(":")
            } else {
                _date = arr[0]
                _time = arr[1].split(":")
            }
        }
        const formatItems = _format.split(_delimiter);
        const dateItems = _date.split(_delimiter);
        const monthIndex = formatItems.indexOf("mm");
        const dayIndex = formatItems.indexOf("dd");
        const yearIndex = formatItems.indexOf("yyyy");
        let month = parseInt(dateItems[monthIndex]);
        month -= 1;
        const dates = new Date(parseInt(dateItems[yearIndex]), month, parseInt(dateItems[dayIndex]), parseInt(_time[0] ?? 0), parseInt(_time[1] ?? 0), parseInt(_time[2] ?? 0));
        return dates
    }
    catch (e) {
        console.log("e")
        return new Date()
    }
}

export const dateStringFormat = (dateString: string, toFormat: string, fromFormat: string = "YYYY-MM-DD", delimiter: "-" | "/" | "." = "-") => {
    try {
        return dateFormat(stringToDate(dateString, fromFormat, delimiter), toFormat)
    }
    catch (e) {
        console.log("Error", encodeURIComponent)
        return dateString
    }
}

export const dateFormat = (date: Date, toFormat: string) => {
    try {
        toFormat = toFormat.replace("YYYY", 'yyyy')
        toFormat = toFormat.replace("YYY", 'yyy')
        toFormat = toFormat.replace("YY", 'yy')
        toFormat = toFormat.replace("YY", 'yy')
        toFormat = toFormat.replace("DDD", 'ddd')
        toFormat = toFormat.replace("DD", 'dd')
        toFormat = toFormat.replace("D", 'd')
        toFormat = toFormat.replace("A", 'a')
        return FNSFormat(date, toFormat)
    }
    catch (e) {
        console.log("Error", encodeURIComponent)
        return date.toDateString()
    }
}

export const isNumeric = (value: any) => {
    return /^-?\d+$/.test(value);
}





export const _calculateAge = (birthday: string | Date, format: string = "YYYY-MM-DD", delimiter: "-" | "/" | "." = "-") => { // birthday is a date
    if (typeof birthday == "string") {
        birthday = stringToDate(birthday, format, delimiter)
    }
    return getAge(birthday)
}

function getAge(dob: Date) {
    let now = new Date();
    let yearNow = now.getFullYear();
    let monthNow = now.getMonth();
    let dateNow = now.getDate();

    let yearDob = dob.getFullYear();
    let monthDob = dob.getMonth();
    let dateDob = dob.getDate();
    let age = {
        years: -1,
        months: -1,
        days: -1
    };
    let ageString = "";
    let yearString = "Y";
    let monthString = "M";
    let dayString = "D";


    let yearAge = yearNow - yearDob;
    let monthAge
    if (monthNow >= monthDob)
        monthAge = monthNow - monthDob;
    else {
        yearAge--;
        monthAge = 12 + monthNow - monthDob;
    }
    let dateAge
    if (dateNow >= dateDob)
        dateAge = dateNow - dateDob;
    else {
        monthAge--;
        dateAge = 31 + dateNow - dateDob;

        if (monthAge < 0) {
            monthAge = 11;
            yearAge--;
        }
    }

    age = {
        years: yearAge,
        months: monthAge,
        days: dateAge
    };

    if ((age?.years > 0) && (age.months > 0) && (age.days > 0))
        ageString = age?.years + yearString + ", " + age.months + monthString + ", " + age.days + dayString;
    else if ((age?.years == 0) && (age.months == 0) && (age.days > 0))
        ageString = age.days + dayString;
    else if ((age?.years > 0) && (age.months == 0) && (age.days == 0))
        ageString = age?.years + yearString;
    else if ((age?.years > 0) && (age.months > 0) && (age.days == 0))
        ageString = age?.years + yearString + ", " + age.months + monthString;
    else if ((age?.years == 0) && (age.months > 0) && (age.days > 0))
        ageString = age.months + monthString + ", " + age.days + dayString;
    else if ((age?.years > 0) && (age.months == 0) && (age.days > 0))
        ageString = age?.years + yearString + ", " + age.days + dayString;
    else if ((age?.years == 0) && (age.months > 0) && (age.days == 0))
        ageString = age.months + monthString;
    else ageString = "Oops! Could not calculate age!";

    return ageString;
}



export const _showErrorMessage = async (msg: string, showAlert = false) => {
    if (!msg || !msg.trim()) return
    if (!showAlert) {
        DropDownHolder.alert('error', "Error", msg)
    } else {
        alert(msg);
    }
}

export const _showSuccessMessage = async (msg: string, showAlert = false) => {
    if (!msg || !msg.trim()) return
    if (!showAlert) {
        DropDownHolder.alert('success', "Success", msg)
    } else {
        alert(msg);
    }
}

export const _showPopUpAlert = (data: IAlertType) => {
    PopupAlertHolder.alert(data)
}


export const splitDate = (dateTimestr: string, onlyDay: any) => {
    let dateStr = '';
    const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (dateTimestr) {
        dateStr = dateTimestr.split(' ')[0]
    }

    var dateObj = new Date(dateStr);
    var month = month_names_short[dateObj.getUTCMonth()]; //months from 0-11
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    return onlyDay ? day : month + ', ' + year
}


// export const openURL = async (url: string) => {
//     try {
//         if (await InAppBrowser.isAvailable()) {
//             try {
//                 InAppBrowser.close()
//             } catch (e) {

//             }
//             const result = await InAppBrowser.open(url, {
//                 // iOS Properties
//                 dismissButtonStyle: 'cancel',
//                 preferredBarTintColor: colors.colorsPrimary,
//                 preferredControlTintColor: 'white',
//                 readerMode: false,
//                 animated: true,
//                 modalPresentationStyle: 'fullScreen',
//                 modalTransitionStyle: 'coverVertical',
//                 modalEnabled: true,
//                 enableBarCollapsing: false,
//                 // Android Properties
//                 showTitle: true,
//                 toolbarColor: colors.colorsPrimary,
//                 secondaryToolbarColor: 'white',
//                 navigationBarColor: 'white',
//                 navigationBarDividerColor: 'white',
//                 enableUrlBarHiding: true,
//                 enableDefaultShare: true,
//                 forceCloseOnRedirection: false,
//                 showInRecents: true,
//                 // Specify full animation resource identifier(package:anim/name)
//                 // or only resource name(in case of animation bundled with app).
//                 animations: {
//                     startEnter: 'slide_in_right',
//                     startExit: 'slide_out_left',
//                     endEnter: 'slide_in_left',
//                     endExit: 'slide_out_right'
//                 },
//                 headers: {
//                 }
//             })
//         }
//         else Linking.openURL(url)
//     } catch (error) {
//         Alert.alert(error.message)
//     }
// }

// export const getImageBaseUrl = (type: 'users' | 'events' | 'groups' | 'messages', height: number, width: number) => {
//     return config.API_URL + "media/thumb/" + height + "/" + width + "/" + type + "/"
// }

export const getImageUrl = (url: string, options: { width: number, height?: number, type: 'users' | 'events' | 'groups' | 'messages' }) => {
    return config.IMAGE_URL + options?.type + "/" + url + "?width=" + options?.width + "&height=" + (options?.height || "")
}


export const ProfileImagePickerOptions = {
    width: 400,
    height: 400,
    compressImageQuality: 0.5,
    compressImageMaxWidth: 400,
    compressImageMaxHeight: 400,
    enableRotationGesture: true,
    cropping: true,
}

export const getAddressFromLocation = async (region: ILocation) => {
    try {
        const json = await Geocoder.from({ latitude: region.latitude, longitude: region.longitude })
        console.log('ADDRESS:', JSON.stringify(json));

        var addressComponent = json.results[0].address_components;

        const otherData = getOtherData(addressComponent);

        const address = getFormattedAddress(addressComponent) //json.results[0].formatted_address;
        console.log('ADDRESS:', JSON.stringify(address));
        return { address, otherData }
    }
    catch (e) {
        console.log(e)
        _showErrorMessage("Location : " + e?.message)
        return { address: null, otherData: null }
    }
}

export const getFormattedAddress = (addressComponent: any) => {
    let main_text = ""
    let secondary_text = ""
    let b = false
    for (let i = 0; i < addressComponent.length - 1; i++) {
        let locality = addressComponent[i];
        let types = locality.types;

        if (!types.includes('plus_code') && !types.includes('locality')) {
            if (b) {
                secondary_text += locality?.long_name + ", "
            } else
                main_text += locality?.long_name + ", "
        }
        if (types.includes('locality')) {
            b = true
            if (main_text)
                secondary_text += locality?.long_name + ", "
            else
                main_text += locality?.long_name + ", "
        }
    }
    return {
        main_text: main_text?.trim().slice(0, -1), secondary_text: secondary_text?.trim().slice(0, -1)
    }
}

export const getOtherData = (addressComponent: any) => {
    let city = "", state = "", country = "";
    for (let i = 0; i < addressComponent.length - 1; i++) {
        let locality = addressComponent[i];
        let types = locality.types;
        for (let j = 0; j < types.length - 1; j++) {
            if (types[j] === 'locality') {
                city = locality.long_name
            }
            if (types[j] === 'administrative_area_level_1') {
                state = locality.long_name
            }
            if (types[j] === 'country') {
                country = locality.long_name
            }
        }
    }
    return { city, state, country }
}

export const InitialPaginationState: IPaginationState = {
    currentPage: 0,
    totalPages: -1,
    perPage: 20
}

export const getShortAddress = (address: string, state: string, city?: string) => {
    try {
        return address.substring(0, address?.indexOf(city ?? state) - 2) || address
    } catch (e) {
        return address
    }
}