package com.picnic;

import androidx.multidex.MultiDexApplication;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

import java.util.List;

import com.reactnativeultimateconfig.UltimateConfigModule;
import com.facebook.react.bridge.JSIModulePackage;
import com.rollbar.RollbarReactNative;
import com.intercom.reactnative.IntercomModule;

// Code Push
import com.microsoft.codepush.react.CodePush;



public class MainApplication extends MultiDexApplication implements ReactApplication {

    private final ReactNativeHost mReactNativeHost =
            new DefaultReactNativeHost(this) {
                @Override
                public boolean getUseDeveloperSupport() {
                    return BuildConfig.DEBUG;
                }

                @Override
                protected String getJSBundleFile() {
                    return CodePush.getJSBundleFile();
                }

                @Override
                protected List<ReactPackage> getPackages() {
                    @SuppressWarnings("UnnecessaryLocalVariable")
                    List<ReactPackage> packages = new PackageList(this).getPackages();
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    // packages.add(new MyReactNativePackage());
                    return packages;
                }

                @Override
                protected String getJSMainModuleName() {
                    return "index";
                }

                @Override
                protected boolean isNewArchEnabled() {
                return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
                }
                @Override
                protected Boolean isHermesEnabled() {
                return BuildConfig.IS_HERMES_ENABLED;
                }

                @Override
                protected JSIModulePackage getJSIModulePackage() {
                    return new CustomMMKVJSIModulePackage();
                }

            };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

  @Override
  public void onCreate() {
    super.onCreate();
    if (!BuildConfig.DEBUG && !BuildConfig.APP_TYPE.equals("dev")) {
        RollbarReactNative.init(this, BuildConfig.ROLLBAR_CLIENT_ITEM_ACCESS_TOKEN, BuildConfig.APP_TYPE);
    }
    SoLoader.init(this, /* native exopackage */ false);
    UltimateConfigModule.setBuildConfig(BuildConfig.class);
    IntercomModule.initialize(this, BuildConfig.INTERCOM_API_KEY, BuildConfig.INTERCOM_APP_ID);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
 }
}
