

import { config } from 'api';
import { ca } from 'date-fns/locale';
import LDClient from 'launchdarkly-react-native-client-sdk';

class FeatureFlagService {
    client: LDClient | undefined;
    readonly config: any;
    user: any;
    ready: Promise<boolean>

    constructor() {
        console.log("launchdarkly key: " + config.LAUNCH_DARKLY_KEY)
        this.config = {
            mobileKey: config.LAUNCH_DARKLY_KEY,
            debbugMode: true
        };

        // basically catch all for now
        this.user = {
            kind: 'user',
            key: 'all',
        };

        this.ready = new Promise(async (resolve, reject) => {
            console.log('Launch Darkly creating new LDClient')
            this.client = new LDClient();
            try {
                console.log('Launch Darkly configuring LDClient')
                await this.client.configure(this.config, this.user);
                console.log('Launch DarklyvLDClient configured');
            } catch (e) {
                console.log("error initializing launchdarkly: " + e)
            }
            resolve(true);
        });

    }

    async checkFlag(flag: string) {
        try {
            let res = await this.ready;
            console.log('Launch Darkly ready to checkFlag: ' + res)
            const booldata = await this.client?.boolVariation(flag, false);
            if (booldata) {
                return booldata
            }
            return false;
        } catch (e) {
            console.log("error checking flag: " + e)
            return false;
        }
    }

    async allFlags() {
        let res = await this.ready;
        console.log('Launch Darkly ready to allFlags: ' + res)
        const allFlagsResult = await this.client?.allFlags();
        return allFlagsResult;
    }
}

// TODO make the key used here an env var
export default new FeatureFlagService();