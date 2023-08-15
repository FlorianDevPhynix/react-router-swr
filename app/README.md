# React + TypeScript + Vite + File Page Routing

This template provides a minimal setup to get React with file based Page Routing working in Vite with HMR, some ESLint rules and Sass/Scss.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Drawbacks

no react router data loading

## Routing

The [vite-pages](https://github.com/hannoeru/vite-plugin-pages) plugin is used to detect all routes and build a json object for [react-router](https://reactrouter.com/en/main).

A custom `onRoutesGenerated` function is used to allow nested route templates as `_layout.[tsx|jsx]` files and catch-all 404 error pages.

A custom `onClientGenerated` function modifies the code output of the plugin to add support for react routers errorElement property on routes. some minor adjustments are also done.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
