# SCSS Directory Structure

File organization in `src/scss/`.

**Note**: Files in this directory are **read-only**. Reference actively for decisions.

---

## Entry Point

### globals.scss

Imports all SCSS modules.

```scss
@use "01variables" as *;
@use "02base" as *;
@use "03header" as *;
@use "08intersection" as *;
@use "09hover" as *;
@use "10UNIT" as *;
@use "20utility" as *;
```

---

## File List

| File | Size | Description |
|------|------|-------------|
| `_01variables.scss` | ~13KB | CSS variables. Colors, fonts, spacing, etc. |
| `_02base.scss` | ~2.5KB | Base styles. Reset, basic elements |
| `_03header.scss` | ~63KB | Header styles. Navigation |
| `_08intersection.scss` | ~3KB | Intersection Observer styles |
| `_09hover.scss` | ~14KB | Hover Effects |
| `_10UNIT.scss` | ~24KB | **CustomClass definitions**. Cards, Panel, ImgText, Toggle, etc. |
| `_20utility.scss` | ~38KB | Utility classes |
| `_mixin.scss` | ~2.7KB | Mixin definitions |

---

## Key Files

### _01variables.scss

CSS variable definitions:
- **Colors**: `--MC` (main), `--AC` (accent), etc.
- **Fonts**: `--font-main`, font sizes
- **Spacing**: `--gap`, `--pad`, etc.
- **Layout**: `--wid` (container width), `--item` (item width), etc.

### _02base.scss

Basic styles:
- Reset styles
- Base elements (html, body, a, p, h1-h6, etc.)
- Global layout settings

### _10UNIT.scss

**CustomClass definition file**. Contains:
- `Cards` - card container
- `Panel` - vertical container
- `ImgText` - image + text
- `Toggle` - collapsible content
- `FlexR` - ratio control Wrapper
- `Hero` - hero section

Value classes (`col3`, `img40`, etc.) and Modifier classes (`IsRev`, `IsFlow`, etc.) defined here.

### _20utility.scss

Utility classes. Use as Tailwind supplement when needed.

---

## When to Reference

- **CustomClass behavior**: `_10UNIT.scss`
- **Variable values**: `_01variables.scss`
- **Base styles**: `_02base.scss`
- **Animations/Effects**: `_08intersection.scss`, `_09hover.scss`
