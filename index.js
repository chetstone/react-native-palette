
import { NativeModules, Platform } from 'react-native';

const { RNPalette } = NativeModules;

let Threshold = 0.179; // contrast luminosity. Original formula calls for 0.179
let Alpha = 1;

const iOSOptions = {
  low: { dimension: 5, flexibility: 5, range: 40 },
  medium: { dimension: 8, flexibility: 5, range: 40 },
  high: { dimension: 10, flexibility: 10, range: 30 },
};

let quality = 'low';

function toHex(d) {
  return (`0${Math.round(d).toString(16)}`).slice(-2).toUpperCase();
}

function computeTextColor(uicolors) {
  // compute text color from http://stackoverflow.com/a/3943023/1404185
  /* for each c in r,g,b:
   *  c = c / 255.0
   *  if c <= 0.03928 then c = c/12.92 else c = ((c+0.055)/1.055) ^ 2.4
   *  L = 0.2126 * r + 0.7152 * g + 0.0722 * b
   */
  const c = uicolors.map((color) => {
    const colorNum = Number(color);
    if (colorNum <= 0.03928) {
      return colorNum / 12.92;
    }
    return ((colorNum + 0.055) / 1.055) ** 2.4;
  });

  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

  return (L > Threshold) ? '#000000ff' : '#ffffffff';
  // well if that doesnt' work, simplify!
  // colors.textColor = ((r*255*0.299 + g*255*0.587 + b*255*0.114) > 186) ? '#000000' : '#ffffff';
}
// eslint-disable-next-line consistent-return
export const getNamedSwatches = (image, callback) => {
  if (Platform.OS === 'android') {
    return RNPalette.getNamedSwatches(image, callback);
  }
  callback('Not supported');
};

// eslint-disable-next-line consistent-return
export const getAllSwatches = (options, image, callback) => {
  if (options.alpha) {
    Alpha = options.alpha;
  }

  if (Platform.OS === 'android') {
    return RNPalette.getAllSwatches(image, (err, res) => {
      if (err) {
        return callback(err);
      }
      res.sort((a, b) => b.population - a.population);
      res.forEach(item => {
        const splitColor = item.color.split(',');
        const r = Number.parseFloat(splitColor[0].split('rgba(')[1]);
        const g = Number.parseFloat(splitColor[1]);
        const b = Number.parseFloat(splitColor[2]);
        const a = Number.parseFloat(splitColor[3].split(')')[0]);
        item.hex = `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a*255*Alpha)}`;
      })

      return callback(err, res);
    });
  }

  if (options.threshold) {
    Threshold = options.threshold;
  }

  if (options.quality) {
    quality = options.quality;
  }

  RNPalette.getColors(image, iOSOptions[quality], (err, res) => {
    if (err) {
      callback(err);
    } else {
      const props = Object.keys(res);
      // convert all dominant to hex
      const maxResults = 16;
      // const domColors = [];
      const swatches = [];
      /*           colors.complementColors = []; */
      for (let i = 0; i < props.length && i < maxResults; i++) {
        const UIColor = props[i];
        const uicolors = UIColor.split(' ');
        uicolors.shift();

        const textColor = computeTextColor(uicolors);

        const r = uicolors[0];
        const g = uicolors[1];
        const b = uicolors[2];
        const a = uicolors[3];
        const hex = `#${toHex(r * 255)}${toHex(g * 255)}${toHex(b * 255)}${toHex(a*255*Alpha)}`;
        const rgba = `rgba(${(r * 255).toFixed(0)}, ${(g * 255).toFixed(0)}, ${(b * 255).toFixed(0)}, ${a})`;
        // console.log("RGB: ", UIColor, "Dominance: ",res[UIColor], "HEX:", hex);
        swatches.push({ color: rgba,
          population: res[UIColor],
          bodyTextColor: textColor,
          titleTextColor: textColor,
          swatchInfo: UIColor,
          hex,
        });
      }
      callback(false, swatches);
    }
  });
};
