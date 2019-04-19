#import <UIKit/UIKit.h>
#import <CoreData/CoreData.h>
#import "WxApi.h"
#import "WxApiObject.h"
#import "UserInfo.h"
#import <NIMSDK/NIMSDK.h>
#import "NIMKit.h"
#import "UIView+Toast.h"
#import "GMESDK/TMGEngine.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate, WXApiDelegate, NIMLoginManagerDelegate, ITMGDelegate>

@property (strong, nonatomic) UIWindow *window;

@property (strong, nonatomic) UINavigationController *navController;

@end
