# Navigator 2.0 (SvelteKit)

IDE-клиент на Svelte 5 + SvelteKit + Tailwind 4.

## Demo: bits-ui vs shadcn

Одна и та же большая форма (поиск по справочникам) в двух UI-слоях:

- `/demo/forms` — сравнение
- `/demo/forms/bits` — bits-ui
- `/demo/forms/shadcn` — shadcn-подобные компоненты

Подробности: [`docs/FORMS_BITS_VS_SHADCN.md`](./docs/FORMS_BITS_VS_SHADCN.md)

## Scaffold

Powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.17.0 create --template minimal --types ts --add tailwindcss="plugins:none" sveltekit-adapter="adapter:auto" --install bun .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
