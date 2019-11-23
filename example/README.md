## Example App

To get started,

```
cd example
yarn
npm run refresh
cd ios; pod install; cd ..
npm run start
```

Normally, after a code change to react-native-palette `src` files,
you must remove the node_modules/react-native-palette directory
and `npm install`.  The react-native packager wont follow symlinks.
To assist development, use:

```
npm run refresh
```

This will remove the node_modules/react-native-palette directory, then
copy the react-native-palette `src` files from `..`.
Since the packager won't notice changes in `node_modules`,
each time you make a change in the `src` files, you will need to
manually kill the packager with `^C`, then just rerun `npm run refresh; npm run start`
