# jscodeshift-isort

sorting `ImportDeclaration` and `ImportSpecifier` using a simple transform implemented on [`jscodeshift`](https://github.com/facebook/jscodeshift).

```sh
pnpm i
./bin/cli.js $(git grep -l . '*.ts') --fix
```
