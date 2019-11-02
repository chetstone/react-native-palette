## Example App

Normally, after a code change to react-native-palette `src` files,
you must remove the node_modules/react-native-palette directory
and `npm install`.  The react-native packager wont follow symlinks.
To assist development, instead of `npm run start`, use:

```
npm run refresh
```

This will remove the node_modules/react-native-palette directory,
copy the react-native-palette `src` files from `..`.
Since the packager won't notice changes in `node_modules`,
each time you make a change in the `src` files, you will need to
manually kill the packager with `^C`, then just rerun `npm run refresh; npm run start`


Alternately the following command watches and rsyncs changes:

```
npm run sync
```

Leave a terminal open running this command when running the Example
app and making react-native-palette `src` changes. This will automatically
propagate changes to `node_modules`. However, since the packager won't
notice the changes and you will have to restart it anyway, so using
`npm run refresh` will be easier.

Thanks to [react-native-router-flux](https://github.com/aksonov/react-native-router-flux/blob/6cb358b0977c9459bdacf3fef26b6e2670844c46/Example/README.md) for this tool.
