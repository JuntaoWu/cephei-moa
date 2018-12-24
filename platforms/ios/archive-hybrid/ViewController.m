#import "ViewController.h"
#import "ZipArchive.h"
#import "WXApi.h"
#import "UserInfo.h"

@interface ViewController ()

@end

@implementation ViewController {
    NSString* _zipName;
    NSString* _host;
    NSString* _gameUrl;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    _zipName = @"game.zip";
    _host = @"http://localhost/game/";
    _gameUrl = [_host stringByAppendingString:@"index.html"];
    NSString* zipFilePath = [[NSBundle mainBundle] pathForResource:_zipName ofType:nil];
    
    [EgretWebViewLib initialize:@"/egretGame/preload/"];
    
    [self setExternalInterfaces];
    
    if ([EgretWebViewLib checkLoaded:zipFilePath Host:_host]) {
        [EgretWebViewLib startLocalServer];
        [EgretWebViewLib startGame:_gameUrl SuperView:self.view];
    } else {
        ZipFileLoader* loader = [EgretWebViewLib createZipFileLoader:zipFilePath Host:_host Delegate:self];
        [loader start];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)setExternalInterfaces {
    [EgretWebViewLib setExternalInterface:@"sendToNative" Callback:^(NSString* msg) {
        NSLog(@"message: %@", msg);
        [EgretWebViewLib callExternalInterface:@"sendToJS" Value:@"message from native"];
    }];
    
    [EgretWebViewLib setExternalInterface:@"sendWxLoginToNative" Callback:^(NSString* msg) {
        NSLog(@"message: %@", msg);
        SendAuthReq* req = [[SendAuthReq alloc]init];
        req.scope = @"snsapi_userinfo";
        req.state = @"123";
        
        [WXApi sendReq:req];
    }];
    
    [EgretWebViewLib setExternalInterface:@"getSecurityStorageAsync" Callback:^(NSString* msg) {
        NSLog(@"getSecurityStorageAsync message: %@", msg);
        
        id ret = [UserInfo load:msg];
        NSString *value = (NSString *)ret;
        if(value == nil) {
            value = @"";
        }
        NSLog(@"getSecurityStorageAsync completed: %@", value);
        [EgretWebViewLib callExternalInterface:@"getSecurityStorageAsyncCallback" Value:value];
    }];
    
    [EgretWebViewLib setExternalInterface:@"setSecurityStorageAsync" Callback:^(NSString* msg) {
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
    
    [EgretWebViewLib setExternalInterface:@"sendShowToastToNative" Callback:^(NSString* msg) {
        NSLog(@"sendShowToastToNative message: %@", msg);
        
        UIAlertController *alert = [UIAlertController alertControllerWithTitle:nil message:msg preferredStyle:UIAlertControllerStyleAlert];
        
        [self presentViewController:alert animated:YES completion:nil];
        
        int duration = 1;
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(duration * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [alert dismissViewControllerAnimated:YES completion:nil];
        });
    }];
}

- (void)onStart:(long)fileCount Size:(long)totalSize {
    NSLog(@"onStart %ld %ld", fileCount, totalSize);
}

- (void)onProgress:(NSString*)filePath Loaded:(long)loaded Error:(long)error Total:(long)total {
    NSLog(@"onProgress %@ %ld %ld %ld", @"", loaded, error, total);
}

- (void)onError:(NSString*)urlStr Msg:(NSString*)errMsg {
    NSLog(@"onError %@ %@", urlStr, errMsg);
}

- (void)onStop {
    NSLog(@"onStop");
    
    __block NSString* gameUrl = _gameUrl;
    dispatch_async(dispatch_get_main_queue(), ^{
        [EgretWebViewLib startLocalServer];
        [EgretWebViewLib startGame:gameUrl SuperView:self.view];
    });
}

- (bool)onUnZip:(NSString*)zipFilePath DstDir:(NSString*)dstDir {
    ZipArchive* zip = [[ZipArchive alloc] init];
    if (![zip UnzipOpenFile:zipFilePath]) {
        NSLog(@"failed to open zip file");
        return false;
    }
    
    bool result = [zip UnzipFileTo:dstDir overWrite:YES];
    if (!result) {
        NSLog(@"failed to unzip files");
        return false;
    }
    [zip UnzipCloseFile];
    return true;
}

@end
