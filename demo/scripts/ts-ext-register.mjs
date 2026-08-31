// Entry point for `node --import ./scripts/ts-ext-register.mjs`.
import { register } from "node:module";
register("./ts-ext-hooks.mjs", import.meta.url);
