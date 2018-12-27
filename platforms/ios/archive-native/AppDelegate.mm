#import "AppDelegate.h"
#import "ViewController.h"
#import <EgretNativeIOS.h>
#import <Toast.h>

@implementation AppDelegate {
    EgretNativeIOS* _native;
    UIViewController* _viewController;
    UIImageView* _imageView;
}

const static NSString* appError = @"error";
// 加载首页失败
const static NSString* errorIndexLoadFailed = @"load";
// 启动引擎失败
const static NSString* errorJSLoadFailed = @"start";
// 引擎停止运行
const static NSString* errorJSCorrupted = @"stopRunning";
const static NSString* appState = @"state";
// 正在启动引擎
const static NSString* stateEngineStarted = @"starting";
// 引擎正在运行
const static NSString* stateEngineRunning = @"running";

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
 

    [WXApi registerApp:@"wxcf2407196cc520b7"];
    NSString* gameUrl = @"http://tool.egret-labs.org/Weiduan/game/index.html";
    
    _native = [[EgretNativeIOS alloc] init];
    _native.config.showFPS = false;
    _native.config.fpsLogTime = 30;
    _native.config.disableNativeRender = false;
    _native.config.clearCache = false;
    
    _viewController = [[ViewController alloc] initWithEAGLView:[_native createEAGLView]];
    if (![_native initWithViewController:_viewController]) {
        return false;
    }
    [self setExternalInterfaces];
    
    NSString* networkState = [_native getNetworkState];
    __block AppDelegate* thiz = self;
    
    __block bool isStarted = true;

    if ([networkState isEqualToString:@"NotReachable"]) {
        isStarted = false;
        
        __block EgretNativeIOS* native = _native;
        [self showLoadingView];
        [self showModal:@"蜂窝数据未连接" Message:@"请开启移动数据或使用WiFi联网进行游戏。"];
        
        [_native setNetworkStatusChangeCallback:^(NSString* state) {
            NSLog(@"NetworkStatus Change: %@", state);
            
            [native callExternalInterface:@"sendNetworkStatusChangeToJS" Value:[thiz getConnectivityStatus:state]];
            
            if (![state isEqualToString:@"NotReachable"]) {
                
                [thiz showToast:[thiz getConnectivityName:state]];
                if(!isStarted) {
                    dispatch_async(dispatch_get_main_queue(), ^{
                        [native startGame:gameUrl];
                    });
                    isStarted = true;
                }
            }
            else {
                [thiz showModal:@"蜂窝数据未连接" Message:@"请开启移动数据或使用WiFi联网进行游戏。"];
            }
        }];
        return true;
    }
    
    [_native setNetworkStatusChangeCallback:^(NSString* state) {
        NSLog(@"NetworkStatus Change: %@", state);
        
        [_native callExternalInterface:@"sendNetworkStatusChangeToJS" Value:[thiz getConnectivityStatus:state]];
        
        if (![state isEqualToString:@"NotReachable"]) {
            [thiz showToast:[thiz getConnectivityName:state]];
        }
        else {
            [thiz showModal:@"蜂窝数据未连接" Message:@"请开启移动数据或使用WiFi联网进行游戏。"];
        }
    }];
    
    [_native startGame:gameUrl];
    
    return true;
}

- (NSString *)getConnectivityStatus:state {
    if ([state isEqualToString:@"NotReachable"] ) {
        return @"0";
    }
    return @"1";
}

- (NSString *)getConnectivityName:state {
    if([state isEqualToString:@"ReachableViaWiFi"]) {
        return @"Wi-Fi已连接";
    }
    else if ([state isEqualToString:@"ReachableViaWWAN"]) {
        return @"移动数据已连接";
    }
    else {
        return @"当前网络未连接";
    }
}

- (void)showLoadingView {
    _imageView = [[UIImageView alloc] initWithFrame:_viewController.view.frame];
    [_imageView setImage:[UIImage imageNamed:@"background"]];
    [_viewController.view addSubview:_imageView];
    [_viewController.view bringSubviewToFront:_imageView];
}

- (void)hideLoadingView {
    [_imageView removeFromSuperview];
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    
    [_native pause];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
    
    [_native resume];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    // Saves changes in the application's managed object context before the application terminates.
}

// according to the error msg, do different action
- (void)handleErrorEvent:(NSString*)error {
    if ([errorIndexLoadFailed isEqualToString:error]) {
        NSLog(@"errorIndexLoadFailed");
    } else if ([errorJSLoadFailed isEqualToString:error]) {
        NSLog(@"errorJSLoadFailed");
    } else if ([errorJSCorrupted isEqualToString:error]) {
        NSLog(@"errorJSCorrupted");
    }
}

