"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/remark-rehype";
exports.ids = ["vendor-chunks/remark-rehype"];
exports.modules = {

/***/ "(ssr)/./node_modules/remark-rehype/lib/index.js":
/*!*************************************************!*\
  !*** ./node_modules/remark-rehype/lib/index.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ remarkRehype)\n/* harmony export */ });\n/* harmony import */ var mdast_util_to_hast__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mdast-util-to-hast */ \"(ssr)/./node_modules/mdast-util-to-hast/lib/index.js\");\n// Include `data` fields in mdast and `raw` nodes in hast.\n/// <reference types=\"mdast-util-to-hast\" />\n\n/**\n * @import {Root as HastRoot} from 'hast'\n * @import {Root as MdastRoot} from 'mdast'\n * @import {Options as ToHastOptions} from 'mdast-util-to-hast'\n * @import {Processor} from 'unified'\n * @import {VFile} from 'vfile'\n */\n\n/**\n * @typedef {Omit<ToHastOptions, 'file'>} Options\n *\n * @callback TransformBridge\n *   Bridge-mode.\n *\n *   Runs the destination with the new hast tree.\n *   Discards result.\n * @param {MdastRoot} tree\n *   Tree.\n * @param {VFile} file\n *   File.\n * @returns {Promise<undefined>}\n *   Nothing.\n *\n * @callback TransformMutate\n *  Mutate-mode.\n *\n *  Further transformers run on the hast tree.\n * @param {MdastRoot} tree\n *   Tree.\n * @param {VFile} file\n *   File.\n * @returns {HastRoot}\n *   Tree (hast).\n */\n\n\n\n/**\n * Turn markdown into HTML.\n *\n * ##### Notes\n *\n * ###### Signature\n *\n * *   if a processor is given, runs the (rehype) plugins used on it with a\n *     hast tree, then discards the result (*bridge mode*)\n * *   otherwise, returns a hast tree, the plugins used after `remarkRehype`\n *     are rehype plugins (*mutate mode*)\n *\n * > 👉 **Note**: It’s highly unlikely that you want to pass a `processor`.\n *\n * ###### HTML\n *\n * Raw HTML is available in mdast as `html` nodes and can be embedded in hast\n * as semistandard `raw` nodes.\n * Most plugins ignore `raw` nodes but two notable ones don’t:\n *\n * *   `rehype-stringify` also has an option `allowDangerousHtml` which will\n *     output the raw HTML.\n *     This is typically discouraged as noted by the option name but is useful if\n *     you completely trust authors\n * *   `rehype-raw` can handle the raw embedded HTML strings by parsing them\n *     into standard hast nodes (`element`, `text`, etc).\n *     This is a heavy task as it needs a full HTML parser, but it is the only way\n *     to support untrusted content\n *\n * ###### Footnotes\n *\n * Many options supported here relate to footnotes.\n * Footnotes are not specified by CommonMark, which we follow by default.\n * They are supported by GitHub, so footnotes can be enabled in markdown with\n * `remark-gfm`.\n *\n * The options `footnoteBackLabel` and `footnoteLabel` define natural language\n * that explains footnotes, which is hidden for sighted users but shown to\n * assistive technology.\n * When your page is not in English, you must define translated values.\n *\n * Back references use ARIA attributes, but the section label itself uses a\n * heading that is hidden with an `sr-only` class.\n * To show it to sighted users, define different attributes in\n * `footnoteLabelProperties`.\n *\n * ###### Clobbering\n *\n * Footnotes introduces a problem, as it links footnote calls to footnote\n * definitions on the page through `id` attributes generated from user content,\n * which results in DOM clobbering.\n *\n * DOM clobbering is this:\n *\n * ```html\n * <p id=x></p>\n * <script>alert(x) // `x` now refers to the DOM `p#x` element</script>\n * ```\n *\n * Elements by their ID are made available by browsers on the `window` object,\n * which is a security risk.\n * Using a prefix solves this problem.\n *\n * More information on how to handle clobbering and the prefix is explained in\n * *Example: headings (DOM clobbering)* in `rehype-sanitize`.\n *\n * ###### Unknown nodes\n *\n * Unknown nodes are nodes with a type that isn’t in `handlers` or `passThrough`.\n * The default behavior for unknown nodes is:\n *\n * *   when the node has a `value` (and doesn’t have `data.hName`,\n *     `data.hProperties`, or `data.hChildren`, see later), create a hast `text`\n *     node\n * *   otherwise, create a `<div>` element (which could be changed with\n *     `data.hName`), with its children mapped from mdast to hast as well\n *\n * This behavior can be changed by passing an `unknownHandler`.\n *\n * @overload\n * @param {Processor} processor\n * @param {Readonly<Options> | null | undefined} [options]\n * @returns {TransformBridge}\n *\n * @overload\n * @param {Readonly<Options> | null | undefined} [options]\n * @returns {TransformMutate}\n *\n * @param {Readonly<Options> | Processor | null | undefined} [destination]\n *   Processor or configuration (optional).\n * @param {Readonly<Options> | null | undefined} [options]\n *   When a processor was given, configuration (optional).\n * @returns {TransformBridge | TransformMutate}\n *   Transform.\n */\nfunction remarkRehype(destination, options) {\n  if (destination && 'run' in destination) {\n    /**\n     * @type {TransformBridge}\n     */\n    return async function (tree, file) {\n      // Cast because root in -> root out.\n      const hastTree = /** @type {HastRoot} */ (\n        (0,mdast_util_to_hast__WEBPACK_IMPORTED_MODULE_0__.toHast)(tree, {file, ...options})\n      )\n      await destination.run(hastTree, file)\n    }\n  }\n\n  /**\n   * @type {TransformMutate}\n   */\n  return function (tree, file) {\n    // Cast because root in -> root out.\n    // To do: in the future, disallow ` || options` fallback.\n    // With `unified-engine`, `destination` can be `undefined` but\n    // `options` will be the file set.\n    // We should not pass that as `options`.\n    return /** @type {HastRoot} */ (\n      (0,mdast_util_to_hast__WEBPACK_IMPORTED_MODULE_0__.toHast)(tree, {file, ...(destination || options)})\n    )\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmVtYXJrLXJlaHlwZS9saWIvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBOztBQUVBO0FBQ0EsWUFBWSxrQkFBa0I7QUFDOUIsWUFBWSxtQkFBbUI7QUFDL0IsWUFBWSwwQkFBMEI7QUFDdEMsWUFBWSxXQUFXO0FBQ3ZCLFlBQVksT0FBTztBQUNuQjs7QUFFQTtBQUNBLGFBQWEsNkJBQTZCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsV0FBVztBQUN0QjtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFdBQVc7QUFDdEI7QUFDQSxXQUFXLE9BQU87QUFDbEI7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFeUM7O0FBRXpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFdBQVc7QUFDdEIsV0FBVyxzQ0FBc0M7QUFDakQsYUFBYTtBQUNiO0FBQ0E7QUFDQSxXQUFXLHNDQUFzQztBQUNqRCxhQUFhO0FBQ2I7QUFDQSxXQUFXLGtEQUFrRDtBQUM3RDtBQUNBLFdBQVcsc0NBQXNDO0FBQ2pEO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDZTtBQUNmO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLFVBQVU7QUFDNUMsUUFBUSwwREFBTSxRQUFRLGlCQUFpQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixVQUFVO0FBQ2hDLE1BQU0sMERBQU0sUUFBUSxrQ0FBa0M7QUFDdEQ7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnJvbnRlbmQvLi9ub2RlX21vZHVsZXMvcmVtYXJrLXJlaHlwZS9saWIvaW5kZXguanM/NTJlZiJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbmNsdWRlIGBkYXRhYCBmaWVsZHMgaW4gbWRhc3QgYW5kIGByYXdgIG5vZGVzIGluIGhhc3QuXG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cIm1kYXN0LXV0aWwtdG8taGFzdFwiIC8+XG5cbi8qKlxuICogQGltcG9ydCB7Um9vdCBhcyBIYXN0Um9vdH0gZnJvbSAnaGFzdCdcbiAqIEBpbXBvcnQge1Jvb3QgYXMgTWRhc3RSb290fSBmcm9tICdtZGFzdCdcbiAqIEBpbXBvcnQge09wdGlvbnMgYXMgVG9IYXN0T3B0aW9uc30gZnJvbSAnbWRhc3QtdXRpbC10by1oYXN0J1xuICogQGltcG9ydCB7UHJvY2Vzc29yfSBmcm9tICd1bmlmaWVkJ1xuICogQGltcG9ydCB7VkZpbGV9IGZyb20gJ3ZmaWxlJ1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09taXQ8VG9IYXN0T3B0aW9ucywgJ2ZpbGUnPn0gT3B0aW9uc1xuICpcbiAqIEBjYWxsYmFjayBUcmFuc2Zvcm1CcmlkZ2VcbiAqICAgQnJpZGdlLW1vZGUuXG4gKlxuICogICBSdW5zIHRoZSBkZXN0aW5hdGlvbiB3aXRoIHRoZSBuZXcgaGFzdCB0cmVlLlxuICogICBEaXNjYXJkcyByZXN1bHQuXG4gKiBAcGFyYW0ge01kYXN0Um9vdH0gdHJlZVxuICogICBUcmVlLlxuICogQHBhcmFtIHtWRmlsZX0gZmlsZVxuICogICBGaWxlLlxuICogQHJldHVybnMge1Byb21pc2U8dW5kZWZpbmVkPn1cbiAqICAgTm90aGluZy5cbiAqXG4gKiBAY2FsbGJhY2sgVHJhbnNmb3JtTXV0YXRlXG4gKiAgTXV0YXRlLW1vZGUuXG4gKlxuICogIEZ1cnRoZXIgdHJhbnNmb3JtZXJzIHJ1biBvbiB0aGUgaGFzdCB0cmVlLlxuICogQHBhcmFtIHtNZGFzdFJvb3R9IHRyZWVcbiAqICAgVHJlZS5cbiAqIEBwYXJhbSB7VkZpbGV9IGZpbGVcbiAqICAgRmlsZS5cbiAqIEByZXR1cm5zIHtIYXN0Um9vdH1cbiAqICAgVHJlZSAoaGFzdCkuXG4gKi9cblxuaW1wb3J0IHt0b0hhc3R9IGZyb20gJ21kYXN0LXV0aWwtdG8taGFzdCdcblxuLyoqXG4gKiBUdXJuIG1hcmtkb3duIGludG8gSFRNTC5cbiAqXG4gKiAjIyMjIyBOb3Rlc1xuICpcbiAqICMjIyMjIyBTaWduYXR1cmVcbiAqXG4gKiAqICAgaWYgYSBwcm9jZXNzb3IgaXMgZ2l2ZW4sIHJ1bnMgdGhlIChyZWh5cGUpIHBsdWdpbnMgdXNlZCBvbiBpdCB3aXRoIGFcbiAqICAgICBoYXN0IHRyZWUsIHRoZW4gZGlzY2FyZHMgdGhlIHJlc3VsdCAoKmJyaWRnZSBtb2RlKilcbiAqICogICBvdGhlcndpc2UsIHJldHVybnMgYSBoYXN0IHRyZWUsIHRoZSBwbHVnaW5zIHVzZWQgYWZ0ZXIgYHJlbWFya1JlaHlwZWBcbiAqICAgICBhcmUgcmVoeXBlIHBsdWdpbnMgKCptdXRhdGUgbW9kZSopXG4gKlxuICogPiDwn5GJICoqTm90ZSoqOiBJdOKAmXMgaGlnaGx5IHVubGlrZWx5IHRoYXQgeW91IHdhbnQgdG8gcGFzcyBhIGBwcm9jZXNzb3JgLlxuICpcbiAqICMjIyMjIyBIVE1MXG4gKlxuICogUmF3IEhUTUwgaXMgYXZhaWxhYmxlIGluIG1kYXN0IGFzIGBodG1sYCBub2RlcyBhbmQgY2FuIGJlIGVtYmVkZGVkIGluIGhhc3RcbiAqIGFzIHNlbWlzdGFuZGFyZCBgcmF3YCBub2Rlcy5cbiAqIE1vc3QgcGx1Z2lucyBpZ25vcmUgYHJhd2Agbm9kZXMgYnV0IHR3byBub3RhYmxlIG9uZXMgZG9u4oCZdDpcbiAqXG4gKiAqICAgYHJlaHlwZS1zdHJpbmdpZnlgIGFsc28gaGFzIGFuIG9wdGlvbiBgYWxsb3dEYW5nZXJvdXNIdG1sYCB3aGljaCB3aWxsXG4gKiAgICAgb3V0cHV0IHRoZSByYXcgSFRNTC5cbiAqICAgICBUaGlzIGlzIHR5cGljYWxseSBkaXNjb3VyYWdlZCBhcyBub3RlZCBieSB0aGUgb3B0aW9uIG5hbWUgYnV0IGlzIHVzZWZ1bCBpZlxuICogICAgIHlvdSBjb21wbGV0ZWx5IHRydXN0IGF1dGhvcnNcbiAqICogICBgcmVoeXBlLXJhd2AgY2FuIGhhbmRsZSB0aGUgcmF3IGVtYmVkZGVkIEhUTUwgc3RyaW5ncyBieSBwYXJzaW5nIHRoZW1cbiAqICAgICBpbnRvIHN0YW5kYXJkIGhhc3Qgbm9kZXMgKGBlbGVtZW50YCwgYHRleHRgLCBldGMpLlxuICogICAgIFRoaXMgaXMgYSBoZWF2eSB0YXNrIGFzIGl0IG5lZWRzIGEgZnVsbCBIVE1MIHBhcnNlciwgYnV0IGl0IGlzIHRoZSBvbmx5IHdheVxuICogICAgIHRvIHN1cHBvcnQgdW50cnVzdGVkIGNvbnRlbnRcbiAqXG4gKiAjIyMjIyMgRm9vdG5vdGVzXG4gKlxuICogTWFueSBvcHRpb25zIHN1cHBvcnRlZCBoZXJlIHJlbGF0ZSB0byBmb290bm90ZXMuXG4gKiBGb290bm90ZXMgYXJlIG5vdCBzcGVjaWZpZWQgYnkgQ29tbW9uTWFyaywgd2hpY2ggd2UgZm9sbG93IGJ5IGRlZmF1bHQuXG4gKiBUaGV5IGFyZSBzdXBwb3J0ZWQgYnkgR2l0SHViLCBzbyBmb290bm90ZXMgY2FuIGJlIGVuYWJsZWQgaW4gbWFya2Rvd24gd2l0aFxuICogYHJlbWFyay1nZm1gLlxuICpcbiAqIFRoZSBvcHRpb25zIGBmb290bm90ZUJhY2tMYWJlbGAgYW5kIGBmb290bm90ZUxhYmVsYCBkZWZpbmUgbmF0dXJhbCBsYW5ndWFnZVxuICogdGhhdCBleHBsYWlucyBmb290bm90ZXMsIHdoaWNoIGlzIGhpZGRlbiBmb3Igc2lnaHRlZCB1c2VycyBidXQgc2hvd24gdG9cbiAqIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LlxuICogV2hlbiB5b3VyIHBhZ2UgaXMgbm90IGluIEVuZ2xpc2gsIHlvdSBtdXN0IGRlZmluZSB0cmFuc2xhdGVkIHZhbHVlcy5cbiAqXG4gKiBCYWNrIHJlZmVyZW5jZXMgdXNlIEFSSUEgYXR0cmlidXRlcywgYnV0IHRoZSBzZWN0aW9uIGxhYmVsIGl0c2VsZiB1c2VzIGFcbiAqIGhlYWRpbmcgdGhhdCBpcyBoaWRkZW4gd2l0aCBhbiBgc3Itb25seWAgY2xhc3MuXG4gKiBUbyBzaG93IGl0IHRvIHNpZ2h0ZWQgdXNlcnMsIGRlZmluZSBkaWZmZXJlbnQgYXR0cmlidXRlcyBpblxuICogYGZvb3Rub3RlTGFiZWxQcm9wZXJ0aWVzYC5cbiAqXG4gKiAjIyMjIyMgQ2xvYmJlcmluZ1xuICpcbiAqIEZvb3Rub3RlcyBpbnRyb2R1Y2VzIGEgcHJvYmxlbSwgYXMgaXQgbGlua3MgZm9vdG5vdGUgY2FsbHMgdG8gZm9vdG5vdGVcbiAqIGRlZmluaXRpb25zIG9uIHRoZSBwYWdlIHRocm91Z2ggYGlkYCBhdHRyaWJ1dGVzIGdlbmVyYXRlZCBmcm9tIHVzZXIgY29udGVudCxcbiAqIHdoaWNoIHJlc3VsdHMgaW4gRE9NIGNsb2JiZXJpbmcuXG4gKlxuICogRE9NIGNsb2JiZXJpbmcgaXMgdGhpczpcbiAqXG4gKiBgYGBodG1sXG4gKiA8cCBpZD14PjwvcD5cbiAqIDxzY3JpcHQ+YWxlcnQoeCkgLy8gYHhgIG5vdyByZWZlcnMgdG8gdGhlIERPTSBgcCN4YCBlbGVtZW50PC9zY3JpcHQ+XG4gKiBgYGBcbiAqXG4gKiBFbGVtZW50cyBieSB0aGVpciBJRCBhcmUgbWFkZSBhdmFpbGFibGUgYnkgYnJvd3NlcnMgb24gdGhlIGB3aW5kb3dgIG9iamVjdCxcbiAqIHdoaWNoIGlzIGEgc2VjdXJpdHkgcmlzay5cbiAqIFVzaW5nIGEgcHJlZml4IHNvbHZlcyB0aGlzIHByb2JsZW0uXG4gKlxuICogTW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdG8gaGFuZGxlIGNsb2JiZXJpbmcgYW5kIHRoZSBwcmVmaXggaXMgZXhwbGFpbmVkIGluXG4gKiAqRXhhbXBsZTogaGVhZGluZ3MgKERPTSBjbG9iYmVyaW5nKSogaW4gYHJlaHlwZS1zYW5pdGl6ZWAuXG4gKlxuICogIyMjIyMjIFVua25vd24gbm9kZXNcbiAqXG4gKiBVbmtub3duIG5vZGVzIGFyZSBub2RlcyB3aXRoIGEgdHlwZSB0aGF0IGlzbuKAmXQgaW4gYGhhbmRsZXJzYCBvciBgcGFzc1Rocm91Z2hgLlxuICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgZm9yIHVua25vd24gbm9kZXMgaXM6XG4gKlxuICogKiAgIHdoZW4gdGhlIG5vZGUgaGFzIGEgYHZhbHVlYCAoYW5kIGRvZXNu4oCZdCBoYXZlIGBkYXRhLmhOYW1lYCxcbiAqICAgICBgZGF0YS5oUHJvcGVydGllc2AsIG9yIGBkYXRhLmhDaGlsZHJlbmAsIHNlZSBsYXRlciksIGNyZWF0ZSBhIGhhc3QgYHRleHRgXG4gKiAgICAgbm9kZVxuICogKiAgIG90aGVyd2lzZSwgY3JlYXRlIGEgYDxkaXY+YCBlbGVtZW50ICh3aGljaCBjb3VsZCBiZSBjaGFuZ2VkIHdpdGhcbiAqICAgICBgZGF0YS5oTmFtZWApLCB3aXRoIGl0cyBjaGlsZHJlbiBtYXBwZWQgZnJvbSBtZGFzdCB0byBoYXN0IGFzIHdlbGxcbiAqXG4gKiBUaGlzIGJlaGF2aW9yIGNhbiBiZSBjaGFuZ2VkIGJ5IHBhc3NpbmcgYW4gYHVua25vd25IYW5kbGVyYC5cbiAqXG4gKiBAb3ZlcmxvYWRcbiAqIEBwYXJhbSB7UHJvY2Vzc29yfSBwcm9jZXNzb3JcbiAqIEBwYXJhbSB7UmVhZG9ubHk8T3B0aW9ucz4gfCBudWxsIHwgdW5kZWZpbmVkfSBbb3B0aW9uc11cbiAqIEByZXR1cm5zIHtUcmFuc2Zvcm1CcmlkZ2V9XG4gKlxuICogQG92ZXJsb2FkXG4gKiBAcGFyYW0ge1JlYWRvbmx5PE9wdGlvbnM+IHwgbnVsbCB8IHVuZGVmaW5lZH0gW29wdGlvbnNdXG4gKiBAcmV0dXJucyB7VHJhbnNmb3JtTXV0YXRlfVxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHk8T3B0aW9ucz4gfCBQcm9jZXNzb3IgfCBudWxsIHwgdW5kZWZpbmVkfSBbZGVzdGluYXRpb25dXG4gKiAgIFByb2Nlc3NvciBvciBjb25maWd1cmF0aW9uIChvcHRpb25hbCkuXG4gKiBAcGFyYW0ge1JlYWRvbmx5PE9wdGlvbnM+IHwgbnVsbCB8IHVuZGVmaW5lZH0gW29wdGlvbnNdXG4gKiAgIFdoZW4gYSBwcm9jZXNzb3Igd2FzIGdpdmVuLCBjb25maWd1cmF0aW9uIChvcHRpb25hbCkuXG4gKiBAcmV0dXJucyB7VHJhbnNmb3JtQnJpZGdlIHwgVHJhbnNmb3JtTXV0YXRlfVxuICogICBUcmFuc2Zvcm0uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbWFya1JlaHlwZShkZXN0aW5hdGlvbiwgb3B0aW9ucykge1xuICBpZiAoZGVzdGluYXRpb24gJiYgJ3J1bicgaW4gZGVzdGluYXRpb24pIHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7VHJhbnNmb3JtQnJpZGdlfVxuICAgICAqL1xuICAgIHJldHVybiBhc3luYyBmdW5jdGlvbiAodHJlZSwgZmlsZSkge1xuICAgICAgLy8gQ2FzdCBiZWNhdXNlIHJvb3QgaW4gLT4gcm9vdCBvdXQuXG4gICAgICBjb25zdCBoYXN0VHJlZSA9IC8qKiBAdHlwZSB7SGFzdFJvb3R9ICovIChcbiAgICAgICAgdG9IYXN0KHRyZWUsIHtmaWxlLCAuLi5vcHRpb25zfSlcbiAgICAgIClcbiAgICAgIGF3YWl0IGRlc3RpbmF0aW9uLnJ1bihoYXN0VHJlZSwgZmlsZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge1RyYW5zZm9ybU11dGF0ZX1cbiAgICovXG4gIHJldHVybiBmdW5jdGlvbiAodHJlZSwgZmlsZSkge1xuICAgIC8vIENhc3QgYmVjYXVzZSByb290IGluIC0+IHJvb3Qgb3V0LlxuICAgIC8vIFRvIGRvOiBpbiB0aGUgZnV0dXJlLCBkaXNhbGxvdyBgIHx8IG9wdGlvbnNgIGZhbGxiYWNrLlxuICAgIC8vIFdpdGggYHVuaWZpZWQtZW5naW5lYCwgYGRlc3RpbmF0aW9uYCBjYW4gYmUgYHVuZGVmaW5lZGAgYnV0XG4gICAgLy8gYG9wdGlvbnNgIHdpbGwgYmUgdGhlIGZpbGUgc2V0LlxuICAgIC8vIFdlIHNob3VsZCBub3QgcGFzcyB0aGF0IGFzIGBvcHRpb25zYC5cbiAgICByZXR1cm4gLyoqIEB0eXBlIHtIYXN0Um9vdH0gKi8gKFxuICAgICAgdG9IYXN0KHRyZWUsIHtmaWxlLCAuLi4oZGVzdGluYXRpb24gfHwgb3B0aW9ucyl9KVxuICAgIClcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/remark-rehype/lib/index.js\n");

/***/ })

};
;