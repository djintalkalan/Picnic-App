#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

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


#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
 [RollbarReactNative initWithAccessToken:ROLLBAR_CLIENT_ITEM_ACCESS_TOKEN];
 [FIRApp configure];
 [GMSServices provideAPIKey:GOOGLE_MAP_API_KEY]; // add this line using the api key obtained from Google Console

#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

  NSDictionary *appProperties = [RNFBMessagingModule addCustomPropsToUserProps:nil withLaunchOptions:launchOptions];


  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"Picnic"
                                            initialProperties:appProperties];

  // if (@available(iOS 13.0, *)) {
  //     rootView.backgroundColor = [UIColor systemBackgroundColor];
  // } else {
  //     rootView.backgroundColor = [UIColor whiteColor];
  // }

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];


  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  if(@available(iOS 13.0,*)){
    rootView.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
  }
  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
