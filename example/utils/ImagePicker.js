import {
  Dimensions,
  Platform,
} from 'react-native';

import ImagePicker from 'react-native-image-picker';
import {getAllSwatches, getNamedSwatches} from 'react-native-palette';

function named(swatches) {
  var   sArr = [];
  for (var s in swatches)
  {
    if (swatches[s]) {
      swatches[s]["name"] = s;
      sArr.push(swatches[s])
    }
  }
  console.log(sArr);
  return sArr;
}



export default function(storeImage, useNamed, useUri) {
  var max = Math.max(Dimensions.get('window').width,Dimensions.get('window').height);

  const options = {
    quality: 0.5,
    maxWidth: max|0, /* convert double to int by bitwise OR */
    maxHeight: max|0,
  };


  let pickOptions = {quality: "low"};

  //console.log("In ImagePicker");
  ImagePicker.launchImageLibrary(options, (response) => {
    var colors = {};

    //console.log('Response = ', response);
    if (response.didCancel) {
      console.log('User cancelled photo picker');
    }
    else if (response.error) {
      console.log('ImagePickerManager Error: ', response.error);
    }
    else {

      colors.image = response.data;
      var path =  Platform.OS === 'ios' ? 
                      useUri ? response.uri.split('file://')[1] : response.origURL 
                    : response.path;
      if (useNamed) {
        getNamedSwatches(path, (error, swatches) => {
          if ( error) {
            console.log(error);
            colors.swatches = error;
          } else {
            colors.swatches = named(swatches);

            colors.swatches.sort((a, b) => {
              return b.population - a.population;
            });

            console.log(colors.swatches);
          }
          storeImage(colors);
        });
      } else {
        getAllSwatches(pickOptions, path, (error, swatches) => {
          if ( error) {
            console.log(error);
            colors.swatches = error;
          } else {
            swatches.sort((a, b) => {
              return b.population - a.population;
            });

            colors.swatches = swatches
          }
          storeImage(colors);
        });
      }
    }
  });
}
