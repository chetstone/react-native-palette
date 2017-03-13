# react-native-palette

A React-Native library which on Android, wraps the [Android Pallete Class](https://developer.android.com/reference/android/support/v7/graphics/Palette.html) to pick colors from an image. On iOS, it uses code from [react-native-color-grabber](https://github.com/bsudekum/react-native-color-grabber).

 A small example app is included.

## Getting started

`$ npm install react-native-palette --save`

### Mostly automatic installation for Android and iOS

`$ react-native link react-native-palette`


### Manual installation

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import io.palette.RNPalettePackage;` to the imports at the top of the file
  - Add `new RNPalettePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:

  ```
   include ':react-native-palette'
   project(':react-native-palette').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-palette/android')
  ```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
```
   compile project(':react-native-palette')
```
#### iOS

1. Add `node_modules/react-native-palette/ios/RNPalette.xcodeproj` to your Xcode project

## API

### `getAllSwatches(options, image, (error, swatches) => {})`

#### options
An object containing option properties.
There are two properties and they're valid for iOS only. On Android, this parameter is ignored.

Property | Type | Info
-------- | ---- | ----
`threshold` | Float | Determines whether white or black text will be selected to contrast with the selected color. It is the value for `L`, in the complex formula at the end of this [StackOverflow comment](http://stackoverflow.com/a/3943023/1404185). The default value is 0.179.
`quality` | String | One of "low", "medium", or "high". Higher quality extracts more colors, takes more time and consumes more memory. Default is "low".

#### image
A path to an image such as that returned by [`react-native-image-picker`](https://github.com/marcshilling/react-native-image-picker). For iOS use the `origURL` field of the image picker response, because only images from `assets-library://` have been tested. For Android use the `path` field.

#### callback
The callback is passed an error parameter and an array of swatches representing the dominant colors in the image. Typically 16 swatches are returned on Android, fewer on iOS.

### `getNamedSwatches(image, (error, swatches) => {})`

Android only.

#### image

Same as in `getAllSwatches`

#### swatches

An object keyed by the qualities of colors defined by the Android `Palette` Class.
The keys are the following:

* "Vibrant"
* "Vibrant Dark"
* "Vibrant Light"
* "Muted"
* "Muted Dark"
* "Muted Light"

The values are swatches (possibly `null`) or with the fields defined below.


### Swatch Fields

Colors include alpha in the `react-native`  `rgba(255,255,255,1.0)` format. Note that on iOS10 devices UIExtendedSRGBColorSpace color values may be greater than 255 or less than 0, but they will render correctly on the device.

Field | Info
------ | ----
color | The main color of the swatch.
population | The dominance of this swatch in the image. You can sort on this field to find the most dominant swatch. Android: A positive integer. iOS: A floating point number between 0 and 1.
titleTextColor | A text color which contrasts well with the main swatch color for use in titles.
bodyTextColor | A text color which contrasts well with the main swatch color for use as body text.
swatchInfo | A string encapsulating all the above and more. Can be used for debugging. Android: Note that the hex strings are in the format `#aarrggbb` rather than the `react-native` format. iOS: the result string returned by the old (`react-native-color-grabber`) API.

### Example
```javascript

  import {getAllSwatches} from 'react-native-palette';
  import ImagePicker from 'react-native-image-picker'

  ImagePicker.launchImageLibrary({}, (response)  => {
    var path =  Platform.OS === 'ios' ? response.origURL : response.path;
    getAllSwatches({}, path, (error, swatches) => {
      if (error) {
        console.log(error);
      } else {
        swatches.sort((a, b) => {
          return b.population - a.population;
        });
        swatches.forEach((swatch) => {
          console.log(swatch.swatchInfo);
        });
      }
    });
  });
```
