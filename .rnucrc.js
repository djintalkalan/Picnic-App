const fs = require('fs');

module.exports = {
    js_override: true,
    on_env: async function ({ APP_TYPE, CODEPUSH_SECRET }) {
        const replaceData = {
            android: {
                source: `${__dirname}/android/app/google-services/${APP_TYPE}/google-services.json`,
                destination: `${__dirname}/android/app/google-services.json`,
                message: "Replacing google-services.json in android project"
            },
            ios: {
                source: `${__dirname}/ios/GoogleServices/${APP_TYPE}/GoogleService-Info.plist`,
                destination: `${__dirname}/ios/GoogleService-Info.plist`,
                message: "Replacing GoogleService-Info.plist in ios project"
            }
        }
        console.log("\n");
        console.log(`Environment ${APP_TYPE} \n`);

        for (const platform in replaceData) {
            const { source, destination } = replaceData[platform];
            let fileName = "google-services.json"
            if (platform == 'ios') {
                fileName = "GoogleService-Info.plist"
            }
            console.log(`Replacing ${fileName} in ${platform} project`);
            try {
                console.log(`Deleting old file ${fileName}`);
                fs.unlinkSync(destination);
            }
            catch (e) {
                console.log(`Old ${fileName} not found.... Skipping delete`);
            }
            console.log(`Writing new ${fileName}`);
            try {
                fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
                console.log(`${fileName} successfully loaded`);
            }
            catch (e) {
                if (e?.message?.includes("no such file or directory")) {
                    console.error(`Loading Error:\n ${fileName} not found in project \n Please add your ${fileName} file in respective environment folder`)
                }
            }
            console.log("\n");
        }

        // REPLACING APP CENTER DATA
        fs.writeFileSync(
            'android/app/src/main/assets/appcenter-config.json',
            `{\n "app_secret": "${CODEPUSH_SECRET?.android}"\n}`,
        );

    }

}

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
// };
