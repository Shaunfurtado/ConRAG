"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/micromark-extension-gfm";
exports.ids = ["vendor-chunks/micromark-extension-gfm"];
exports.modules = {

/***/ "(ssr)/./node_modules/micromark-extension-gfm/index.js":
/*!*******************************************************!*\
  !*** ./node_modules/micromark-extension-gfm/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   gfm: () => (/* binding */ gfm),\n/* harmony export */   gfmHtml: () => (/* binding */ gfmHtml)\n/* harmony export */ });\n/* harmony import */ var micromark_util_combine_extensions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-combine-extensions */ \"(ssr)/./node_modules/micromark-util-combine-extensions/index.js\");\n/* harmony import */ var micromark_extension_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-extension-gfm-autolink-literal */ \"(ssr)/./node_modules/micromark-extension-gfm-autolink-literal/dev/lib/syntax.js\");\n/* harmony import */ var micromark_extension_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! micromark-extension-gfm-autolink-literal */ \"(ssr)/./node_modules/micromark-extension-gfm-autolink-literal/dev/lib/html.js\");\n/* harmony import */ var micromark_extension_gfm_footnote__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! micromark-extension-gfm-footnote */ \"(ssr)/./node_modules/micromark-extension-gfm-footnote/dev/lib/syntax.js\");\n/* harmony import */ var micromark_extension_gfm_footnote__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! micromark-extension-gfm-footnote */ \"(ssr)/./node_modules/micromark-extension-gfm-footnote/dev/lib/html.js\");\n/* harmony import */ var micromark_extension_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! micromark-extension-gfm-strikethrough */ \"(ssr)/./node_modules/micromark-extension-gfm-strikethrough/dev/lib/syntax.js\");\n/* harmony import */ var micromark_extension_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! micromark-extension-gfm-strikethrough */ \"(ssr)/./node_modules/micromark-extension-gfm-strikethrough/dev/lib/html.js\");\n/* harmony import */ var micromark_extension_gfm_table__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! micromark-extension-gfm-table */ \"(ssr)/./node_modules/micromark-extension-gfm-table/dev/lib/syntax.js\");\n/* harmony import */ var micromark_extension_gfm_table__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! micromark-extension-gfm-table */ \"(ssr)/./node_modules/micromark-extension-gfm-table/dev/lib/html.js\");\n/* harmony import */ var micromark_extension_gfm_tagfilter__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! micromark-extension-gfm-tagfilter */ \"(ssr)/./node_modules/micromark-extension-gfm-tagfilter/lib/index.js\");\n/* harmony import */ var micromark_extension_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! micromark-extension-gfm-task-list-item */ \"(ssr)/./node_modules/micromark-extension-gfm-task-list-item/dev/lib/syntax.js\");\n/* harmony import */ var micromark_extension_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! micromark-extension-gfm-task-list-item */ \"(ssr)/./node_modules/micromark-extension-gfm-task-list-item/dev/lib/html.js\");\n/**\n * @typedef {import('micromark-extension-gfm-footnote').HtmlOptions} HtmlOptions\n * @typedef {import('micromark-extension-gfm-strikethrough').Options} Options\n * @typedef {import('micromark-util-types').Extension} Extension\n * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension\n */\n\n\n\n\n\n\n\n\n\n/**\n * Create an extension for `micromark` to enable GFM syntax.\n *\n * @param {Options | null | undefined} [options]\n *   Configuration (optional).\n *\n *   Passed to `micromark-extens-gfm-strikethrough`.\n * @returns {Extension}\n *   Extension for `micromark` that can be passed in `extensions` to enable GFM\n *   syntax.\n */\nfunction gfm(options) {\n  return (0,micromark_util_combine_extensions__WEBPACK_IMPORTED_MODULE_0__.combineExtensions)([\n    (0,micromark_extension_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_1__.gfmAutolinkLiteral)(),\n    (0,micromark_extension_gfm_footnote__WEBPACK_IMPORTED_MODULE_2__.gfmFootnote)(),\n    (0,micromark_extension_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_3__.gfmStrikethrough)(options),\n    (0,micromark_extension_gfm_table__WEBPACK_IMPORTED_MODULE_4__.gfmTable)(),\n    (0,micromark_extension_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_5__.gfmTaskListItem)()\n  ])\n}\n\n/**\n * Create an extension for `micromark` to support GFM when serializing to HTML.\n *\n * @param {HtmlOptions | null | undefined} [options]\n *   Configuration (optional).\n *\n *   Passed to `micromark-extens-gfm-footnote`.\n * @returns {HtmlExtension}\n *   Extension for `micromark` that can be passed in `htmlExtensions` to\n *   support GFM when serializing to HTML.\n */\nfunction gfmHtml(options) {\n  return (0,micromark_util_combine_extensions__WEBPACK_IMPORTED_MODULE_0__.combineHtmlExtensions)([\n    (0,micromark_extension_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_6__.gfmAutolinkLiteralHtml)(),\n    (0,micromark_extension_gfm_footnote__WEBPACK_IMPORTED_MODULE_7__.gfmFootnoteHtml)(options),\n    (0,micromark_extension_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_8__.gfmStrikethroughHtml)(),\n    (0,micromark_extension_gfm_table__WEBPACK_IMPORTED_MODULE_9__.gfmTableHtml)(),\n    (0,micromark_extension_gfm_tagfilter__WEBPACK_IMPORTED_MODULE_10__.gfmTagfilterHtml)(),\n    (0,micromark_extension_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_11__.gfmTaskListItemHtml)()\n  ])\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0vaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBLGFBQWEsd0RBQXdEO0FBQ3JFLGFBQWEseURBQXlEO0FBQ3RFLGFBQWEsMENBQTBDO0FBQ3ZELGFBQWEsOENBQThDO0FBQzNEOztBQUswQztBQUlPO0FBQzRCO0FBSS9CO0FBQ3NCO0FBQ0Y7QUFJbkI7O0FBRS9DO0FBQ0E7QUFDQTtBQUNBLFdBQVcsNEJBQTRCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDTztBQUNQLFNBQVMsb0ZBQWlCO0FBQzFCLElBQUksNEZBQWtCO0FBQ3RCLElBQUksNkVBQVc7QUFDZixJQUFJLHVGQUFnQjtBQUNwQixJQUFJLHVFQUFRO0FBQ1osSUFBSSx1RkFBZTtBQUNuQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsZ0NBQWdDO0FBQzNDO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDTztBQUNQLFNBQVMsd0ZBQXFCO0FBQzlCLElBQUksZ0dBQXNCO0FBQzFCLElBQUksaUZBQWU7QUFDbkIsSUFBSSwyRkFBb0I7QUFDeEIsSUFBSSwyRUFBWTtBQUNoQixJQUFJLG9GQUFnQjtBQUNwQixJQUFJLDRGQUFtQjtBQUN2QjtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnJvbnRlbmQvLi9ub2RlX21vZHVsZXMvbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0vaW5kZXguanM/MWE3ZiJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ21pY3JvbWFyay1leHRlbnNpb24tZ2ZtLWZvb3Rub3RlJykuSHRtbE9wdGlvbnN9IEh0bWxPcHRpb25zXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdtaWNyb21hcmstZXh0ZW5zaW9uLWdmbS1zdHJpa2V0aHJvdWdoJykuT3B0aW9uc30gT3B0aW9uc1xuICogQHR5cGVkZWYge2ltcG9ydCgnbWljcm9tYXJrLXV0aWwtdHlwZXMnKS5FeHRlbnNpb259IEV4dGVuc2lvblxuICogQHR5cGVkZWYge2ltcG9ydCgnbWljcm9tYXJrLXV0aWwtdHlwZXMnKS5IdG1sRXh0ZW5zaW9ufSBIdG1sRXh0ZW5zaW9uXG4gKi9cblxuaW1wb3J0IHtcbiAgY29tYmluZUV4dGVuc2lvbnMsXG4gIGNvbWJpbmVIdG1sRXh0ZW5zaW9uc1xufSBmcm9tICdtaWNyb21hcmstdXRpbC1jb21iaW5lLWV4dGVuc2lvbnMnXG5pbXBvcnQge1xuICBnZm1BdXRvbGlua0xpdGVyYWwsXG4gIGdmbUF1dG9saW5rTGl0ZXJhbEh0bWxcbn0gZnJvbSAnbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0tYXV0b2xpbmstbGl0ZXJhbCdcbmltcG9ydCB7Z2ZtRm9vdG5vdGUsIGdmbUZvb3Rub3RlSHRtbH0gZnJvbSAnbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0tZm9vdG5vdGUnXG5pbXBvcnQge1xuICBnZm1TdHJpa2V0aHJvdWdoLFxuICBnZm1TdHJpa2V0aHJvdWdoSHRtbFxufSBmcm9tICdtaWNyb21hcmstZXh0ZW5zaW9uLWdmbS1zdHJpa2V0aHJvdWdoJ1xuaW1wb3J0IHtnZm1UYWJsZSwgZ2ZtVGFibGVIdG1sfSBmcm9tICdtaWNyb21hcmstZXh0ZW5zaW9uLWdmbS10YWJsZSdcbmltcG9ydCB7Z2ZtVGFnZmlsdGVySHRtbH0gZnJvbSAnbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0tdGFnZmlsdGVyJ1xuaW1wb3J0IHtcbiAgZ2ZtVGFza0xpc3RJdGVtLFxuICBnZm1UYXNrTGlzdEl0ZW1IdG1sXG59IGZyb20gJ21pY3JvbWFyay1leHRlbnNpb24tZ2ZtLXRhc2stbGlzdC1pdGVtJ1xuXG4vKipcbiAqIENyZWF0ZSBhbiBleHRlbnNpb24gZm9yIGBtaWNyb21hcmtgIHRvIGVuYWJsZSBHRk0gc3ludGF4LlxuICpcbiAqIEBwYXJhbSB7T3B0aW9ucyB8IG51bGwgfCB1bmRlZmluZWR9IFtvcHRpb25zXVxuICogICBDb25maWd1cmF0aW9uIChvcHRpb25hbCkuXG4gKlxuICogICBQYXNzZWQgdG8gYG1pY3JvbWFyay1leHRlbnMtZ2ZtLXN0cmlrZXRocm91Z2hgLlxuICogQHJldHVybnMge0V4dGVuc2lvbn1cbiAqICAgRXh0ZW5zaW9uIGZvciBgbWljcm9tYXJrYCB0aGF0IGNhbiBiZSBwYXNzZWQgaW4gYGV4dGVuc2lvbnNgIHRvIGVuYWJsZSBHRk1cbiAqICAgc3ludGF4LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2ZtKG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNvbWJpbmVFeHRlbnNpb25zKFtcbiAgICBnZm1BdXRvbGlua0xpdGVyYWwoKSxcbiAgICBnZm1Gb290bm90ZSgpLFxuICAgIGdmbVN0cmlrZXRocm91Z2gob3B0aW9ucyksXG4gICAgZ2ZtVGFibGUoKSxcbiAgICBnZm1UYXNrTGlzdEl0ZW0oKVxuICBdKVxufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBleHRlbnNpb24gZm9yIGBtaWNyb21hcmtgIHRvIHN1cHBvcnQgR0ZNIHdoZW4gc2VyaWFsaXppbmcgdG8gSFRNTC5cbiAqXG4gKiBAcGFyYW0ge0h0bWxPcHRpb25zIHwgbnVsbCB8IHVuZGVmaW5lZH0gW29wdGlvbnNdXG4gKiAgIENvbmZpZ3VyYXRpb24gKG9wdGlvbmFsKS5cbiAqXG4gKiAgIFBhc3NlZCB0byBgbWljcm9tYXJrLWV4dGVucy1nZm0tZm9vdG5vdGVgLlxuICogQHJldHVybnMge0h0bWxFeHRlbnNpb259XG4gKiAgIEV4dGVuc2lvbiBmb3IgYG1pY3JvbWFya2AgdGhhdCBjYW4gYmUgcGFzc2VkIGluIGBodG1sRXh0ZW5zaW9uc2AgdG9cbiAqICAgc3VwcG9ydCBHRk0gd2hlbiBzZXJpYWxpemluZyB0byBIVE1MLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2ZtSHRtbChvcHRpb25zKSB7XG4gIHJldHVybiBjb21iaW5lSHRtbEV4dGVuc2lvbnMoW1xuICAgIGdmbUF1dG9saW5rTGl0ZXJhbEh0bWwoKSxcbiAgICBnZm1Gb290bm90ZUh0bWwob3B0aW9ucyksXG4gICAgZ2ZtU3RyaWtldGhyb3VnaEh0bWwoKSxcbiAgICBnZm1UYWJsZUh0bWwoKSxcbiAgICBnZm1UYWdmaWx0ZXJIdG1sKCksXG4gICAgZ2ZtVGFza0xpc3RJdGVtSHRtbCgpXG4gIF0pXG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/micromark-extension-gfm/index.js\n");

/***/ })

};
;