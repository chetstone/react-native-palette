#import <Foundation/Foundation.h>
#import <GLKit/GLKit.h>
#import "RCTBridgeModule.h"

@interface RNPalette : NSObject <RCTBridgeModule>
- (void)extractColor: (UIImage*) image
    options:(NSDictionary *)options
    callback : (RCTResponseSenderBlock) callback;
@end
