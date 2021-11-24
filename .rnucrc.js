// const fs = require('fs');

// module.exports = {
//   on_env: async function (env) {
//     fs.writeFileSync(
//       'android/app/src/main/res/values/strings.xml',
//       `<resources>
//       <string name="app_name">RNStarter</string>
//       <string moduleConfig="true" name="CodePushDeploymentKey">${env['DEPLOYMENT_KEY_ANDROID']}</string>
//       <string name="appCenterCrashes_whenToSendCrashes" moduleConfig="true" translatable="false">DO_NOT_ASK_JAVASCRIPT</string>
//       <string name="appCenterAnalytics_whenToEnableAnalytics" moduleConfig="true" translatable="false">ALWAYS_SEND</string>
// </resources>`,
//     );
//     fs.writeFileSync(
//       'android/app/src/main/assets/appcenter-config.json',
//       `{
//         "app_secret": "${env['APPSECRET_ANDROID']}"
// }
//       `,
//     );
//   },
// };
