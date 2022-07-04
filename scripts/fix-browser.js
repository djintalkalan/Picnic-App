const fs = require('fs');

const replaced = `<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />`;
const replacement = ``;

const file = 'node_modules/react-native-inappbrowser-reborn/android/src/main/AndroidManifest.xml'

fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    // console.log("data", data);
    const result = data.replace(new RegExp(replaced, 'g'), replacement);
    fs.writeFile(file, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
});
