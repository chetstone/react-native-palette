'use strict'

import { NativeModules, Platform } from 'react-native';
const { RNPalette, colorGrabber } = NativeModules;

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

  return (L > Threshold) ? '#000000ff' : '#ffffffff';
  // well if that doesnt' work, simplify!
  //colors.textColor = ((r*255*0.299 + g*255*0.587 + b*255*0.114) > 186) ? '#000000' : '#ffffff';
}
export const getNamedSwatches = (image, callback) => {
  if (Platform.OS === 'android') {
    return RNPalette.getNamedSwatches(image, callback);
  } else {
    callback("Not supported");
  }
}


export const getAllSwatches = (options, image, callback) => {
  if (Platform.OS === 'android') {
    return RNPalette.getAllSwatches(image, callback);
  }
  if (options.hasOwnProperty('threshold')) {
    Threshold = options.threshold
  }
  colorGrabber.getColors(image, (err, res) => {
    if (err) {
      callback(err);
    } else {
      var props = Object.keys(res);
      // convert all dominant to hex
      var maxResults = 16;
      var domColors = [];
      var swatches = [];
      /*           colors.complementColors = []; */
      for (var i = 0 ; i< props.length && i < maxResults ; i++) {
        var UIColor = props[i];
        var uicolors = UIColor.split(' ');
        var colorSpace = uicolors.shift();

        if (colorSpace !== 'UIDeviceRGBColorSpace') {
          callback(`Unsupported colorspace: ${colorSpace}`);
          return;
        }

        var textColor = computeTextColor(uicolors);

        var r = uicolors[0];
        var g = uicolors[1];
        var b = uicolors[2];
        var a = uicolors[3];
        var hex = '#' + toHex(r*255) + toHex(g*255) +toHex(b*255) + toHex(a*255);
        //console.log("RGB: ", UIColor, "Dominance: ",res[UIColor], "HEX:", hex);
        swatches.push({color: hex,
                       population: res[UIColor],
                       bodyTextColor: textColor,
                       titleTextColor: textColor,
                       swatchInfo: UIColor,
        });
      }
      callback(false, swatches);
    }
  })
}
