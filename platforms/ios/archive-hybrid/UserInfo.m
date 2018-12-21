//
//  UserInfo.m
//  moa-client_ios_hybrid
//
//  Created by LuoYong on 2018/11/26.
//  Copyright © 2018年 egret. All rights reserved.
//

#import "UserInfo.h"

@implementation UserInfo

+ (id)load:(NSString *)service {
    id ret = nil;
    NSMutableDictionary *keyChainQuery = [self getKeychainQuery:service];
    [keyChainQuery setObject:(id)kCFBooleanTrue forKey:(id)kSecReturnData];
    [keyChainQuery setObject:(id)kSecMatchLimitOne forKey:(id)kSecMatchLimit];
    
    CFDataRef keyData = NULL;
    if(SecItemCopyMatching((CFDictionaryRef)keyChainQuery, (CFTypeRef *)&keyData) == noErr) {
        @try {
            ret = [NSKeyedUnarchiver unarchiveObjectWithData:(__bridge NSData *)keyData];
        } @catch (NSException *exception) {
            NSLog(@"Unarchive of %@ failed: %@", service, exception);
        } @finally {
            
        }
    }
    if (keyData) {
        CFRelease(keyData);
    }
    return ret;
}

+ (void)save:(NSString *)key Value:(NSString *)value {
    int ret = 0;
    NSMutableDictionary *keyChainQuery = [self getKeychainQuery:key];
    
    CFDataRef keyData = NULL;
    if(SecItemCopyMatching((CFDictionaryRef)keyChainQuery, (CFTypeRef *)&keyData) == noErr) {
        @try {
            NSMutableDictionary *attributesToUpdate = [NSMutableDictionary dictionary];
            attributesToUpdate[(__bridge id)kSecValueData] = [value dataUsingEncoding:NSUTF8StringEncoding];
            
            OSStatus status = SecItemUpdate((__bridge CFDictionaryRef)keyChainQuery, (__bridge CFDictionaryRef)attributesToUpdate);
            NSLog(@"Error Code: %d", (int)status);
            ret = (int)status;
        } @catch (NSException *exception) {

        } @finally {
            
        }
    }
    else {
        NSLog(@"Unable to find your key, %@", key);
        keyChainQuery[(__bridge id)kSecValueData] = [value dataUsingEncoding:NSUTF8StringEncoding];
        
        OSStatus status = SecItemAdd((__bridge CFDictionaryRef)keyChainQuery, NULL);

        NSLog(@"Error Code: %d", (int)status);
        ret = (int)status;
    }
}
    
+ (NSMutableDictionary *)getKeychainQuery:(NSString *)service {
    return [NSMutableDictionary dictionaryWithObjectsAndKeys:(id)kSecClassGenericPassword,
            (id)kSecClass,
            service,
            (id)kSecAttrService,
            service,
            (id)kSecAttrAccount,
            (id)kSecAttrAccessibleAfterFirstUnlock,
            (id)kSecAttrAccessible,
            nil];
}


@end
