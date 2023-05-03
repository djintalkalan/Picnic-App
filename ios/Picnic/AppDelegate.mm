#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

//Code push
#import <CodePush/CodePush.h>

// Map
#import <GoogleMaps/GoogleMaps.h>

// Splash Screen
#import "RNBootSplash.h"

// ENV
#import <react-native-ultimate-config/ConfigValues.h>

//Firebase
#import <Firebase.h>
#import "RNFBMessagingModule.h"

//Rollbar
#import <RollbarReactNative/RollbarReactNative.h>

// Intercomm
#import <IntercomModule.h>


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  #if DEBUG
      
  #else
    BOOL isDevType = [APP_TYPE isEqualToString:@"dev"];
    if(!isDevType){
      RollbarConfiguration *config = [RollbarConfiguration configuration];
      config.environment = [APP_TYPE isEqualToString:@"dev"]? @"development" : APP_TYPE;
      [RollbarReactNative initWithAccessToken:ROLLBAR_CLIENT_ITEM_ACCESS_TOKEN configuration:config];
    }
  #endif
  [FIRApp configure];
  [GMSServices provideAPIKey:GOOGLE_MAP_API_KEY];

  self.moduleName = @"Picnic";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.

  NSDictionary *appProperties = [RNFBMessagingModule addCustomPropsToUserProps:nil withLaunchOptions:launchOptions];

  self.initialProps = appProperties;

  [super application:application didFinishLaunchingWithOptions:launchOptions];
  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:self.window.rootViewController.view];
  [IntercomModule initialize:INTERCOM_API_KEY withAppId:INTERCOM_APP_ID];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [CodePush bundleURL]; // return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return true;
}

@end
