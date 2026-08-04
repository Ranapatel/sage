# TS → CJS Conversion Reference

This is the canonical reference for converting TypeScript files to plain
CommonJS JavaScript. Read this first before converting any file.

## Why

The backend's runtime currently mixes JavaScript and TypeScript. `src/index.js`
loads `src/register.js` which requires `ts-node/register/transpile-only` to
patch Node's `require()` so extension-less `require('./foo')` paths can
resolve to `.ts` files. This works in dev where `ts-node` is installed, but
**production Docker images install only `npm ci --omit=dev`** — so `ts-node`
is not present at runtime. Any production boot that touches a `.ts` file
crashes.

The fix: convert every `.ts` file under `src/` and `prisma/` to a plain `.js`
file using CommonJS syntax. After conversion:

- `ts-node` is no longer required at runtime.
- `src/register.js` is deleted.
- `src/index.js` boots cleanly with `node src/index.js`.

## Conversion rules

The existing `.js` files in this codebase already use CommonJS — `require()`
and `module.exports.X`. The converted files MUST use the same pattern.

### Imports → require

```ts
import { X, Y } from '../foo'
import Z from '../foo'
import * as Ns from '../foo'
import '../foo'
import { X as Y } from '../foo'
import type { T } from '../foo'      // DELETE entirely
import { type X, Y } from '../foo'   // → const { Y } = require('../foo')
```

becomes

```js
const { X, Y } = require('../foo')
const Z = require('../foo').default
const Ns = require('../foo')
require('../foo')
const { X: Y } = require('../foo')
```

Special case: `dotenv` is a CommonJS package without a `.default` export.
If you see `import dotenv from 'dotenv'`, change to:

```js
const dotenv = require('dotenv')
```

(otherwise `require('dotenv').default` returns undefined and `.config()`
will crash).

### Exports → module.exports

**Default export (router, class, function, or expression):**

```ts
export default router
export default function buildRouter() { ... }
export default class Foo { ... }
export default { foo: 1 }
```

becomes (when the value is an identifier):

```js
// keep the declaration, append at end of file:
module.exports = router;
module.exports.default = router;
```

When the value is a function/class declaration:

```js
// rewrite `export default function X` → `function X`
// rewrite `export default class X` → `class X`
// append:
module.exports = X;
module.exports.default = X;
```

When the value is an expression (object/array literal, string, etc.):

```js
// remove the `export default` line
// append:
module.exports = { foo: 1 };
module.exports.default = { foo: 1 };
```

**Named exports:**

```ts
export const X = ...
export function X() { ... }
export class X { ... }
export { X, Y as Z }
export * from './foo'
export * as Ns from './foo'
```

becomes

```js
// declaration stays in place
const X = ...
function X() { ... }
class X { ... }

// append at end of file:
module.exports.X = X;
module.exports.Y = Z;  // Y renamed to Z externally
// or
Object.assign(module.exports, require('./foo'))
// or
module.exports.Ns = require('./foo')
```

**Barrel files with both default and re-exports** (`src/modules/travelport/index.ts`):

If the file has `export default X` AND `export * from './Y'` lines, do NOT
reassign `module.exports = X` (this wipes out the re-exports). Use the
attach-only pattern instead:

```js
// at end of file
module.exports.default = travelportRouter;
module.exports.travelportRouter = travelportRouter;
Object.assign(module.exports, require('./config/travelport.config'));
Object.assign(module.exports, require('./constants/travelport.constants'));
// ... one Object.assign per `export * from` line
```

### Type-only constructs → DELETE

```ts
export interface X { ... }
export type X = ...
interface X { ... }
type X = ...
enum X { ... }
import type ...
declare ...
```

All of these erase entirely. The compiled JavaScript has no trace of them.

For `enum X { ... }`, convert to a plain object literal — this is the only
case where we preserve runtime semantics:

```ts
enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}
```

becomes

```js
const Status = { Active: 'ACTIVE', Inactive: 'INACTIVE' }
```

### Type annotations → DELETE

Strip `: Type` from parameters, returns, variables, properties.

```ts
function foo(x: string, y?: number): Promise<void> { ... }
const x: string = 'hello'
class Foo {
  private name: string
  readonly id: number
}
```

becomes

```js
function foo(x, y) { ... }
const x = 'hello'
class Foo {
  name;
  id;
}
```

### Modifiers → DELETE

`readonly`, `private`, `public`, `protected`, `abstract`, `static` — drop
these keywords. (Note: `static` is sometimes load-bearing — keep it if
removing it would change runtime semantics. E.g. `static method()` is fine
to strip; `static CONST = 1` is fine to strip. Just remove the keyword.)

### Generics → DELETE

```ts
function foo<T>(x: T): T { return x }
class Foo<T> { ... }
const x: Array<string> = []
foo<number>(42)
```

becomes

```js
function foo(x) { return x }
class Foo { ... }
const x = []
foo(42)
```

### Non-null assertion `!` → drop

`x!.foo` becomes `x.foo`.

### Type casts `as T` / `as unknown as T` / `as const` / `satisfies T` → drop

`x as Foo` becomes `x`.

### `implements Y` → drop the `implements` keyword

```ts
class Foo implements Bar, Baz { ... }
```

becomes

```js
class Foo { ... }
```

## Things to look out for

1. **JSX/TSX**: There should be no `.tsx` files in this codebase. If you find
   one, stop and ask.

2. **Decorator syntax** (`@decorator`): TypeScript-only, no runtime equivalent.
   The codebase doesn't use decorators — but if you spot one, drop it.

3. **Type guards / `instanceof` / etc.**: these are runtime — keep as-is.

4. **`as` in `import { X as Y }`**: NOT a type cast. It's a rename. Keep
   this as `require({ X: Y })`.

5. **String literals containing `:` or `: Type` patterns**: do NOT modify
   strings. The string-aware processing in the conversion scripts handles
   this; manual conversion should be careful around template literals too.

6. **Comments**: preserve them. Don't strip JSDoc, don't strip block comments,
   don't strip `//` line comments.

## Default-export dual-binding

Many routers in this codebase are imported as both `require('./users')` and
`require('./users').default`. The `src/index.js` mounts them as
`require('./routes/users').default`. Therefore every router/controller file
with `export default router` MUST end with:

```js
module.exports = router;
module.exports.default = router;
```

The dual-binding ensures both call sites work.

## Process

1. **Read each file in full** before converting.
2. **Apply the rules above** — preserve all runtime semantics, strip all
   types.
3. **Write the converted file** to the same path with `.js` extension.
4. **Delete the original `.ts` file**.
5. **Run `node -c <file>` or `node --check <file>`** to verify the
   converted file is syntactically valid JavaScript. If it fails, fix it.

For pure-type files (only `interface`/`type`/`enum`/`declare` content), the
converted file becomes empty — write `module.exports = {}\n` and delete the
original.

## Final cleanup (after all files converted)

1. Delete `src/register.js`.
2. Remove `require('./register')` and its comment from `src/index.js`.
3. Remove `require('../register')` from `src/middleware/auth.middleware.test.js`.
4. Delete `tsconfig.json`.
5. Update `package.json`:
   - `start`: `node src/index.js`
   - `dev`: `node --watch src/index.js`
   - `restart`: kill-port 4000 + start
   - `prisma.seed`: `node prisma/seed.js`
   - Remove `ts-node`, `typescript`, `@types/*` from `devDependencies`.