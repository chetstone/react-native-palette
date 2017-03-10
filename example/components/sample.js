/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Alert,
  Button,
  Image,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

import imagePicker from '../utils/ImagePicker'

export default Sample = React.createClass( {
  getInitialState: function() {
    return {
      colors: {},
      api: 'v1', //Platform.OS === 'ios' ? 'v0' : 'v1',
      diag: "",
      useNamed: false,
      leftButton: Platform.OS === 'ios' ? 'v0 API' : 'getAllSwatches',
      rightButton: Platform.OS === 'ios' ? 'v1 API' : 'getNamedSwatches',
    }
  } ,

  storeImage(colors) {
    console.log("In sample", typeof this.state.colors.swatches === 'string' ?
                    this.state.colors.swatches : colors.swatches[0].swatchInfo );
    this.setState({colors});
  },

  pressLeft() {
    if (Platform.OS === 'ios') {
      this.setState({api: 'v0'});
    } else {
      this.setState({useNamed: false});
    }
  },
  pressRight() {
    if (Platform.OS === 'ios') {
      this.setState({api: 'v1'});
    } else {
      this.setState({useNamed: true});
    }
  },
  onPress() {
    console.log("Button pressed");
    if (this.state.api === 'v1') {
      imagePicker(this.storeImage, this.state.useNamed);
    } else {
      imagePicker(this.storeImage, this.state.useNamed);
    }
  },

  render() {
    console.log(this.state.colors);
    let isImage = this.state.colors && this.state.colors.image;
    let buttonText = `Load ${isImage? "Another":""} Image`
    let textColor = this.state.colors && this.state.colors.swatches && this.state.colors.swatches[0].bodyTextColor  ? this.state.colors.swatches[0].bodyTextColor : 'white'
    let domColor = this.state.colors && this.state.colors.swatches && this.state.colors.swatches[0].color
    let buttonColor = domColor? domColor: "#841584"
    const button = <Button
                onPress={this.onPress}
                title={buttonText}
                color={buttonColor}
                accessibilityLabel="Learn more about this purple button"
                />;
    const imagewrapped = isImage ? <Image style={styles.image} source={{uri: 'data:image/jpeg;base64,' + this.state.colors.image, isStatic: true}}>
    {button}
    </Image> : <View>{button}<Text>{this.state.diag}</Text></View>
    const buttons = Platform.OS === 'ios' ? <View/> :           <View style={styles.optionContainer}>
            <Button  onPress={this.pressLeft} title={this.state.leftButton} />
            <Button  onPress={this.pressRight} title={this.state.rightButton} />
          </View>;

    return (
      <View style={styles.container}>
          <View style={styles.imageContainer}>
              {imagewrapped}
          </View>
          <View style={styles.swatchContainer}>
            {isImage && typeof this.state.colors.swatches !== 'string' ?
             this.state.colors.swatches.map((swatch, index) => {
              return (
                <View key={index} style={[styles.swatch,{backgroundColor: swatch.color}]}>
                    <Text style={{color: swatch.bodyTextColor}}>{swatch.name  ? swatch.name: (swatch.population*(Platform.OS === 'ios'?1000:1)).toFixed()}</Text>
                </View>)
            }
             ) : <Text>{typeof this.state.colors.swatches === 'string'? this.state.colors.swatches :  "Placeholder"}</Text>}
          </View>
          {buttons}
    </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  imageContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,

  },
  swatchContainer: {
    flex: .75,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  optionContainer: {
    flex: .25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  swatch: {
    width: 70,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
/*    overflow: 'hidden', /* don't let bounce obscure the navbar */
    alignSelf: 'stretch',
    resizeMode: 'cover',
  },
});
