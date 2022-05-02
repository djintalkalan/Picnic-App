package com.picnic; // <-- Replace with your package

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.intercom.reactnative.IntercomModule;

public class MainNotificationService extends FirebaseMessagingService {
  
  @Override public void onNewToken(String refreshedToken) {
    IntercomModule.sendTokenToIntercom(getApplication(), refreshedToken);
    //DO HOST LOGIC HERE
    }

  // public void onMessageReceived(RemoteMessage remoteMessage) {
  //   if (IntercomModule.isIntercomPush(remoteMessage)) {
  //     IntercomModule.handleRemotePushMessage(getApplication(), remoteMessage);
  //   } else {
  //     // HANDLE NON-INTERCOM MESSAGE
  //   }
  // }
}