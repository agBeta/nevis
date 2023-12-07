## Module syntax

Make sure you have "module": "es2020" and "moduleResolution": "Node" to your `jsconfig` file. Read more in the following links: [difference between `module` and `moduleResolution`](https://stackoverflow.com/a/72599201) and [typscript docs](https://www.typescriptlang.org/docs/handbook/module-resolution.html).

</br>

## `dependencies` and `engines` in packge.json

There are many ways to specify the version of each package. See [npm docs](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#dependencies).  
Also about `engines` property, take a look at [npm docs] (https://docs.npmjs.com/cli/v10/using-npm/config#engine-strict) or [this stackoverflow post] (https://stackoverflow.com/questions/29349684/how-can-i-specify-the-required-node-js-version-in-package-json).


</br>

## VSCode Ruler

It is better to have a ruler in your vscode editor to see lenght of lines. Follow these steps:  
1- Create `.vscode` directory in the root of your project.  
2- Create file `settings.json` inside the directory. These settings will overwrite user settings. You can see [here](https://stackoverflow.com/questions/71627159/is-there-a-way-to-make-a-settings-json-simply-on-a-project).  
3- Now add following lines (copied from [this answer](https://stackoverflow.com/questions/29968499/vertical-rulers-in-visual-studio-code)) inside settings.json file:  
&emsp;  `"editor.rulers": [120],`  
&emsp;  `"workbench.colorCustomizations": {  "editorRuler.foreground": "#40b3ff5e"  }`
  
</br>
