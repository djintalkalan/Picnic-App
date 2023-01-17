
import dynamicLinks, { FirebaseDynamicLinksTypes } from '@react-native-firebase/dynamic-links';
import AnalyticService from 'analytics';
import { config } from 'api';
import { store } from 'app-store';
import { setLoadingAction } from 'app-store/actions';
import { colors } from 'assets';
import { IBottomMenu } from 'custom-components/BottomMenu';
import { IAlertType } from 'custom-components/PopupAlert';
import { TouchAlertType } from 'custom-components/TouchAlert';
import { format as FNSFormat } from 'date-fns';
import {
    // format as TZFormat, formatInTimeZone,
    utcToZonedTime, zonedTimeToUtc
} from 'date-fns-tz';
import { decode } from 'html-entities';
import moment from 'moment-timezone';
import { Keyboard, Linking, Platform } from 'react-native';
import Geocoder from 'react-native-geocoding';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import LaunchNVG, { LaunchNavigator as LType } from 'react-native-launch-navigator';
import Share from 'react-native-share';
import { ShareOpenResult } from 'react-native-share/lib/typescript/types';
import Toast from 'react-native-simple-toast';
import Database, { ILocation } from 'src/database/Database';
import Language, { LanguageType } from 'src/language/Language';
import { ALL_CURRENCIES, DEFAULT_CURRENCY, ICurrency, ICurrencyKeys, ICurrencyValues, REMOVED_CURRENCIES } from './Constants';
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

