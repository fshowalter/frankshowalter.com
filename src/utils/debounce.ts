/**
 * Shared debounce utilities
 * Originally lifted from underscore.js, now used across the codebase
 */

type OnChangeHandler = (value: string) => void;

/**
 * Debounce function for string onChange handlers (used by TextFilter and Search)
 * @param func The onChange handler function
 * @param wait The number of milliseconds to wait
 * @returns Debounced onChange handler
 */
export function debounce(func: OnChangeHandler, wait: number): OnChangeHandler {
  let timeout: NodeJS.Timeout | undefined;

  const later = function later(value: string) {
    timeout = undefined;
    func(value);
  };

  return function debouncedFunction(value: string): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = delay(later, wait, value);
  };
}

/**
 * Alias for backward compatibility with TextFilter component
 * @param func The onChange handler function
 * @param wait The number of milliseconds to wait
 * @returns Debounced onChange handler
 */
export function debounceOnChange(
  func: OnChangeHandler,
  wait: number,
): OnChangeHandler {
  return debounce(func, wait);
}

/**
 * Wraps a given function in a setTimeout call with the given milliseconds.
 * @param func The function to wrap.
 * @param wait The number of milliseconds to wait before executing.
 * @param value The string value to pass to the function.
 */
function delay(
  func: OnChangeHandler,
  wait: number,
  value: string,
): NodeJS.Timeout {
  return setTimeout(function delayWrap() {
    return func(value);
  }, wait);
}
