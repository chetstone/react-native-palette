package io.palette;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
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

import android.util.Patterns;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

import java.net.URL;
import java.net.HttpURLConnection;
import java.io.InputStream;

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

  private String intToRGBA(int color) {
    return String.format("rgba(%d,%d,%d,%.3f)", Color.red(color), Color.green(color), Color.blue(color), (float)(Color.alpha(color))/255.0);
  }

  private Palette getPallet(final String realPath, final Callback callback) {

    Bitmap bitmap = null;

    if (Patterns.WEB_URL.matcher(realPath).matches()){
      try{
        URL url = new URL(realPath);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setDoInput(true);
        connection.connect();
        InputStream input = connection.getInputStream();
        bitmap = BitmapFactory.decodeStream(input);
      } catch (Exception e){
        //TODO: Handle Errors
      }
    } else {
      bitmap = BitmapFactory.decodeFile(realPath);
    }

    if (bitmap == null) {
      callback.invoke("Bitmap Null");
    } else if (bitmap.isRecycled()) {
      callback.invoke("Bitmap Recycled");
    }
    return Palette.from(bitmap).generate();
  }

  private WritableMap convertSwatch(Palette.Swatch swatch) {

    if (swatch == null) {
      return null;
    }
    WritableMap swatchMap = Arguments.createMap();
    swatchMap.putString("color", intToRGBA(swatch.getRgb()));
    swatchMap.putInt("population", swatch.getPopulation());
    swatchMap.putString("titleTextColor", intToRGBA(swatch.getTitleTextColor()));
    swatchMap.putString("bodyTextColor", intToRGBA(swatch.getBodyTextColor()));
    swatchMap.putString("swatchInfo", swatch.toString());
    return swatchMap;
  }

  @ReactMethod
  public void getNamedSwatches(final String realPath, final Callback callback) {
    Palette palette = getPallet(realPath, callback);
    WritableMap swatches = Arguments.createMap();

    swatches.putMap("Vibrant", convertSwatch(palette.getVibrantSwatch()));
    swatches.putMap("Vibrant Dark", convertSwatch(palette.getDarkVibrantSwatch()));
    swatches.putMap("Vibrant Light", convertSwatch(palette.getLightVibrantSwatch()));
    swatches.putMap("Muted", convertSwatch(palette.getMutedSwatch()));
    swatches.putMap("Muted Dark", convertSwatch(palette.getDarkMutedSwatch()));
    swatches.putMap("Muted Light", convertSwatch(palette.getLightMutedSwatch()));

    callback.invoke(false, swatches);
  }

  @ReactMethod
    public void getAllSwatches(final String realPath, final Callback callback) {

    Palette palette = getPallet(realPath, callback);
    WritableArray aSwatches = Arguments.createArray();
    List<Palette.Swatch> swatches = palette.getSwatches();
    ListIterator litr = swatches.listIterator();
    while(litr.hasNext()) {
      Palette.Swatch swatch = (Palette.Swatch)litr.next();
      aSwatches.pushMap(convertSwatch(swatch));
    }
    callback.invoke(false, aSwatches);
  }
}
