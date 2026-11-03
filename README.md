# KnowMe

A private journal for people changing a habit. Start with `AGENTS.md`.

## First-time setup
Needs Node 20+ and Yarn.

```sh
yarn install
yarn add expo expo-router expo-sqlite react-native-safe-area-context react-native-screens \
  expo-linking expo-constants expo-status-bar react react-native
yarn add -D typescript @types/react jest jest-expo @types/jest
yarn expo install --fix        # pins everything to the current SDK
cp .env.example .env           # set EXPO_PUBLIC_PROXY_URL once the proxy is deployed
```

## Run
```sh
yarn ios        # or: yarn android
```

## Check before every commit
```sh
yarn typecheck && yarn lint && yarn test
```

## Proxy
See `proxy/README.md`. The Llama key lives only in Vercel.

## Docs
`PRODUCT.md` what · `DESIGN.md` how it looks · `SAFETY.md` non-negotiables · `STRUCTURE.md` where things go · `DECISIONS.md` · `TODO.md` · `DEMO.md`
