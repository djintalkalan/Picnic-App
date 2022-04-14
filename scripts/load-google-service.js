const fs = require('fs');
if (process.argv?.length < 3) {
    console.log("Please define flavor like:\n staging \n production \n beta\n");
    process.exit()
}
console.log("Adding GoogleService-Info.plist in ios project");
const appType = process.argv[process.argv?.length - 1] // staging | production | beta
const source = __dirname.replace("/scripts", "") + "/ios/GoogleServices/" + appType + "/GoogleService-Info.plist"
const destination = __dirname.replace("/scripts", "") + "/ios/GoogleService-Info.plist"
console.log("flavor", appType);
try {
    console.log("Deleting old file");
    fs.unlinkSync(destination);
}
catch (e) {
    console.log("Old file not found.... Skipping delete");
}
console.log("Writing new file");
try {
    fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
    console.log("GoogleService-Info.plist successfully loaded");
}
catch (e) {
    if (e?.message?.includes("no such file or directory")) {
        console.error("Loading Error:\n GoogleService-Info.plist not found in project \n Please add your GoogleService-Info.plist file in respective flavor folder")
    }
}

