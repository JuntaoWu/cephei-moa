//
//  UserInfo.h
//  moa-client_ios_hybrid
//
//  Created by LuoYong on 2018/11/26.
//  Copyright © 2018年 egret. All rights reserved.
//
#import <UIKit/UIKit.h>

#ifndef UserInfo_h
#define UserInfo_h

@interface UserInfo : NSObject
{
    
}

+ (id)load: (NSString *)service;

+ (void)save: (NSString *)key Value:(NSString *)value;

@end

#endif /* UserInfo_h */
