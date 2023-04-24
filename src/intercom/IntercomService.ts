
import Intercom from '@intercom/intercom-react-native';
import Database from 'database';
Intercom.setInAppMessageVisibility("GONE")

const updateUser = (userData: any) => {
    return Intercom.updateUser({
        email: userData?.email,
        userId: userData?._id,
        name: userData?.first_name + (userData?.last_name?.trim() ? (" " + userData?.last_name?.trim()) : ""),
        phone: userData?.phone_number,
        // languageOverride: userData?.language,
        // signedUpAt: 1621844451,
        // unsubscribedFromEmails: true,
    });
}

const IntercomService = {
    init: async () => {
        const userData = Database.getStoredValue("userData")
        const firebaseToken = Database.getStoredValue("firebaseToken")
        if (!userData) return
        Intercom.registerIdentifiedUser({ email: userData?.email, userId: userData?._id })
        firebaseToken && Intercom.sendTokenToIntercom(firebaseToken)
        await updateUser(userData)
        console.log("Intercom Initialized")
    },
    updateUser,
    logout: Intercom.logout,
    openMessenger: Intercom.displayMessenger,
}

export default IntercomService
