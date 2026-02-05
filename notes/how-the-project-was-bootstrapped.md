# How the Project was Bootstrapped

For my own reference when I have forgotten it all in six months' time.

RippleDoc is a *monorepo* with the following structure:
- **Apps** are projects that have a user-facing function
  *i.e. an Electron App or a web page*
- **Packages** are simple collections of code. They should have a well-defined and contained
  function, although they may depend on other packages within project. They must never
  depend on Apps
- Apps and packages live in different directories with different parents.

The basic steps were as follows:
1. Setup Git
2. Setup TypeScript
3. Setup Webpack

## Git
Git is sufficiently complex (and generic) that I have split this off into a separate document:
`how-to-bootstrap-a-github-project.md`

The basic steps were:
1. Create a new repo on GitHub
   *Much easier than creating locally and pushing!*
2. Clone locally
3. Set up a Personal Access Token
4. Do an initial commit

## TypeScript

Install it...

`npm --save-dev typescript`

Thens create the config file hierarchy...

| File                       | Notes                                                          |
|----------------------------|----------------------------------------------------------------|
| tsconfig.json              | Sets up `files` (empty) `references` (one `"path"` per package) Purpose is to enable building the whole thing from root with `tsc -b` |
| tsconfig.base.json         | Common basic settings for every package. | 
| packages/.../tsconfig.json | Build options for individual packages |
| apps/.../tsconfig.json     | Build options for individual apps |

We then add the following to `package.json`:
```
"scripts": {
    "tsc-watch": "tsc -b --watch"
}
```

### How are package and app settings different?
This is all to do with interactions between TSC (the TypeScript compiler) and Webpack (our bundler).

In general I want:
- TSC to syntax check (without emitting!)
- Webpack to bundle

TSC in watch mode works well for this. However, dependencies mess things up - for a dependency to work in TSC, it has to be emitted. That's ok for packages, but will conflict with Webpack for apps.

So, apps (but *not* packages) contain the following in their compiler options:
```
"compilerOptions": {
  "noEmit": true
}
```

## Webpack

Webpack is a complex beast but it seems (*I hope*) to be the best choice when true single-file output is desired. Hopefully that complexity can be hidden day-to-day.

Install it...

`npm --save-dev webpack`

Then create the config file hierarchy...

| File                       | Notes                                                          |
|----------------------------|----------------------------------------------------------------|
| webpack.common.js          | Global config |
| apps/.../webpack.config.js | Per App config. |

**Note:** config files in subdirectories need to be told that they are not in the root. One way
seems to be like this:

```
module.exports = {
  context: __dirname,
};
```

**Note:** packages don't need a `webpack.config.js` file.

Then we setup some shortcuts in `package.json`:
```
"scripts": {
  "build:test": "webpack --config apps/test/webpack.config.js",
  "watch:test": "webpack --config apps/test/webpack.config.js --watch"
}
```
