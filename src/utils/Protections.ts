// This file is imported for side effects only.
/* Prevent inadvertantly redefining certain window properties,
   which are known to cause unrecoverable game errors when redefined.
   The player is able to redefine these properties as writable if desired. */
if (globalThis.window) {
  Object.defineProperties(window, {
    Number: { writable: false },
    Object: { writable: false },
    String: { writable: false },
  });
}
