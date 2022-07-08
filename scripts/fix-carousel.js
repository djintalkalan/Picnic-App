const fs = require('fs');

const replaced = `<ScrollView`;
const replacement = `<ScrollView scrollEventThrottle={0}`;

const files = [
    'node_modules/react-native-looped-carousel/index.js',
];

files.forEach(file => {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        if (data.includes("scrollEventThrottle")) {
            return
        }
        // console.log("data", data);
        const result = data.replace(new RegExp(replaced, 'g'), replacement);
        fs.writeFile(file, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
});
