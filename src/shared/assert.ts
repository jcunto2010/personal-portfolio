/**
 * Asserts that a condition is truthy at runtime.
 * Narrows the type of `condition` to `true` in the calling scope.
 *
 * @example
 * const el = document.getElementById('root')
 * assert(el !== null, 'Root element must exist')
 * el.innerHTML = '...' // el is now HTMLElement, not null
 */
export function assert(
  condition: unknown,
  message = 'Assertion failed',
): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}
