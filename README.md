# react-native-palette

An Android-only library which wraps the [Android Pallete Class](https://developer.android.com/reference/android/support/v7/graphics/Palette.html)
to pick colors from an image.

## Getting started

`$ npm install react-native-palette --save`

### Mostly automatic installation

`$ react-native link react-native-palette`

### Manual installation


#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import io.palette.RNPalettePackage;` to the imports at the top of the file
  - Add `new RNPalettePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:

  ```
   include ':react-native-palette'
   project(':react-native-palette').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-palette/android')
  ```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
```
   compile project(':react-native-palette')
```


## Usage

Call `getSwatches()` with a path to an image  such as that returned by [`react-native-image-picker`](https://github.com/marcshilling/react-native-image-picker) and a callback function. The callback is passed an error parameter and an array of swatches representing the dominant colors in the image. Typically 16 swatches are returned. Each swatch contains the following fields:

### Fields

Field | Info
------ | ----
color | The main color of the swatch as a hex `#rrggbb` string
population | The population of this swatch in the image. A positive integer. You can sort on this field to find the most dominant swatch.
titleTextColor | A text color which contrasts well with the main swatch color for use in titles. Includes alpha as a hex `#rrggbbaa` string.
bodyTextColor | A text color which contrasts well with the main swatch color for use as body text. Includes alpha as a hex `#rrggbbaa` string.
swatchInfo | A string encapsulating all the above and more. Can be used for debugging. Note that the hex strings are in the format #aarrggbb rather than that specified above.
### Example
```javascript
    import Palette from 'react-native-palette';
    import ImagePicker from 'react-native-image-picker'

    ImagePicker.launchImageLibrary({}, (response)  => {
        Palette.getSwatches(response.path, (error, swatches) => {
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
