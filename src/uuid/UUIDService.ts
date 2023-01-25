
import Clipboard from '@react-native-community/clipboard';
import { differenceInSeconds } from 'date-fns';
import { MMKVInstance, MMKVLoader } from 'react-native-mmkv-storage';
import uuid from 'react-native-uuid';
var uuidStorage: MMKVInstance | null = new MMKVLoader().withEncryption().withInstanceID("uuidStorage").initialize();
let totalClicked = 0;
let lastClickedAt = new Date();
const retrieveToken = async () => {
    console.log("Retrieving UUID Token");
    const token = uuidStorage?.getString('uuid');
    if (token) return token
    console.log("Generating new UUID Token");
    let newToken = 'tokenNotGenerated'
    try {
        newToken = uuid?.v4()?.toString();
    }
    catch (e) {
        console.log("Error generating new UUID Token")
        console.log(e)
    }
    console.log("New UUID Token is ", newToken);
    uuidStorage?.setStringAsync('uuid', newToken).then(() => {
        uuidStorage = null;
    });
    return newToken
}

let UUID = ''
retrieveToken().then(_ => (UUID = _));
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