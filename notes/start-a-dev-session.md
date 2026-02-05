# Starting a Development Session

> [!info] Before you begin
> Read `setting-up-the-dev-environment.md` and follow the steps there

You're going to be using a few tools:
1. A **code editor** - I use/suggest VSCode
2. A **live server** - I use/suggest the default one with VSCode
3. The **TypeScript compiler** (in watch mode)
4. **Webpack** (in watch mode)
5. **Git** for saving changes

Once they're all installed I usually have three terminals open, all `cd`ed to the **project root** (*not the subdirectory of a individual project*):
1. Run the Webpack command:
   `npm run watch:PACKAGE-NAME`
2. Run the TypeScript compiler:
   `npm run tsc-watch`
3. A third terminal if for general use/Git etc.

Open your development environment and live-server, and off you go.

### What next?
[Creating a new module](creating-a-new-module.md)

### Meta
Author: James Heggie

| Date       | Event        |
|------------|--------------|
| 05-02-2026 | File created |