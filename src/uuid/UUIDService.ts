
import Clipboard from '@react-native-community/clipboard';
import { differenceInSeconds } from 'date-fns';
import { MMKVLoader } from 'react-native-mmkv-storage';
import uuid from 'react-native-uuid';

const uuidStorage = new MMKVLoader().withEncryption().withInstanceID("uuidStorage").initialize();

let totalClicked = 0;
let lastClickedAt = new Date();

const retrieveToken = async () => {
    console.log("Retrieving Token");
    const token = await uuidStorage.getStringAsync('uuid');
    if (token) return token
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
    uuidStorage.setStringAsync('uuid', newToken);
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