const logoUrl = 'https://is1-ssl.mzstatic.com/image/thumb/Purple122/v4/0e/fa/de/0efade76-c963-6e51-722b-2a0bfba89a3c/AppIcon-0-0-1x_U007emarketing-0-0-0-10-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/1024x1024bb.png'

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
    return Share.open({
        title, message,
        url,
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
    if (!dateString) return ""
    try {
        return dateFormat(stringToDate(dateString, fromFormat, delimiter), toFormat)
    }
    catch (e) {
        console.log("dateStringFormat Error", e)
        return dateString
    }
}
const getFormat = (toFormat: string) => {
    toFormat = toFormat.replace("YYYY", 'yyyy')
    toFormat = toFormat.replace("YYY", 'yyy')
    toFormat = toFormat.replace("YY", 'yy')
    toFormat = toFormat.replace("YY", 'yy')
    toFormat = toFormat.replace("DDD", 'ddd')
    toFormat = toFormat.replace("DD", 'dd')
    toFormat = toFormat.replace("D", 'd')
    toFormat = toFormat.replace("A", 'a')
    return toFormat
}
export const dateFormat = (date: Date, toFormat: string) => {
    if (!date) return ""
    try {
        toFormat = getFormat(toFormat);
        let locale;
        if (Language.getLanguage() == 'es') {
            locale = require('date-fns/locale/es')
        }
        // console.log("locale", locale);

        const formatted = FNSFormat(date, toFormat, { locale });
        // console.log("formatted", formatted);

        return formatted
    }
    catch (e) {
        console.log("dateFormat Error", e, date)
        return date && date?.toDateString()
    }
}

export const isNumeric = (value: any) => {
    return /^-?\d+$/.test(value);
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

export const _showTouchAlert = (data: TouchAlertType) => {
    Keyboard.dismiss()
    setTimeout(() => {
        StaticHolder.showTouchAlert(data)
    }, 0);
}

export const _hideTouchAlert = () => {
    StaticHolder.hideTouchAlert()
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

export const getImageUrl = (url: string, options: { width?: number, height?: number, type: 'users' | 'events' | 'groups' | 'messages' }) => {
    return config.IMAGE_URL + options?.type + "/" + url + "?width=" + (options?.width || "1000") + "&height=" + (options?.height || "")
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

export const formatAmountWithSymbol = (currency: string, amount: string) => {
    const symbol = getSymbol(currency)
    const price = formatAmount(currency, amount);
    console.log("symbol", symbol);
    console.log("price", price);
    return symbol + price
}

export const formatAmount = (currency: string, amount: string | number) => {
    try {
        if (!currency) currency = 'usd'
        else if (currency == 'mxn') currency = 'mxp'

        const activeLanguage = Language.getLanguage()
        // const currencyString = parseFloat("0").toLocaleString(activeLanguage, {
        //     currency: currency?.toUpperCase(),
        //     style: 'currency',
        // })

        // let price = parseFloat(amount?.toString()).toLocaleString(activeLanguage, {
        //     currency: currency?.toUpperCase(),
        // })

        // const search = activeLanguage == 'en' ? "0.00" : "0,00"

        // price = currencyString.replace(search, price)

        // return price

        const getLocale = (currency: string) => {
            switch (currency?.toUpperCase()) {
                case "GBP":
                    return 'en-GB'
                case "EUR":
                    return 'de'
                default:
                    return 'en-US'
            }
        }

        // return Intl.NumberFormat(getLocale(currency), {
        //     currency: currency?.toUpperCase(),
        //     style: 'currency',
        // }).format(parseFloat(amount?.toString()))
        return parseFloat(amount?.toString()).toLocaleString(getLocale(currency), {
            currency: currency?.toUpperCase(),
            style: 'currency',
        })
    }
    catch (e) {
        console.log("Error in format", e);
        return ""
    }

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

const buildLink = async (l: string, social?: FirebaseDynamicLinksTypes.DynamicLinkSocialParameters) => {
    const link = `${config.BASE_URL}/download${l}`
    const dynamicLink = await dynamicLinks().buildShortLink({
        link,
        domainUriPrefix: "https://" + config.DYNAMIC_LINK_DOMAIN,
        android: {
            packageName: config.BUNDLE_ID_PACKAGE_NAME,
            fallbackUrl: link
        },
        social: social,
        ios: {
            bundleId: config.BUNDLE_ID_PACKAGE_NAME,
            fallbackUrl: link
        },
        navigation: {
            forcedRedirectEnabled: true,
        }

    });
    return dynamicLink;
}

export const shareDynamicLink = async (name: string, { type, id, image }: { type: IDynamicType, id: string, image?: any }) => {
    try {
        store.dispatch(setLoadingAction(true))
        const t = type == 'event-detail' ? 'event' : 'group'
        const link = await buildLink("?t=" + type + "&i=" + id + "&l=" + Database.getStoredValue("selectedLanguage"), {
            descriptionText: Language.join_us_link,// Language?.checkout_this + " " + Language?.[t]?.toLowerCase() + " `" + name + "` " + Language?.here,
            title: "Picnic Groups",
            imageUrl: image || logoUrl
        })
        store.dispatch(setLoadingAction(false))
        const shareString = Language?.checkout_this + " " + Language?.[t]?.toLowerCase() + " `" + name + "` " + Language?.here + " : " + link
        setTimeout(async () => {
            try {
                const shareResult = await share("Share " + name, shareString)
                handleShareAction(shareResult, t, id)
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

const handleShareAction = (shareResult: ShareOpenResult | null, type: string, id: string) => {
    console.log("shareResult", shareResult);

    if (shareResult?.success) {
        AnalyticService.logShare(id, type, shareResult.message)
    }
}

export const shareAppLink = async (name: string) => {
    const link = `${config.BASE_URL}/download?l=${Database.getStoredValue("selectedLanguage")}`
    const dynamicLink = await dynamicLinks().buildShortLink({
        link,
        domainUriPrefix: "https://" + config.DYNAMIC_LINK_DOMAIN,
        android: {
            packageName: config.BUNDLE_ID_PACKAGE_NAME,
            fallbackUrl: link
        },
        social: {
            title: "Picnic Groups",
            descriptionText: Language.join_us_link,
            imageUrl: logoUrl,
        },
        ios: {
            bundleId: config.BUNDLE_ID_PACKAGE_NAME,
            fallbackUrl: link
        },
        navigation: {
            forcedRedirectEnabled: true
        }
    });

    const line = Language.picnic_share_line + '\n' + Language.download_app_here + " : " + dynamicLink

    try {
        const shareResult = await share("Share " + name, line)
        handleShareAction(shareResult, 'application', Platform.OS)
    }
    catch (e) {
        e && console.log("share error ", e);
    }

}

const getBase64FromUrl = async (url: string) => {
    const data = await fetch(url);
    const blob = await data.blob();
    // blob.Properties.ContentType = "image/png"
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve("data:image/png;base64," + (base64data as string)?.split('base64,')[1]);
        }
    });
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
            return "Español"
    }
}

export const getReadableTime = (date: Date) => {
    try {
        if (!date) return ""
        let hour = ((date?.getHours()) % 12 || 12) > 9 ? ((date?.getHours()) % 12 || 12) : '0' + ((date?.getHours()) % 12 || 12);
        let min = date?.getMinutes() > 9 ? date?.getMinutes() : '0' + date?.getMinutes();
        let isAMPM = date?.getHours() >= 12 ? 'PM' : 'AM'
        return hour + ':' + min + ' ' + isAMPM

    }
    catch (e) {
        console.log("getReadableTime e", e);

        return ""
    }
}

export const getReadableDate = (date: Date) => {
    try {
        if (!date) return ""

        return dateFormat(date, 'MMM DD, YYYY')

    }
    catch (e) {
        console.log("getReadableDate e", e);

        return ""
    }
}

export const getFreeTicketsInMultiple = (ticket_plans: any[] = []): {
    total_free_tickets: number,
    total_free_tickets_consumed: number
} => {
    if (ticket_plans?.length)
        return ticket_plans.reduce((prev, current) => {
            if ((prev?.total_free_tickets || 0) - (prev?.total_free_tickets_consumed || 0) > (current?.total_free_tickets || 0) - (current?.total_free_tickets_consumed || 0)) {
                return { total_free_tickets: prev?.total_free_tickets || 0, total_free_tickets_consumed: prev?.total_free_tickets_consumed || 0 }
            } else {
                return { total_free_tickets: current?.total_free_tickets || 0, total_free_tickets_consumed: current?.total_free_tickets_consumed || 0 }
            }
        })
    return {
        total_free_tickets: 0,
        total_free_tickets_consumed: 0
    }
}

export const getZonedDate = (timezone: string, ISODate?: Date | string) => {
    if (!ISODate) {
        ISODate = new Date()
    }
    if (!(ISODate instanceof Date)) {
        ISODate = new Date(ISODate)
    }
    let locale;
    if (Language.getLanguage() == 'es') {
        locale = require('date-fns/locale/es')
    }
    return utcToZonedTime(ISODate?.toISOString(), timezone, { locale });
}

export const getFromZonedDate = (timezone: string, zonedDate?: Date | string) => {
    if (!zonedDate) {
        zonedDate = new Date()
    }
    if (!(zonedDate instanceof Date)) {
        zonedDate = new Date(zonedDate)
    }
    let locale;
    if (Language.getLanguage() == 'es') {
        locale = require('date-fns/locale/es')
    }
    return zonedTimeToUtc(zonedDate, timezone, { locale })
}


export const dateFormatInSpecificZone = (iso: string | Date, timezone: string, format: string) => {

    // const esLocale = require('moment/dist/locale/es').default;
    // moment.updateLocale('es', esLocale);
    const es = moment(iso).locale(Language.getLanguage());

    // console.log("Locale is", es, moment.locale(), Language.getLanguage());

    return es.tz(timezone).format(format)?.replace('.', '')

    // return formatInTimeZone(iso, timezone, getFormat(format))
    // const zoned = getZonedDate(timezone, iso)
    // let locale;
    // if (Language.getLanguage() == 'es') {
    //     locale = require('date-fns/locale/es')
    // }
    // return TZFormat(zoned, getFormat(format), {
    //     timeZone: timezone,
    //     locale
    // })
}


export const calculateImageUrl = (image: string, images: any[] = []) => {
    if (!image) {
        return images?.find(_ => _?.type == 'image')?.name
    }
    return image
}

export const getSelectedCurrencyFromValue = (currency: ICurrencyValues | string): ICurrency => {
    if (REMOVED_CURRENCIES.includes(currency?.toLowerCase())) {
        return DEFAULT_CURRENCY
    }
    //@ts-ignore
    return ALL_CURRENCIES.find(_ => _?.value == currency?.toLowerCase()) || {}
}

export const getSelectedCurrencyFromText = (currency: ICurrencyKeys | string): ICurrency => {
    //@ts-ignore
    return ALL_CURRENCIES.find(_ => _?.text?.toLowerCase() == currency?.toLowerCase()) || {}
}


