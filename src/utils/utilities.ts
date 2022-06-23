
import dynamicLinks from '@react-native-firebase/dynamic-links';
import AnalyticService from 'analytics';
import { config } from 'api';
import { store } from 'app-store';
import { IPaginationState, setLoadingAction } from 'app-store/actions';
import { colors } from 'assets';
import { IBottomMenu } from 'custom-components/BottomMenu';
import { IAlertType } from 'custom-components/PopupAlert';
import { format as FNSFormat } from 'date-fns';
import { decode } from 'html-entities';
import { Keyboard, Linking, Platform, Share, ShareAction } from 'react-native';
import Geocoder from 'react-native-geocoding';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import LaunchNVG, { LaunchNavigator as LType } from 'react-native-launch-navigator';
import Toast from 'react-native-simple-toast';
import Database, { ILocation } from 'src/database/Database';
import Language, { LanguageType } from 'src/language/Language';
import { StaticHolder } from './StaticHolder';
//@ts-ignore
const LaunchNavigator: LType = LaunchNVG
Geocoder.init(config.GOOGLE_MAP_API_KEY);
try {
    //@ts-ignore
    LaunchNVG?.setGoogleApiKey(config.GOOGLE_MAP_API_KEY);
} catch (e) {

}
const urlRegx = /[?&]([^=#]+)=([^&#]*)/g

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

export const share = async (title: string, message: string, url?: string | undefined) => {
    return await Share.share({
        title, message, url
    })
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



export const _showErrorMessage = async (msg?: string, time?: number) => {
    if (!msg || !msg.trim()) return
    StaticHolder.dropDownAlert('error', "Error", msg, time)
}

export const _showWarningMessage = async (msg?: string, time?: number) => {
    if (!msg || !msg.trim()) return
    StaticHolder.dropDownAlert('warn', "Warning", msg, time)
}

export const _showSuccessMessage = async (msg?: string, time?: number) => {
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

export const getImageUrl = (url: string, options: { width?: number, height?: number, type: 'users' | 'events' | 'groups' | 'messages' }) => {
    return config.IMAGE_URL + options?.type + "/" + url + "?width=" + (options?.width || "1000") + "&height=" + (options?.height || "")
}


export const ProfileImagePickerOptions = {
    width: 800,
    height: 800,
    compressImageQuality: 1,
    compressImageMaxWidth: 800,
    compressImageMaxHeight: 800,
    enableRotationGesture: true,
    cropping: true,
    loadingLabelText: Language.getString("processing", Language.getLanguage()),
    cropperCircleOverlay: true,

}

export const getAddressFromLocation = async (region: ILocation) => {
    try {
        const json = await Geocoder.from({ latitude: region.latitude, longitude: region.longitude })
        // console.log('ADDRESS JSON:', JSON.stringify(json));

        let formattedAddress = json.results[0].formatted_address;


        let addressComponent = json.results[0].address_components;
        let valueAvailable = false
        addressComponent?.some((item) => {
            if (item?.types?.includes("locality") || item?.types?.includes("political")) {
                valueAvailable = true
                return true
            }
        })
        if (!valueAvailable) {
            addressComponent = json.results[1].address_components;
            formattedAddress = json.results[1].formatted_address;
        }


        const otherData = getOtherData(addressComponent);
        // console.log('other Data', otherData);

        const address = getFormattedAddress(addressComponent, formattedAddress) //json.results[0].formatted_address;
        console.log('ADDRESS:', JSON.stringify(address));
        return { address, otherData }
    }
    catch (e) {
        console.log(e)
        // _showErrorMessage("Location Error: " + e?.message)
        // _showErrorMessage('Location is unavailable, please check your network.', 5000)
        return { address: null, otherData: null }
    }
}

export const formattedAddressToString = (address?: { main_text?: string, secondary_text?: string } | null) => {
    let addressString = ""
    if (address) {
        if (address?.main_text) {
            addressString += address?.main_text
            if (address?.secondary_text) {
                addressString += ", "
            }
        }
        if (address?.secondary_text) {
            addressString += address?.secondary_text
        }
        addressString = addressString?.trim();
    }
    return addressString
}

export const getFormattedAddress = (addressComponent: any, formattedAddress: string) => {
    let main_text = ""
    let secondary_text = ""
    let b = false

    let cityName = addressComponent?.find((item: any, index: number) => (item?.types?.includes('locality')))?.long_name

    if (!cityName)

        if (cityName)
            return {
                main_text: formattedAddress?.substring(0, formattedAddress?.toLowerCase()?.indexOf(cityName?.toLowerCase())),
                secondary_text: formattedAddress?.substring(formattedAddress?.toLowerCase()?.indexOf(cityName?.toLowerCase()))
            }
    console.log("addressComponent", addressComponent);

    for (let i = 0; i < addressComponent.length; i++) {
        let address = addressComponent[i];
        let types = address.types;
        if (!types?.includes("postal_code") && !types.includes('plus_code')) {

            if (!types.includes('administrative_area_level_1') && !types.includes('administrative_area_level_2')) {
                if (b) {
                    if (!secondary_text?.includes(address?.long_name)) secondary_text += address?.long_name + ", "
                } else
                    if (!main_text?.includes(address?.long_name)) main_text += (address?.long_name) + ", "

            }
            if (types.includes('administrative_area_level_2') || types.includes('administrative_area_level_1')) {
                b = true
                if (main_text) {
                    if (!secondary_text?.includes(address?.long_name)) secondary_text += address?.long_name + ", "
                }
                else
                    if (!main_text?.includes(address?.long_name)) main_text += address?.long_name + ", "
            } else if (types.includes('country')) {
                if (!secondary_text?.includes(address?.long_name)) secondary_text += address?.long_name + ", "
            }
        }
    }
    main_text = main_text?.trim().slice(0, -1)
    secondary_text = secondary_text?.trim().slice(0, -1)
    if ((!main_text && secondary_text) || (main_text && !secondary_text)) {
        main_text = main_text || secondary_text
        secondary_text = main_text.substring(main_text?.indexOf(", "))?.trim()
        main_text = main_text.substring(0, main_text?.indexOf(", "))?.trim()

        if (secondary_text?.startsWith(","))
            secondary_text = secondary_text?.replace(",", "")

    }
    return {
        main_text: main_text?.trim(), secondary_text: secondary_text?.trim()
    }
}

const getAddressObject = (address_components: any) => {
    var ShouldBeComponent: any = {
        home: ["street_number"],
        postal_code: ["postal_code"],
        street: ["street_address", "route"],
        region: [
            "administrative_area_level_1",
            "administrative_area_level_2",
            "administrative_area_level_3",
            "administrative_area_level_4",
            "administrative_area_level_5"
        ],
        city: [
            "locality",
            "sublocality",
            "sublocality_level_1",
            "sublocality_level_2",
            "sublocality_level_3",
            "sublocality_level_4"
        ],
        country: ["country"]
    };

    let address: any = {
        home: "",
        postal_code: "",
        street: "",
        region: "",
        city: "",
        country: ""
    };
    address_components.forEach((component: any) => {
        for (var shouldBe in ShouldBeComponent) {
            if (ShouldBeComponent?.[shouldBe].indexOf(component.types[0]) !== -1) {
                if (shouldBe === "country") {
                    address[shouldBe] = component.short_name;
                } else {
                    address[shouldBe] = component.long_name;
                }
            }
        }
    });
    return address;

}

export const getOtherData = (addressComponent: any) => {
    let city = "", state = "", country = "", adminCity = "";
    for (let i = 0; i < addressComponent.length - 1; i++) {
        let locality = addressComponent[i];
        let types = locality.types;
        for (let j = 0; j < types.length - 1; j++) {
            if (types[j] === 'locality') {
                city = locality.long_name
            }
            if (types[j] === 'administrative_area_level_2') {
                adminCity = locality.long_name
            }
            if (types[j] === 'administrative_area_level_1') {
                state = locality.long_name
            }
            if (types[j] === 'country') {
                country = locality.long_name
            }
        }
    }
    return { city: city?.trim() || adminCity?.trim(), state: state?.trim(), country: country?.trim() }
}

export const getOtherDataFromAddress = (address: { main_text: string, secondary_text: string }) => {
    let state = "", country = "";
    const arr = address?.secondary_text?.split(",")
    arr?.some((_, i) => {
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

const getShortAddress = (address: string, state: string, city?: string) => {
    try {
        let index = address?.indexOf(city || state) - 2
        if (index < 0) {
            index = 0
        }
        return address.substring(0, index) || city || state
    } catch (e) {
        console.log("address error", e, address);

        return address
    }
}

export const getFormattedAddress2 = (address: string, city: string, state: string, country?: string) => {
    const main_text = getShortAddress(address, state, city)
    let secondary_text = city + ", " + state + ", " + country
    if (secondary_text?.includes(main_text)) {
        secondary_text = secondary_text?.replace(main_text + ",", "")?.trim();
    }
    if (secondary_text?.startsWith(",")) {
        secondary_text = secondary_text?.replace(",", "")?.trim()
    }
    if (secondary_text?.endsWith(",")) {
        secondary_text = secondary_text.substring(0, secondary_text.lastIndexOf(","))?.trim();
    }
    return {
        main_text, secondary_text
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
        // const arr = url?.split("/").reverse();

        const { i, t } = getQueryVariables(url)
        return { id: i, type: t }


        //@ts-ignore
        // return { id: arr[0], type: arr[1] }
    }
    catch (e) {
        return { id: undefined, type: undefined }
    }
}

const buildLink = async (l: string) => {
    const link = await dynamicLinks().buildShortLink({
        link: 'http://www.picnicapp.link/download' + l,
        // link: config.SOCKET_URL.replace("ws://", "http://") + '/download' + l,
        domainUriPrefix: 'https://picnicgroups.page.link',
        android: {
            packageName: config.BUNDLE_ID_PACKAGE_NAME,
        },
        ios: {
            bundleId: config.BUNDLE_ID_PACKAGE_NAME,
        }

    });
    return link;
}

export const shareDynamicLink = async (name: string, { type, id }: { type: IDynamicType, id: string }) => {
    try {
        store.dispatch(setLoadingAction(true))
        const link = await buildLink("?t=" + type + "&i=" + id)
        store.dispatch(setLoadingAction(false))
        setTimeout(async () => {
            try {
                const shareAction = await share("Share " + name, link)
                handleShareAction(shareAction, type == 'event-detail' ? 'event' : 'group', id)
            }
            catch (e) {
                e && console.log("share error ", e);
            }
        }, 100);
    }
    catch (e) {
        store.dispatch(setLoadingAction(false))
    }

}

const handleShareAction = (shareAction: ShareAction | null, type: string, id: string) => {
    if (shareAction) {
        console.log(shareAction);
        switch (shareAction?.action) {
            case 'dismissedAction':

                break;
            case 'sharedAction':
                AnalyticService.logShare(id, type, shareAction?.activityType)
                break;
            default:
                break;
        }
    }

}

export const shareAppLink = async (name: string) => {
    const link = await dynamicLinks().buildShortLink({
        link: 'http://www.picnicapp.link/download',
        // link: config.SOCKET_URL.replace("ws://", "http://") + '/download',
        domainUriPrefix: 'https://picnicgroups.page.link',
        android: {
            packageName: config.BUNDLE_ID_PACKAGE_NAME
        },
        ios: {
            bundleId: config.BUNDLE_ID_PACKAGE_NAME
        },
        // navigation: {
        //     forcedRedirectEnabled: true
        // }
    });

    try {
        const shareAction = await share("Share " + name, link)
        handleShareAction(shareAction, 'application', Platform.OS)
    }
    catch (e) {
        e && console.log("share error ", e);
    }

}

export const getDisplayName = (user: {
    username: string,
    first_name: string,
    last_name: string,
    account_deleted: number,
    active: number,
}, showRealName: boolean = false) => {
    const { username, first_name, last_name, account_deleted = 0 } = user ?? {}
    const realName = ((first_name || "") + (last_name ? (" " + last_name) : ""))
    return (
        // account_deleted ? Language?.getString("deleted_user") :
        showRealName ? realName : (username || realName))
}

export const mergeMessageObjects = (chats: Array<any>, total_likes: Array<any>, like_by_me: Array<any>) => {
    return chats;
    const map = new Map();
    chats.forEach(item => map.set(item._id, item));
    total_likes?.length && total_likes?.forEach(item => map.set(item._id, { ...map.get(item._id), message_total_likes_count: item?.total_likes }));
    like_by_me?.length && like_by_me?.forEach(item => map.set(item.message_id, { ...map.get(item.message_id), is_message_liked_by_me: true }));
    return Array.from(map.values());
}

export const _showToast = (message: string, duration: 'SHORT' | 'LONG' = 'SHORT', gravity: 'TOP' | 'BOTTOM' | 'CENTER' = 'BOTTOM') => {
    Toast.showWithGravity(message, Toast?.[duration], Toast?.[gravity]);
}

export const openLink = async (url: string, options: any = {}) => {
    try {
        if (await InAppBrowser.isAvailable()) {
            try {
                InAppBrowser.close()
            }
            catch (e) {
                console.log(e)
            }
            InAppBrowser.open(url, {
                // iOS Properties
                dismissButtonStyle: 'close',
                preferredBarTintColor: 'white',
                preferredControlTintColor: colors.colorBlackText,
                readerMode: false,
                animated: true,
                modalPresentationStyle: 'fullScreen',
                modalTransitionStyle: 'coverVertical',
                modalEnabled: true,
                enableBarCollapsing: false,
                // Android Properties
                showTitle: true,
                toolbarColor: 'white',
                secondaryToolbarColor: colors.colorBlackText,
                hasBackButton: true,
                navigationBarColor: colors.colorBlackText,
                navigationBarDividerColor: 'white',
                enableUrlBarHiding: true,
                enableDefaultShare: true,
                forceCloseOnRedirection: false,
                showInRecents: true,
                // Specify full animation resource identifier(package:anim/name)
                // or only resource name(in case of animation bundled with app).
                animations: {
                    startEnter: 'slide_in_right',
                    startExit: 'slide_out_left',
                    endEnter: 'slide_in_left',
                    endExit: 'slide_out_right'
                },
                headers: {},
                ...options
            })
        }
        else Linking.openURL(url)
    } catch (error: any) {
        _showErrorMessage(error?.message)
    }
}

export const getCityOnly = (city?: string, state?: string, country?: string) => {
    return city?.trim() || state?.trim() || country?.trim() || ""
}

export const getQueryVariables = (url: string) => {
    let params: any = {}, match
    try {
        while (match = urlRegx.exec(url)) {
            params[match[1]] = match[2];
        }
    }
    catch (e) {
        console.log("Regx error", e);
    }
    return params
}

export const getChatUsers = (users: Array<any>) => {
    const user = Database.getStoredValue("userData");
    return {
        chatUser: users?.find(_ => _?._id != user?._id),
        loggedInUser: user
    }
}

const getLanguageString = (language: LanguageType) => {
    switch (language) {
        case 'en':
            return "English";
        case 'es':
            return "Español (Spanish)"
    }
}