// according to the state msg, do different action
- (void)handleStateEvent:(NSString*)state {
    if ([stateEngineStarted isEqualToString:state]) {
        NSLog(@"stateEngineStarted");
    } else if ([stateEngineRunning isEqualToString:state]) {
        NSLog(@"stateEngineRunning");
        [self hideLoadingView];
    }
}

- (void)showModal:(NSString *)title Message:(NSString *)message {
    NSString *confirmText = @"OK";
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:title message:message preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction *okAction = [UIAlertAction actionWithTitle:confirmText
                                                       style:UIAlertActionStyleDefault
                                                       handler: ^(UIAlertAction *action) {
                                                           NSLog(@"OK choosed");
                                                       }];
    [alert addAction:okAction];
    
    UIViewController *hostVC = [UIApplication sharedApplication].keyWindow.rootViewController;
    while (hostVC.presentedViewController) {
        hostVC = hostVC.presentedViewController;
    }
    [hostVC presentViewController:alert animated:YES completion:nil];
}

- (void)showToast:(NSString*)msg {
    
    //UIAlertController *alert = [UIAlertController alertControllerWithTitle:nil message:msg preferredStyle:UIAlertControllerStyleAlert];
    
    UIViewController *hostVC = [UIApplication sharedApplication].keyWindow.rootViewController;
    
    while (hostVC.presentedViewController) {
        hostVC = hostVC.presentedViewController;
    }
    [hostVC.view hideAllToasts];
    [hostVC.view makeToast:msg];
    //[hostVC presentViewController:alert animated:YES completion:nil];
    
    //int duration = 1;
    //dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(duration * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        //[alert dismissViewControllerAnimated:YES completion:nil];
    //});
}

- (void)hideToast {
    UIViewController *hostVC = [UIApplication sharedApplication].keyWindow.rootViewController;
    
    while (hostVC.presentedViewController) {
        hostVC = hostVC.presentedViewController;
    }
    [hostVC.view hideAllToasts];
}

