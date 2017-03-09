//
//  color-grabber.m
//

#import "color-grabber.h"
#import "RCTLog.h"
#import <AssetsLibrary/AssetsLibrary.h>

@implementation colorGrabber

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getColors:(NSString *)path callback:(RCTResponseSenderBlock)callback)
{

  NSURL* aURL = [NSURL URLWithString:path];
  ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];

  [library assetForURL:aURL resultBlock:^(ALAsset *asset) {
    UIImage  *image = [UIImage imageWithCGImage:[[asset defaultRepresentation] fullScreenImage] scale:0.5 orientation:UIImageOrientationUp];

    float dimension = 4;
    float flexibility = 5;
    float range = 40;

    // determine the colours in the image
    NSMutableArray * colours = [NSMutableArray new];
    CGImageRef imageRef = [image CGImage];
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    unsigned char *rawData = (unsigned char*) calloc(dimension * dimension * 4, sizeof(unsigned char));
    NSUInteger bytesPerPixel = 4;
    NSUInteger bytesPerRow = bytesPerPixel * dimension;
    NSUInteger bitsPerComponent = 8;
    CGContextRef context = CGBitmapContextCreate(rawData, dimension, dimension, bitsPerComponent, bytesPerRow, colorSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
    CGColorSpaceRelease(colorSpace);
    CGContextDrawImage(context, CGRectMake(0, 0, dimension, dimension), imageRef);
    CGContextRelease(context);

    float x = 0;
    float y = 0;
    for (int n = 0; n<(dimension*dimension); n++){

      int index = (bytesPerRow * y) + x * bytesPerPixel;
      int red   = rawData[index];
      int green = rawData[index + 1];
      int blue  = rawData[index + 2];
      int alpha = rawData[index + 3];
      NSArray * a = [NSArray arrayWithObjects:[NSString stringWithFormat:@"%i",red],[NSString stringWithFormat:@"%i",green],[NSString stringWithFormat:@"%i",blue],[NSString stringWithFormat:@"%i",alpha], nil];
      [colours addObject:a];

      y++;
      if (y==dimension){
        y=0;
        x++;
      }
    }
    free(rawData);

    // Add some colour flexibility (adds more colours either side of the colours in the image)
    NSArray * copyColours = [NSArray arrayWithArray:colours];
    NSMutableArray * flexibleColours = [NSMutableArray new];

    float flexFactor = flexibility * 2 + 1;
    float factor = flexFactor * flexFactor * 3; //(r,g,b) == *3
    for (int n = 0; n<(dimension * dimension); n++){

      NSArray * pixelColours = copyColours[n];
      NSMutableArray * reds = [NSMutableArray new];
      NSMutableArray * greens = [NSMutableArray new];
      NSMutableArray * blues = [NSMutableArray new];

      for (int p = 0; p<3; p++){

        NSString * rgbStr = pixelColours[p];
        int rgb = [rgbStr intValue];

        for (int f = -flexibility; f<flexibility+1; f++){
          int newRGB = rgb+f;
          if (newRGB<0){
            newRGB = 0;
          }
          if (p==0){
            [reds addObject:[NSString stringWithFormat:@"%i",newRGB]];
          } else if (p==1){
            [greens addObject:[NSString stringWithFormat:@"%i",newRGB]];
          } else if (p==2){
            [blues addObject:[NSString stringWithFormat:@"%i",newRGB]];
          }
        }
      }

      int r = 0;
      int g = 0;
      int b = 0;
      for (int k = 0; k<factor; k++){

        int red = [reds[r] intValue];
        int green = [greens[g] intValue];
        int blue = [blues[b] intValue];

        NSString * rgbString = [NSString stringWithFormat:@"%i,%i,%i",red,green,blue];
        [flexibleColours addObject:rgbString];

        b++;
        if (b==flexFactor){ b=0; g++; }
        if (g==flexFactor){ g=0; r++; }
      }
    }

    // Distinguish the colours
    // orders the flexible colours by their occurrence
    // then keeps them if they are sufficiently disimilar

    NSMutableDictionary * colourCounter = [NSMutableDictionary new];

    //count the occurences in the array
    NSCountedSet *countedSet = [[NSCountedSet alloc] initWithArray:flexibleColours];
    for (NSString *item in countedSet) {
      NSUInteger count = [countedSet countForObject:item];
      [colourCounter setValue:[NSNumber numberWithInteger:count] forKey:item];
    }

    // Sort keys highest occurrence to lowest
    NSArray *orderedKeys = [colourCounter keysSortedByValueUsingComparator:^NSComparisonResult(id obj1, id obj2){
      return [obj2 compare:obj1];
    }];

    // Checks if the colour is similar to another one already included
    NSMutableArray * ranges = [NSMutableArray new];
    for (NSString * key in orderedKeys){
      NSArray * rgb = [key componentsSeparatedByString:@","];
      int r = [rgb[0] intValue];
      int g = [rgb[1] intValue];
      int b = [rgb[2] intValue];
      bool exclude = false;
      for (NSString * ranged_key in ranges){
        NSArray * ranged_rgb = [ranged_key componentsSeparatedByString:@","];

        int ranged_r = [ranged_rgb[0] intValue];
        int ranged_g = [ranged_rgb[1] intValue];
        int ranged_b = [ranged_rgb[2] intValue];

        if (r>= ranged_r-range && r<= ranged_r+range){
          if (g>= ranged_g-range && g<= ranged_g+range){
            if (b>= ranged_b-range && b<= ranged_b+range){
              exclude = true;
            }
          }
        }
      }

      if (!exclude){ [ranges addObject:key]; }
    }

    // Return ranges array here if you just want the ordered colours high to low
    NSMutableArray * colourArray = [NSMutableArray new];
    for (NSString * key in ranges){
      NSArray * rgb = [key componentsSeparatedByString:@","];
      float r = [rgb[0] floatValue];
      float g = [rgb[1] floatValue];
      float b = [rgb[2] floatValue];
      UIColor * colour = [UIColor colorWithRed:(r/255.0f) green:(g/255.0f) blue:(b/255.0f) alpha:1.0f];
      [colourArray addObject:colour];
    }

    // If you want percentages to colours continue below
    NSMutableDictionary * temp = [NSMutableDictionary new];
    float totalCount = 0.0f;
    for (NSString * rangeKey in ranges){
      NSNumber * count = colourCounter[rangeKey];
      totalCount += [count intValue];
      temp[rangeKey]=count;
    }

    // Set percentages
    NSMutableDictionary * colourDictionary = [NSMutableDictionary new];
    for (NSString * key in temp){
      float count = [temp[key] floatValue];
      float percentage = count/totalCount;
      NSLog(@"%f",percentage);
      NSArray * rgb = [key componentsSeparatedByString:@","];
      float r = [rgb[0] floatValue];
      float g = [rgb[1] floatValue];
      float b = [rgb[2] floatValue];
      NSString* colour = [[UIColor colorWithRed:(r/255.0f) green:(g/255.0f) blue:(b/255.0f) alpha:1.0f] description];
      colourDictionary[colour]=[[NSNumber numberWithFloat:percentage] description];
    }

    callback(@[[NSNull null], colourDictionary]);
  }
          failureBlock:^(NSError *error) {
            NSLog(@"failure-----");
          }];


}

@end
