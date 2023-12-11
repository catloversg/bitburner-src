import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html lang='en'></html>", { pretendToBeVisual: true });
// @ts-expect-error jsdom
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.location = dom.window.location;

// import { parseHTML } from "linkedom";
//
// const {
//   window, document, navigator, location,
// } = parseHTML("<!doctype html><html lang='en'></html>");
// globalThis.window = window;
// globalThis.document = document;
// globalThis.navigator = navigator;
// globalThis.location = location;

// console.log(window);
// console.log(document);
// console.log(navigator);
// console.log(location);

// console.log(window !== undefined);
// console.log(document !== undefined);
// console.log(navigator !== undefined);
// console.log(location !== undefined);
// console.log(window.getComputedStyle !== undefined);
// console.log(window.setTimeout !== undefined);
// console.log(window.addEventListener !== undefined);
// console.log(document.body.style.background !== undefined);
// console.log(navigator.userAgent !== undefined);
// console.log(location.reload !== undefined);
// console.log(window.location.href !== undefined);
