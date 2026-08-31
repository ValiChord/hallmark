/**
 * Resolve extensionless relative imports to `.ts`.
 *
 * The `src/lib/raf` modules import each other as `./types`, which Vite resolves
 * and Node's ESM loader does not. Rather than rewrite application source to suit
 * the test runner, teach the runner the same rule Vite uses.
 */
const HAS_EXTENSION = /\.[mc]?[jt]sx?$/;

export async function resolve(specifier, context, next) {
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !HAS_EXTENSION.test(specifier)) {
    try {
      return await next(`${specifier}.ts`, context);
    } catch {
      // Fall through to the default resolution and let it report the failure.
    }
  }
  return next(specifier, context);
}
