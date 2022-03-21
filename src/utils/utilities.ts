
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { config } from 'api';
import { store } from 'app-store';
import { IPaginationState, setLoadingAction } from 'app-store/actions';
import { IBottomMenu } from 'custom-components/BottomMenu';
import { IAlertType } from 'custom-components/PopupAlert';
import { format as FNSFormat } from 'date-fns';
import { decode } from 'html-entities';
import { Keyboard, Platform, Share } from 'react-native';
import Geocoder from 'react-native-geocoding';
import LaunchNVG, { LaunchNavigator as LType } from 'react-native-launch-navigator';
import Toast from 'react-native-simple-toast';
import Database, { ILocation } from 'src/database/Database';
import { StaticHolder } from './StaticHolder';
//@ts-ignore
const LaunchNavigator: LType = LaunchNVG
Geocoder.init(config.GOOGLE_MAP_API_KEY);
try {
    //@ts-ignore
    LaunchNVG?.setGoogleApiKey(config.GOOGLE_MAP_API_KEY);
} catch (e) {

}

export const launchMap = async (address: string | { lat: number, long: number },) => {
    let app = null;

    const map = Platform.OS == 'android' ? LaunchNavigator.APP.GOOGLE_MAPS : LaunchNavigator.APP.APPLE_MAPS
    const map2 = Platform.OS == 'ios' ? LaunchNavigator.APP.GOOGLE_MAPS : LaunchNavigator.APP.APPLE_MAPS

    app = await LaunchNavigator.isAppAvailable(map) ? map : null
    if (!app) {
        app = await LaunchNavigator.isAppAvailable(map2) ? map2 : null
    }


    if (address && typeof address === 'string') {
        LaunchNavigator.navigate(address, { app })
            .then(() => console.log('Launched navigator'))
            .catch((err: any) => console.error('Error launching navigator: ', err));
    } else if (
        address &&
        typeof address === 'object' &&
        address?.lat &&
        address?.long
    ) {
        LaunchNavigator.navigate([address?.lat, address?.long], { app })
            .then(() => console.log('Launched navigator'))
            .catch((err: any) => console.log('Error launching navigator: ', err));
    } else {
    }

};

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
        console.log("e", e)
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



export const _showErrorMessage = async (msg: string, time?: number) => {
    if (!msg || !msg.trim()) return
    StaticHolder.dropDownAlert('error', "Error", msg, time)
}

export const _showWarningMessage = async (msg: string, time?: number) => {
    if (!msg || !msg.trim()) return
    StaticHolder.dropDownAlert('warn', "Warning", msg, time)
}

export const _showSuccessMessage = async (msg: string, time?: number) => {
    if (!msg || !msg.trim()) return
    StaticHolder.dropDownAlert('success', "Success", msg, time)
}

export const _showPopUpAlert = (data: IAlertType) => {
    Keyboard.dismiss()
    setTimeout(() => {
        StaticHolder.alert(data)
    }, 0);
}

export const _hidePopUpAlert = () => {
    StaticHolder.hide()
}

export const _showBottomMenu = (data: IBottomMenu) => {
    Keyboard.dismiss()
    setTimeout(() => {
        StaticHolder.showBottomMenu(data)
    }, 0);
}

export const _zoomImage = (imageUrl: string) => {
    console.log("Showing", imageUrl);

    Keyboard.dismiss()
    setTimeout(() => {
        StaticHolder.showImage(imageUrl)
    }, 0);
}

export const _cancelZoom = () => {
    StaticHolder.hideImage()
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
    return config.IMAGE_URL + options?.type + "/" + url + "?width=" + (options?.width || "1000") + "&height=" + (options?.height || "")
}


export const ProfileImagePickerOptions = {
    width: 800,
    height: 800,
    compressImageQuality: 0.8,
    compressImageMaxWidth: 800,
    compressImageMaxHeight: 800,
    enableRotationGesture: true,
    cropping: true,
}

