import { handleUnknownError } from "./Netscript/ErrorMessages";

export function setupUncaughtPromiseHandler(): void {
  globalThis.addEventListener?.("unhandledrejection", (e) => {
    e.preventDefault();
    handleUnknownError(
      e.reason,
      null,
      "UNCAUGHT PROMISE ERROR\nYou forgot to await a promise\nmaybe hack / grow / weaken ?\n\n",
    );
  });
}
