# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyMoney is a personal finance PWA for tracking income and expenses by category, with monthly/annual reports, related movements and import/export. The app is meant to be used by multiple users, not only its author, so UI text must be understandable to non-technical people.

- Angular 16 with **NgModules** (not standalone): every component is declared in `src/app/app.module.ts`, routes live in `src/app/app.routing.ts`.
- Angular Material 16 using the **legacy** modules (`MatLegacy*`), Firebase/Firestore via `@angular/fire`, `ngx-mask` for numeric inputs, `@ngx-translate` for i18n (`src/assets/i18n/es.json` and `en.json`), `ng2-charts` for reports.
- UI language is Spanish (Paraguay, voseo: "podés", "elegí") and English.

## Commands

```bash
npm start                                   # ng serve
npm run build                               # ng build
npx ng build --configuration development    # fastest full check (AOT, includes templates)
npm run prod                                # production build
npx playwright test                         # e2e tests (tests/), need URL and login data in .env
```

`src/environments/environment*.ts` usually have local, uncommitted changes with Firebase credentials: never commit or overwrite them.

## Architecture (`src/app/`)

| Folder | Content |
|---|---|
| `components/` | One folder per screen/component (`*.component.ts/html/scss`), no spec files |
| `services/` | Firestore access (`category.service`, `user-category.service`, `movement.service`...) and `helper.service` (static helpers) |
| `forms/` | Typed reactive form interfaces (`XxxForm` with `FormControl<T \| null>`) |
| `models/` | Classes and interfaces (`XxxModel`) |
| `enums/` | Enums; enum **values** are often also translation keys |
| `constants/` | Static data shared by several components (category icon groups, color palettes, default colors) |
| `directive/` | `customColor` directive (`[color]`, `[backgroundColor]` inputs) and pipes |
| `guards/`, `resolvers/`, `observables/` | `UserGuard`, config resolver, `ItemObservable` base class |

### State / cache
- `UserService` extends `ItemObservable<UserDataModel>` (a `BehaviorSubject`) and is the in-memory cache of the logged user: `allCategories`, `activeCategories`, `userCategories`, `userConfiguration`.
- `PrincipalComponent` loads categories, user categories and configuration from Firestore and calls `userService.setCategories(...)`, which merges per-user data (color, background, order, active) into each `CategoryModel`.
- Screens read from the cache with `getAllCategories$()` / `getUserCategories$()` and **must use `take(1)`**: the streams never complete and old subscriptions leak and re-fire.
- After writing to Firestore, update the cache (`setCategory`, `setUserCategory`) and mutate the cached `CategoryModel` so lists refresh without reloading.

### Categories data model
- `categories` collection: `name`, `icon`, `type`, `active`, `owner` (`'system'` for default categories, the user email for own ones).
- `userCategories` collection: per-user `color`, `backgroundColor`, `order`, `active`, and a `category` DocumentReference (`categoryId` is derived from its path on load).
- System categories: users can only change colors and order (name and icon are hidden in the form). Own categories: everything can be edited.
- Own categories are marked in the UI with a "Mía"/"Mine" chip. **Never append text to `category.name`** (the old " (usuario)" suffix was removed because it mutated the cache and broke comparisons).
- `type` values are compared case-insensitively (`'income'`/`'Income'` both exist in data).

### Category screens
- `category-configuration`: Income/Expense tabs. The selected tab is kept in `?tab=income|expense` so `location.back()` returns to the original tab.
- `upsert-category`: single create/edit form for both routes `category/new-category/:type` and `category/edit-category/:id`.
  - Sticky compact preview on top.
  - Name → icon accordion → colors (preset swatches + custom picker + hex input) → list position.
  - No default icon (required). Enter on the name opens the icons; choosing an icon collapses the accordion and scrolls to colors.
  - The "Ingresos" icon group is shown first for income and last for expense.
  - Duplicate names are checked synchronously, only within the same type.
  - A `saving` flag prevents double submits.
- New icons: add the value to `enums/icon-type.enum.ts` (Material Icons names, font loaded from Google Fonts) and place it in a group in `constants/category.constants.ts`.

## Conventions

- Components use `protected` members for template bindings, arrow-function methods (`protected save = (): void => {}`), and constructor injection with `private readonly`.
- Every Firestore save button must be disabled while saving (`saving` flag + `[disabled]="formGroup.invalid || saving"`), with error handling that re-enables it and shows a snackbar.
- No `debounceTime` between a form input and the value that gets saved (it caused stale saves).
- Add every new UI text to **both** `es.json` and `en.json`.
- Repo stores LF, working copy uses CRLF (`core.autocrlf=true`): avoid mixed line endings when editing with shell tools.
- e2e tests (`tests/e2e`, Playwright, page objects in `tests/e2e/pages`) run with the UI in English and rely on labels/titles (`Category name *`, `Save`, `Add category`, `Icon color`, `List position`, icon titles like `Fast Food`): update them when changing those texts.
