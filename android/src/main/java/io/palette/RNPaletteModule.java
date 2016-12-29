package io.palette;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapFactory.Options;
import android.support.v7.graphics.Palette;
import android.support.v7.graphics.Palette.Swatch;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;

import java.util.List;
import java.util.ListIterator;
import java.lang.Integer;

public class RNPaletteModule extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;

  public RNPaletteModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "RNPalette";
  }

  private String intToRGB(int color) {
    return String.format("#%06X", (0xFFFFFF & color));
  }

  private String intToRGBA(int color) {
    color = Integer.rotateLeft(color, 8);
    return String.format("#%08X", (0xFFFFFFFF & color));
  }

  @ReactMethod
  public void getSwatches(final String realPath, final Callback callback) {

    Bitmap bitmap = BitmapFactory.decodeFile(realPath);

    if (bitmap == null) {
      callback.invoke("Bitmap Null");
    } else if (!bitmap.isRecycled()) {
      WritableArray aSwatches = Arguments.createArray();;
      Palette palette = Palette.from(bitmap).generate();
      List<Palette.Swatch> swatches = palette.getSwatches();
      ListIterator litr = swatches.listIterator();
      while(litr.hasNext()) {
        Palette.Swatch element = (Palette.Swatch)litr.next();

        WritableMap swatch = Arguments.createMap();
        swatch.putString("color", intToRGB(element.getRgb()));
        swatch.putInt("population", element.getPopulation());
        swatch.putString("titleTextColor", intToRGBA(element.getTitleTextColor()));
        swatch.putString("bodyTextColor", intToRGBA(element.getBodyTextColor()));
        swatch.putString("swatchInfo", element.toString());
        aSwatches.pushMap(swatch);
      }
      callback.invoke(false, aSwatches);
    } else {
      callback.invoke("Bitmap Recycled");
    }
  }
}