export const getAddressFromLocation = async (region: ILocation) => {
    try {
        const json = await Geocoder.from({ latitude: region.latitude, longitude: region.longitude })
        // console.log('ADDRESS JSON:', JSON.stringify(json));

        var addressComponent = json.results[0].address_components;

        const otherData = getOtherData(addressComponent);
        // console.log('other Data', otherData);

        const address = getFormattedAddress(addressComponent) //json.results[0].formatted_address;
        console.log('ADDRESS:', JSON.stringify(address));
        return { address, otherData }
    }
    catch (e) {
        console.log(e)
        // _showErrorMessage("Location Error: " + e?.message)
        _showErrorMessage('Location is unavailable, please check your network.', 5000)
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
    return { city: city?.trim(), state: state?.trim(), country: country?.trim() }
}

export const getOtherDataFromAddress = (address: { main_text: string, secondary_text: string }) => {
    let state = "", country = "";
    const arr = address?.secondary_text.split(",")
    arr.some((_, i) => {
        if (i == arr.length - 1) {
            country = _
        } else {
            state = state + (i > 0 ? ", " : "") + _
        }
    })
    return { city: address?.main_text?.trim(), state: state?.trim(), country: country?.trim() }
}

export const InitialPaginationState: IPaginationState = {
    currentPage: 0,
    totalPages: -1,
    perPage: 20
}

export const getShortAddress = (address: string, state: string, city?: string) => {
    try {
        let index = address?.indexOf(city ?? state) - 2
        if (index < 0) {
            index = 0
        }
        return address.substring(0, index)
    } catch (e) {
        console.log("E", e);

        return address
    }
}

export const getSymbol = (currency: string) => {
    const currencies = Database.getStoredValue('currencies')
    let symbol = '';
    currencies?.map((_: any, i: number) => {
        if (_?.value == currency) {
            symbol = _?.value == 'usd' ? decode(_?.symbol) : (decode(_?.key) + " ");
            // symbol = decode(_?.symbol);
        }
    })
    return symbol;
}

export const WaitTill = async (time: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    })
}

type IDynamicType = "group-detail" | "event-detail"

export const getDetailsFromDynamicUrl = (url: string): { id?: string, type?: IDynamicType } => {
    try {
        const arr = url?.split("/").reverse();
        //@ts-ignore
        return { id: arr[0], type: arr[1] }
    }
    catch (e) {
        return { id: undefined, type: undefined }
    }
}

const buildLink = async (l: string) => {
    const link = await dynamicLinks().buildShortLink({
        link: 'https://picnicapp.com/' + l,
        domainUriPrefix: 'https://picnicapp.page.link',
        android: {
            packageName: config.PACKAGE_NAME
        },
        ios: {
            bundleId: config.BUNDLE_ID
        }
    });
    return link;
}

export const shareDynamicLink = async (name: string, { type, id }: { type: IDynamicType, id: string }) => {
    try {
        store.dispatch(setLoadingAction(true))
        const link = await buildLink(type + "/" + id)
        store.dispatch(setLoadingAction(false))
        setTimeout(() => {
            share("Share " + name, link)
        }, 100);
    }
    catch (e) {
        store.dispatch(setLoadingAction(false))
    }

}

export const shareAppLink = async (name: string) => {
    const link = await dynamicLinks().buildShortLink({
        link: 'https://picnicapp.com/',
        domainUriPrefix: 'https://picnicapp.page.link',
        android: {
            packageName: config.PACKAGE_NAME
        },
        ios: {
            bundleId: config.BUNDLE_ID
        },
        navigation: {
            forcedRedirectEnabled: true
        }
    });
    share("Share " + name, link)
}

export const getDisplayName = (username: string, firstName: string, lastName: string) => {
    return username || ((firstName || "") + (lastName ? (" " + lastName) : ""))
}

export const mergeMessageObjects = (chats: Array<any>, total_likes: Array<any>, like_by_me: Array<any>) => {
    const map = new Map();
    chats.forEach(item => map.set(item._id, item));
    total_likes?.length && total_likes?.forEach(item => map.set(item._id, { ...map.get(item._id), message_total_likes_count: item?.total_likes }));
    like_by_me?.length && like_by_me?.forEach(item => map.set(item.message_id, { ...map.get(item.message_id), is_message_liked_by_me: true }));
    return Array.from(map.values());
}

export const _showToast = (message: string, duration: 'SHORT' | 'LONG' = 'SHORT', gravity: 'TOP' | 'BOTTOM' | 'CENTER' = 'BOTTOM') => {
    Toast.showWithGravity(message, Toast?.[duration], Toast?.[gravity]);
}