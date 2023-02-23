# jscodeshift-isort

Sort `ImportDeclaration` and `ImportSpecifier` using a simple transform implemented on [`jscodeshift`](https://github.com/facebook/jscodeshift).

## example usage

```sh
npm install -D jscodeshift @hiogawa/jscodeshift-isort
npx jscodeshift-isort $(git grep -l . '*.ts' '*.tsx') --fix
```

## development

```sh
pnpm i
pnpm dev
./bin/cli.js $(git grep -l . '*.ts') --fix

# release
pnpm build
pnpm release
```
