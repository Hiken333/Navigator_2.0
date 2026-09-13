# Forms demo: bits-ui vs shadcn-svelte

Две **одинаковые** формы «Карточка операции MCA»: одни и те же поля, каталоги, zod-валидация и state-контроллер. Отличается только UI-слой.

## Открыть

```bash
bun run dev
```

- Сравнение: http://127.0.0.1:5173/demo/forms
- bits-ui: http://127.0.0.1:5173/demo/forms/bits
- shadcn: http://127.0.0.1:5173/demo/forms/shadcn

## Архитектура переиспользования

```
src/lib/forms/operation/     ← ОБЩЕЕ (не дублировать)
  types.ts                   # OperationFormValues
  catalog.ts                 # CLASSES/VIEWS/METHODS/… + filterCatalog()
  schema.ts                  # zod + validateOperationForm()
  model.svelte.ts            # createOperationForm() — $state контроллер

src/lib/features/operation-form/
  FormSection.svelte         # ОБЩАЯ сетка секций
  OperationFormBits.svelte   # UI на $lib/components/bits/*
  OperationFormShadcn.svelte # UI на $lib/components/ui/*

src/lib/components/bits/     # свои обёртки над bits-ui (IDE-стиль)
src/lib/components/ui/       # shadcn-подобные компоненты (тоже на bits-ui)
```

**Важно:** shadcn-svelte — не отдельный runtime-пакет. Это набор файлов в `ui/`, внутри которых вызывается `bits-ui`. Поэтому «bits vs shadcn» = headless+свои стили vs готовый design-system слой.

## Что внутри формы

Много полей + поиск по большим спискам:

| Поле                                         | UI                |
| -------------------------------------------- | ----------------- |
| ТБП / View / Method / Филиал / Юзер / Валюта | Combobox + search |
| Теги                                         | Multi combobox    |
| Приоритет / Канал                            | Select            |
| Срочность                                    | Switch            |
| Override                                     | Checkbox          |
| Описание / комментарий                       | Textarea          |
| Сброс                                        | Dialog confirm    |

Валидация: обязательные поля, email, сумма, end ≥ start, urgent ≠ low priority.

## Когда что брать в Navigator

1. **Сначала bits-ui** (`components/bits`) — оболочка IDE, плотные таблицы, свой визуальный язык.
2. **Потом shadcn (`components/ui`)** — там, где нужен быстрый стандартный вид (настройки, простые диалоги), или копировать отдельные `ui/*` куски.
3. **Домен всегда общий** — `forms/operation` (или будущие `forms/*`), без копипаста schema/state между экранами.

## Зависимости

- `bits-ui` — headless
- `@lucide/svelte` — иконки
- `clsx` + `tailwind-merge` + `tailwind-variants` — `cn` / variants
- `zod` — схема
- Tailwind 4 theme tokens в `src/routes/layout.css`