- (void)setExternalInterfaces {

    __block EgretNativeIOS* support = _native;
    __block AppDelegate* thiz = self;
    
    [_native setExternalInterface:@"@onError" Callback:^(NSString* message) {
        NSString* str = @"Native get onError message: ";
        
        NSData* jsonData = [message dataUsingEncoding:NSUTF8StringEncoding];
        NSError* err;
        NSDictionary* dic = [NSJSONSerialization JSONObjectWithData:jsonData
                                                            options:NSJSONReadingMutableContainers
                                                              error:&err];
        if (err) {
            NSLog(@"onError message failed to analyze");
            return;
        }
        
        NSString* error = [dic objectForKey:appError];
        [thiz handleErrorEvent:error];
        
        str = [str stringByAppendingString:error];
        NSLog(@"%@", str);
    }];
    
    [_native setExternalInterface:@"@onState" Callback:^(NSString* message) {
        NSString* str = @"Native get onState message: ";
        
        NSData* jsonData = [message dataUsingEncoding:NSUTF8StringEncoding];
        NSError* err;
        NSDictionary* dic = [NSJSONSerialization JSONObjectWithData:jsonData
                                                            options:NSJSONReadingMutableContainers
                                                              error:&err];
        if (err) {
            NSLog(@"onState message failed to analyze");
            return;
        }
        
        NSString* state = [dic objectForKey:appState];
        [thiz handleStateEvent:state];
        
        str = [str stringByAppendingString:state];
        NSLog(@"%@", str);
    }];
    
    [_native setExternalInterface:@"sendToNative" Callback:^(NSString* message) {
        NSString* str = @"Native get message: ";
        str = [str stringByAppendingString:message];
        NSLog(@"%@", str);
        [support callExternalInterface:@"sendToJS" Value:str];
    }];
    
    [_native setExternalInterface:@"sendWxLoginToNative" Callback:^(NSString* msg) {
        NSLog(@"message: %@", msg);
        SendAuthReq* req = [[SendAuthReq alloc]init];
        req.scope = @"snsapi_userinfo";
        req.state = @"123";
        
        [WXApi sendReq:req];
    }];
    
    [_native setExternalInterface:@"getSecurityStorageAsync" Callback:^(NSString* msg) {
        NSLog(@"getSecurityStorageAsync message: %@", msg);
        
        id ret = [UserInfo load:msg];
        NSString *value = (NSString *)ret;
        if(value == nil) {
            value = @"";
        }
        NSLog(@"getSecurityStorageAsync completed: %@", value);
        [support callExternalInterface:@"getSecurityStorageAsyncCallback" Value:value];
    }];
    
    [_native setExternalInterface:@"setSecurityStorageAsync" Callback:^(NSString* msg) {
        NSLog(@"setSecurityStorageAsync message: %@", msg);
        
        NSData* jsonData = [msg dataUsingEncoding:NSUTF8StringEncoding];
        NSError* jsonError;
        NSDictionary *jsonObject = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
        
        if(jsonObject != nil) {
            
            NSString *key = [jsonObject objectForKey:@"key"];
            NSString *value = [jsonObject objectForKey:@"value"];
            
            [UserInfo save:key Value:value];
        }
        
        NSLog(@"setSecurityStorageAsync completed.");
    }];
    
    [_native setExternalInterface:@"sendShowModalToNative" Callback:^(NSString* msg) {
        NSLog(@"sendShowModalToNative message: %@", msg);
        
        NSData* jsonData = [msg dataUsingEncoding:NSUTF8StringEncoding];
        NSError* jsonError;
        NSDictionary *jsonObject = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
        
        if(jsonObject != nil) {
            
            NSString *message = [jsonObject objectForKey:@"message"];
            NSString *confirmText = [jsonObject objectForKey:@"confirmText"];
            NSString *cancelText = [jsonObject objectForKey:@"cancelText"];
            
            UIAlertController *alert = [UIAlertController alertControllerWithTitle:nil message:message preferredStyle:UIAlertControllerStyleAlert];
            
            UIAlertAction *okAction = [UIAlertAction actionWithTitle:confirmText
                                        style:UIAlertActionStyleDefault
                                        handler: ^(UIAlertAction *action) {
                                            NSLog(@"OK choosed");
                                            [support callExternalInterface:@"sendShowModalResultToJS" Value:@"confirm"];
                                        }];
            
            UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:cancelText
                                           style:UIAlertActionStyleDefault
                                         handler: ^(UIAlertAction *action) {
                                             NSLog(@"Cancel choosed");
                                             [support callExternalInterface:@"sendShowModalResultToJS" Value:@""];
                                         }];
            
            [alert addAction:okAction];
            if(cancelText != nil && ![cancelText isEqualToString:@""]) {
                [alert addAction:cancelAction];
            }
            
            UIViewController *hostVC = [UIApplication sharedApplication].keyWindow.rootViewController;
            while (hostVC.presentedViewController) {
                hostVC = hostVC.presentedViewController;
            }
            [hostVC presentViewController:alert animated:YES completion:nil];
        }
        
        NSLog(@"sendShowModalToNative completed.");
    }];
    
    [_native setExternalInterface:@"sendShowToastToNative" Callback:^(NSString* msg) {
        NSLog(@"sendShowToastToNative message: %@", msg);
        
        [thiz showToast:msg];
    }];
    
    [_native setExternalInterface:@"sendHideToastToNative" Callback:^(NSString* msg) {
        NSLog(@"sendShowToastToNative message: %@", msg);

        [thiz hideToast];
    }];
    
    [_native setExternalInterface:@"sendOpenExternalLinkToNative" Callback:^(NSString* msg) {
        NSLog(@"sendOpenExternalLinkToNative message: %@", msg);
        
        NSURL *url = [NSURL URLWithString:msg];
        
        if([[UIApplication sharedApplication] respondsToSelector:@selector(openURL:options:completionHandler:)]) {
            [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:NULL];
        }
        else {
            [[UIApplication sharedApplication] openURL:url];
        }
    }];
}

- (void)dealloc {
    [_native destroy];
}

- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url {
    return [WXApi handleOpenURL:url delegate:(id)self];
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    return [WXApi handleOpenURL:url delegate:(id)self];
}

- (void)onReq:(BaseReq *)req {
    
}

- (void)onResp:(BaseResp *)resp {
    NSLog(@"sendAuth onResp");
    
    if([resp isKindOfClass:[SendAuthResp class]]) {
        SendAuthResp *authResp = (SendAuthResp*)resp;
        if(authResp.code != nil) {
            __block EgretNativeIOS* support = _native;
            
            [support callExternalInterface:@"sendWxLoginCodeToJS" Value:authResp.code];
        }
    }
    else if([resp isKindOfClass:[SendMessageToWXResp class]]) {
        NSString *strTitle = [NSString stringWithFormat:@"Received result"];
        NSString *strMsg = [NSString stringWithFormat:@"errCode:%d", resp.errCode];
        __block EgretNativeIOS* support = _native;
        
        [support callExternalInterface:@"sendWxLoginCodeToJS" Value:strMsg];
    }
}

@end
