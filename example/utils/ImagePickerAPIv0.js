import {
  Dimensions,
  Platform,
  NativeModules,
} from 'react-native';

import ImagePicker from 'react-native-image-picker';


var Threshold = 0.179; // contrast luminosity. Original formula calls for 0.179

function toHex(d) {
  return  ("0"+(Math.round(d).toString(16))).slice(-2).toUpperCase()
}

function computeTextColor(uicolors) {
  // compute text color from http://stackoverflow.com/a/3943023/1404185
  /* for each c in r,g,b:
   *  c = c / 255.0
   *  if c <= 0.03928 then c = c/12.92 else c = ((c+0.055)/1.055) ^ 2.4
   *  L = 0.2126 * r + 0.7152 * g + 0.0722 * b
   */
  var c = uicolors.map((c)=> {
    c = Number(c);
    if (c <= 0.03928 ) {
      return c/12.92;
    } else {
      return Math.pow((c+0.055)/1.055, 2.4);
    }
  });

  var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  
  return (L > Threshold) ? '#000000' : '#ffffff';
  // well if that doesnt' work, simplify!
  //colors.textColor = ((r*255*0.299 + g*255*0.587 + b*255*0.114) > 186) ? '#000000' : '#ffffff';
}


export default function(storeImage) {
  var max = Math.max(Dimensions.get('window').width,Dimensions.get('window').height);
  
  const options = {
    quality: 0.5,
    maxWidth: max|0, /* convert double to int by bitwise OR */
    maxHeight: max|0,
  };
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
      // You can display the image using either:

      var uri =  response.uri.replace('file://', '');

      colors.image = response.data;

      NativeModules.colorGrabber.getColors(response.origURL, (err, res) => {
        if (err) {
          console.log("getColors error");
        } else {
          var props = Object.keys(res);

          props.sort(function(a, b) {
            return res[b] - res[a];
          });
          console.log(JSON.stringify(res));
          // convert all dominant to hex
          var maxResults = 16;
          var domColors = [];
          colors.swatches = [];
          /*           colors.complementColors = []; */
          for (var i = 0 ; i< props.length && i < maxResults ; i++) {
            var UIColor = props[i];
            var uicolors = UIColor.split(' ');
            uicolors.shift();
            uicolors.pop();
            
            var textColor = computeTextColor(uicolors);

            console.log(UIColor);
            console.log(uicolors);
            var r = uicolors[0];
            var g = uicolors[1];
            var b = uicolors[2];
            var hex = '#' + toHex(r*255) + toHex(g*255) +toHex(b*255);
            console.log("RGB: ", UIColor, "Dominance: ",res[UIColor], "HEX:", hex);
            colors.swatches.push({color: hex,
                                  population: res[UIColor],
                                  bodyTextColor: textColor,
                                  titleTextColor: textColor,
                                  swatchInfo: UIColor,
            });

          }
          storeImage(colors);
        }
      });

    }
  });
}
