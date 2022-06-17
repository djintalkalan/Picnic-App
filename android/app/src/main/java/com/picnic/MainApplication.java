package com.picnic;

import androidx.multidex.MultiDexApplication;
import android.content.Context;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import com.reactnativeultimateconfig.UltimateConfigModule;
import com.facebook.react.bridge.JSIModulePackage;
import com.rollbar.RollbarReactNative;
import com.intercom.reactnative.IntercomModule;


public class MainApplication extends MultiDexApplication implements ReactApplication {

    private final ReactNativeHost mReactNativeHost =
            new ReactNativeHost(this) {
                @Override
                public boolean getUseDeveloperSupport() {
                    return BuildConfig.DEBUG;
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
    if (!BuildConfig.DEBUG) {
        RollbarReactNative.init(this, BuildConfig.ROLLBAR_CLIENT_ITEM_ACCESS_TOKEN, BuildConfig.APP_TYPE == "dev" ? "development" : BuildConfig.APP_TYPE);
    }
    SoLoader.init(this, /* native exopackage */ false);
    UltimateConfigModule.setBuildConfig(BuildConfig.class);
    IntercomModule.initialize(this, BuildConfig.INTERCOM_API_KEY, BuildConfig.INTERCOM_APP_ID);
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

    /**
     * Loads Flipper in React Native templates. Call this in the onCreate method with something like
     * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
     *
     * @param context
     * @param reactInstanceManager
     */
    private static void initializeFlipper(
            Context context, ReactInstanceManager reactInstanceManager) {
        if (BuildConfig.DEBUG) {
            try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
                Class<?> aClass = Class.forName("picnic.ReactNativeFlipper");
                aClass
                        .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
                        .invoke(null, context, reactInstanceManager);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
        }
    }
}
