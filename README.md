# jscodeshift-isort

Sort `ImportDeclaration` and `ImportSpecifier` using a simple transform implemented on [`jscodeshift`](https://github.com/facebook/jscodeshift).

## example usage

```sh
npm install -D jscodeshift @hiogawa/jscodeshift-isort
npx jscodeshift-isort $(git grep -l . '*.ts' '*.tsx') $(git ls-files --others --exclude-standard '*.ts') --fix
```

## development

```sh
pnpm i
pnpm dev
./bin/cli.js src/*.ts --fix

# release
pnpm build
pnpm release
```
