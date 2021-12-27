const fs = require('fs');

const data = [
    {
        file: 'node_modules/react-native-mmkv-storage/android/build.gradle',
        replacements: [
            {
                remove: `com.scottyab:secure-preferences-lib:0.1.4`,
                add: `androidx.security:security-crypto:1.1.0-alpha03`
            }
        ]
    },
    {
        file: "node_modules/react-native-mmkv-storage/android/src/main/java/com/ammarahmed/mmkv/SecureKeystore.java",
        replacements: [{
            remove: `prefs = new SecurePreferences(reactApplicationContext, (String) null, "e4b001df9a082298dd090bb7455c45d92fbd5ddd.xml");`,
            add: `String fileName = "e4b001df9a082298dd090bb7455c45d92fbd5ddd";
                try {
                    MasterKey.Builder keyBuilder = new MasterKey.Builder(reactApplicationContext);
                    keyBuilder.setKeyScheme(MasterKey.KeyScheme.AES256_GCM);
                    MasterKey key = keyBuilder.build();
                    prefs = EncryptedSharedPreferences.create(reactApplicationContext,fileName,key,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV, EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM);
        
                } catch (GeneralSecurityException | IOException e) {
                    e.printStackTrace();
                    prefs = reactContext.getSharedPreferences(fileName,Context.MODE_PRIVATE);
                }`
        },
        {
            remove: `import com.securepreferences.SecurePreferences;`,
            add: `import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;`
        }
        ]
    }
]

data.forEach(({ file, replacements }) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            return console.log(err);
        }
        replacements.some(({ remove, add }, i) => {
            data = data.replace(remove, add);
        });
        fs.writeFile(file, data, 'utf8', (err) => {
            if (err) return console.log(err);
        });
    })
})

