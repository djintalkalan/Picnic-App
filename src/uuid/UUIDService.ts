
import { ACCESSIBLE, getGenericPassword as GetGenericPasswordFromKeyChain, setGenericPassword as SetGenericPasswordFromKeyChain } from 'react-native-keychain';
import uuid from 'react-native-uuid';
import { config } from 'src/api/config';

import Clipboard from '@react-native-community/clipboard';
import { differenceInSeconds } from 'date-fns';


let totalClicked = 0;
let lastClickedAt = new Date();

const retrieveToken = async () => {
    console.log("Retrieving Token");
    const genericCredentials = await GetGenericPasswordFromKeyChain({ service: config.BUNDLE_ID_PACKAGE_NAME, accessible: ACCESSIBLE.AFTER_FIRST_UNLOCK }).catch((e) => {
        console.log("Error in getting password from KeyChain")
    })

    if (genericCredentials && genericCredentials?.service == config.BUNDLE_ID_PACKAGE_NAME && genericCredentials?.username == config.BUNDLE_ID_PACKAGE_NAME && genericCredentials?.password) {
        console.log("uuid is ", genericCredentials?.password);
        return genericCredentials?.password
    }
    console.log("Generating new Token");
    let newToken = 'tokenNotGenerated'
    try {
        newToken = uuid?.v4()?.toString();
    }
    catch (e) {
        console.log("Error generating new Token")
        console.log(e)
    }
    console.log("New Token is ", newToken);
    await SetGenericPasswordFromKeyChain(config.BUNDLE_ID_PACKAGE_NAME, newToken, { service: config.BUNDLE_ID_PACKAGE_NAME, accessible: ACCESSIBLE.AFTER_FIRST_UNLOCK }).catch(e => {
        console.log("Error setting uuid in the KeyChain")
        console.log(e)
    })
    return newToken
}

let UUID = ''

setTimeout(() => {
    retrieveToken().then(_ => {
        UUID = _
    });
}, 500);

const showUUIDToast = () => {
    if (differenceInSeconds(new Date(), lastClickedAt)) {
        totalClicked = 1;
    } else {
        totalClicked++;
    }
    lastClickedAt = new Date();
    if (totalClicked > 9) {
        // _showToast(uuid, 'SHORT');
        Clipboard.setString(UUID);
        totalClicked = 0;
    }
}

const getUUID = () => UUID;

export default {
    getUUID,
    showUUIDToast
}