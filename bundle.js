/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/css-loader/dist/cjs.js!./src/css/styles.css"
/*!**********************************************************************!*\
  !*** ../../node_modules/css-loader/dist/cjs.js!./src/css/styles.css ***!
  \**********************************************************************/
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "../../node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/api.js */ "../../node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.rdoc-root {
  font-size: calc(var(--presentation-scale) * 12pt);
  font-family: "Trebuchet MS", sans-serif;
}

.rdoc-root * {
  box-sizing: border-box;
}

.rdoc-root .rdoc-viewport {
}

.rdoc-root .rdoc-viewport .rdoc-backgrounds {
}

.rdoc-root .rdoc-viewport .rdoc-backgrounds .rdoc-section-background {
}

.rdoc-root .rdoc-viewport .rdoc-elements {
}

.rdoc-root .rdoc-viewport .rdoc-elements .rdoc-section-content {
}

.rdoc-root .rdoc-viewport .rdoc-elements .rdoc-section-content .rdoc-element {
}

.rdoc-root .rdoc-overlay {
}

/*
 */

.rdoc-root .rdoc-elements .rdoc-text-box-element {
}

.rdoc-root .rdoc-elements .rdoc-image-element {
}
`, "",{"version":3,"sources":["webpack://./src/css/styles.css"],"names":[],"mappings":"AAAA;EACE,iDAAiD;EACjD,uCAAuC;AACzC;;AAEA;EACE,sBAAsB;AACxB;;AAEA;AACA;;AAEA;AACA;;AAEA;AACA;;AAEA;AACA;;AAEA;AACA;;AAEA;AACA;;AAEA;AACA;;AAEA;EACE;;AAEF;AACA;;AAEA;AACA","sourcesContent":[".rdoc-root {\n  font-size: calc(var(--presentation-scale) * 12pt);\n  font-family: \"Trebuchet MS\", sans-serif;\n}\n\n.rdoc-root * {\n  box-sizing: border-box;\n}\n\n.rdoc-root .rdoc-viewport {\n}\n\n.rdoc-root .rdoc-viewport .rdoc-backgrounds {\n}\n\n.rdoc-root .rdoc-viewport .rdoc-backgrounds .rdoc-section-background {\n}\n\n.rdoc-root .rdoc-viewport .rdoc-elements {\n}\n\n.rdoc-root .rdoc-viewport .rdoc-elements .rdoc-section-content {\n}\n\n.rdoc-root .rdoc-viewport .rdoc-elements .rdoc-section-content .rdoc-element {\n}\n\n.rdoc-root .rdoc-overlay {\n}\n\n/*\n */\n\n.rdoc-root .rdoc-elements .rdoc-text-box-element {\n}\n\n.rdoc-root .rdoc-elements .rdoc-image-element {\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ "../../node_modules/css-loader/dist/runtime/api.js"
/*!*********************************************************!*\
  !*** ../../node_modules/css-loader/dist/runtime/api.js ***!
  \*********************************************************/
(module) {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ },

/***/ "../../node_modules/css-loader/dist/runtime/sourceMaps.js"
/*!****************************************************************!*\
  !*** ../../node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \****************************************************************/
(module) {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ },

/***/ "./src/css/styles.css"
/*!****************************!*\
  !*** ./src/css/styles.css ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "../../node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "../../node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "../../node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "../../node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../../../node_modules/css-loader/dist/cjs.js!./styles.css */ "../../node_modules/css-loader/dist/cjs.js!./src/css/styles.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());
options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ },

/***/ "../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"
/*!********************************************************************************!*\
  !*** ../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \********************************************************************************/
(module) {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ },

/***/ "../../node_modules/style-loader/dist/runtime/insertBySelector.js"
/*!************************************************************************!*\
  !*** ../../node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \************************************************************************/
(module) {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ },

/***/ "../../node_modules/style-loader/dist/runtime/insertStyleElement.js"
/*!**************************************************************************!*\
  !*** ../../node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**************************************************************************/
(module) {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ },

/***/ "../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js"
/*!**************************************************************************************!*\
  !*** ../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**************************************************************************************/
(module, __unused_webpack_exports, __webpack_require__) {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ },

/***/ "../../node_modules/style-loader/dist/runtime/styleDomAPI.js"
/*!*******************************************************************!*\
  !*** ../../node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \*******************************************************************/
(module) {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ },

/***/ "../../node_modules/style-loader/dist/runtime/styleTagTransform.js"
/*!*************************************************************************!*\
  !*** ../../node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*************************************************************************/
(module) {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ },

/***/ "../../packages/expressions/src/expressions/Expression.ts"
/*!****************************************************************!*\
  !*** ../../packages/expressions/src/expressions/Expression.ts ***!
  \****************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Expression: () => (/* binding */ Expression)
/* harmony export */ });
/**
 * Wrapper around a resolved AST (phase 3).
 */
class Expression {
    root_;
    constructor(root) {
        if (!root) {
            throw new Error("Expression requires AST root");
        }
        this.root_ = root;
    }
    evaluate() {
        return this.root_.evaluate();
    }
}


/***/ },

/***/ "../../packages/expressions/src/expressions/UnboundExpression.ts"
/*!***********************************************************************!*\
  !*** ../../packages/expressions/src/expressions/UnboundExpression.ts ***!
  \***********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UnboundExpression: () => (/* binding */ UnboundExpression)
/* harmony export */ });
/* harmony import */ var _UncheckedExpression__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UncheckedExpression */ "../../packages/expressions/src/expressions/UncheckedExpression.ts");

/**
 * Wrapper around an unbound (symbolic) AST.
 *
 * Represents phase 1 of an expression's lifecycle and owns the
 * AST until bind(context) is called.
 */
class UnboundExpression {
    // Root AST node while unbound. Set to null after binding.
    root_;
    // The UncheckedExpression created by binding.
    dependentExpression_ = null;
    constructor(root) {
        if (!root) {
            throw new Error("UnboundExpression requires non-null AST root");
        }
        this.root_ = root;
    }
    /**
     * Returns true if this expression has already been bound.
     */
    isBound() {
        return this.dependentExpression_ !== null;
    }
    /**
     * Bind this expression using the provided context.
     *
     * After this call, ownership of the AST moves to the
     * created DependentExpression and this wrapper becomes
     * inert, retaining only a reference to that dependent
     * expression.
     */
    bind(context) {
        if (this.root_ === null) {
            throw new Error("Expression already bound");
        }
        const boundAst = this.root_.bind(context);
        this.dependentExpression_ = new _UncheckedExpression__WEBPACK_IMPORTED_MODULE_0__.UncheckedExpression(boundAst);
        // Jump ship: UnboundExpression no longer owns the AST
        this.root_ = null;
        return this.dependentExpression_;
    }
    /**
     * Return the UncheckedExpression produced by binding.
     * Only valid after bind() has been called.
     */
    get dependentExpression() {
        if (this.dependentExpression_ === null) {
            throw new Error("Expression not yet bound");
        }
        return this.dependentExpression_;
    }
}


/***/ },

/***/ "../../packages/expressions/src/expressions/UncheckedExpression.ts"
/*!*************************************************************************!*\
  !*** ../../packages/expressions/src/expressions/UncheckedExpression.ts ***!
  \*************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UncheckedExpression: () => (/* binding */ UncheckedExpression)
/* harmony export */ });
/* harmony import */ var _Expression__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Expression */ "../../packages/expressions/src/expressions/Expression.ts");

/**
 * Wrapper around a bound AST (phase 2).
 *
 * Owns the AST after binding. After resolve(), ownership of
 * the AST moves to Expression and this wrapper becomes a
 * lightweight handle to the resolved Expression.
 */
class UncheckedExpression {
    // Bound AST while unresolved. Set to null after resolve().
    ast_;
    // Cached dependency list, initialized lazily.
    dependencies_ = null;
    // Final resolved Expression (after resolve()).
    expression_ = null;
    constructor(ast) {
        if (!ast) {
            throw new Error("UncheckedExpression requires AST");
        }
        this.ast_ = ast;
    }
    /**
     * Returns true if this expression has been resolved.
     */
    isResolved() {
        return this.expression_ !== null;
    }
    /**
     * Return true if any dependency is not yet resolved.
     *
     * Dependencies are discovered lazily and cached on first call.
     */
    hasUnresolvedDependencies() {
        if (this.dependencies_ === null) {
            if (!this.ast_) {
                throw new Error("AST not available for dependency discovery");
            }
            this.dependencies_ = this.ast_.getDependencies();
        }
        for (const d of this.dependencies_) {
            if (!d.isResolved()) {
                return true;
            }
        }
        return false;
    }
    /**
     * Resolve this expression into its final Expression form.
     * All dependencies must already be resolved.
     */
    resolve() {
        if (this.expression_ !== null) {
            throw new Error("Already resolved");
        }
        if (this.hasUnresolvedDependencies()) {
            throw new Error("Unresolved dependencies exist");
        }
        if (!this.ast_) {
            throw new Error("AST not available for resolution");
        }
        // Resolve AST nodes (phase 2 -> phase 3)
        const resolvedAst = this.ast_.resolve();
        this.expression_ = new _Expression__WEBPACK_IMPORTED_MODULE_0__.Expression(resolvedAst);
        // Jump ship: UncheckedExpression no longer owns AST
        this.ast_ = null;
        return this.expression_;
    }
    /**
     * Return the resolved Expression. Only valid after resolve().
     */
    get expression() {
        if (this.expression_ === null) {
            throw new Error("Expression not resolved yet");
        }
        return this.expression_;
    }
}


/***/ },

/***/ "../../packages/expressions/src/index.ts"
/*!***********************************************!*\
  !*** ../../packages/expressions/src/index.ts ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Expression: () => (/* reexport safe */ _expressions_Expression__WEBPACK_IMPORTED_MODULE_1__.Expression),
/* harmony export */   Module: () => (/* reexport safe */ _modules_Module__WEBPACK_IMPORTED_MODULE_0__.Module)
/* harmony export */ });
/* harmony import */ var _modules_Module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/Module */ "../../packages/expressions/src/modules/Module.ts");
/* harmony import */ var _expressions_Expression__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./expressions/Expression */ "../../packages/expressions/src/expressions/Expression.ts");
/** @packageDocumentation
 *
 * This package provides support for the RippleDoc expressions system:
 * - Parsing expressions
 * - Building a system of interdependent expressions
 * - Compiling that system into executable form
 *
 * # For Users of the Expressions System
 *
 * Start with {@link Module}. You can use this to build a system of expressions which can be
 * compiled into an executable form ({@link Expression}).
 *
 * You can also you use it to setup complex relationships between Modules such as:
 * - Giving modules parents so that they can inherit expressions
 * - Importing modules into other modules so that they can use their expressions via member access
 *
 * You shouldn't need anything else - if you find yourself burrowing into the package more deeply,
 * let me know!
 *
 * # For Maintainers of the Expressions System
 *
 * You will, no doubt, need to delve more deeply into the inner workings of the system.
 *
 * The package is organized into subdirectories by subcomponent. There is a natural order
 * and components at a lower level should never reference dependent components.
 *
 * As such there it probably makes sense to read the code in the following order:
 * 1. Lexer
 * 2. Parser
 * 3. Expressions
 * 4. Modules
 */




/***/ },

/***/ "../../packages/expressions/src/lexer/Lexer.ts"
/*!*****************************************************!*\
  !*** ../../packages/expressions/src/lexer/Lexer.ts ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Lexer: () => (/* binding */ Lexer)
/* harmony export */ });
/* harmony import */ var _Token__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Token */ "../../packages/expressions/src/lexer/Token.ts");

/**
 * Simple streaming lexer for an expression grammar.
 * Converts source text into a stream of tokens.
 */
class Lexer {
    /** Source text to lex */
    source_;
    /** Current scanning position */
    pos_;
    /**
     * Creates a new lexer for the given source text.
     * @param source The source string to tokenize.
     */
    constructor(source) {
        this.source_ = source;
        this.pos_ = 0;
    }
    /**
     * Returns the next token in the input stream.
     * Always returns a token; EOF token marks end-of-input.
     */
    nextToken() {
        this.skipWhitespace();
        if (this.pos_ >= this.source_.length) {
            return {
                type: _Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.EOF,
                lexeme: "",
                position: this.pos_,
                value: 0,
            };
        }
        const c = this.source_[this.pos_] ?? "\0";
        if (this.isDigit(c)) {
            return this.number();
        }
        if (this.isAlpha(c)) {
            return this.identifier();
        }
        switch (c) {
            case "+":
                return this.single(_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.PLUS);
            case "-":
                return this.single(_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.MINUS);
            case "*":
                return this.single(_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.STAR);
            case "/":
                return this.single(_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.SLASH);
            case "%":
                return this.single(_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.PERCENT);
            case ".":
                return this.single(_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.DOT);
            case "(":
                return this.single(_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.LPAREN);
            case ")":
                return this.single(_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.RPAREN);
        }
        // Unknown character
        const start = this.pos_;
        const lexeme = this.source_[this.pos_++] ?? "\0";
        return {
            type: _Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.UNKNOWN,
            lexeme,
            position: start,
            value: 0,
        };
    }
    // ---------------- Helper Methods ----------------
    /**
     * Creates a single-character token.
     * @param type The token type.
     * @returns A Token object with value 0.
     */
    single(type) {
        const start = this.pos_;
        const ch = this.source_[this.pos_] ?? "\0";
        this.pos_++;
        return {
            type,
            lexeme: ch,
            position: start,
            value: 0,
        };
    }
    /**
     * Skips over whitespace characters: space, tab, newline, carriage return.
     */
    skipWhitespace() {
        while (this.pos_ < this.source_.length) {
            const c = this.source_[this.pos_] ?? "\0";
            if (c === " " || c === "\t" || c === "\n" || c === "\r") {
                this.pos_++;
            }
            else {
                break;
            }
        }
    }
    /**
     * Peeks at the current character without advancing the position.
     * @returns Current character or '\0' if at end-of-input.
     */
    peek() {
        return this.source_[this.pos_] ?? "\0";
    }
    /**
     * Peeks at the next character without advancing the position.
     * @returns Next character or '\0' if at end-of-input.
     */
    peekNext() {
        return this.source_[this.pos_ + 1] ?? "\0";
    }
    /**
     * Checks if the character is a digit (0-9).
     * @param c Character to check.
     */
    isDigit(c) {
        return c >= "0" && c <= "9";
    }
    /**
     * Checks if the character is an alphabetic letter (a-z, A-Z).
     * @param c Character to check.
     */
    isAlpha(c) {
        return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
    }
    /**
     * Checks if the character is alphanumeric (a-z, A-Z, 0-9, or underscore).
     * @param c Character to check.
     */
    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c) || c === "_";
    }
    /**
     * Scans a number literal (integer or decimal).
     * @returns NUMBER token with parsed value.
     */
    number() {
        const start = this.pos_;
        // Integer part
        while (this.isDigit(this.peek())) {
            this.pos_++;
        }
        // Optional fractional part
        if (this.peek() === "." && this.isDigit(this.peekNext())) {
            this.pos_++; // consume '.'
            while (this.isDigit(this.peek())) {
                this.pos_++;
            }
        }
        const lexeme = this.source_.slice(start, this.pos_);
        const value = Number(lexeme);
        return {
            type: _Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.NUMBER,
            lexeme,
            position: start,
            value,
        };
    }
    /**
     * Scans an identifier (letters, digits, underscores).
     * @returns IDENTIFIER token with value 0.
     */
    identifier() {
        const start = this.pos_;
        while (this.isAlphaNumeric(this.peek())) {
            this.pos_++;
        }
        const lexeme = this.source_.slice(start, this.pos_);
        return {
            type: _Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.IDENTIFIER,
            lexeme,
            position: start,
            value: 0,
        };
    }
}


/***/ },

/***/ "../../packages/expressions/src/lexer/Token.ts"
/*!*****************************************************!*\
  !*** ../../packages/expressions/src/lexer/Token.ts ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TokenType: () => (/* binding */ TokenType)
/* harmony export */ });
/**
 * Enumerates all token kinds produced by the lexer.
 */
var TokenType;
(function (TokenType) {
    /** Numeric literal (e.g. 123, 3.14) */
    TokenType[TokenType["NUMBER"] = 0] = "NUMBER";
    /** Identifier (e.g. variable names) */
    TokenType[TokenType["IDENTIFIER"] = 1] = "IDENTIFIER";
    /** '+' */
    TokenType[TokenType["PLUS"] = 2] = "PLUS";
    /** '-' */
    TokenType[TokenType["MINUS"] = 3] = "MINUS";
    /** '*' */
    TokenType[TokenType["STAR"] = 4] = "STAR";
    /** '/' */
    TokenType[TokenType["SLASH"] = 5] = "SLASH";
    /** '%' */
    TokenType[TokenType["PERCENT"] = 6] = "PERCENT";
    /** '.' */
    TokenType[TokenType["DOT"] = 7] = "DOT";
    /** '(' */
    TokenType[TokenType["LPAREN"] = 8] = "LPAREN";
    /** ')' */
    TokenType[TokenType["RPAREN"] = 9] = "RPAREN";
    /** End-of-file marker */
    TokenType[TokenType["EOF"] = 10] = "EOF";
    /** Any character not recognized by the lexer */
    TokenType[TokenType["UNKNOWN"] = 11] = "UNKNOWN";
})(TokenType || (TokenType = {}));


/***/ },

/***/ "../../packages/expressions/src/modules/HasCyclicalDependencies.ts"
/*!*************************************************************************!*\
  !*** ../../packages/expressions/src/modules/HasCyclicalDependencies.ts ***!
  \*************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hasCyclicalDependencies: () => (/* binding */ hasCyclicalDependencies)
/* harmony export */ });
/**
 * Checks if a collection of UncheckedExpressions has cyclical dependencies.
 * Returns true if a cycle is detected, false otherwise.
 *
 */
function hasCyclicalDependencies(expressions, sortedExpressions = []) {
    // Clear the sorted expressions array before starting.
    sortedExpressions.length = 0;
    if (expressions.length === 0) {
        // No expressions means no dependencies, so no cycles.
        return false;
    }
    for (let i = 0; i < expressions.length; i++) {
        switch (resolveAtLeastOne(expressions, sortedExpressions)) {
            case DependencyResolutionResult.AllDone:
                // (a) No unresolved expressions?
                //     All expressions resolved successfully, so no cycles.
                return false;
            case DependencyResolutionResult.FoundCycle:
                // (b) No progress made?
                //     Remaining expressions have unresolved dependencies that
                //     cannot be satisfied without a cycle.
                return true;
            case DependencyResolutionResult.MadeProgress:
                // (c) Made progress but still have unresolved expressions?
                //     Keep going.
                break;
        }
    }
    // If we get here, we made as many passes as there are expressions without resolving them all, so
    // a cycle must exist.
    return true;
}
var DependencyResolutionResult;
(function (DependencyResolutionResult) {
    DependencyResolutionResult[DependencyResolutionResult["MadeProgress"] = 0] = "MadeProgress";
    DependencyResolutionResult[DependencyResolutionResult["AllDone"] = 1] = "AllDone";
    DependencyResolutionResult[DependencyResolutionResult["FoundCycle"] = 2] = "FoundCycle";
})(DependencyResolutionResult || (DependencyResolutionResult = {}));
/**
 * Makes a pass through the list of UncheckedExpressions, attempting to resolve at least one.
 *
 * @returns a DependencyResolutionResult indicating the outcome of the pass
 */
function resolveAtLeastOne(expressions, sortedExpressions) {
    // False unless we resolve at least one expression in this pass.
    let madeProgress = false;
    // Count of expressions that remain unresolved after this pass.
    let unresolvedCount = 0;
    for (let i = 0; i < expressions.length; i++) {
        const de = expressions[i];
        if (!de) {
            throw new Error(`Dependent expression at index ${i} is null or undefined.`);
        }
        if (de.isResolved()) {
            continue;
        }
        unresolvedCount++;
        if (!de.hasUnresolvedDependencies()) {
            unresolvedCount--;
            sortedExpressions.push(de.resolve());
            madeProgress = true;
        }
    } // end for
    // We've made a complete pass through the expressions.
    // What did we find...?
    // (a) No unresolved expressions?
    //     We must be done.
    if (unresolvedCount === 0) {
        return DependencyResolutionResult.AllDone;
    }
    if (!madeProgress) {
        // (b) No progress made?
        //     Remaining expressions have unresolved dependencies that
        //     cannot be satisfied without a cycle.
        return DependencyResolutionResult.FoundCycle;
    }
    // (c) Made progress but still have unresolved expressions?
    //     Keep going.
    return DependencyResolutionResult.MadeProgress;
}


/***/ },

/***/ "../../packages/expressions/src/modules/Module.ts"
/*!********************************************************!*\
  !*** ../../packages/expressions/src/modules/Module.ts ***!
  \********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Module: () => (/* binding */ Module)
/* harmony export */ });
/* harmony import */ var _parser_Parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../parser/Parser */ "../../packages/expressions/src/parser/Parser.ts");
/* harmony import */ var _native_NativeExpression__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../native/NativeExpression */ "../../packages/expressions/src/native/NativeExpression.ts");
/* harmony import */ var _native_NativeExpression2__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../native/NativeExpression2 */ "../../packages/expressions/src/native/NativeExpression2.ts");
/* harmony import */ var _HasCyclicalDependencies__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./HasCyclicalDependencies */ "../../packages/expressions/src/modules/HasCyclicalDependencies.ts");
/* harmony import */ var _parser_NameType__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../parser/NameType */ "../../packages/expressions/src/parser/NameType.ts");





/**
 * Class Module exists as a higher level abstraction (Facade pattern) over the lower level
 * lexing, parsing, binding, and cyclical dependency checking processes.
 *
 * # The Basic Idea
 * The basic idea is to create a complete set of expressions so that all referenced names are defined
 * within the module, and then compile the module to perform binding and dependency resolution. The
 * later step is hidden from the client.
 *
 * Once compiled, callable functions implementing those expressions are returned to the client.
 * The module is frozen to prevent further modifications.
 *
 * # Other features
 * We also support some more complex programming features:
 * 1. Submodules: supporting names that are not found in the current module being looked up in the parent module
 * 2. Mapped modules: supporting member access
 *
 * ## Submodules
 * Modules can be connected by a parent-child relationship.
 *
 * In the simplest case clients start with a single module - the root module.
 * This is created with Module.createRootModule().
 *
 * However, clients may wish certain names to have different meanings in different contexts. For
 * example:
 *   - localProperty: a property that is unique in different contexts
 *   - globalProperty: a property that is shared across all contexts
 *
 * In this case, a client would add globalProperty to the root module. They would then create a
 * submodule for each specific context and add localProperty to each submodule.
 *
 * ## Mapped modules
 * Modules can also have names that refer to other modules. These are so-called mapped modules.
 *
 * If submodules express a parent-child relationship, mapped modules express a sibling relationship.
 *
 * They are important for supporting member access (e.g. moduleName.expressionName) and allowing
 * expressions to access arbitary chains of submodules (e.g. module1.module2.expressionName).
 *
 * # Basic usage
 * The basic use case is as follows:
 * ```ts
 * // 1. Create a root module using Module.createRootModule() and add some expressions
 * //    addExpression returns a function that will return the bound expression after compilation.
 * const rootModule = Module.createRootModule();
 * const getA = rootModule.addExpression("a", "1 + 2");
 * const getB = rootModule.addExpression("b", "a * 3");
 *
 * // 2. Compile the module to perform binding and dependency resolution
 * rootModule.compile();
 *
 * // 3. Access the bound expressions using the functions returned by addExpression
 * const a = getA(); // returns the bound expression for "a"
 * const b = getB(); // returns the bound expression for "b"
 * ```
 *
 * # Parent modules
 * ```ts
 * const rootModule = Module.createRootModule();
 * const getA = rootModule.addExpression("a", "1 + 2");
 * const subModule = rootModule.addSubModule();
 *
 * // Submodules can access names defined in the parent module.
 * const getB = subModule.addExpression("b", "a * 3");
 *
 * rootModule.compile();
 * const b = getB(); // returns the bound expression for "b", which depends on "a" defined in the parent module
 * ```
 *
 * # Mapped modules
 * ```ts
 * const rootModule = Module.createRootModule();
 * const subModule = rootModule.addSubModule();
 * subModule.addExpression("a", "1 + 2");
 * rootModule.mapModule("sub", subModule);
 *
 * // Mapped modules are accessed using member access.
 * const getA = rootModule.addExpression("getA", "sub.a");
 *
 * rootModule.compile();
 * const getAExpression = getA(); // returns the bound expression for "getA", which depends on "sub.a" defined in the mapped submodule
 * ```
 */
class Module {
    compiled_ = false;
    /**
     * The parent module, or null if this is the root module.
     */
    parent_;
    /**
     * Submodules.
     */
    subModules_ = [];
    /**
     * Expressions defined in this module, mapped by their name.
     */
    names_ = new Map();
    constructor(parent = null) {
        if (parent && parent.compiled_) {
            throw new Error("Cannot create a submodule of a compiled module");
        }
        this.parent_ = parent;
    }
    static createRootModule() {
        return new Module();
    }
    get parentModule() {
        return this.parent_;
    }
    get rootModule() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current = this;
        while (current.parent_) {
            current = current.parent_;
        }
        return current;
    }
    /**
     * Creates a new Module with this module as its parent and adds it to the list of submodules.
     *
     * @returns The newly created submodule.
     * @throws If this module is already compiled.
     */
    addSubModule() {
        if (this.compiled_) {
            throw new Error("addSubModule: Cannot add a submodule to a compiled module");
        }
        const subModule = new Module(this);
        this.subModules_.push(subModule);
        return subModule;
    }
    /**
     * Adds a named expression to the module.
     * Returns a function that, after the module is compiled, will return the bound expression.
     *
     * This function can be called more than once and will return the same value.
     *
     * @param name The name of the expression.
     * @param expression The expression string.
     * @returns A function that returns the bound expression after compilation.
     */
    addExpression(name, expression) {
        this.assertNotCompiled("addExpression");
        if (this.names_.has(name)) {
            throw new Error(`Expression with name "${name}" already exists in this module`);
        }
        const unboundExpression = (0,_parser_Parser__WEBPACK_IMPORTED_MODULE_0__.parseExpression)(expression);
        this.names_.set(name, { type: _parser_NameType__WEBPACK_IMPORTED_MODULE_4__.NameType.VALUE, value: unboundExpression });
        // Return a function that will return the bound expression after compilation.
        return () => {
            if (!unboundExpression.dependentExpression ||
                !unboundExpression.dependentExpression.expression) {
                throw new Error(`Cannot access expression "${name}" before the module is compiled`);
            }
            return unboundExpression.dependentExpression.expression;
        };
    }
    /**
     * Adds a named native expression to the module.
     * Returns a function that, after the module is compiled, will return the bound expression.
     *
     * @param name The name of the expression.
     * @param expression The expression function.
     * @returns A function that returns the bound expression after compilation.
     */
    addNativeExpression(name, expression) {
        this.assertNotCompiled("addNativeExpression");
        if (this.names_.has(name)) {
            throw new Error(`Expression with name "${name}" already exists in this module`);
        }
        const unboundExpression = (0,_native_NativeExpression__WEBPACK_IMPORTED_MODULE_1__.createNativeExpression)(expression);
        this.names_.set(name, { type: _parser_NameType__WEBPACK_IMPORTED_MODULE_4__.NameType.VALUE, value: unboundExpression });
        // Return a function that will return the bound expression after compilation.
        return () => {
            if (!unboundExpression.dependentExpression ||
                !unboundExpression.dependentExpression.expression) {
                throw new Error(`Cannot access expression "${name}" before the module is compiled`);
            }
            return unboundExpression.dependentExpression.expression;
        };
    }
    /**
     * Adds a named native expression with optional dependencies to the module.
     *
     * This variant uses NativeExpression2 under the hood, allowing the native
     * function to depend on other expressions (by name) and to be replaced at
     * runtime after compilation.
     *
     * @param name The name of the expression.
     * @param expression The native function implementing the expression.
     * @param dependencies Optional list of dependency names (dot-separated).
     * @returns An object with:
     *   - getExpression: returns the bound Expression after compilation.
     *   - replaceNativeFunction: replaces the underlying native function.
     */
    addNativeExpression2(name, expression, dependencies = []) {
        this.assertNotCompiled("addNativeExpression2");
        if (this.names_.has(name)) {
            throw new Error(`Expression with name "${name}" already exists in this module`);
        }
        const nativeExpr = (0,_native_NativeExpression2__WEBPACK_IMPORTED_MODULE_2__.createNativeExpression2)(expression, dependencies);
        const unboundExpression = nativeExpr.unboundExpression;
        this.names_.set(name, { type: _parser_NameType__WEBPACK_IMPORTED_MODULE_4__.NameType.VALUE, value: unboundExpression });
        return {
            getExpression: () => {
                if (!unboundExpression.dependentExpression ||
                    !unboundExpression.dependentExpression.expression) {
                    throw new Error(`Cannot access expression "${name}" before the module is compiled`);
                }
                return unboundExpression.dependentExpression.expression;
            },
            replaceNativeFunction: (fn) => {
                nativeExpr.replaceNativeFunction(fn);
            },
        };
    }
    /**
     * Mapped modules are accessed using the member access operator (e.g. moduleName.expressionName).
     * Name lookup is then delegated to the mapped module, minus the module's name (e.g. expressionName).
     *
     * In this way, expressions can access arbitary chains of submodules.
     *
     * Submodule can only be mapped if they share a common ancestor with the current module.
     *
     * @param name The name by which the mapped module will be accessed.
     * @param module The module itself
     */
    mapModule(name, module) {
        this.assertNotCompiled("mapModule");
        if (this.names_.has(name)) {
            throw new Error(`Expression with name "${name}" already exists in this module`);
        }
        if (!this.hasCommonAncestor(module)) {
            throw new Error("Mapped module must share a common ancestor with this module");
        }
        this.names_.set(name, { type: _parser_NameType__WEBPACK_IMPORTED_MODULE_4__.NameType.OBJECT, value: module });
    }
    /**
     * Returns true if this module and the other module share
     * a common ancestor in the module tree (including either
     * module itself).
     */
    hasCommonAncestor(other) {
        const ancestors = new Set();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current = this;
        while (current) {
            ancestors.add(current);
            current = current.parent_;
        }
        current = other;
        while (current) {
            if (ancestors.has(current)) {
                return true;
            }
            current = current.parent_;
        }
        return false;
    }
    /**
     * Compiles the module and all its submodules.
     *
     * After compilation:
     *  1. Expressions can be accessed via the functions returned by addExpression.
     *  2. No more expressions or submodules can be added.
     *
     * Exception safety:
     * If an error occurs during compilation, the module is unrecoverably broken and should not be used
     * again. This is a trade-off to avoid the complexity of rolling back changes in case of an error.
     *
     * Returns:
     * An array of bound expressions in topologically sorted order (i.e. if expression A depends on
     * expression B, then B will appear before A in the array).
     */
    compile() {
        if (this.compiled_) {
            throw new Error("Module is already compiled");
        }
        if (this.parent_) {
            throw new Error("Only the root module can be compiled");
        }
        this.compiled_ = true;
        const expressions = this.bindExpressions();
        const sortedExpressions = [];
        if ((0,_HasCyclicalDependencies__WEBPACK_IMPORTED_MODULE_3__.hasCyclicalDependencies)(expressions, sortedExpressions)) {
            throw new Error("Circular dependency detected among expressions.");
        }
        return sortedExpressions;
    }
    /**
     * Bind all expressions in this module and its submodules.
     *
     * Each module receives its own binding context which delegates
     * upwards to the parent module's context. This mirrors the
     * behaviour of DefaultBindingContext (upwards and sideways
     * delegation) while keeping the binding process internal to
     * the modules package.
     */
    bindExpressions() {
        const context = {
            lookupName: this.lookupName.bind(this),
        };
        const bound = [];
        // Bind all value expressions defined in this module.
        for (const entry of this.names_.values()) {
            if (entry.type === _parser_NameType__WEBPACK_IMPORTED_MODULE_4__.NameType.VALUE) {
                const unbound = entry.value;
                bound.push(unbound.bind(context));
            }
        }
        // Recursively bind submodules.
        for (const sub of this.subModules_) {
            bound.push(...sub.bindExpressions());
        }
        return bound;
    }
    /**
     * Throws an exception (type unspecified) if the module is already compiled.
     * Returns having no side-effects otherwise.
     */
    assertNotCompiled(functionName) {
        if (this.compiled_) {
            throw new Error(`Cannot modify a compiled module: ${functionName}`);
        }
    }
    /**
     * Exists to implement BindingContext for the bindExpressions process.
     * It is private to keep the public interface clean and we will build a wrapper around it
     * as we need it.
     */
    lookupName(parts, type) {
        if (!Array.isArray(parts) || parts.length === 0) {
            throw new Error("Name parts required");
        }
        const [head, ...rest] = parts;
        if (!head) {
            throw new Error("Invalid name part");
        }
        const entry = this.names_.get(head);
        // Final name part: expect a value expression.
        if (rest.length === 0) {
            if (entry && entry.type === type && entry.type === _parser_NameType__WEBPACK_IMPORTED_MODULE_4__.NameType.VALUE) {
                const unbound = entry.value;
                return () => unbound.dependentExpression;
            }
            // Delegate to parent module if available.
            if (this.parent_) {
                return this.parent_.lookupName(parts, type);
            }
            throw new Error(`Unresolved name: ${head}`);
        }
        // There are remaining parts: expect an object (mapped module) for the head.
        if (entry && entry.type === _parser_NameType__WEBPACK_IMPORTED_MODULE_4__.NameType.OBJECT) {
            const mappedModule = entry.value;
            return mappedModule.lookupName(rest, type);
        }
        // Delegate to parent if head is not a local object.
        if (this.parent_) {
            return this.parent_.lookupName(parts, type);
        }
        throw new Error(`'${head}' is not an object`);
    }
}


/***/ },

/***/ "../../packages/expressions/src/native/NativeExpression.ts"
/*!*****************************************************************!*\
  !*** ../../packages/expressions/src/native/NativeExpression.ts ***!
  \*****************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createNativeExpression: () => (/* binding */ createNativeExpression)
/* harmony export */ });
/* harmony import */ var _parser_AST__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../parser/AST */ "../../packages/expressions/src/parser/AST.ts");
/* harmony import */ var _expressions_UnboundExpression__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../expressions/UnboundExpression */ "../../packages/expressions/src/expressions/UnboundExpression.ts");


/**
 * AST node that wraps a native JavaScript function.
 *
 * Participates in the standard expression lifecycle but skips
 * dependency tracking and symbolic binding.
 */
class NativeFunctionNode extends _parser_AST__WEBPACK_IMPORTED_MODULE_0__.AstNode {
    nativeFn_;
    /**
     * Create a new native function node.
     *
     * @param nativeFn The JavaScript function to call during evaluation.
     */
    constructor(nativeFn) {
        super();
        if (typeof nativeFn !== "function") {
            throw new Error("NativeFunctionNode requires a function");
        }
        this.nativeFn_ = nativeFn;
    }
    /**
     * Bind operation is a no-op for native functions.
     * Returns self since there's nothing to bind.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bind(_context) {
        return this;
    }
    /**
     * Resolve operation is a no-op for native functions.
     * Returns self since there's nothing to resolve.
     */
    resolve() {
        return this;
    }
    /**
     * Native functions have no dependencies.
     */
    getDependencies() {
        return [];
    }
    /**
     * Evaluate by calling the native function.
     */
    evaluate() {
        return this.nativeFn_();
    }
}
/**
 * Create an UnboundExpression that wraps a native JavaScript function.
 *
 * The returned expression participates in the standard expression lifecycle
 * (bind → resolve → evaluate) but delegates evaluation to the provided function.
 * Native expressions have no dependencies on other expressions.
 */
function createNativeExpression(nativeFn) {
    const astNode = new NativeFunctionNode(nativeFn);
    return new _expressions_UnboundExpression__WEBPACK_IMPORTED_MODULE_1__.UnboundExpression(astNode);
}


/***/ },

/***/ "../../packages/expressions/src/native/NativeExpression2.ts"
/*!******************************************************************!*\
  !*** ../../packages/expressions/src/native/NativeExpression2.ts ***!
  \******************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createNativeExpression2: () => (/* binding */ createNativeExpression2)
/* harmony export */ });
/* harmony import */ var _parser_AST__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../parser/AST */ "../../packages/expressions/src/parser/AST.ts");
/* harmony import */ var _expressions_UnboundExpression__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../expressions/UnboundExpression */ "../../packages/expressions/src/expressions/UnboundExpression.ts");
/* harmony import */ var _parser_NameType__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../parser/NameType */ "../../packages/expressions/src/parser/NameType.ts");



/**
 * Unbound AST node for a native JavaScript function.
 *
 * During bind(), dependency names are looked up symbolically in the
 * BindingContext and converted into link functions. The result of
 * binding is an UncheckedNativeFunctionNode that owns those links.
 */
class UnboundNativeFunctionNode extends _parser_AST__WEBPACK_IMPORTED_MODULE_0__.AstNode {
    nativeFn_;
    dependencyNames_;
    uncheckedNativeFunctionNode_ = null;
    /**
     * Create a new unbound native function node.
     *
     * @param nativeFn The JavaScript function to call during evaluation.
     * @param dependencies Optional list of dependency names (dot-separated).
     */
    constructor(nativeFn, dependencies = []) {
        super();
        if (typeof nativeFn !== "function") {
            throw new Error("UnboundNativeFunctionNode requires a function");
        }
        this.nativeFn_ = nativeFn;
        this.dependencyNames_ = dependencies;
    }
    /**
     * Bind this node by capturing dependency link functions from the context.
     *
     * Returns an UncheckedNativeFunctionNode that owns the dependency links.
     */
    bind(context) {
        const dependencies = this.dependencyNames_.map((d) => {
            return context.lookupName(d.split("."), _parser_NameType__WEBPACK_IMPORTED_MODULE_2__.NameType.VALUE);
        });
        this.uncheckedNativeFunctionNode_ = new UncheckedNativeFunctionNode(this.nativeFn_, dependencies);
        return this.uncheckedNativeFunctionNode_;
    }
    /**
     * Unbound native nodes cannot be resolved directly.
     */
    resolve() {
        throw new Error("UnboundNativeFunctionNode cannot be resolved");
    }
    /**
     * Unbound native nodes do not expose dependencies directly.
     *
     * Dependencies are managed by the UncheckedNativeFunctionNode produced
     * during bind().
     */
    getDependencies() {
        throw new Error("UnboundNativeFunctionNode is unbound.");
    }
    get uncheckedNativeFunctionNode() {
        if (this.uncheckedNativeFunctionNode_ === null) {
            throw new Error("UncheckedNativeFunctionNode is not available until after binding");
        }
        return this.uncheckedNativeFunctionNode_;
    }
}
/**
 * Bound (unchecked) AST node for a native function.
 *
 * Holds link functions to dependencies discovered during bind(). When
 * getDependencies() is first called, those links are invoked to
 * materialise concrete UncheckedExpression dependencies. During
 * resolve(), this node produces the final NativeFunctionNode.
 */
class UncheckedNativeFunctionNode extends _parser_AST__WEBPACK_IMPORTED_MODULE_0__.AstNode {
    nativeFn_;
    dependencies_;
    linkedDependencies_ = null;
    nativeFunctionNode_ = null;
    constructor(nativeFn, dependencies) {
        super();
        if (typeof nativeFn !== "function") {
            throw new Error("UncheckedNativeFunctionNode requires a function");
        }
        this.nativeFn_ = nativeFn;
        this.dependencies_ = dependencies;
    }
    /**
     * Unchecked native nodes cannot be rebound.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bind(_context) {
        throw new Error("UncheckedNativeFunctionNode cannot be rebound");
    }
    /**
     * Resolve this node into the final NativeFunctionNode.
     */
    resolve() {
        this.nativeFunctionNode_ = new NativeFunctionNode(this.nativeFn_);
        return this.nativeFunctionNode_;
    }
    /**
     * Return the concrete UncheckedExpression dependencies of this node.
     *
     * Dependency link functions are invoked lazily and cached.
     */
    getDependencies() {
        this.ensureLinkedDependencies();
        return this.linkedDependencies_;
    }
    ensureLinkedDependencies() {
        if (this.linkedDependencies_ === null) {
            this.linkedDependencies_ = this.dependencies_.map((linkFn) => linkFn());
        }
    }
    get nativeFunctionNode() {
        if (this.nativeFunctionNode_ === null) {
            throw new Error("NativeFunctionNode is not available until after resolution");
        }
        return this.nativeFunctionNode_;
    }
}
/**
 * Resolved AST node for a native function.
 *
 * Represents the final, dependency-free node used during evaluation.
 * The wrapped function can be replaced at runtime.
 */
class NativeFunctionNode extends _parser_AST__WEBPACK_IMPORTED_MODULE_0__.AstNode {
    nativeFn_;
    constructor(nativeFn) {
        super();
        if (typeof nativeFn !== "function") {
            throw new Error("NativeFunctionNode requires a function");
        }
        this.nativeFn_ = nativeFn;
    }
    /**
     * NativeFunctionNode instances cannot be rebound.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bind(_context) {
        throw new Error("NativeFunctionNode cannot be rebound");
    }
    /**
     * NativeFunctionNode instances are already resolved.
     */
    resolve() {
        throw new Error("NativeFunctionNode cannot be resolved");
    }
    evaluate() {
        return this.nativeFn_();
    }
    get nativeFunction() {
        return this.nativeFn_;
    }
    replaceNativeFunction(newFn) {
        if (typeof newFn !== "function") {
            throw new Error("replaceNativeFunction requires a function");
        }
        this.nativeFn_ = newFn;
    }
}
/**
 * Create an UnboundExpression that wraps a native JavaScript function.
 *
 * This version (vs createNativeExpression) extends native expressions to support:
 * 1. Optional dependencies that can be linked during the bind phase using
 *    string names (including dot-separated module paths).
 * 2. The ability to replace the native function at runtime, after the
 *    expression has been bound and resolved.
 *
 * Important Note:
 * If you change the native function after compilation, you must ensure that the new function
 * has dependencies that are compatible with the original function. The system cannot perform any
 * checks to verify this compatibility.
 *
 * In particular it is possible to introduce a cyclical dependency resulting in infinite recursion.
 *
 * This function exists mainly to solve bootstrapping issues. As such, clients should probably
 * discard the replaceNativeFunction capability after initial setup to avoid accidental misuse.
 *
 */
function createNativeExpression2(nativeFn, dependencies = []) {
    const astNode = new UnboundNativeFunctionNode(nativeFn, dependencies);
    return {
        unboundExpression: new _expressions_UnboundExpression__WEBPACK_IMPORTED_MODULE_1__.UnboundExpression(astNode),
        replaceNativeFunction(newFn) {
            astNode.uncheckedNativeFunctionNode.nativeFunctionNode.replaceNativeFunction(newFn);
        },
    };
}


/***/ },

/***/ "../../packages/expressions/src/parser/AST.NameExpression.ts"
/*!*******************************************************************!*\
  !*** ../../packages/expressions/src/parser/AST.NameExpression.ts ***!
  \*******************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NameExpression: () => (/* binding */ NameExpression)
/* harmony export */ });
/* harmony import */ var _AST__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AST */ "../../packages/expressions/src/parser/AST.ts");
/* harmony import */ var _NameType__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./NameType */ "../../packages/expressions/src/parser/NameType.ts");


/**
 * Symbolic name reference.
 *
 * Examples:
 *   x
 *   a.b
 *   a.b.c
 *
 * Represents phase 1 - binding.
 *
 * Because of this, the only valid thing to do with a NameExpression is to bind it exactly once.
 * This will cause it to be replaced with a LinkedNameExpression.
 */
class NameExpression extends _AST__WEBPACK_IMPORTED_MODULE_0__.AstNode {
    // Sequence of name parts, e.g. ["a", "b", "c"] for a.b.c
    parts_;
    constructor(parts) {
        // Type assertion on AstNode constructor above satisfies TS while
        // preserving the runtime shape of the AstNode base class.
        super();
        this.parts_ = parts;
    }
    getParts() {
        return this.parts_;
    }
    /**
     * Symbolic dependency: the first name determines which
     * expression we depend on.
     */
    getDependencies() {
        throw new Error("Unbound NameExpression cannot get dependencies");
    }
    bind(context) {
        return new LinkedNameExpression(context.lookupName(this.parts_, _NameType__WEBPACK_IMPORTED_MODULE_1__.NameType.VALUE));
    }
}
class LinkedNameExpression extends _AST__WEBPACK_IMPORTED_MODULE_0__.AstNode {
    // Link function: () => UncheckedExpression
    link_;
    linkedExpression_ = null;
    constructor(link) {
        super();
        if (!link) {
            throw new Error("LinkedNameExpression requires a valid link");
        }
        this.link_ = link;
    }
    getDependencies() {
        this.ensureLink();
        return [this.linkedExpression_];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bind(_context) {
        throw new Error("LinkedNameExpression cannot be rebound");
    }
    resolve() {
        this.ensureLink();
        return new ResolvedNameExpression(this.linkedExpression_.expression);
    }
    ensureLink() {
        if (this.linkedExpression_ === null) {
            this.linkedExpression_ = this.link_();
        }
    }
}
class ResolvedNameExpression extends _AST__WEBPACK_IMPORTED_MODULE_0__.AstNode {
    expression_;
    constructor(expression) {
        super();
        this.expression_ = expression;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bind(_context) {
        throw new Error("ResolvedNameExpression cannot be rebound");
    }
    resolve() {
        throw new Error("ResolvedNameExpression is already resolved");
    }
    getDependencies() {
        throw new Error("ResolvedNameExpression cannot get dependencies");
    }
    evaluate() {
        return this.expression_.evaluate();
    }
}


/***/ },

/***/ "../../packages/expressions/src/parser/AST.ts"
/*!****************************************************!*\
  !*** ../../packages/expressions/src/parser/AST.ts ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AstNode: () => (/* binding */ AstNode),
/* harmony export */   BinaryExpression: () => (/* binding */ BinaryExpression),
/* harmony export */   NumberLiteral: () => (/* binding */ NumberLiteral),
/* harmony export */   UnaryExpression: () => (/* binding */ UnaryExpression)
/* harmony export */ });
/* harmony import */ var _lexer_Token__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lexer/Token */ "../../packages/expressions/src/lexer/Token.ts");

/**
 * Base class for all AST nodes.
 *
 * Expression nodes move through several conceptual phases:
 *   1. Symbolic (unbound)  - names are just identifiers
 *   2. Bound (concrete)    - names are linked to a binding context
 *   3. Resolved            - all references are replaced with final expressions
 *
 * The same node hierarchy is reused across phases; each node
 * implements phase-transition methods that either return itself
 * unchanged or return a new node in the next phase.
 *
 * This model explains the slightly bizarre lookupName interface which returns a link function
 * instead of a direct reference. We want to bind to an UncheckedExpression but during a call
 * to bind, not all expressions will have yet run so an UncheckedExpression may not yet exist for a
 * given name.
 *
 * The link function is then called during the resolve() call when all expressions in a system
 * are guarenteed to have been converted to an UncheckedExpression and can be safely referenced.
 *
 */
class AstNode {
    /**
     * Evaluate this node.
     * Only valid after binding and resolution.
     *
     * Subclasses are expected to override this; the base
     * implementation simply signals misuse.
     */
    evaluate() {
        throw new Error("evaluate() not implemented");
    }
    /**
     * Return array of dependent expressions this node depends on.
     * Symbolic dependency discovery phase.
     *
     * By default, nodes have no dependencies.
     */
    getDependencies() {
        return [];
    }
    /**
     * Bind this node using the provided context.
     * Default implementation: node is already concrete.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bind(context) {
        return this;
    }
    /**
     * Resolve this node to its final form.
     * Default implementation: already resolved.
     */
    resolve() {
        return this;
    }
}
/**
 * Numeric literal.
 */
class NumberLiteral extends AstNode {
    value_;
    constructor(value) {
        super();
        this.value_ = value;
    }
    evaluate() {
        return this.value_;
    }
}
/**
 * Unary operator expression.
 */
class UnaryExpression extends AstNode {
    operator_;
    operand_;
    constructor(operator, operand) {
        super();
        this.operator_ = operator;
        this.operand_ = operand;
    }
    bind(context) {
        this.operand_ = this.operand_.bind(context);
        return this;
    }
    resolve() {
        this.operand_ = this.operand_.resolve();
        return this;
    }
    evaluate() {
        const v = this.operand_.evaluate();
        switch (this.operator_) {
            case _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.MINUS:
                return -v;
            default:
                throw new Error("Unsupported unary operator");
        }
    }
    getDependencies() {
        return this.operand_.getDependencies();
    }
}
/**
 * Binary operator expression.
 */
class BinaryExpression extends AstNode {
    left_;
    operator_;
    right_;
    constructor(left, operator, right) {
        super();
        this.left_ = left;
        this.operator_ = operator;
        this.right_ = right;
    }
    bind(context) {
        this.left_ = this.left_.bind(context);
        this.right_ = this.right_.bind(context);
        return this;
    }
    resolve() {
        this.left_ = this.left_.resolve();
        this.right_ = this.right_.resolve();
        return this;
    }
    evaluate() {
        const l = this.left_.evaluate();
        const r = this.right_.evaluate();
        switch (this.operator_) {
            case _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.PLUS:
                return l + r;
            case _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.MINUS:
                return l - r;
            case _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.STAR:
                return l * r;
            case _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.SLASH:
                return l / r;
            case _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.PERCENT:
                return l % r;
            default:
                throw new Error("Unsupported operator");
        }
    }
    getDependencies() {
        return [...this.left_.getDependencies(), ...this.right_.getDependencies()];
    }
}


/***/ },

/***/ "../../packages/expressions/src/parser/NameType.ts"
/*!*********************************************************!*\
  !*** ../../packages/expressions/src/parser/NameType.ts ***!
  \*********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NameType: () => (/* binding */ NameType)
/* harmony export */ });
/**
 * Enumerates the different kinds of named entities
 * that can be referenced in an expression.
 */
var NameType;
(function (NameType) {
    /** Value-like name (variables, constants, etc.) */
    NameType["VALUE"] = "VALUE";
    /** Array-like name (indexed collections) */
    NameType["ARRAY"] = "ARRAY";
    /** Function-like name (callable entities) */
    NameType["FUNCTION"] = "FUNCTION";
    /** Object-like name (objects, modules, etc.) */
    NameType["OBJECT"] = "OBJECT";
})(NameType || (NameType = {}));


/***/ },

/***/ "../../packages/expressions/src/parser/Parser.ts"
/*!*******************************************************!*\
  !*** ../../packages/expressions/src/parser/Parser.ts ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseExpression: () => (/* binding */ parseExpression)
/* harmony export */ });
/* harmony import */ var _lexer_Token__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lexer/Token */ "../../packages/expressions/src/lexer/Token.ts");
/* harmony import */ var _lexer_Lexer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lexer/Lexer */ "../../packages/expressions/src/lexer/Lexer.ts");
/* harmony import */ var _AST__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AST */ "../../packages/expressions/src/parser/AST.ts");
/* harmony import */ var _AST_NameExpression__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./AST.NameExpression */ "../../packages/expressions/src/parser/AST.NameExpression.ts");
/* harmony import */ var _expressions_UnboundExpression__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../expressions/UnboundExpression */ "../../packages/expressions/src/expressions/UnboundExpression.ts");
// Parser.ts
//
// Recursive-ascent expression parser.
// Produces a single unbound AST wrapped in UnboundExpression.





/**
 * Parse an expression string into an UnboundExpression.
 */
function parseExpression(expressionString) {
    const lexer = new _lexer_Lexer__WEBPACK_IMPORTED_MODULE_1__.Lexer(expressionString);
    const parser = new Parser(lexer);
    return parser.parseExpression();
}
class Parser {
    // ---------- Fields ----------
    lexer_;
    current_;
    // ---------- Construction ----------
    constructor(lexer) {
        // Defensive runtime check retained for now in case this
        // is ever called from untyped/JS code; consider removing
        // once all construction sites are strictly typed.
        if (!lexer) {
            throw new Error("Parser requires lexer");
        }
        this.lexer_ = lexer;
        this.current_ = lexer.nextToken();
    }
    // ---------- Public API ----------
    /**
     * Parse a full expression.
     */
    parseExpression() {
        const root = this.parseAdditive();
        if (this.current_.type !== _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.EOF) {
            throw new Error(`Unexpected token at position ${this.current_.position}`);
        }
        return new _expressions_UnboundExpression__WEBPACK_IMPORTED_MODULE_4__.UnboundExpression(root);
    }
    // ---------- Grammar ----------
    // additive → multiplicative ( ( "+" | "-" ) multiplicative )*
    parseAdditive() {
        let left = this.parseMultiplicative();
        while (this.current_.type === _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.PLUS ||
            this.current_.type === _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.MINUS) {
            const op = this.current_.type;
            this.advance();
            const right = this.parseMultiplicative();
            left = new _AST__WEBPACK_IMPORTED_MODULE_2__.BinaryExpression(left, op, right);
        }
        return left;
    }
    // multiplicative → unary ( ( "*" | "/" | "%" ) unary )*
    parseMultiplicative() {
        let left = this.parseUnary();
        while (this.current_.type === _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.STAR ||
            this.current_.type === _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.SLASH ||
            this.current_.type === _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.PERCENT) {
            const op = this.current_.type;
            this.advance();
            const right = this.parseUnary();
            left = new _AST__WEBPACK_IMPORTED_MODULE_2__.BinaryExpression(left, op, right);
        }
        return left;
    }
    // unary → "-" unary | primary
    parseUnary() {
        if (this.current_.type === _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.MINUS) {
            const op = this.current_.type;
            this.advance();
            const operand = this.parseUnary();
            return new _AST__WEBPACK_IMPORTED_MODULE_2__.UnaryExpression(op, operand);
        }
        return this.parsePrimary();
    }
    // primary → NUMBER
    //         | IDENTIFIER ("." IDENTIFIER)*
    //         | "(" additive ")"
    parsePrimary() {
        // Number
        if (this.current_.type === _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.NUMBER) {
            const value = this.current_.value;
            this.advance();
            return new _AST__WEBPACK_IMPORTED_MODULE_2__.NumberLiteral(value);
        }
        // Name / member access
        const token = this.current_;
        if (token.type === _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.IDENTIFIER) {
            const parts = [];
            parts.push(token.lexeme);
            this.advance();
            while (this.current_.type === _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.DOT) {
                this.advance();
                this.expectAndStay(_lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.IDENTIFIER);
                parts.push(this.current_.lexeme);
                this.advance();
            }
            return new _AST_NameExpression__WEBPACK_IMPORTED_MODULE_3__.NameExpression(parts);
        }
        // Parenthesized
        if (this.current_.type === _lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.LPAREN) {
            this.advance();
            const expr = this.parseAdditive();
            this.expect(_lexer_Token__WEBPACK_IMPORTED_MODULE_0__.TokenType.RPAREN);
            return expr;
        }
        throw new Error(`Expected number, identifier, or '(' at position ${this.current_.position}`);
    }
    // ---------- Helpers ----------
    advance() {
        this.current_ = this.lexer_.nextToken();
    }
    /**
     * Checks the current token type and advances.
     */
    expect(type) {
        if (this.current_.type !== type) {
            throw new Error(`Expected ${type.toString()} at position ${this.current_.position}`);
        }
        this.advance();
    }
    /**
     * Checks the current token type without advancing.
     */
    expectAndStay(type) {
        if (this.current_.type !== type) {
            throw new Error(`Expected ${type.toString()} at position ${this.current_.position}`);
        }
    }
}


/***/ },

/***/ "../../packages/markdown/src/index.ts"
/*!********************************************!*\
  !*** ../../packages/markdown/src/index.ts ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseMarkdown: () => (/* binding */ parseMarkdown)
/* harmony export */ });
/* harmony import */ var marked__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! marked */ "../../node_modules/marked/lib/marked.esm.js");
/* harmony import */ var _rippledoc_sanitizer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @rippledoc/sanitizer */ "../../packages/sanitizer/src/index.ts");


/**
 * Parses the given markdown string and returns an HTMLElement representing the rendered markdown.
 */
function parseMarkdown(markdown) {
    const container = document.createElement("div");
    container.innerHTML = (0,_rippledoc_sanitizer__WEBPACK_IMPORTED_MODULE_1__.sanitizeHTML)(marked__WEBPACK_IMPORTED_MODULE_0__.marked.parse(markdown));
    return container;
}


/***/ },

/***/ "../../packages/presentation2/src/components/common/AxisBuilder.ts"
/*!*************************************************************************!*\
  !*** ../../packages/presentation2/src/components/common/AxisBuilder.ts ***!
  \*************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AxisBuilder: () => (/* binding */ AxisBuilder)
/* harmony export */ });
/**
 * Internal helper - not a public API. Subject to change without warning.
 *
 * Utility class for building an axis with constraints where:
 * - Exactly two constrains must be set for the axis to be correctly constrained.
 * - Constraints may have reasonable default values which can be overridden.
 *
 * ## A Correctly Constrained Axis
 * A correctly constrained axis has exactly two constraint expressions set. It is
 * underconstrained if fewer that two are set. It is constrained if more that two are set.
 *
 * Default values will never overconstrain an axis but can prevent an axis from being
 * underconstrained.
 *
 * ## Usage
 * const ab = new AxisBuilder(['left', 'width', 'right'] as const);
 * ab.set('left', '0');
 * ab.setDefault('right', '100');
 * ab.setDefault('width', '100');
 * console.log(ab.correctlyConstrained); // Should print: false
 */
class AxisBuilder {
    keys_;
    constraint_;
    constructor(keys) {
        // eslint-disable-next-line no-magic-numbers
        if (keys.length !== 3) {
            throw new Error("AxisBuilder requires exactly 3 keys");
        }
        this.keys_ = [...keys];
        this.constraint_ = Object.fromEntries(keys.map((k) => [k, { expression: null, isDefault: false }]));
    }
    set(key, expression) {
        if (this.constraint_[key].expression !== null &&
            !this.constraint_[key].isDefault) {
            throw new Error(`Constraint '${key}' is already set and is not default`);
        }
        this.constraint_[key] = { expression, isDefault: false };
        return this;
    }
    setDefault(key, expression) {
        this.constraint_[key] = { expression, isDefault: true };
        return this;
    }
    /**
     *
     */
    get correctlyConstrained() {
        // FIXME: I'm not sure how to fix this linting error
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const values = Object.values(this.constraint_);
        const constraintCount = values.filter((c) => c.expression !== null).length;
        // Simplest case: exactly two constraints are set
        if (constraintCount === 2) {
            return true;
        }
        else if (constraintCount < 2) {
            // Underconstrained: fewer than two constraints are set, even considering defaults
            return false;
        }
        // Complex case: potential overconstrained scenario, check if any constraints are default
        const defaultConstraintCount = values.filter((c) => c.expression !== null && c.isDefault).length;
        if (defaultConstraintCount == 1) {
            return true;
        }
        // Two possibilities:
        // 1. All constraints are explicitly set, so it's overconstrained
        // 2. One constraint is explicitly set and two are default, which is still overconstrained
        // because we can't know which default to ignore
        return false;
    }
    /**
     * Returns three constraint expressions, deriving the missing one from the other two.
     *
     * Assumes the keys passed to the constructor are ordered as:
     *   [start, size, end] — e.g. ['left', 'width', 'right'] or ['top', 'height', 'bottom'].
     *
     * The derived expression uses the user-provided key names, for example:
     *   right = left + width
     *   width = right - left
     *   left = right - width
     */
    deriveExpressions() {
        if (!this.correctlyConstrained) {
            throw new Error("Axis is not correctly constrained");
        }
        const keys = this.keys_;
        const [k0, k1, k2] = keys;
        const constrainedKeys = keys.filter((k) => this.constraint_[k].expression !== null);
        const explicitKeys = constrainedKeys.filter((k) => !this.constraint_[k].isDefault);
        const primaryKeys = (() => {
            if (explicitKeys.length >= 2) {
                return [explicitKeys[0], explicitKeys[1]];
            }
            if (constrainedKeys.length === 2) {
                return [constrainedKeys[0], constrainedKeys[1]];
            }
            // Should not happen if correctlyConstrained is true
            throw new Error("Internal error: unable to determine primary constraints");
        })();
        const [p0, p1] = primaryKeys;
        const hasPrimary = (k) => k === p0 || k === p1;
        let derivedKey;
        let derivedExpression;
        if (hasPrimary(k0) && hasPrimary(k1)) {
            // Derive end from start and size
            derivedKey = k2;
            derivedExpression = `${String(k0)} + ${String(k1)}`;
        }
        else if (hasPrimary(k0) && hasPrimary(k2)) {
            // Derive size from start and end
            derivedKey = k1;
            derivedExpression = `${String(k2)} - ${String(k0)}`;
        }
        else if (hasPrimary(k1) && hasPrimary(k2)) {
            // Derive start from size and end
            derivedKey = k0;
            derivedExpression = `${String(k2)} - ${String(k1)}`;
        }
        else {
            throw new Error("Internal error: unsupported constraint combination");
        }
        const result = {};
        for (const key of keys) {
            if (key === derivedKey) {
                result[key] = derivedExpression;
            }
            else {
                const entry = this.constraint_[key];
                if (entry.expression === null) {
                    throw new Error(`Internal error: missing expression for key '${String(key)}'`);
                }
                result[key] = entry.expression;
            }
        }
        return result;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/common/StringBoundaryHelper.ts"
/*!**********************************************************************************!*\
  !*** ../../packages/presentation2/src/components/common/StringBoundaryHelper.ts ***!
  \**********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   containsIsolatedToken: () => (/* binding */ containsIsolatedToken)
/* harmony export */ });
/**
 * Checks whether a given string contains a specific token such that
 * the characters immediately before and after the token (if present)
 * are not alphanumeric (A–Z, a–z, 0–9).
 *
 * This is useful when you want to match a token only when it is not
 * part of a larger identifier or word.
 */
function containsIsolatedToken(haystack, token) {
    if (!token || token.length > haystack.length) {
        return false;
    }
    let fromIndex = 0;
    // Scan for all occurrences of the token
    while (fromIndex <= haystack.length - token.length) {
        const index = haystack.indexOf(token, fromIndex);
        // Not magic: -1 is well known as the "not found" return value for indexOf
        // eslint-disable-next-line no-magic-numbers
        if (index === -1) {
            return false;
        }
        const beforeIndex = index - 1;
        const afterIndex = index + token.length;
        const beforeChar = beforeIndex >= 0 ? haystack.charAt(beforeIndex) : undefined;
        const afterChar = afterIndex < haystack.length ? haystack.charAt(afterIndex) : undefined;
        const beforeIsAlphaNumeric = beforeChar !== undefined && isAlphaNumeric(beforeChar);
        const afterIsAlphaNumeric = afterChar !== undefined && isAlphaNumeric(afterChar);
        // Both neighbors (if any) must NOT be alphanumeric
        if (!beforeIsAlphaNumeric && !afterIsAlphaNumeric) {
            return true;
        }
        // Continue searching from the next character after this match
        fromIndex = index + 1;
    }
    return false;
}
function isAlphaNumeric(ch) {
    if (!ch) {
        return false;
    }
    const code = ch.charCodeAt(0);
    // 0–9
    // eslint-disable-next-line no-magic-numbers
    if (code >= 48 && code <= 57) {
        return true;
    }
    // A–Z
    // eslint-disable-next-line no-magic-numbers
    if (code >= 65 && code <= 90) {
        return true;
    }
    // a–z
    // eslint-disable-next-line no-magic-numbers
    if (code >= 97 && code <= 122) {
        return true;
    }
    return false;
}


/***/ },

/***/ "../../packages/presentation2/src/components/common/TypedEmitter.ts"
/*!**************************************************************************!*\
  !*** ../../packages/presentation2/src/components/common/TypedEmitter.ts ***!
  \**************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TypedEmitter: () => (/* binding */ TypedEmitter)
/* harmony export */ });
/**
 *
 */
class TypedEmitter {
    listeners_ = {};
    on(event, listener) {
        let set = this.listeners_[event];
        if (!set) {
            set = new Set();
            this.listeners_[event] = set;
        }
        set.add(listener);
        // return unsubscribe function (important modern practice)
        return () => set.delete(listener);
    }
    emit(event, payload) {
        const set = this.listeners_[event];
        if (!set) {
            return;
        }
        for (const listener of set) {
            listener(payload);
        }
    }
    clear(event) {
        if (event) {
            delete this.listeners_[event];
        }
        else {
            this.listeners_ = {};
        }
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/compilePresentation.ts"
/*!**************************************************************************!*\
  !*** ../../packages/presentation2/src/components/compilePresentation.ts ***!
  \**************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   compilePresentation: () => (/* binding */ compilePresentation)
/* harmony export */ });
/* harmony import */ var _presentation_PresentationCompiler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./presentation/PresentationCompiler */ "../../packages/presentation2/src/components/presentation/PresentationCompiler.ts");

function compilePresentation(from) {
    const compiler = new _presentation_PresentationCompiler__WEBPACK_IMPORTED_MODULE_0__.PresentationCompiler(from);
    return Promise.resolve(compiler.compile());
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/Element.ts"
/*!**********************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/Element.ts ***!
  \**********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ContentDependentDimension: () => (/* binding */ ContentDependentDimension),
/* harmony export */   Element: () => (/* binding */ Element)
/* harmony export */ });
/**
 * Content dependent dimension types.
 */
var ContentDependentDimension;
(function (ContentDependentDimension) {
    ContentDependentDimension["None"] = "none";
    ContentDependentDimension["Width"] = "width";
    ContentDependentDimension["Height"] = "height";
})(ContentDependentDimension || (ContentDependentDimension = {}));
class Element {
    // Construction-related data ---------------------------------------------------------------------
    //
    static constructionToken_ = Symbol("Element.ConstructorProtector");
    phase2Constructor_ = {
        setScrollTriggers: (scrollTriggers) => {
            this.scrollTriggers_ = scrollTriggers;
            return this.phase2Constructor_;
        },
        setPins: (pins) => {
            this.pins_ = pins;
            return this.phase2Constructor_;
        },
        complete: () => {
            this.phase2Constructor_ = null;
        },
    };
    // Structural relationships ----------------------------------------------------------------------
    //
    section_;
    scrollTriggers_ = [];
    pins_ = [];
    // Owned properties ------------------------------------------------------------------------------
    //
    name_;
    contentDependentDimension_ = ContentDependentDimension.None;
    left_;
    right_;
    width_;
    top_;
    bottom_;
    height_;
    constructor(token, options) {
        if (token !== Element.constructionToken_) {
            throw new Error("Element constructor is private. Use Element.create() instead.");
        }
        this.section_ = options.section;
        this.name_ = options.name;
        this.contentDependentDimension_ = options.contentDependentDimension;
        this.left_ = options.left;
        this.right_ = options.right;
        this.width_ = options.width;
        this.top_ = options.top;
        this.bottom_ = options.bottom;
        this.height_ = options.height;
    }
    get phase2Constructor() {
        if (this.phase2Constructor_ === null) {
            throw new Error("Phase 2 construction already complete");
        }
        return this.phase2Constructor_;
    }
    static createElement(options) {
        const element = new Element(Element.constructionToken_, options);
        return {
            element,
            phase2Constructor: element.phase2Constructor,
        };
    }
    // ----------------------------------------------------------------------------------------------
    // Structural relationships
    // ----------------------------------------------------------------------------------------------
    get section() {
        return this.section_;
    }
    get presentation() {
        return this.section_.presentation;
    }
    // ----------------------------------------------------------------------------------------------
    // Non-structural, non-geometric properties
    // ----------------------------------------------------------------------------------------------
    get name() {
        return this.name_;
    }
    scrollTriggerByName(name) {
        const scrollTrigger = this.scrollTriggers_.find((st) => st.name === name);
        if (!scrollTrigger) {
            throw new Error(`ScrollTrigger with name "${name}" not found.`);
        }
        return scrollTrigger;
    }
    // ----------------------------------------------------------------------------------------------
    // Geometry
    // ----------------------------------------------------------------------------------------------
    get left() {
        return this.left_.evaluate();
    }
    get right() {
        return this.right_.evaluate();
    }
    get width() {
        return this.width_.evaluate();
    }
    get top() {
        return this.top_.evaluate();
    }
    get bottom() {
        return this.bottom_.evaluate();
    }
    get height() {
        return this.height_.evaluate();
    }
    get contentDependentDimension() {
        return this.contentDependentDimension_;
    }
    get scrollTriggers() {
        return this.scrollTriggers_;
    }
    get pins() {
        return this.pins_;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/ElementBuilder.ts"
/*!*****************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/ElementBuilder.ts ***!
  \*****************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ElementBuilder: () => (/* binding */ ElementBuilder)
/* harmony export */ });
/* harmony import */ var _common_AxisBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/AxisBuilder */ "../../packages/presentation2/src/components/common/AxisBuilder.ts");
/* harmony import */ var _scrollTrigger_ScrollTriggerBuilder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../scrollTrigger/ScrollTriggerBuilder */ "../../packages/presentation2/src/components/scrollTrigger/ScrollTriggerBuilder.ts");
/* harmony import */ var _pin_PinBuilder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../pin/PinBuilder */ "../../packages/presentation2/src/components/pin/PinBuilder.ts");
/* harmony import */ var _ElementCompiler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ElementCompiler */ "../../packages/presentation2/src/components/element/ElementCompiler.ts");




/**
 *
 *
 * ## Structural related classes
 * ElementBuilder has direct access to:
 * - SectionBuilder, @see section
 * - PresentationBuilder, @see presentation
 *
 */
class ElementBuilder {
    // Structural relationships ----------------------------------------------------------------------
    //
    section_;
    // Owned properties ------------------------------------------------------------------------------
    //
    name_ = "";
    scrollTriggers_ = [];
    pins_ = [];
    // Order of axis components is key here: AxisBuilder.deriveExpressions depends on it
    // DO NOT CHANGE
    xAxis_ = new _common_AxisBuilder__WEBPACK_IMPORTED_MODULE_0__.AxisBuilder(["left", "width", "right"]);
    yAxis_ = new _common_AxisBuilder__WEBPACK_IMPORTED_MODULE_0__.AxisBuilder(["top", "height", "bottom"]);
    constructor(options) {
        this.section_ = options.section;
    }
    makeCompiler(sectionCompiler) {
        return new _ElementCompiler__WEBPACK_IMPORTED_MODULE_3__.ElementCompiler({
            elementBuilder: this,
            sectionCompiler: sectionCompiler,
        });
    }
    // ----------------------------------------------------------------------------------------------
    // Structural relationships
    // ----------------------------------------------------------------------------------------------
    get section() {
        return this.section_;
    }
    get presentation() {
        return this.section.presentation;
    }
    addScrollTrigger() {
        const scrollTrigger = new _scrollTrigger_ScrollTriggerBuilder__WEBPACK_IMPORTED_MODULE_1__.ScrollTriggerBuilder({ element: this });
        this.scrollTriggers_.push(scrollTrigger);
        return scrollTrigger;
    }
    addPin() {
        const pin = new _pin_PinBuilder__WEBPACK_IMPORTED_MODULE_2__.PinBuilder({ element: this });
        this.pins_.push(pin);
        return pin;
    }
    get scrollTriggers() {
        return this.scrollTriggers_;
    }
    get pins() {
        return this.pins_;
    }
    // ----------------------------------------------------------------------------------------------
    // Owned properties
    // ----------------------------------------------------------------------------------------------
    // Axes
    //
    get xAxis() {
        return this.xAxis_;
    }
    get yAxis() {
        return this.yAxis_;
    }
    // Name
    //
    get name() {
        return this.name_;
    }
    set name(value) {
        this.name_ = value;
    }
    get hasName() {
        return this.name_.trim().length > 0;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/ElementCompiler.ts"
/*!******************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/ElementCompiler.ts ***!
  \******************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ElementCompiler: () => (/* binding */ ElementCompiler)
/* harmony export */ });
/* harmony import */ var _Element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Element */ "../../packages/presentation2/src/components/element/Element.ts");
/* harmony import */ var _common_StringBoundaryHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/StringBoundaryHelper */ "../../packages/presentation2/src/components/common/StringBoundaryHelper.ts");
/* harmony import */ var _scrollTrigger_ScrollTriggerCompiler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../scrollTrigger/ScrollTriggerCompiler */ "../../packages/presentation2/src/components/scrollTrigger/ScrollTriggerCompiler.ts");
/* harmony import */ var _pin_PinCompiler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../pin/PinCompiler */ "../../packages/presentation2/src/components/pin/PinCompiler.ts");




class ElementCompiler {
    // Structural relationships
    //
    builder_;
    sectionCompiler_;
    // Owned properties
    //
    module_;
    left_ = null;
    right_ = null;
    width_ = null;
    top_ = null;
    bottom_ = null;
    height_ = null;
    contentDependentDimension_ = _Element__WEBPACK_IMPORTED_MODULE_0__.ContentDependentDimension.None;
    contentDependentDimensionHolder_ = { value: 42 };
    scrollTriggers_ = [];
    pins_ = [];
    constructor(options) {
        this.builder_ = options.elementBuilder;
        this.sectionCompiler_ = options.sectionCompiler;
        this.module_ = this.sectionCompiler_.module.addSubModule();
        this.scrollTriggers_ = this.builder_.scrollTriggers.map((scrollTriggerBuilder) => new _scrollTrigger_ScrollTriggerCompiler__WEBPACK_IMPORTED_MODULE_2__.ScrollTriggerCompiler({
            scrollTriggerBuilder,
            elementCompiler: this,
        }));
        this.pins_ = this.builder_.pins.map((pinBuilder) => new _pin_PinCompiler__WEBPACK_IMPORTED_MODULE_3__.PinCompiler({
            pinBuilder,
            elementCompiler: this,
        }));
    }
    // ----------------------------------------------------------------------------------------------
    // Property accessors
    // ----------------------------------------------------------------------------------------------
    get module() {
        return this.module_;
    }
    get builder() {
        return this.builder_;
    }
    // ----------------------------------------------------------------------------------------------
    // Pre-compilation steps
    // ----------------------------------------------------------------------------------------------
    /**
     * See Presentation.beforeCompile() for symantics of this method & pattern of implementation
     * Do not duplicate that comment here - single point of truth.
     */
    beforeCompile() {
        this.validateAndDerive();
        this.scrollTriggers_.forEach((scrollTrigger) => scrollTrigger.beforeCompile());
        this.pins_.forEach((pin) => pin.beforeCompile());
        this.subclassValidateAndDerive();
    }
    subclassValidateAndDerive() { }
    validateAndDerive() {
        const xAxisStrings = this.builder_.xAxis.deriveExpressions();
        this.left_ = this.module.addExpression("left", xAxisStrings.left);
        this.width_ = this.module.addExpression("width", xAxisStrings.width);
        this.right_ = this.module.addExpression("right", xAxisStrings.right);
        const yAxisStrings = this.builder_.yAxis.deriveExpressions();
        this.top_ = this.module.addExpression("top", yAxisStrings.top);
        this.height_ = this.module.addExpression("height", yAxisStrings.height);
        this.bottom_ = this.module.addExpression("bottom", yAxisStrings.bottom);
        this.module.addNativeExpression("content", () => this.contentDependentDimensionHolder_.value);
        if ((0,_common_StringBoundaryHelper__WEBPACK_IMPORTED_MODULE_1__.containsIsolatedToken)(xAxisStrings.width, "content")) {
            this.contentDependentDimension_ = _Element__WEBPACK_IMPORTED_MODULE_0__.ContentDependentDimension.Width;
        }
        if ((0,_common_StringBoundaryHelper__WEBPACK_IMPORTED_MODULE_1__.containsIsolatedToken)(yAxisStrings.height, "content")) {
            if (this.contentDependentDimension_ === _Element__WEBPACK_IMPORTED_MODULE_0__.ContentDependentDimension.Width) {
                throw new Error("We do not support both dimensions being content-dependent");
            }
            this.contentDependentDimension_ = _Element__WEBPACK_IMPORTED_MODULE_0__.ContentDependentDimension.Height;
        }
    }
    // ----------------------------------------------------------------------------------------------
    // Compilation steps
    // ----------------------------------------------------------------------------------------------
    /**
     * See Presentation.compile() for symantics of this method & pattern of implementation
     * Do not duplicate that comment here - single point of truth.
     */
    compile(section) {
        const { element, phase2Constructor } = _Element__WEBPACK_IMPORTED_MODULE_0__.Element.createElement(this.buildElementOptions(section));
        this.defaultPhase2Construction(element, phase2Constructor);
        return element;
    }
    buildElementOptions(section) {
        return {
            section,
            name: this.builder_.name,
            contentDependentDimension: this.contentDependentDimension_,
            left: this.left_(),
            width: this.width_(),
            right: this.right_(),
            top: this.top_(),
            height: this.height_(),
            bottom: this.bottom_(),
        };
    }
    defaultPhase2Construction(element, p2c) {
        // If we have a content-dependent dimension we must report this to the underlying
        // PresentationCompiler
        //
        if (this.contentDependentDimension_ === _Element__WEBPACK_IMPORTED_MODULE_0__.ContentDependentDimension.Width) {
            this.sectionCompiler_.presentationCompiler.declareContentDependentElement(element, this.width_(), this.contentDependentDimensionHolder_);
        }
        else if (this.contentDependentDimension_ === _Element__WEBPACK_IMPORTED_MODULE_0__.ContentDependentDimension.Height) {
            this.sectionCompiler_.presentationCompiler.declareContentDependentElement(element, this.height_(), this.contentDependentDimensionHolder_);
        }
        // Compile & attach scroll triggers and pins
        //
        p2c.setScrollTriggers(this.scrollTriggers_.map((st) => st.compile(element)));
        p2c.setPins(this.pins_.map((pin) => pin.compile(element)));
        p2c.complete();
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/htmlView/HTMLElementView.ts"
/*!***************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/htmlView/HTMLElementView.ts ***!
  \***************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLElementView: () => (/* binding */ HTMLElementView)
/* harmony export */ });
/* harmony import */ var _Element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element */ "../../packages/presentation2/src/components/element/Element.ts");

/**
 *
 * # Pattern for subclassing
 * This is *not* a limitless extension point. We expect a strict pattern:
 *
 * 1. The constructor *must*:
 *  a. Call super() with the options, and sets subclass: true
 *  b. Call createDOM()
 * 2. You *may* override:
 *  a. subclassCreateDOM() to create the DOM elements for this element, and add them to the DOM
 *  b. subclassLayout() to position the DOM elements for this element
 *  c. get element() to return the correct type of element for this view
 *  d. disconnect() to clean up any resources when this view is removed from the DOM
 *     (indeed you *must* do this if you add any event listeners or other resources that need to be
 *      cleaned up)
 * 3. You *must not* override anything else.
 */
class HTMLElementView {
    // Structural relationships ----------------------------------------------------------------------
    //
    element_;
    sectionView_;
    htmlElement_;
    constructor(options) {
        this.sectionView_ = options.sectionView;
        this.element_ = options.element;
        // If this is a subclass, then we will call createDOM() from the subclass constructor
        if (!options.subclass) {
            this.createDOM();
        }
    }
    disconnect() { }
    // ----------------------------------------------------------------------------------------------
    // Structural relationships
    // ----------------------------------------------------------------------------------------------
    get element() {
        return this.element_;
    }
    get htmlElement() {
        return this.htmlElement_;
    }
    get sectionView() {
        return this.sectionView_;
    }
    get presentationView() {
        return this.sectionView.presentationView;
    }
    // ----------------------------------------------------------------------------------------------
    // Rendering
    // ----------------------------------------------------------------------------------------------
    createDOM() {
        this.htmlElement_ = document.createElement("div");
        this.htmlElement_.style.position = "absolute";
        this.htmlElement_.classList.add("rdoc-element");
        if (this.element.name.length > 0) {
            this.htmlElement_.classList.add(`rdoc-element-${this.element.name}`);
        }
        this.sectionView.htmlContentElement.appendChild(this.htmlElement_);
        this.subclassCreateDOM();
    }
    subclassCreateDOM() { }
    /**
     * Content dependent sizing calculations are a two step process to minimise layout thrashing:
     * 1. Application of layout
     * 2. Measurement of content dependent size
     *
     * See PresentationViewRoot.layout
     */
    applyContentDependentSize() {
        const scale = this.presentationView.physicalDimensions.scale;
        if (this.element.contentDependentDimension == _Element__WEBPACK_IMPORTED_MODULE_0__.ContentDependentDimension.Width) {
            this.htmlElement_.style.width = "";
            this.htmlElement_.style.height = `${this.element.height * scale}px`;
        }
        else if (this.element.contentDependentDimension == _Element__WEBPACK_IMPORTED_MODULE_0__.ContentDependentDimension.Height) {
            this.htmlElement_.style.width = `${this.element.width * scale}px`;
            this.htmlElement_.style.height = "";
        }
        else {
            throw new Error("Element does not have a content dependent dimension");
        }
    }
    /**
     * Gets the content dependent size of the element in basis coordinates.
     */
    measureContentDependentSize() {
        const scale = this.presentationView.physicalDimensions.scale;
        const size = this.htmlElement_.getBoundingClientRect();
        if (this.element.contentDependentDimension == _Element__WEBPACK_IMPORTED_MODULE_0__.ContentDependentDimension.Width) {
            return size.width / scale;
        }
        else if (this.element.contentDependentDimension == _Element__WEBPACK_IMPORTED_MODULE_0__.ContentDependentDimension.Height) {
            return size.height / scale;
        }
        throw new Error("Element does not have a content dependent dimension");
    }
    layout() {
        const scale = this.presentationView.physicalDimensions.scale;
        this.htmlElement_.style.left = `${this.element.left * scale}px`;
        this.htmlElement_.style.top = `${this.element.top * scale}px`;
        this.htmlElement_.style.width = `${this.element.width * scale}px`;
        this.htmlElement_.style.height = `${this.element.height * scale}px`;
        this.subclassLayout();
    }
    subclassLayout() { }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/imageElement/ImageElement.ts"
/*!****************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/imageElement/ImageElement.ts ***!
  \****************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ImageElement: () => (/* binding */ ImageElement),
/* harmony export */   ImageFit: () => (/* binding */ ImageFit)
/* harmony export */ });
/* harmony import */ var _Element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element */ "../../packages/presentation2/src/components/element/Element.ts");

var ImageFit;
(function (ImageFit) {
    ImageFit["Fill"] = "fill";
    ImageFit["Contain"] = "contain";
    ImageFit["Cover"] = "cover";
})(ImageFit || (ImageFit = {}));
class ImageElement extends _Element__WEBPACK_IMPORTED_MODULE_0__.Element {
    source_;
    fit_;
    constructor(token, options) {
        super(token, options.elementOptions);
        this.source_ = options.source;
        this.fit_ = options.fit;
    }
    static createImageElement(options) {
        const element = new ImageElement(_Element__WEBPACK_IMPORTED_MODULE_0__.Element.constructionToken_, options);
        return {
            element,
            phase2Constructor: element.phase2Constructor,
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static createElement(options) {
        throw new Error("Use createImageElement to create an ImageElement");
    }
    get source() {
        return this.source_;
    }
    get fit() {
        return this.fit_;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/imageElement/ImageElementBuilder.ts"
/*!***********************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/imageElement/ImageElementBuilder.ts ***!
  \***********************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ImageElementBuilder: () => (/* binding */ ImageElementBuilder)
/* harmony export */ });
/* harmony import */ var _ElementBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ElementBuilder */ "../../packages/presentation2/src/components/element/ElementBuilder.ts");
/* harmony import */ var _ImageElementCompiler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ImageElementCompiler */ "../../packages/presentation2/src/components/element/imageElement/ImageElementCompiler.ts");
/* harmony import */ var _ImageElement__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ImageElement */ "../../packages/presentation2/src/components/element/imageElement/ImageElement.ts");



class ImageElementBuilder extends _ElementBuilder__WEBPACK_IMPORTED_MODULE_0__.ElementBuilder {
    source_ = "";
    fit_ = _ImageElement__WEBPACK_IMPORTED_MODULE_2__.ImageFit.Fill;
    constructor(options) {
        super(options);
    }
    makeCompiler(sectionCompiler) {
        return new _ImageElementCompiler__WEBPACK_IMPORTED_MODULE_1__.ImageElementCompiler({
            elementBuilder: this,
            sectionCompiler: sectionCompiler,
        });
    }
    get source() {
        return this.source_;
    }
    set source(value) {
        this.source_ = value;
    }
    get fit() {
        return this.fit_;
    }
    set fit(value) {
        this.fit_ = value;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/imageElement/ImageElementCompiler.ts"
/*!************************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/imageElement/ImageElementCompiler.ts ***!
  \************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ImageElementCompiler: () => (/* binding */ ImageElementCompiler)
/* harmony export */ });
/* harmony import */ var _ElementCompiler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ElementCompiler */ "../../packages/presentation2/src/components/element/ElementCompiler.ts");
/* harmony import */ var _ImageElement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ImageElement */ "../../packages/presentation2/src/components/element/imageElement/ImageElement.ts");


class ImageElementCompiler extends _ElementCompiler__WEBPACK_IMPORTED_MODULE_0__.ElementCompiler {
    constructor(options) {
        super(options);
    }
    get builder() {
        // We know this is a ImageElementBuilder because of the type signature of the constructor, but the
        // base class only knows it's an ElementBuilder, so we have to cast it here.
        return super.builder;
    }
    subclassValidateAndDerive() { }
    compile(section) {
        const { element, phase2Constructor } = _ImageElement__WEBPACK_IMPORTED_MODULE_1__.ImageElement.createImageElement({
            elementOptions: this.buildElementOptions(section),
            source: this.builder.source,
            fit: this.builder.fit,
        });
        this.defaultPhase2Construction(element, phase2Constructor);
        return element;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/imageElement/htmlView/HTMLImageElementView.ts"
/*!*********************************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/imageElement/htmlView/HTMLImageElementView.ts ***!
  \*********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLImageElementView: () => (/* binding */ HTMLImageElementView)
/* harmony export */ });
/* harmony import */ var _htmlView_HTMLElementView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../htmlView/HTMLElementView */ "../../packages/presentation2/src/components/element/htmlView/HTMLElementView.ts");
/* harmony import */ var _ImageElement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ImageElement */ "../../packages/presentation2/src/components/element/imageElement/ImageElement.ts");


class HTMLImageElementView extends _htmlView_HTMLElementView__WEBPACK_IMPORTED_MODULE_0__.HTMLElementView {
    constructor(options) {
        super({ ...options, subclass: true });
        this.createDOM();
    }
    get element() {
        // We know that this is a ImageElement, so we can cast it here.
        return super.element;
    }
    subclassCreateDOM() {
        const img = document.createElement("img");
        img.src = this.element.source;
        switch (this.element.fit) {
            case _ImageElement__WEBPACK_IMPORTED_MODULE_1__.ImageFit.Fill:
                img.style.objectFit = "fill";
                break;
            case _ImageElement__WEBPACK_IMPORTED_MODULE_1__.ImageFit.Contain:
                img.style.objectFit = "contain";
                break;
            case _ImageElement__WEBPACK_IMPORTED_MODULE_1__.ImageFit.Cover:
                img.style.objectFit = "cover";
                break;
        }
        img.style.width = "100%";
        img.style.height = "100%";
        this.htmlElement.classList.add("rdoc-image-element");
        this.htmlElement.appendChild(img);
    }
    subclassLayout() { }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/textBoxElement/TextBoxElement.ts"
/*!********************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/textBoxElement/TextBoxElement.ts ***!
  \********************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TextBoxElement: () => (/* binding */ TextBoxElement)
/* harmony export */ });
/* harmony import */ var _Element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element */ "../../packages/presentation2/src/components/element/Element.ts");

class TextBoxElement extends _Element__WEBPACK_IMPORTED_MODULE_0__.Element {
    content_;
    constructor(token, options) {
        super(token, options.elementOptions);
        this.content_ = options.content;
    }
    get content() {
        return this.content_;
    }
    static createTextBox(options) {
        const element = new TextBoxElement(_Element__WEBPACK_IMPORTED_MODULE_0__.Element.constructionToken_, options);
        return {
            element,
            phase2Constructor: element.phase2Constructor,
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static createElement(options) {
        throw new Error("Use createTextBox to create a TextBoxElement");
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/textBoxElement/TextBoxElementBuilder.ts"
/*!***************************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/textBoxElement/TextBoxElementBuilder.ts ***!
  \***************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TextBoxBuilder: () => (/* binding */ TextBoxBuilder)
/* harmony export */ });
/* harmony import */ var _ElementBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ElementBuilder */ "../../packages/presentation2/src/components/element/ElementBuilder.ts");
/* harmony import */ var _TextBoxElementCompiler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TextBoxElementCompiler */ "../../packages/presentation2/src/components/element/textBoxElement/TextBoxElementCompiler.ts");


class TextBoxBuilder extends _ElementBuilder__WEBPACK_IMPORTED_MODULE_0__.ElementBuilder {
    htmlContent_ = document.createDocumentFragment();
    constructor(options) {
        super(options);
    }
    makeCompiler(sectionCompiler) {
        return new _TextBoxElementCompiler__WEBPACK_IMPORTED_MODULE_1__.TextBoxCompiler({
            elementBuilder: this,
            sectionCompiler: sectionCompiler,
        });
    }
    get htmlContent() {
        return this.htmlContent_;
    }
    set htmlContent(value) {
        this.htmlContent_ = value;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/textBoxElement/TextBoxElementCompiler.ts"
/*!****************************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/textBoxElement/TextBoxElementCompiler.ts ***!
  \****************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TextBoxCompiler: () => (/* binding */ TextBoxCompiler)
/* harmony export */ });
/* harmony import */ var _ElementCompiler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ElementCompiler */ "../../packages/presentation2/src/components/element/ElementCompiler.ts");
/* harmony import */ var _TextBoxElement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TextBoxElement */ "../../packages/presentation2/src/components/element/textBoxElement/TextBoxElement.ts");


class TextBoxCompiler extends _ElementCompiler__WEBPACK_IMPORTED_MODULE_0__.ElementCompiler {
    constructor(options) {
        super(options);
    }
    get builder() {
        // We know this is a TextBoxBuilder because of the type signature of the constructor, but the
        // base class only knows it's an ElementBuilder, so we have to cast it here.
        return super.builder;
    }
    subclassValidateAndDerive() { }
    compile(section) {
        const { element, phase2Constructor } = _TextBoxElement__WEBPACK_IMPORTED_MODULE_1__.TextBoxElement.createTextBox({
            elementOptions: this.buildElementOptions(section),
            content: this.builder.htmlContent,
        });
        this.defaultPhase2Construction(element, phase2Constructor);
        return element;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/element/textBoxElement/htmlView/HTMLTextBoxElementView.ts"
/*!*************************************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/element/textBoxElement/htmlView/HTMLTextBoxElementView.ts ***!
  \*************************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLTextBoxElementView: () => (/* binding */ HTMLTextBoxElementView)
/* harmony export */ });
/* harmony import */ var _htmlView_HTMLElementView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../htmlView/HTMLElementView */ "../../packages/presentation2/src/components/element/htmlView/HTMLElementView.ts");

class HTMLTextBoxElementView extends _htmlView_HTMLElementView__WEBPACK_IMPORTED_MODULE_0__.HTMLElementView {
    constructor(options) {
        super({ ...options, subclass: true });
        this.createDOM();
    }
    get element() {
        // We know that this is a TextBoxElement, so we can cast it here.
        return super.element;
    }
    subclassCreateDOM() {
        this.htmlElement.classList.add("rdoc-text-box-element");
        this.htmlElement.appendChild(this.element.content);
    }
    subclassLayout() { }
}


/***/ },

/***/ "../../packages/presentation2/src/components/loadFromXML/io/loadXMLSource.ts"
/*!***********************************************************************************!*\
  !*** ../../packages/presentation2/src/components/loadFromXML/io/loadXMLSource.ts ***!
  \***********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadXMLSource: () => (/* binding */ loadXMLSource)
/* harmony export */ });
/**
 * Loads XML content from either a URL or a text string.
 * Exactly one of the two options must be provided.
 *
 * @param options An object containing either a URL or a text string.
 * @returns A promise that resolves to the XML content as a string.
 */
async function loadXMLSource(options) {
    const { url, text } = options;
    if ((url && text) || (!url && !text)) {
        throw new Error("loadFromXML: exactly one of 'url' or 'text' must be provided");
    }
    if (typeof text === "string") {
        return text;
    }
    // At this point we know url is defined.
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch XML: ${response.statusText}`);
    }
    return response.text();
}


/***/ },

/***/ "../../packages/presentation2/src/components/loadFromXML/io/parseXMLDocument.ts"
/*!**************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/loadFromXML/io/parseXMLDocument.ts ***!
  \**************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseXMLDocument: () => (/* binding */ parseXMLDocument)
/* harmony export */ });
/**
 * Parses an XML string into a Document object.
 */
function parseXMLDocument(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
        throw new Error(`XML parsing error: ${parserError.textContent ?? ""}`);
    }
    return xmlDoc;
}


/***/ },

/***/ "../../packages/presentation2/src/components/loadFromXML/loadElement.ts"
/*!******************************************************************************!*\
  !*** ../../packages/presentation2/src/components/loadFromXML/loadElement.ts ***!
  \******************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadElement: () => (/* binding */ loadElement)
/* harmony export */ });
/* harmony import */ var _loadTextBoxElement__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./loadTextBoxElement */ "../../packages/presentation2/src/components/loadFromXML/loadTextBoxElement.ts");
/* harmony import */ var _loadImageElement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./loadImageElement */ "../../packages/presentation2/src/components/loadFromXML/loadImageElement.ts");


function loadElement(options) {
    const { element, sectionBuilder } = options;
    const tagName = element.tagName.toLowerCase();
    switch (tagName) {
        case "textbox":
            (0,_loadTextBoxElement__WEBPACK_IMPORTED_MODULE_0__.loadTextBoxElement)({ element, sectionBuilder });
            break;
        case "image":
            (0,_loadImageElement__WEBPACK_IMPORTED_MODULE_1__.loadImageElement)({ element, sectionBuilder });
            break;
        default:
            // Unknown child elements are ignored for now. Consider tightening this
            // behaviour once the XML schema is stable.
            break;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/loadFromXML/loadFromXML.ts"
/*!******************************************************************************!*\
  !*** ../../packages/presentation2/src/components/loadFromXML/loadFromXML.ts ***!
  \******************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadFromXML: () => (/* binding */ loadFromXML)
/* harmony export */ });
/* harmony import */ var _io_loadXMLSource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./io/loadXMLSource */ "../../packages/presentation2/src/components/loadFromXML/io/loadXMLSource.ts");
/* harmony import */ var _io_parseXMLDocument__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./io/parseXMLDocument */ "../../packages/presentation2/src/components/loadFromXML/io/parseXMLDocument.ts");
/* harmony import */ var _loadPresentation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./loadPresentation */ "../../packages/presentation2/src/components/loadFromXML/loadPresentation.ts");



async function loadFromXML(options) {
    const xmlText = await (0,_io_loadXMLSource__WEBPACK_IMPORTED_MODULE_0__.loadXMLSource)(options);
    const dom = (0,_io_parseXMLDocument__WEBPACK_IMPORTED_MODULE_1__.parseXMLDocument)(xmlText);
    return (0,_loadPresentation__WEBPACK_IMPORTED_MODULE_2__.loadPresentation)({ dom });
}


/***/ },

/***/ "../../packages/presentation2/src/components/loadFromXML/loadImageElement.ts"
/*!***********************************************************************************!*\
  !*** ../../packages/presentation2/src/components/loadFromXML/loadImageElement.ts ***!
  \***********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyCommonElementAttributes: () => (/* binding */ applyCommonElementAttributes),
/* harmony export */   loadImageElement: () => (/* binding */ loadImageElement)
/* harmony export */ });
/* harmony import */ var _element_imageElement_ImageElement__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../element/imageElement/ImageElement */ "../../packages/presentation2/src/components/element/imageElement/ImageElement.ts");
/* harmony import */ var _loadScrollTrigger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./loadScrollTrigger */ "../../packages/presentation2/src/components/loadFromXML/loadScrollTrigger.ts");
/* harmony import */ var _loadPin__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./loadPin */ "../../packages/presentation2/src/components/loadFromXML/loadPin.ts");



function loadImageElement(options) {
    const { element, sectionBuilder } = options;
    const builder = sectionBuilder.addImageElement();
    applyCommonElementAttributes({ element, builder });
    const src = element.getAttribute("src");
    if (!src || src.trim() === "") {
        throw new Error("<image> must have a src attribute");
    }
    builder.source = src;
    const fitAttr = element.getAttribute("fit");
    if (fitAttr && fitAttr.trim() !== "") {
        const fit = fitAttr.trim().toLowerCase();
        switch (fit) {
            case "fill":
                builder.fit = _element_imageElement_ImageElement__WEBPACK_IMPORTED_MODULE_0__.ImageFit.Fill;
                break;
            case "contain":
                builder.fit = _element_imageElement_ImageElement__WEBPACK_IMPORTED_MODULE_0__.ImageFit.Contain;
                break;
            case "cover":
                builder.fit = _element_imageElement_ImageElement__WEBPACK_IMPORTED_MODULE_0__.ImageFit.Cover;
                break;
            default:
                throw new Error(`Invalid fit value '${fitAttr}' for <image>; expected 'fill', 'contain' or 'cover'`);
        }
    }
    Array.prototype.forEach.call(element.children, (child) => {
        const tag = child.tagName.toLowerCase();
        if (tag === "scroll-trigger") {
            const triggerBuilder = builder.addScrollTrigger();
            (0,_loadScrollTrigger__WEBPACK_IMPORTED_MODULE_1__.loadScrollTrigger)({ element: child, builder: triggerBuilder });
            return;
        }
        if (tag === "pin") {
            const pinBuilder = builder.addPin();
            (0,_loadPin__WEBPACK_IMPORTED_MODULE_2__.loadPin)({ element: child, builder: pinBuilder });
            return;
        }
    });
}
function applyCommonElementAttributes(options) {
    const { element, builder } = options;
    const nameAttr = element.getAttribute("name");
    if (nameAttr && nameAttr.trim() !== "") {
        builder.name = nameAttr;
    }
    const l = element.getAttribute("l");
    const w = element.getAttribute("w");
    const r = element.getAttribute("r");
    if (l && l.trim() !== "") {
        builder.xAxis.set("left", l);
    }
    if (w && w.trim() !== "") {
        builder.xAxis.set("width", w);
    }
    if (r && r.trim() !== "") {
        builder.xAxis.set("right", r);
    }
    const t = element.getAttribute("t");
    const h = element.getAttribute("h");
    const b = element.getAttribute("b");
    if (t && t.trim() !== "") {
        builder.yAxis.set("top", t);
    }
    if (h && h.trim() !== "") {
        builder.yAxis.set("height", h);
    }
    if (b && b.trim() !== "") {
        builder.yAxis.set("bottom", b);
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/loadFromXML/loadPin.ts"
/*!**************************************************************************!*\
  !*** ../../packages/presentation2/src/components/loadFromXML/loadPin.ts ***!
  \**************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadPin: () => (/* binding */ loadPin)
/* harmony export */ });
function loadPin(options) {
    const { element, builder } = options;
    const triggerAttr = element.getAttribute("trigger");
    if (!triggerAttr || triggerAttr.trim() === "") {
        throw new Error("<pin> must have a non-empty 'trigger' attribute");
    }
    builder.scrollTrigger = triggerAttr.trim();
}


/***/ },

/***/ "../../packages/presentation2/src/components/loadFromXML/loadPresentation.ts"
/*!***********************************************************************************!*\
  !*** ../../packages/presentation2/src/components/loadFromXML/loadPresentation.ts ***!
  \***********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadPresentation: () => (/* binding */ loadPresentation)
/* harmony export */ });
/* harmony import */ var _presentation_PresentationBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../presentation/PresentationBuilder */ "../../packages/presentation2/src/components/presentation/PresentationBuilder.ts");
/* harmony import */ var _compilePresentation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../compilePresentation */ "../../packages/presentation2/src/components/compilePresentation.ts");
/* harmony import */ var _loadSection__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./loadSection */ "../../packages/presentation2/src/components/loadFromXML/loadSection.ts");



async function loadPresentation(options) {
    const presentationBuilder = new _presentation_PresentationBuilder__WEBPACK_IMPORTED_MODULE_0__.PresentationBuilder();
    if (!options.dom.firstChild ||
        options.dom.firstChild.nodeName !== "presentation") {
        throw new Error("Presentation XML must have a root <presentation> element");
    }
    Array.prototype.forEach.call(options.dom.children[0].children, (child) => {
        switch (child.tagName) {
            case "size":
                loadSize({ element: child, presentationBuilder });
                return;
            case "section":
                (0,_loadSection__WEBPACK_IMPORTED_MODULE_2__.loadSection)({ element: child, presentationBuilder });
                return;
            default: // Ignore unknown tags for now
        }
    });
    return (0,_compilePresentation__WEBPACK_IMPORTED_MODULE_1__.compilePresentation)(presentationBuilder);
}
function loadSize(options) {
    const { element, presentationBuilder } = options;
    const width = element.getAttribute("w");
    const height = element.getAttribute("h");
    if (!width || !height) {
        throw new Error("<size> must have both w and h attributes");
    }
    presentationBuilder.basisDimensions.width = Number(width);
    presentationBuilder.basisDimensions.height = Number(height);
}


/***/ },

/***/ "../../packages/presentation2/src/components/loadFromXML/loadScrollTrigger.ts"
/*!************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/loadFromXML/loadScrollTrigger.ts ***!
  \************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadScrollTrigger: () => (/* binding */ loadScrollTrigger)
/* harmony export */ });
function loadScrollTrigger(options) {
    const { element, builder } = options;
    const nameAttr = element.getAttribute("name");
    const startAttr = element.getAttribute("start");
    const endAttr = element.getAttribute("end");
    if (!nameAttr || nameAttr.trim() === "") {
        throw new Error("<scroll-trigger> must have a non-empty 'name' attribute");
    }
    if (!startAttr || startAttr.trim() === "") {
        throw new Error("<scroll-trigger> must have a non-empty 'start' attribute");
    }
    if (!endAttr || endAttr.trim() === "") {
        throw new Error("<scroll-trigger> must have a non-empty 'end' attribute");
    }
    builder.name = nameAttr.trim();
    builder.start = startAttr;
    builder.end = endAttr;
}


/***/ },

/***/ "../../packages/presentation2/src/components/loadFromXML/loadSection.ts"
/*!******************************************************************************!*\
  !*** ../../packages/presentation2/src/components/loadFromXML/loadSection.ts ***!
  \******************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadSection: () => (/* binding */ loadSection)
/* harmony export */ });
/* harmony import */ var _loadElement__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./loadElement */ "../../packages/presentation2/src/components/loadFromXML/loadElement.ts");
/* harmony import */ var _loadScrollTrigger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./loadScrollTrigger */ "../../packages/presentation2/src/components/loadFromXML/loadScrollTrigger.ts");


function loadSection(options) {
    const sectionBuilder = options.presentationBuilder.addSection();
    loadSectionProperties({ ...options, sectionBuilder });
    loadSectionChildren({ ...options, sectionBuilder });
}
function loadSectionProperties(options) {
    const { element, sectionBuilder } = options;
    const nameAttr = element.getAttribute("name");
    if (nameAttr && nameAttr.trim() !== "") {
        sectionBuilder.name = nameAttr;
    }
    const h = element.getAttribute("h");
    const b = element.getAttribute("b");
    // Set whichever is non-empty
    if (h && h.trim() !== "") {
        sectionBuilder.sectionHeight = h;
    }
    if (b && b.trim() !== "") {
        sectionBuilder.sectionBottom = b;
    }
}
function loadSectionChildren(options) {
    const { element, sectionBuilder } = options;
    Array.prototype.forEach.call(element.children, (child) => {
        switch (child.tagName) {
            case "image":
            case "textbox":
                (0,_loadElement__WEBPACK_IMPORTED_MODULE_0__.loadElement)({ element: child, sectionBuilder });
                break;
            case "scroll-trigger": {
                const triggerBuilder = sectionBuilder.addScrollTrigger();
                (0,_loadScrollTrigger__WEBPACK_IMPORTED_MODULE_1__.loadScrollTrigger)({ element: child, builder: triggerBuilder });
                break;
            }
            default:
                // Unknown child elements are ignored for now. Consider tightening this
                break;
        }
    });
}


/***/ },

/***/ "../../packages/presentation2/src/components/loadFromXML/loadTextBoxElement.ts"
/*!*************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/loadFromXML/loadTextBoxElement.ts ***!
  \*************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadTextBoxElement: () => (/* binding */ loadTextBoxElement)
/* harmony export */ });
/* harmony import */ var _rippledoc_markdown__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @rippledoc/markdown */ "../../packages/markdown/src/index.ts");
/* harmony import */ var _loadImageElement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./loadImageElement */ "../../packages/presentation2/src/components/loadFromXML/loadImageElement.ts");
/* harmony import */ var _loadScrollTrigger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./loadScrollTrigger */ "../../packages/presentation2/src/components/loadFromXML/loadScrollTrigger.ts");
/* harmony import */ var _loadPin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./loadPin */ "../../packages/presentation2/src/components/loadFromXML/loadPin.ts");




function loadTextBoxElement(options) {
    const { element, sectionBuilder } = options;
    const builder = sectionBuilder.addTextBox();
    (0,_loadImageElement__WEBPACK_IMPORTED_MODULE_1__.applyCommonElementAttributes)({ element, builder });
    const markdown = (element.textContent ?? "").trim();
    const contentNode = (0,_rippledoc_markdown__WEBPACK_IMPORTED_MODULE_0__.parseMarkdown)(markdown);
    builder.htmlContent = contentNode;
    Array.prototype.forEach.call(element.children, (child) => {
        const tag = child.tagName.toLowerCase();
        if (tag === "scroll-trigger") {
            const triggerBuilder = builder.addScrollTrigger();
            (0,_loadScrollTrigger__WEBPACK_IMPORTED_MODULE_2__.loadScrollTrigger)({ element: child, builder: triggerBuilder });
            return;
        }
        if (tag === "pin") {
            const pinBuilder = builder.addPin();
            (0,_loadPin__WEBPACK_IMPORTED_MODULE_3__.loadPin)({ element: child, builder: pinBuilder });
            return;
        }
    });
}


/***/ },

/***/ "../../packages/presentation2/src/components/pin/Pin.ts"
/*!**************************************************************!*\
  !*** ../../packages/presentation2/src/components/pin/Pin.ts ***!
  \**************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pin: () => (/* binding */ Pin)
/* harmony export */ });
class Pin {
    element_;
    scrollTrigger_;
    constructor(options) {
        this.element_ = options.element;
        this.scrollTrigger_ = options.scrollTrigger;
    }
    get element() {
        return this.element_;
    }
    get scrollTrigger() {
        return this.scrollTrigger_;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/pin/PinBuilder.ts"
/*!*********************************************************************!*\
  !*** ../../packages/presentation2/src/components/pin/PinBuilder.ts ***!
  \*********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PinBuilder: () => (/* binding */ PinBuilder)
/* harmony export */ });
/**
 *
 */
class PinBuilder {
    element_;
    scrollTrigger_ = null;
    constructor(options) {
        this.element_ = options.element;
    }
    get element() {
        return this.element_;
    }
    get scrollTrigger() {
        if (!this.scrollTrigger_) {
            throw new Error("Pin must have a scroll trigger to get it.");
        }
        return this.scrollTrigger_;
    }
    set scrollTrigger(value) {
        this.scrollTrigger_ = value;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/pin/PinCompiler.ts"
/*!**********************************************************************!*\
  !*** ../../packages/presentation2/src/components/pin/PinCompiler.ts ***!
  \**********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PinCompiler: () => (/* binding */ PinCompiler)
/* harmony export */ });
/* harmony import */ var _Pin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Pin */ "../../packages/presentation2/src/components/pin/Pin.ts");

class PinCompiler {
    // Structural relationships
    //
    builder_;
    elementCompiler_;
    // Owned properties
    //
    constructor(options) {
        this.builder_ = options.pinBuilder;
        this.elementCompiler_ = options.elementCompiler;
    }
    // ----------------------------------------------------------------------------------------------
    // Pre-compilation steps
    // ----------------------------------------------------------------------------------------------
    /**
     * See Presentation.beforeCompile() for symantics of this method & pattern of implementation
     * Do not duplicate that comment here - single point of truth.
     */
    beforeCompile() {
        this.validateAndDerive();
    }
    validateAndDerive() {
        // Nothing yet
    }
    // ----------------------------------------------------------------------------------------------
    // Compilation steps
    // ----------------------------------------------------------------------------------------------
    /**
     * See Presentation.compile() for symantics of this method & pattern of implementation
     * Do not duplicate that comment here - single point of truth.
     */
    compile(element) {
        return new _Pin__WEBPACK_IMPORTED_MODULE_0__.Pin({
            element,
            scrollTrigger: element.scrollTriggerByName(this.builder_.scrollTrigger),
        });
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/pin/htmlView/HTMLPinManager.ts"
/*!**********************************************************************************!*\
  !*** ../../packages/presentation2/src/components/pin/htmlView/HTMLPinManager.ts ***!
  \**********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLPinManager: () => (/* binding */ HTMLPinManager)
/* harmony export */ });
/* harmony import */ var _HTMLPinView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./HTMLPinView */ "../../packages/presentation2/src/components/pin/htmlView/HTMLPinView.ts");

class HTMLPinManager {
    htmlPresentationRoot_;
    cachedPins_ = [];
    pinViews_ = [];
    constructor(options) {
        this.htmlPresentationRoot_ = options.htmlPresentationRoot;
        this.buildPinCache();
        this.attachPinViews();
    }
    buildPinCache() {
        this.cachedPins_.length = 0;
        // FIXME: We need a better way to collate pins from the presentation.
        this.htmlPresentationRoot_.sections.forEach((section) => {
            section.elementViews.forEach((elementView) => {
                elementView.element.pins.forEach((pin) => {
                    this.cachedPins_.push({ pin, elementView });
                });
            });
        });
    }
    attachPinViews() {
        this.cachedPins_.forEach(({ pin, elementView }) => {
            this.pinViews_.push(new _HTMLPinView__WEBPACK_IMPORTED_MODULE_0__.HTMLPinView({ pin, elementView }));
        });
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/pin/htmlView/HTMLPinView.ts"
/*!*******************************************************************************!*\
  !*** ../../packages/presentation2/src/components/pin/htmlView/HTMLPinView.ts ***!
  \*******************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLPinView: () => (/* binding */ HTMLPinView)
/* harmony export */ });
const STYLE_PRECISION = 2;
/**
 *
 */
class HTMLPinView {
    pin_;
    elementView_;
    unsubscribe_ = [];
    clone_;
    target_;
    constructor(options) {
        this.pin_ = options.pin;
        this.elementView_ = options.elementView;
        this.buildDOM();
        this.attachEventListeners();
    }
    disconnect() {
        this.unsubscribe_.forEach((unsubscribe) => unsubscribe());
        this.unsubscribe_.length = 0;
        this.clone_.remove();
    }
    buildDOM() {
        // Placeholder
        //
        this.target_ = this.elementView_.htmlElement;
        // Clone
        //
        this.clone_ = this.elementView_.htmlElement.cloneNode(true);
        this.clone_.style.position = "absolute";
        this.clone_.style.visibility = "hidden";
        this.clone_.classList.add("rdoc-pin-clone");
        this.elementView_.presentationView.htmlPins.appendChild(this.clone_);
    }
    attachEventListeners() {
        const scrollTrigger = this.pin_.scrollTrigger;
        this.unsubscribe_.push(scrollTrigger.on("start", () => {
            this.pinForward();
        }), scrollTrigger.on("reverseStart", () => {
            this.pinReverse();
        }), scrollTrigger.on("end", () => {
            this.unpinForward();
        }), scrollTrigger.on("reverseEnd", () => {
            this.unpinReverse();
        }));
    }
    pinForward() {
        this.positionClone();
        this.clone_.style.visibility = "visible";
        this.target_.style.visibility = "hidden";
    }
    pinReverse() {
        this.positionClone();
        this.clone_.style.visibility = "visible";
        this.target_.style.visibility = "hidden";
    }
    unpinForward() {
        // We're carefull to position the target element based on the perfect position as per the scroll
        // trigger, rather than the current scroll position. Scrolling at speed might have caused the
        // end trigger to have been missed.
        //
        const scale = this.elementView_.presentationView.physicalDimensions.scale;
        const dy = scale * (this.pin_.scrollTrigger.end - this.pin_.scrollTrigger.start);
        this.target_.style.transform = `translateY(${dy.toFixed(STYLE_PRECISION)}px)`;
        this.target_.style.zIndex = "1000";
        this.target_.style.visibility = "visible";
        this.clone_.style.visibility = "hidden";
    }
    unpinReverse() {
        this.target_.style.transform = `translateY(0px)`;
        this.target_.style.visibility = "visible";
        this.clone_.style.visibility = "hidden";
    }
    positionClone() {
        const targetRect = this.target_.getBoundingClientRect();
        //const top = targetRect.top - presentationRect.top;
        const scale = this.elementView_.presentationView.physicalDimensions.scale;
        const top = scale * (this.elementView_.element.top - this.pin_.scrollTrigger.start);
        const left = targetRect.left;
        this.clone_.style.top = `${top.toFixed(STYLE_PRECISION)}px`;
        this.clone_.style.left = `${left.toFixed(STYLE_PRECISION)}px`;
        this.clone_.style.width = `${targetRect.width.toFixed(STYLE_PRECISION)}px`;
        this.clone_.style.height = `${targetRect.height.toFixed(STYLE_PRECISION)}px`;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/presentation/Presentation.ts"
/*!********************************************************************************!*\
  !*** ../../packages/presentation2/src/components/presentation/Presentation.ts ***!
  \********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Presentation: () => (/* binding */ Presentation)
/* harmony export */ });
/**
 *
 * # Implementation notes
 * These are notes on the implementation of the presentation. They are not part of the public API,
 * and clients must not rely on them. They are subject to change without warning.
 *
 * ## (1) Two-phase construction
 * These is a chicken and egg problem in constructing the presentation. The sections of the
 * presentation need to reference the presentation itself, but the presentation needs to know its
 * sections. But the whole tree is immutable after construction. So what to do?
 *
 * I adopted a two-phase construction approach. The presentation is constructed in two phases:
 * - Phase 1: details of the presentation that don't depend on the rest of the tree are passed
 *   to the constructor via the create() method.
 * - Phase 2: details of the presentation that do depend on the rest of the tree are set via the
 *   Phase2Constructor interface, which is returned by the create() method.
 * - Once phase 2 is complete, the presentation is fully constructed and immutable.
 *
 * ## (2) Content-dependent elements
 *
 * Content-dependent elements are unusual. In normal layout, data flows only in one direction -
 * elements know their own geometry, and this is used by the rendering systems.
 *
 * Content-dependent elements depend on the rendering system to know their size however. In our
 * model one dimension is fixed and the rendering system determines the other dimension based on
 * that and the content.
 *
 * To faciliate this we keep a list of content-dependent elements in the presentation:
 * - The list is sort in dependency order, so that if element A's size depends on element B, then A
 *   comes after B in the list.
 * - The list also contains value holders for the content-dependent dimension of each element (in
 *   basis coorinates, not physical ones).
 *
 * The rendering system is expected to determine the content-dependent dimensions of the elements in
 * order, updating the value holders as it goes.
 *
 * See PresentationCompiler for the details of how the sorted list of content-dependent elements is
 * constructed.
 */
class Presentation {
    // Construction-related data ---------------------------------------------------------------------
    //
    static constructionToken_ = Symbol("Presentation.ConstructorProtector");
    phase2Constructor_ = {
        setSections: (sections) => {
            this.sections_.push(...sections);
            return this.phase2Constructor;
        },
        setSortedContentDependentElements: (elements) => {
            this.sortedContentDependentElements_.push(...elements);
            return this.phase2Constructor;
        },
        complete: () => {
            this.phase2Constructor_ = null;
        },
    };
    // View properties -------------------------------------------------------------------------------
    //
    view_ = null;
    // Owned properties ------------------------------------------------------------------------------
    //
    basisDimensions_;
    sections_ = [];
    // View-dependent properties ---------------------------------------------------------------------
    //
    // These properties are oddities in that they all exists to connect the presentation tree to the
    // underlying view. In the future I'd like to have some unified way of doing this, but for now
    // they are just properties on the presentation.
    // The list of content-dependent elements, sorted in dependency order. This is populated during
    // phase 2 of construction, and is used by the view to determine the content-dependent dimensions
    // of elements.
    sortedContentDependentElements_ = [];
    // The 'slideHeight' variable is provided to expressions during compilation. Clearly it varies
    // depending on the view.
    slideHeightNativeExpression_;
    // ----------------------------------------------------------------------------------------------
    // Construction
    // ----------------------------------------------------------------------------------------------
    /**
     * Don't call the constructor directly. Use Presentation.create() instead.
     */
    constructor(token, options) {
        if (token !== Presentation.constructionToken_) {
            throw new Error("Presentation is not constructable. Use Presentation.create() instead.");
        }
        this.basisDimensions_ = { ...options.basisDimensions };
        this.slideHeightNativeExpression_ = options.slideHeightNativeExpression;
        this.installDefaultSlideHeightExpression();
    }
    get phase2Constructor() {
        if (this.phase2Constructor_ === null) {
            throw new Error("Phase 2 construction is already complete.");
        }
        return this.phase2Constructor_;
    }
    static create(options) {
        const presentation = new Presentation(Presentation.constructionToken_, options);
        return { presentation, phase2Constructor: presentation.phase2Constructor };
    }
    /**
     * The 'slideHeight' variable is used by expressions to determine the actual height of a slide
     * in basis coordinates. It enables them to match the actual height of the viewport.
     *
     * It is, inevitably, a view-dependent property. However, we want expressions to be evaluable
     * even when there is no view attached, so we need to have some default expression for it.
     *
     * Two functions exist as a pair:
     * - `installDefaultSlideHeightExpression`
     * - `installProperSlideHeightExpression`
     */
    installDefaultSlideHeightExpression() {
        // Default 'slideHeight' is the basis height. Is this a good default? Maybe not, but until
        // the view is attached, there is no physical dimension to base it on, so this is the best we
        // can do.
        this.slideHeightNativeExpression_(() => this.basisDimensions_.height);
    }
    /**
     * See installDefaultSlideHeightExpression
     */
    installProperSlideHeightExpression() {
        // Once the view is attached, 'slideHeight' should be based on the physical dimensions of the
        // view. This is the expression we install when a view is attached.
        this.slideHeightNativeExpression_(() => {
            if (this.view_ === null) {
                throw new Error("No view is attached to this presentation.");
            }
            return (this.view_.physicalDimensions.height /
                this.view_.physicalDimensions.scale);
        });
    }
    // ----------------------------------------------------------------------------------------------
    // View management
    // ----------------------------------------------------------------------------------------------
    attachView(view) {
        if (this.view_ !== null) {
            throw new Error("A view is already attached to this presentation.");
        }
        this.view_ = view;
        view.connect({
            presentation: this,
            sortedContentDependentElements: this.sortedContentDependentElements_,
        });
        // After .connect is it reasonable to assume that the view sufficiently realised to provide
        // physical dimensions, so we can set the slide height expression now.
        //
        this.installProperSlideHeightExpression();
    }
    detachView() {
        if (this.view_ === null) {
            throw new Error("No view is attached to this presentation.");
        }
        // Clear the slide height expression, since without a view there is no physical dimension to
        // base it on.
        this.installDefaultSlideHeightExpression();
        this.view_.disconnect();
        this.view_ = null;
    }
    get hasView() {
        return this.view_ !== null;
    }
    // ----------------------------------------------------------------------------------------------
    // Owned properties
    // ----------------------------------------------------------------------------------------------
    get sections() {
        return this.sections_;
    }
    get basisDimensions() {
        return { ...this.basisDimensions_ };
    }
    get physicalDimensions() {
        if (this.view_ === null) {
            throw new Error("No view is attached to this presentation.");
        }
        return this.view_.physicalDimensions;
    }
    get height() {
        if (this.sections.length === 0) {
            return 0;
        }
        return this.sections[this.sections.length - 1].sectionBottom;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/presentation/PresentationBuilder.ts"
/*!***************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/presentation/PresentationBuilder.ts ***!
  \***************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PresentationBuilder: () => (/* binding */ PresentationBuilder)
/* harmony export */ });
/* harmony import */ var _section_SectionBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../section/SectionBuilder */ "../../packages/presentation2/src/components/section/SectionBuilder.ts");

/**
 *
 */
class PresentationBuilder {
    sections_ = [];
    basisDimensions_ = {
        width: 800,
        height: 600,
    };
    addSection() {
        const section = new _section_SectionBuilder__WEBPACK_IMPORTED_MODULE_0__.SectionBuilder({ presentation: this });
        this.sections_.push(section);
        return section;
    }
    get sections() {
        return this.sections_;
    }
    setBasisDimensions(width, height) {
        this.basisDimensions_ = { width, height };
    }
    get basisDimensions() {
        return { ...this.basisDimensions_ };
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/presentation/PresentationCompiler.ts"
/*!****************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/presentation/PresentationCompiler.ts ***!
  \****************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PresentationCompiler: () => (/* binding */ PresentationCompiler)
/* harmony export */ });
/* harmony import */ var _Presentation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Presentation */ "../../packages/presentation2/src/components/presentation/Presentation.ts");
/* harmony import */ var _section_SectionCompiler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../section/SectionCompiler */ "../../packages/presentation2/src/components/section/SectionCompiler.ts");
/* harmony import */ var _rippledoc_expressions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @rippledoc/expressions */ "../../packages/expressions/src/index.ts");



/**
 *
 * # Implementation Notes:
 *
 * ## (1) Compilation process
 * The compilation process consists of the following steps:
 * 1. Pre-compilation:
 *    - Validation - especially for properties whose validity depends on the full
 *      Presentation/Section/Element structure. For example, expression name binding.
 *    - Derivation of properties - this is for properties that only exist once the full
 *      Presentation/Section/Element structure is known. For example, previous/next section
 *      relationships.
 *
 *    By the end of pre-compilation, compilation must be able to complete without (runtime) errors.
 *
 * 2. Compilation:
 *    Generation of the Presentation/Section/Element tree.
 *
 * ## (2) Flow of control during the compilation process
 *
 * For both steps, higher levels objects proceed prior to lower level ones:
 *
 * Presentation.beforeCompile():
 *   validateAndDerive()
 *   for each section: section.beforeCompile()
 *
 * This means that, for example, Section.beforeCompile() can rely on the fact that
 * Presentation.validateAndDerive() has already been executed.
 *
 * ## (3) Code pattern for pre-compilation and compilation steps
 *
 * Compilers for Presentation/Section/Element all follow the same code pattern:
 *
 */
class PresentationCompiler {
    // Structural relationships
    //
    builder_;
    sections_;
    // Owned properties
    //
    module_;
    sortedExpressions_ = null;
    expressionToElement_ = new Map();
    slideHeightNativeExpression_ = null;
    constructor(builder) {
        this.builder_ = builder;
        this.module_ = _rippledoc_expressions__WEBPACK_IMPORTED_MODULE_2__.Module.createRootModule();
        this.sections_ = builder.sections.map((sectionBuilder) => new _section_SectionCompiler__WEBPACK_IMPORTED_MODULE_1__.SectionCompiler({
            sectionBuilder,
            presentationCompiler: this,
        }));
    }
    // ----------------------------------------------------------------------------------------------
    // Property accessors
    // ----------------------------------------------------------------------------------------------
    get module() {
        return this.module_;
    }
    /**
     * Called by ElementCompiler.compile to report content-dependent Elements.
     *
     * View code updates valueHolder.value to provide the content-dependent value.
     *
     * @param element The element that is content-dependent.
     * @param expression The expression that is content-dependent
     * @param valueHolder
     */
    declareContentDependentElement(element, expression, valueHolder) {
        this.expressionToElement_.set(expression, { element, valueHolder });
    }
    // ----------------------------------------------------------------------------------------------
    // Pre-compilation steps
    // ----------------------------------------------------------------------------------------------
    /**
     * Perform pre-compilation steps for the presentation.
     */
    beforeCompile() {
        this.validateAndDerive();
        this.sections_.forEach((section) => section.beforeCompile());
        this.finalize();
    }
    validateAndDerive() {
        this.connectAdjacentSections();
        this.mapNamedSections();
        this.mapBasisGeometry();
        const nativeExpression = this.module.addNativeExpression2("slideHeight", () => 1);
        this.slideHeightNativeExpression_ = nativeExpression.replaceNativeFunction;
    }
    connectAdjacentSections() {
        if (this.sections_.length <= 1) {
            return;
        }
        for (let i = 0; i < this.sections_.length - 1; i++) {
            // '!' is safe - array elements are never undefined
            const currentSection = this.sections_[i];
            const nextSection = this.sections_[i + 1];
            currentSection.setNextSection(nextSection);
            nextSection.setPreviousSection(currentSection);
        }
    }
    mapNamedSections() {
        // Create a the 'sections' namespace: this enables expressions on sections and elements (they
        // inherit the parent section's namespace) to refer to sections by name, e.g.
        // "sections.Section1.top"
        //
        // Notes:
        // (1) We only map sections that have names
        //     Possible FIXME: might be nice to support referring to sections by index?
        // (2) We use the rootModule for the namespace - this prevents the new namespace from being
        //     contaminated with other stuff in the section's namespace.
        //
        const sectionNamespace = this.module.rootModule.addSubModule();
        this.module.mapModule("sections", sectionNamespace);
        this.sections_.forEach((s) => {
            if (s.builder.hasName) {
                sectionNamespace.mapModule(s.builder.name, s.module);
            }
        });
    }
    mapBasisGeometry() {
        // Basic dimension stored into temporaries. I'm not sure with closures exactly what is saved:
        // Are we capturing builder_, or basisDimensions?
        //
        // In either case this creates a brittleness and potential memory leak - we want to discard all
        // of the builder data after compilation, and closures mustn't prevent this.
        //
        const basisWidth = this.builder_.basisDimensions.width;
        const basisHeight = this.builder_.basisDimensions.height;
        this.module.addNativeExpression("basisWidth", () => basisWidth);
        this.module.addNativeExpression("basisHeight", () => basisHeight);
    }
    /**
     * PresentationCompiler differs from other Compiler modules in that it has a post-compilation
     * step: this can then perform validation/derivation that depends on a fully validated tree.
     */
    finalize() {
        const sortedExpressions = this.module.compile();
        this.sortedExpressions_ = sortedExpressions;
    }
    // ----------------------------------------------------------------------------------------------
    // Compilation steps
    // ----------------------------------------------------------------------------------------------
    compile() {
        this.beforeCompile();
        const p = _Presentation__WEBPACK_IMPORTED_MODULE_0__.Presentation.create({
            basisDimensions: this.builder_.basisDimensions,
            slideHeightNativeExpression: this.slideHeightNativeExpression_,
        });
        p.phase2Constructor.setSections(this.sections_.map((sectionCompiler) => sectionCompiler.compile(p.presentation)));
        this.buildSortedContentDependentElementList(p.phase2Constructor);
        p.phase2Constructor.complete();
        return p.presentation;
    }
    /**
     * At this point we have:
     * - A list of Expressions sorted by dependency order (i.e. if Expression A depends on Expression
     *   B, then B will appear before A in the list).
     * - A mapping from Expressions to the content-dependent Element that they are associated with.
     *
     * We can use these to build a list of content-dependent Elements sorted by dependency order. This
     * is important because it allows us to update the content-dependent Elements in a single pass
     * (i.e. we can guarantee that when we update an Element, all of the Elements that it depends on
     * have already been updated).
     *
     * We then pass this list to the Presentation via the Phase2Constructor.
     */
    buildSortedContentDependentElementList(phase2Constructor) {
        const list = [];
        // ! ok as never null at this phase in compilation (i.e. post-beforeCompile)
        this.sortedExpressions_.forEach((e) => {
            if (this.expressionToElement_.has(e)) {
                list.push(this.expressionToElement_.get(e));
            }
        });
        phase2Constructor.setSortedContentDependentElements(list);
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/presentation/htmlView/HTMLPresentationDOM.ts"
/*!************************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/presentation/htmlView/HTMLPresentationDOM.ts ***!
  \************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLPresentationDOM: () => (/* binding */ HTMLPresentationDOM)
/* harmony export */ });
class HTMLPresentationDOM {
    htmlPresentationView_;
    // DOM elements - hierarchy:
    //   fragment_ (document fragment)
    //     root_ (div)
    //       viewport_ (div)
    //          backgrounds_ (div)
    //          elements_ (div)
    //       overlay_ (div)
    fragment_ = document.createDocumentFragment();
    root_ = document.createElement("div");
    viewport_ = document.createElement("div");
    backgrounds_ = document.createElement("div");
    elements_ = document.createElement("div");
    overlay_ = document.createElement("div");
    pins_ = document.createElement("div");
    // ----------------------------------------------------------------------------------------------
    // Construction
    // ----------------------------------------------------------------------------------------------
    constructor(htmlPresentationView, presentation, debugMode) {
        this.htmlPresentationView_ = htmlPresentationView;
        // Connect DOM elements:
        //
        this.root_.appendChild(this.viewport_);
        this.viewport_.appendChild(this.backgrounds_);
        this.viewport_.appendChild(this.elements_);
        this.root_.appendChild(this.overlay_);
        this.overlay_.appendChild(this.pins_);
        this.fragment_.appendChild(this.root_);
        // Setup standard class names:
        // FIXME: these should be defined as constants somewhere
        //
        this.root_.classList.add("rdoc-root");
        if (debugMode) {
            this.root_.classList.add("rdoc-debug-mode");
        }
        this.viewport_.classList.add("rdoc-viewport");
        this.overlay_.classList.add("rdoc-overlay");
        this.backgrounds_.classList.add("rdoc-backgrounds");
        this.elements_.classList.add("rdoc-elements");
        this.pins_.classList.add("rdoc-pins", "rdoc-elements");
        // The client will provide a container element and will append the fragment to it.
        // We must fill the container.
        //
        [
            this.root_,
            this.viewport_,
            this.overlay_,
            this.backgrounds_,
            this.elements_,
            this.pins_,
        ].forEach((element) => {
            element.style.position = "absolute";
            element.style.left = "0";
            element.style.top = "0";
            element.style.width = "100%";
            element.style.height = "100%";
            element.style.overflow = "hidden";
        });
        // Apply specific styles to certain elements:
        // - The viewport should scroll if content overflows.
        // - The overlay should not capture pointer events (so that it doesn't interfere with interaction with the content)
        //
        this.backgrounds_.style.height = `${presentation.height}px`;
        this.elements_.style.height = `${presentation.height}px`;
        this.viewport_.style.overflowX = "hidden";
        this.viewport_.style.overflowY = "auto";
        this.overlay_.style.pointerEvents = "none";
    }
    disconnect() {
        this.root_.remove();
    }
    appendToContainer(container) {
        // Append our DOM to the container element.
        //
        const containerElement = (function () {
            if (typeof container === "string") {
                const element = document.querySelector(container);
                if (!element) {
                    throw new Error(`No element found for selector: ${container}`);
                }
                return element;
            }
            else {
                return container;
            }
        })();
        containerElement.appendChild(this.fragment_);
    }
    // ----------------------------------------------------------------------------------------------
    // Layout
    // ----------------------------------------------------------------------------------------------
    layout() {
        const tx = this.htmlPresentationView_.physicalDimensions.tx;
        const scale = this.htmlPresentationView_.physicalDimensions.scale;
        this.backgrounds_.style.left = `${tx}px`;
        this.elements_.style.left = `${tx}px`;
        const height = this.htmlPresentationView_.presentation.height * scale;
        this.backgrounds_.style.height = `${height}px`;
        this.elements_.style.height = `${height}px`;
    }
    // ----------------------------------------------------------------------------------------------
    // Properties
    // ----------------------------------------------------------------------------------------------
    get htmlRoot() {
        return this.root_;
    }
    get htmlViewport() {
        return this.viewport_;
    }
    get htmlOverlay() {
        return this.overlay_;
    }
    get htmlBackgrounds() {
        return this.backgrounds_;
    }
    get htmlElements() {
        return this.elements_;
    }
    get htmlPins() {
        return this.pins_;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/presentation/htmlView/HTMLPresentationView.ts"
/*!*************************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/presentation/htmlView/HTMLPresentationView.ts ***!
  \*************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLPresentationView: () => (/* binding */ HTMLPresentationView)
/* harmony export */ });
/* harmony import */ var _HTMLPresentationViewRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./HTMLPresentationViewRoot */ "../../packages/presentation2/src/components/presentation/htmlView/HTMLPresentationViewRoot.ts");

/**
 * This is the client-facing API for the HTMLPresentationView component.
 *
 * In general, if a method on this exists, you can use it. If it doesn't, you can't. Please don't
 * go furtling around in the htmlView hierarchy. Nothing in there is contractual and you will break
 * things if you mess with it.
 *
 *
 */
class HTMLPresentationView {
    /**
     * We use the 'pImpl' pattern to hide the implementation details of the HTMLPresentationView.
     * This is a common pattern in C++ and other languages, but it's not as common in TypeScript.
     * However, it helps us keep the public API clean and stable while allowing us to change the
     * implementation.
     *
     * Any state or proper functionality should live in the proper view hierarchy, and not here.
     */
    pImpl_ = null;
    constructor(options) {
        // We use the self=this pattern to get around a TypeScript issue with getters created as part
        // of an object literal. See get physicalDimensions below.
        //
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        options.presentation.attachView({
            connect: (connectionData) => {
                if (this.pImpl_) {
                    throw new Error("Already connected");
                }
                this.pImpl_ = new _HTMLPresentationViewRoot__WEBPACK_IMPORTED_MODULE_0__.HTMLPresentationViewRoot({
                    presentation: options.presentation,
                    container: options.container,
                    debugMode: options.debugMode,
                    sortedContentDependentElements: connectionData.sortedContentDependentElements,
                });
                // We can trigger a first layout here because we know that, after HTMLPresentationViewRoot
                // has constructed, the DOM is valid.
                this.pImpl_.layout();
            }, // connect
            disconnect: () => {
                if (!this.pImpl_) {
                    throw new Error("Not connected");
                }
                this.pImpl_.disconnect();
                this.pImpl_ = null;
            }, // disconnect
            get physicalDimensions() {
                if (!self.pImpl_) {
                    throw new Error("Not connected");
                }
                return self.pImpl_.physicalDimensions;
            },
        }); // end attachView
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/presentation/htmlView/HTMLPresentationViewRoot.ts"
/*!*****************************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/presentation/htmlView/HTMLPresentationViewRoot.ts ***!
  \*****************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLPresentationViewRoot: () => (/* binding */ HTMLPresentationViewRoot)
/* harmony export */ });
/* harmony import */ var _HTMLPresentationDOM__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./HTMLPresentationDOM */ "../../packages/presentation2/src/components/presentation/htmlView/HTMLPresentationDOM.ts");
/* harmony import */ var _section_htmlView_HTMLSectionView__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../section/htmlView/HTMLSectionView */ "../../packages/presentation2/src/components/section/htmlView/HTMLSectionView.ts");
/* harmony import */ var _ScaleHelper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ScaleHelper */ "../../packages/presentation2/src/components/presentation/htmlView/ScaleHelper.ts");
/* harmony import */ var _scrollTrigger_htmlView_HTMLScrollTriggerManager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../scrollTrigger/htmlView/HTMLScrollTriggerManager */ "../../packages/presentation2/src/components/scrollTrigger/htmlView/HTMLScrollTriggerManager.ts");
/* harmony import */ var _pin_htmlView_HTMLPinManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../pin/htmlView/HTMLPinManager */ "../../packages/presentation2/src/components/pin/htmlView/HTMLPinManager.ts");





class HTMLPresentationViewRoot {
    // Structural relationships ----------------------------------------------------------------------
    //
    presentation_;
    // Owned properties ------------------------------------------------------------------------------
    //
    dom_;
    scaleHelper_;
    resizeObserver_;
    sections_;
    scrollTriggerManager_;
    pinManager_;
    sortedContentDependentElements_;
    // ----------------------------------------------------------------------------------------------
    // Construction
    // ----------------------------------------------------------------------------------------------
    constructor(options) {
        this.presentation_ = options.presentation;
        this.scaleHelper_ = new _ScaleHelper__WEBPACK_IMPORTED_MODULE_2__.ScaleHelper(options.presentation);
        // Order of DOM construction:
        // 1. Create our DOM elements (done in HTMLPresentationDOM()) so that children can attach to them.
        // 2. Create our section views, which will create their element views, which will create their
        //    DOM elements and attach them to the appropriate parent.
        // 3. Attach our root DOM element to the container provided by the client.
        //    (We wait until the end to attach to the container because we want to avoid unnecessary
        //    reflows as we build our DOM)
        // 4. Observe resize events on our viewport element
        //    Do this last so that resisze events don't trigger before we're fully constructed.
        //
        // (1)
        this.dom_ = new _HTMLPresentationDOM__WEBPACK_IMPORTED_MODULE_0__.HTMLPresentationDOM(this, options.presentation, options.debugMode);
        // (2)
        this.sections_ = this.presentation_.sections.map((section) => {
            return new _section_htmlView_HTMLSectionView__WEBPACK_IMPORTED_MODULE_1__.HTMLSectionView({ presentationView: this, section: section });
        });
        this.sortedContentDependentElements_ =
            this.buildContentDependentElementList(options.sortedContentDependentElements);
        // (3)
        this.dom_.appendToContainer(options.container);
        // (4) *** MUST BE LAST STEP IN CONSTRUCTION ***
        // Our hierarchy + associated DOM is now complete.
        this.scrollTriggerManager_ = new _scrollTrigger_htmlView_HTMLScrollTriggerManager__WEBPACK_IMPORTED_MODULE_3__.HTMLScrollTriggerManager({
            htmlPresentationRoot: this,
        });
        this.pinManager_ = new _pin_htmlView_HTMLPinManager__WEBPACK_IMPORTED_MODULE_4__.HTMLPinManager({ htmlPresentationRoot: this });
        this.resizeObserver_ = new ResizeObserver(() => {
            this.layout();
        });
        this.resizeObserver_.observe(this.dom_.htmlViewport);
    }
    /**
     * We have Element[] and we need HTMLElementView[]. Because Element doesn't have a reference to
     * its view, we need to find the corresponding HTMLElementView for each Element.
     *
     * FIXME: In the future I'd like a way for Element to know about its view without having to do
     * this kind of lookup. *But* I want to be sure that the view isn't mutable by clients so it
     * needs a bit of thought - hence this funky lookup method for now.
     */
    buildContentDependentElementList(sortedContentDependentElements) {
        const elementToValueHolder = new Map();
        sortedContentDependentElements.forEach((cde) => {
            elementToValueHolder.set(cde.element, cde.valueHolder);
        });
        const result = [];
        this.sections.forEach((section) => {
            section.elementViews.forEach((e) => {
                const valueHolder = elementToValueHolder.get(e.element);
                if (valueHolder) {
                    result.push({
                        elementView: e,
                        valueHolder: valueHolder,
                    });
                }
            });
        });
        return result;
    }
    /**
     * Disconnects the view from the presentation.
     *
     * In general we disconnect in the reverse order of construction:
     * - Bubble disconnect to sections
     * - Then do our own cleanup (disconnect DOM, disconnect resize observer)
     *
     * Exception to this is that we disconnect the resize observer first, because we don't want to
     * trigger any layout calls after we've started disconnecting our sections and DOM.
     */
    disconnect() {
        this.resizeObserver_.disconnect();
        this.sections_.forEach((s) => s.disconnect());
        this.sections_.length = 0;
        this.dom_.disconnect();
    }
    // ----------------------------------------------------------------------------------------------
    // Structural relationships
    // ----------------------------------------------------------------------------------------------
    get presentation() {
        return this.presentation_;
    }
    get sections() {
        return this.sections_;
    }
    // ----------------------------------------------------------------------------------------------
    // Properties
    // ----------------------------------------------------------------------------------------------
    get physicalDimensions() {
        return {
            width: this.scaleHelper_.width,
            height: this.scaleHelper_.height,
            scale: this.scaleHelper_.scale,
            tx: this.scaleHelper_.tx,
        };
    }
    get htmlRoot() {
        return this.dom_.htmlRoot;
    }
    get htmlViewport() {
        return this.dom_.htmlViewport;
    }
    get htmlOverlay() {
        return this.dom_.htmlOverlay;
    }
    get htmlBackgrounds() {
        return this.dom_.htmlBackgrounds;
    }
    get htmlElements() {
        return this.dom_.htmlElements;
    }
    get htmlPins() {
        return this.dom_.htmlPins;
    }
    // ----------------------------------------------------------------------------------------------
    // ...
    // ----------------------------------------------------------------------------------------------
    layout() {
        this.htmlRoot.style.setProperty("--presentation-scale", this.presentation.physicalDimensions.scale.toPrecision(4));
        this.scaleHelper_.setPhysicalDimensions({
            width: this.dom_.htmlViewport.clientWidth,
            height: this.dom_.htmlViewport.clientHeight,
        });
        this.dom_.layout();
        this.sortedContentDependentElements_.forEach((cde) => {
            cde.elementView.applyContentDependentSize();
        });
        this.sortedContentDependentElements_.forEach((cde) => {
            cde.valueHolder.value = cde.elementView.measureContentDependentSize();
        });
        this.sections_.forEach((section) => {
            section.layout();
        });
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/presentation/htmlView/ScaleHelper.ts"
/*!****************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/presentation/htmlView/ScaleHelper.ts ***!
  \****************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ScaleHelper: () => (/* binding */ ScaleHelper)
/* harmony export */ });
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
class ScaleHelper {
    presentation_;
    width_ = DEFAULT_WIDTH;
    height_ = DEFAULT_HEIGHT;
    scale_ = 1;
    tx_ = 0;
    constructor(presentation) {
        this.presentation_ = presentation;
    }
    get width() {
        return this.width_;
    }
    get height() {
        return this.height_;
    }
    get scale() {
        return this.scale_;
    }
    get tx() {
        return this.tx_;
    }
    setPhysicalDimensions(dimensions) {
        const width = (this.width_ = dimensions.width);
        const height = (this.height_ = dimensions.height);
        // Recalculate scale and translation to maintain aspect ratio and center the presentation
        const scaleX = width / this.presentation_.basisDimensions.width;
        const scaleY = height / this.presentation_.basisDimensions.height;
        this.scale_ = Math.min(scaleX, scaleY);
        const scaledWidth = this.presentation_.basisDimensions.width * this.scale_;
        this.tx_ = (width - scaledWidth) / 2; // Center horizontally
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/scrollTrigger/ScrollTrigger.ts"
/*!**********************************************************************************!*\
  !*** ../../packages/presentation2/src/components/scrollTrigger/ScrollTrigger.ts ***!
  \**********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DefaultScrollTrigger: () => (/* binding */ DefaultScrollTrigger)
/* harmony export */ });
/* harmony import */ var _common_TypedEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/TypedEmitter */ "../../packages/presentation2/src/components/common/TypedEmitter.ts");
/* harmony import */ var _section_Section__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../section/Section */ "../../packages/presentation2/src/components/section/Section.ts");
/* harmony import */ var _element_Element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../element/Element */ "../../packages/presentation2/src/components/element/Element.ts");



var TriggerState;
(function (TriggerState) {
    TriggerState["Before"] = "before";
    TriggerState["Active"] = "active";
    TriggerState["After"] = "after";
})(TriggerState || (TriggerState = {}));
/**
 *
 *
 * Do not construct directly – use ScrollTriggerBuilder instead.
 */
class DefaultScrollTrigger {
    parent_;
    name_;
    start_;
    end_;
    listeners_ = new _common_TypedEmitter__WEBPACK_IMPORTED_MODULE_0__.TypedEmitter();
    lastState_ = TriggerState.Before;
    constructor(options) {
        const { parent, start, end, name } = options;
        this.parent_ = parent;
        this.name_ = name ?? "";
        this.start_ = start;
        this.end_ = end;
    }
    /**
     * Subscribe to scroll trigger events. Returns an unsubscribe function.
     */
    on = this.listeners_.on.bind(this.listeners_);
    /**
     * Emit a scroll trigger event. Not intended for external use.
     */
    emit = this.listeners_.emit.bind(this.listeners_);
    get name() {
        return this.name_;
    }
    get start() {
        return this.start_.evaluate();
    }
    get end() {
        return this.end_.evaluate();
    }
    get section() {
        if (this.parent_ instanceof _section_Section__WEBPACK_IMPORTED_MODULE_1__.Section) {
            return this.parent_;
        }
        return this.parent_.section;
    }
    get element() {
        if (!(this.parent_ instanceof _element_Element__WEBPACK_IMPORTED_MODULE_2__.Element)) {
            throw new Error("ScrollTrigger parent is not an Element");
        }
        return this.parent_;
    }
    onScroll(scrollY) {
        /**
         * Algorithm:
         * 1. Determine current state based on scroll position relative to start/end triggers
         * 2. Calculate progress (0-1) if between triggers
         * 3. Dispatch start events if entering active range
         * 4. Dispatch scroll event if in active range
         * 5. Dispatch end events if exiting active range
         *
         * Order is key to ensure correct event sequencing:
         * - Listeners must recieve start events before *any* scroll events
         * - Listeners must recieve end events after *all* scroll events
         */
        const startY = this.start;
        const endY = this.end;
        let state;
        let progress;
        if (scrollY < startY) {
            // Before the trigger range
            state = TriggerState.Before;
            progress = 0;
        }
        else if (scrollY >= endY) {
            // After the trigger range
            state = TriggerState.After;
            progress = 1;
        }
        else {
            // Within the trigger range
            state = TriggerState.Active;
            progress = (scrollY - startY) / (endY - startY);
        }
        // 1. Dispatch start events when entering active range
        if (state === TriggerState.Active &&
            this.lastState_ !== TriggerState.Active) {
            // Entering from top (scrolling down)
            if (this.lastState_ === TriggerState.Before) {
                //this.callbacks_.onStart(eventData);
                this.emit("start", { progress });
            }
            // Entering from bottom (scrolling up)
            else if (this.lastState_ === TriggerState.After) {
                this.emit("reverseStart", { progress });
            }
        }
        // 2. Dispatch scroll event while in active range
        if (state === TriggerState.Active) {
            this.emit("scroll", { progress });
        }
        // 3. Dispatch end events when exiting active range
        if (state !== TriggerState.Active &&
            this.lastState_ === TriggerState.Active) {
            // Exiting at bottom (scrolling down)
            if (state === TriggerState.After) {
                this.emit("end", { progress });
            }
            // Exiting at top (scrolling up)
            else if (state === TriggerState.Before) {
                this.emit("reverseEnd", { progress });
            }
        }
        // 4. Update last state
        this.lastState_ = state;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/scrollTrigger/ScrollTriggerBuilder.ts"
/*!*****************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/scrollTrigger/ScrollTriggerBuilder.ts ***!
  \*****************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ScrollTriggerBuilder: () => (/* binding */ ScrollTriggerBuilder)
/* harmony export */ });
/* harmony import */ var _element_ElementBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../element/ElementBuilder */ "../../packages/presentation2/src/components/element/ElementBuilder.ts");
/* harmony import */ var _section_SectionBuilder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../section/SectionBuilder */ "../../packages/presentation2/src/components/section/SectionBuilder.ts");


/**
 * Bag-of-properties builder for ScrollTrigger.
 *
 * Implements the "Builder" role. See PresentationBuilder for more details on the Builder pattern in
 * this presentation2.
 */
class ScrollTriggerBuilder {
    start_ = "";
    end_ = "";
    name_ = "";
    parent_;
    constructor(options) {
        if (options.element && options.section === undefined) {
            this.parent_ = options.element;
        }
        else if (options.section && options.element === undefined) {
            this.parent_ = options.section;
        }
        else {
            throw new Error("ScrollTriggerBuilder must have either an element or a section as parent, but not both");
        }
    }
    // ----------------------------------------------------------------------------------------------
    // Structural relationships
    // ----------------------------------------------------------------------------------------------
    get parent() {
        return this.parent_;
    }
    get element() {
        if (this.parent_ instanceof _element_ElementBuilder__WEBPACK_IMPORTED_MODULE_0__.ElementBuilder) {
            return this.parent_;
        }
        else {
            throw new Error("ScrollTriggerBuilder parent must be an ElementBuilder to access element property");
        }
    }
    get section() {
        if (this.parent_ instanceof _section_SectionBuilder__WEBPACK_IMPORTED_MODULE_1__.SectionBuilder) {
            return this.parent_;
        }
        else {
            return this.parent_.section;
        }
    }
    get presentation() {
        return this.section.presentation;
    }
    // ----------------------------------------------------------------------------------------------
    // Owned properties
    // ----------------------------------------------------------------------------------------------
    get name() {
        return this.name_;
    }
    set name(value) {
        this.name_ = value;
    }
    get start() {
        return this.start_;
    }
    set start(value) {
        this.start_ = value;
    }
    get end() {
        return this.end_;
    }
    set end(value) {
        this.end_ = value;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/scrollTrigger/ScrollTriggerCompiler.ts"
/*!******************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/scrollTrigger/ScrollTriggerCompiler.ts ***!
  \******************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ScrollTriggerCompiler: () => (/* binding */ ScrollTriggerCompiler)
/* harmony export */ });
/* harmony import */ var _ScrollTrigger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ScrollTrigger */ "../../packages/presentation2/src/components/scrollTrigger/ScrollTrigger.ts");

/**
 * Produces a concrete ScrollTrigger instance from a ScrollTriggerBuilder.
 *
 * See PresentationCompiler for more details on the compiler pattern in this presentation2.
 */
class ScrollTriggerCompiler {
    builder_;
    parentCompiler_;
    module_;
    start_ = null;
    end_ = null;
    constructor(options) {
        this.builder_ = options.scrollTriggerBuilder;
        if (options.elementCompiler && options.sectionCompiler === undefined) {
            this.parentCompiler_ = options.elementCompiler;
        }
        else if (options.sectionCompiler &&
            options.elementCompiler === undefined) {
            this.parentCompiler_ = options.sectionCompiler;
        }
        else {
            throw new Error("ScrollTriggerCompiler must have either an element compiler or a section compiler as parent, but not both");
        }
        this.module_ = this.parentCompiler_.module.addSubModule();
    }
    // ----------------------------------------------------------------------------------------------
    // Property accessors
    // ----------------------------------------------------------------------------------------------
    get module() {
        return this.module_;
    }
    // ----------------------------------------------------------------------------------------------
    // Pre-compilation steps
    // ----------------------------------------------------------------------------------------------
    /**
     * See Presentation.beforeCompile() for symantics of this method & pattern of implementation
     * Do not duplicate that comment here - single point of truth.
     */
    beforeCompile() {
        this.validateAndDerive();
    }
    validateAndDerive() {
        this.start_ = this.module.addExpression("start", this.builder_.start);
        this.end_ = this.module.addExpression("end", this.builder_.end);
    }
    // ----------------------------------------------------------------------------------------------
    // Compilation steps
    // ----------------------------------------------------------------------------------------------
    /**
     * See Presentation.compile() for symantics of this method & pattern of implementation
     * Do not duplicate that comment here - single point of truth.
     */
    compile(parent) {
        return new _ScrollTrigger__WEBPACK_IMPORTED_MODULE_0__.DefaultScrollTrigger({
            parent,
            name: this.builder_.name,
            start: this.start_(),
            end: this.end_(),
        });
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/scrollTrigger/htmlView/HTMLScrollTriggerManager.ts"
/*!******************************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/scrollTrigger/htmlView/HTMLScrollTriggerManager.ts ***!
  \******************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLScrollTriggerManager: () => (/* binding */ HTMLScrollTriggerManager)
/* harmony export */ });
/* harmony import */ var _RAFThrottledScrollListener__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RAFThrottledScrollListener */ "../../packages/presentation2/src/components/scrollTrigger/htmlView/RAFThrottledScrollListener.ts");
/* harmony import */ var _SafariScrollFix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SafariScrollFix */ "../../packages/presentation2/src/components/scrollTrigger/htmlView/SafariScrollFix.ts");


/**
 * Central registry for scroll triggers within an HTMLPresentationView.
 *
 * Section and element views forward their trigger registrations here so that
 * scroll-related behaviour can be coordinated from a single place.
 */
class HTMLScrollTriggerManager {
    htmlPresentationRoot_;
    cachedTriggers_ = [];
    constructor(options) {
        this.htmlPresentationRoot_ = options.htmlPresentationRoot;
        this.buildScrollTriggerCache();
        this.attachScrollListener(this.htmlPresentationRoot_.htmlViewport);
    }
    attachScrollListener(target) {
        (0,_SafariScrollFix__WEBPACK_IMPORTED_MODULE_1__.safariScrollFix)(target);
        (0,_RAFThrottledScrollListener__WEBPACK_IMPORTED_MODULE_0__.addRAFThrottledScrollListener)({
            target,
            callback: (scrollTop) => {
                // Convert DOM scrollTop (in viewport pixels) to presentation
                // coordinates using the current presentation geometry.
                const scale = this.htmlPresentationRoot_.physicalDimensions.scale;
                const scrollPosition = scrollTop / scale;
                // Forward scaled scroll position to any registered internal triggers.
                this.cachedTriggers_.forEach((trigger) => {
                    trigger.onScroll(scrollPosition);
                });
            },
        });
    }
    get triggers() {
        return this.cachedTriggers_;
    }
    buildScrollTriggerCache() {
        this.cachedTriggers_.length = 0;
        // FIXME: We need a better way to collate scroll triggers from the presentation. This is a bit
        // hacky, since it depends on a cast which is brittle in the face of future refactors.
        this.htmlPresentationRoot_.sections.forEach((section) => {
            section.section.scrollTriggers.forEach((trigger) => {
                this.cachedTriggers_.push(trigger);
            });
            section.elementViews.forEach((elementView) => {
                elementView.element.scrollTriggers.forEach((trigger) => {
                    this.cachedTriggers_.push(trigger);
                });
            });
        });
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/scrollTrigger/htmlView/RAFThrottledScrollListener.ts"
/*!********************************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/scrollTrigger/htmlView/RAFThrottledScrollListener.ts ***!
  \********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addRAFThrottledScrollListener: () => (/* binding */ addRAFThrottledScrollListener)
/* harmony export */ });
function addRAFThrottledScrollListener({ target, callback, }) {
    let ticking = false;
    target.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                callback(target.scrollTop);
                ticking = false;
            });
            ticking = true;
        }
    });
}


/***/ },

/***/ "../../packages/presentation2/src/components/scrollTrigger/htmlView/SafariScrollFix.ts"
/*!*********************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/scrollTrigger/htmlView/SafariScrollFix.ts ***!
  \*********************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   safariScrollFix: () => (/* binding */ safariScrollFix)
/* harmony export */ });
/**
 * Applies fixes for Safari/iOS scrolling behavior.
 * Early returns if not running on Safari or iOS.
 *
 * Specific issue address:
 *  - When Safari tab/page loses the focus, elements that are scrolling with momentum can seem
 *    to pause.
 *  - When the tab/page regains focus, the scroll position can jump to the top of the page.
 */
function safariScrollFix(scrollingElement) {
    // Detect Safari (including iOS Safari)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    // Only apply fix on Safari or iOS
    if (!isSafari && !isIOS) {
        return;
    }
    let needsScrollReset = false;
    window.addEventListener("blur", () => {
        needsScrollReset = true;
    });
    window.addEventListener("focus", () => {
        if (!needsScrollReset)
            return;
        console.log("Resetting scroll to prevent jump due to pinning.");
        needsScrollReset = false;
        const y = scrollingElement.scrollTop;
        scrollingElement.style.overflowY = "hidden";
        scrollingElement.scrollTop = y;
        requestAnimationFrame(() => {
            scrollingElement.style.overflowY = "scroll";
        });
    });
}


/***/ },

/***/ "../../packages/presentation2/src/components/section/Section.ts"
/*!**********************************************************************!*\
  !*** ../../packages/presentation2/src/components/section/Section.ts ***!
  \**********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Section: () => (/* binding */ Section)
/* harmony export */ });
class Section {
    // Construction-related data ---------------------------------------------------------------------
    //
    static constructionToken_ = Symbol("Section.ConstructorProtector");
    phase2Constructor_ = {
        setElements: (elements) => {
            this.elements_ = elements;
            return this.phase2Constructor_;
        },
        setScrollTriggers: (scrollTriggers) => {
            this.scrollTriggers_ = scrollTriggers;
            return this.phase2Constructor_;
        },
        complete: () => {
            this.phase2Constructor_ = null;
        },
    };
    // Structural relationships ----------------------------------------------------------------------
    //
    presentation_;
    elements_ = null;
    // Owned properties ------------------------------------------------------------------------------
    //
    name_ = "";
    sectionTop_;
    sectionHeight_;
    sectionBottom_;
    scrollTriggers_ = [];
    // ----------------------------------------------------------------------------------------------
    // Construction
    // ----------------------------------------------------------------------------------------------
    constructor(token, options) {
        if (token !== Section.constructionToken_) {
            throw new Error("Section.constructor() - cannot call constructor directly; use create.");
        }
        this.presentation_ = options.presentation;
        this.sectionTop_ = options.sectionTop;
        this.sectionHeight_ = options.sectionHeight;
        this.sectionBottom_ = options.sectionBottom;
        this.name_ = options.name;
    }
    get phase2Constructor() {
        if (this.phase2Constructor_ === null) {
            throw new Error("Phase 2 construction already complete");
        }
        return this.phase2Constructor_;
    }
    static create(options) {
        const section = new Section(Section.constructionToken_, options);
        return {
            section,
            phase2Constructor: section.phase2Constructor,
        };
    }
    // ----------------------------------------------------------------------------------------------
    // Structural Relations
    // ----------------------------------------------------------------------------------------------
    get presentation() {
        return this.presentation_;
    }
    get elements() {
        if (this.elements_ === null) {
            throw new Error("Phase 2 construction not yet complete. .elements has not be created.");
        }
        return this.elements_;
    }
    get scrollTriggers() {
        return this.scrollTriggers_;
    }
    // ----------------------------------------------------------------------------------------------
    // Geometry
    // ----------------------------------------------------------------------------------------------
    get name() {
        return this.name_;
    }
    get sectionTop() {
        return this.sectionTop_.evaluate();
    }
    get sectionHeight() {
        return this.sectionHeight_.evaluate();
    }
    get sectionBottom() {
        return this.sectionBottom_.evaluate();
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/section/SectionBuilder.ts"
/*!*****************************************************************************!*\
  !*** ../../packages/presentation2/src/components/section/SectionBuilder.ts ***!
  \*****************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SectionBuilder: () => (/* binding */ SectionBuilder)
/* harmony export */ });
/* harmony import */ var _element_ElementBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../element/ElementBuilder */ "../../packages/presentation2/src/components/element/ElementBuilder.ts");
/* harmony import */ var _element_textBoxElement_TextBoxElementBuilder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../element/textBoxElement/TextBoxElementBuilder */ "../../packages/presentation2/src/components/element/textBoxElement/TextBoxElementBuilder.ts");
/* harmony import */ var _element_imageElement_ImageElementBuilder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../element/imageElement/ImageElementBuilder */ "../../packages/presentation2/src/components/element/imageElement/ImageElementBuilder.ts");
/* harmony import */ var _scrollTrigger_ScrollTriggerBuilder__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../scrollTrigger/ScrollTriggerBuilder */ "../../packages/presentation2/src/components/scrollTrigger/ScrollTriggerBuilder.ts");




class SectionBuilder {
    presentation_;
    elements_ = [];
    scrollTriggers_ = [];
    name_ = "";
    sectionHeight_ = "";
    sectionBottom_ = "";
    constructor(options) {
        this.presentation_ = options.presentation;
    }
    // ----------------------------------------------------------------------------------------------
    // Structural relationships
    // ----------------------------------------------------------------------------------------------
    get presentation() {
        return this.presentation_;
    }
    addElement() {
        const elementBuilder = new _element_ElementBuilder__WEBPACK_IMPORTED_MODULE_0__.ElementBuilder({ section: this });
        this.elements_.push(elementBuilder);
        return elementBuilder;
    }
    addTextBox() {
        const textBoxBuilder = new _element_textBoxElement_TextBoxElementBuilder__WEBPACK_IMPORTED_MODULE_1__.TextBoxBuilder({ section: this });
        this.elements_.push(textBoxBuilder);
        return textBoxBuilder;
    }
    addImageElement() {
        const elementBuilder = new _element_imageElement_ImageElementBuilder__WEBPACK_IMPORTED_MODULE_2__.ImageElementBuilder({ section: this });
        this.elements_.push(elementBuilder);
        return elementBuilder;
    }
    addScrollTrigger() {
        const scrollTriggerBuilder = new _scrollTrigger_ScrollTriggerBuilder__WEBPACK_IMPORTED_MODULE_3__.ScrollTriggerBuilder({ section: this });
        this.scrollTriggers_.push(scrollTriggerBuilder);
        return scrollTriggerBuilder;
    }
    get elements() {
        return this.elements_;
    }
    get scrollTriggers() {
        return this.scrollTriggers_;
    }
    // ----------------------------------------------------------------------------------------------
    // Owned properties
    // ----------------------------------------------------------------------------------------------
    // Axes
    //
    get sectionHeight() {
        return this.sectionHeight_;
    }
    set sectionHeight(value) {
        this.sectionHeight_ = value;
    }
    get hasSectionHeight() {
        return this.sectionHeight_.trim().length > 0;
    }
    get sectionBottom() {
        return this.sectionBottom_;
    }
    set sectionBottom(value) {
        this.sectionBottom_ = value;
    }
    get hasSectionBottom() {
        return this.sectionBottom_.trim().length > 0;
    }
    get name() {
        return this.name_;
    }
    set name(value) {
        this.name_ = value;
    }
    get hasName() {
        return this.name_.trim().length > 0;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/section/SectionCompiler.ts"
/*!******************************************************************************!*\
  !*** ../../packages/presentation2/src/components/section/SectionCompiler.ts ***!
  \******************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SectionCompiler: () => (/* binding */ SectionCompiler)
/* harmony export */ });
/* harmony import */ var _Section__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Section */ "../../packages/presentation2/src/components/section/Section.ts");
/* harmony import */ var _scrollTrigger_ScrollTriggerCompiler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../scrollTrigger/ScrollTriggerCompiler */ "../../packages/presentation2/src/components/scrollTrigger/ScrollTriggerCompiler.ts");


class SectionCompiler {
    // Structural relationships
    //
    builder_;
    presentationCompiler_;
    elements_;
    prevSection_ = null;
    nextSection_ = null;
    // Owned properties
    //
    module_;
    sectionTop_ = null;
    sectionBottom_ = null;
    sectionHeight_ = null;
    scrollTriggers_ = [];
    constructor(options) {
        this.builder_ = options.sectionBuilder;
        this.presentationCompiler_ = options.presentationCompiler;
        this.module_ = this.presentationCompiler_.module.addSubModule();
        this.elements_ = options.sectionBuilder.elements.map((elementBuilder) => elementBuilder.makeCompiler(this));
        this.scrollTriggers_ = options.sectionBuilder.scrollTriggers.map((scrollTriggerBuilder) => new _scrollTrigger_ScrollTriggerCompiler__WEBPACK_IMPORTED_MODULE_1__.ScrollTriggerCompiler({
            scrollTriggerBuilder,
            sectionCompiler: this,
        }));
    }
    // ----------------------------------------------------------------------------------------------
    // Property accessors
    // ----------------------------------------------------------------------------------------------
    get module() {
        return this.module_;
    }
    get presentationCompiler() {
        return this.presentationCompiler_;
    }
    get builder() {
        return this.builder_;
    }
    setNextSection(nextSection) {
        this.nextSection_ = nextSection;
        this.module.mapModule("nextSection", nextSection.module);
    }
    setPreviousSection(previousSection) {
        this.prevSection_ = previousSection;
        this.module.mapModule("prevSection", previousSection.module);
    }
    // ----------------------------------------------------------------------------------------------
    // Pre-compilation steps
    // ----------------------------------------------------------------------------------------------
    /**
     * See Presentation.beforeCompile() for symantics of this method & pattern of implementation
     * Do not duplicate that comment here - single point of truth.
     */
    beforeCompile() {
        this.validateAndDerive();
        this.scrollTriggers_.forEach((scrollTrigger) => scrollTrigger.beforeCompile());
        this.elements_.forEach((element) => element.beforeCompile());
    }
    validateAndDerive() {
        //
        //
        this.sectionTop_ = this.module.addExpression("sectionTop", this.prevSection_ ? "prevSection.sectionBottom" : "0");
        if (this.builder.hasSectionHeight && !this.builder.hasSectionBottom) {
            this.sectionHeight_ = this.module.addExpression("sectionHeight", this.builder_.sectionHeight);
            this.sectionBottom_ = this.module.addExpression("sectionBottom", this.prevSection_
                ? "prevSection.sectionBottom + sectionHeight"
                : "sectionHeight");
        }
        else if (!this.builder.hasSectionHeight &&
            this.builder.hasSectionBottom) {
            this.sectionBottom_ = this.module.addExpression("sectionBottom", this.builder_.sectionBottom);
            this.sectionHeight_ = this.module.addExpression("sectionHeight", "sectionBottom - sectionTop");
        }
        else {
            throw new Error(`Section must specify exactly one of 'sectionHeight' or 'sectionBottom'`);
        }
        // Create a the 'elements' namespace: this enables expressions on sections and elements (they
        // inherit the parent section's namespace) to refer to elements by name, e.g.
        // "elements.Element1.bottom"
        //
        // Notes:
        // (1) We only map elements that have names
        //     Possible FIXME: might be nice to support referring to elements by index?
        // (2) We use the rootModule for the namespace - this prevents the new namespace from being
        //     contaminated with other stuff in the section's namespace.
        //
        const elementsNamespace = this.module.rootModule.addSubModule();
        this.module.mapModule("elements", elementsNamespace);
        this.elements_.forEach((e) => {
            if (e.builder.hasName) {
                elementsNamespace.mapModule(e.builder.name, e.module);
            }
        });
    }
    // ----------------------------------------------------------------------------------------------
    // Compilation steps
    // ----------------------------------------------------------------------------------------------
    /**
     * See Presentation.compile() for symantics of this method & pattern of implementation
     * Do not duplicate that comment here - single point of truth.
     */
    compile(presentation) {
        const s = _Section__WEBPACK_IMPORTED_MODULE_0__.Section.create({
            presentation,
            sectionTop: this.sectionTop_(),
            sectionHeight: this.sectionHeight_(),
            sectionBottom: this.sectionBottom_(),
            name: this.builder_.name,
        });
        s.phase2Constructor.setElements(this.elements_.map((ec) => {
            return ec.compile(s.section);
        }));
        s.phase2Constructor.setScrollTriggers(this.scrollTriggers_.map((st) => st.compile(s.section)));
        s.phase2Constructor.complete();
        return s.section;
    }
}


/***/ },

/***/ "../../packages/presentation2/src/components/section/htmlView/HTMLSectionView.ts"
/*!***************************************************************************************!*\
  !*** ../../packages/presentation2/src/components/section/htmlView/HTMLSectionView.ts ***!
  \***************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLSectionView: () => (/* binding */ HTMLSectionView)
/* harmony export */ });
/* harmony import */ var _element_htmlView_HTMLElementView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../element/htmlView/HTMLElementView */ "../../packages/presentation2/src/components/element/htmlView/HTMLElementView.ts");
/* harmony import */ var _element_textBoxElement_TextBoxElement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../element/textBoxElement/TextBoxElement */ "../../packages/presentation2/src/components/element/textBoxElement/TextBoxElement.ts");
/* harmony import */ var _element_textBoxElement_htmlView_HTMLTextBoxElementView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../element/textBoxElement/htmlView/HTMLTextBoxElementView */ "../../packages/presentation2/src/components/element/textBoxElement/htmlView/HTMLTextBoxElementView.ts");
/* harmony import */ var _element_imageElement_ImageElement__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../element/imageElement/ImageElement */ "../../packages/presentation2/src/components/element/imageElement/ImageElement.ts");
/* harmony import */ var _element_imageElement_htmlView_HTMLImageElementView__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../element/imageElement/htmlView/HTMLImageElementView */ "../../packages/presentation2/src/components/element/imageElement/htmlView/HTMLImageElementView.ts");





class HTMLSectionView {
    // Structural relationships ----------------------------------------------------------------------
    //
    section_;
    presentationView_;
    elementViews_ = [];
    // DOM elements ----------------------------------------------------------------------------------
    //
    backgroundElement_ = document.createElement("div");
    contentElement_ = document.createElement("div");
    // ----------------------------------------------------------------------------------------------
    // Construction
    // ----------------------------------------------------------------------------------------------
    constructor(options) {
        this.presentationView_ = options.presentationView;
        this.section_ = options.section;
        // Order of construction:
        // 1. Create our DOM elements (done in createDOM()) so that children can attach to them.
        // 2. Create our element views, which will create their DOM elements and attach them to the
        //    appropriate parent.
        this.createDOM();
        this.section_.elements.forEach((element) => {
            if (element instanceof _element_textBoxElement_TextBoxElement__WEBPACK_IMPORTED_MODULE_1__.TextBoxElement) {
                this.elementViews_.push(new _element_textBoxElement_htmlView_HTMLTextBoxElementView__WEBPACK_IMPORTED_MODULE_2__.HTMLTextBoxElementView({ sectionView: this, element }));
            }
            else if (element instanceof _element_imageElement_ImageElement__WEBPACK_IMPORTED_MODULE_3__.ImageElement) {
                this.elementViews_.push(new _element_imageElement_htmlView_HTMLImageElementView__WEBPACK_IMPORTED_MODULE_4__.HTMLImageElementView({ sectionView: this, element }));
            }
            else {
                this.elementViews_.push(new _element_htmlView_HTMLElementView__WEBPACK_IMPORTED_MODULE_0__.HTMLElementView({ sectionView: this, element }));
            }
        });
    }
    disconnect() {
        this.elementViews_.forEach((ev) => ev.disconnect());
        this.elementViews_.length = 0;
    }
    // ----------------------------------------------------------------------------------------------
    // Structural Relations
    // ----------------------------------------------------------------------------------------------
    get section() {
        return this.section_;
    }
    get presentationView() {
        return this.presentationView_;
    }
    get elementViews() {
        return this.elementViews_;
    }
    get htmlBackgroundElement() {
        return this.backgroundElement_;
    }
    get htmlContentElement() {
        return this.contentElement_;
    }
    // ----------------------------------------------------------------------------------------------
    // Rendering
    // ----------------------------------------------------------------------------------------------
    createDOM() {
        // (1) Background element
        //
        this.backgroundElement_.classList.add("rdoc-section-background");
        this.presentationView.htmlBackgrounds.appendChild(this.backgroundElement_);
        // (2) Content element
        //
        this.contentElement_.classList.add("rdoc-section-content");
        if (this.section.name.length > 0) {
            this.contentElement_.classList.add(`rdoc-section-${this.section.name}`);
        }
        this.presentationView.htmlElements.appendChild(this.contentElement_);
    }
    layout() {
        const scale = this.presentationView.physicalDimensions.scale;
        const tx = this.presentationView.physicalDimensions.tx;
        const basisDimensions = this.section.presentation.basisDimensions;
        // (1) Set up our background element:
        //     - Absolutely positioned to correct size & position as per Section dimensions
        //     - Translated to centre
        this.backgroundElement_.style.left = `${tx}px`;
        this.backgroundElement_.style.top = `${this.section.sectionTop * scale}px`;
        this.backgroundElement_.style.width = `${basisDimensions.width * scale}px`;
        this.backgroundElement_.style.height = `${this.section.sectionHeight * scale}px`;
        // (2) Set up our content element:
        //     - Absolutely positioned to the top of the content area: children are all layed out
        //       in global coordinate space so we don't want any offsets on this element.
        //     - Translated to centre
        //
        this.contentElement_.style.left = `${tx}px`;
        this.contentElement_.style.top = "0px";
        // (3) Layout our element views
        //
        this.elementViews.forEach((elementView) => {
            elementView.layout();
        });
    }
}


/***/ },

/***/ "../../packages/presentation2/src/index.ts"
/*!*************************************************!*\
  !*** ../../packages/presentation2/src/index.ts ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ContentDependentDimension: () => (/* reexport safe */ _components_element_Element__WEBPACK_IMPORTED_MODULE_4__.ContentDependentDimension),
/* harmony export */   Element: () => (/* reexport safe */ _components_element_Element__WEBPACK_IMPORTED_MODULE_4__.Element),
/* harmony export */   ElementBuilder: () => (/* reexport safe */ _components_element_ElementBuilder__WEBPACK_IMPORTED_MODULE_5__.ElementBuilder),
/* harmony export */   HTMLPresentationView: () => (/* reexport safe */ _components_presentation_htmlView_HTMLPresentationView__WEBPACK_IMPORTED_MODULE_9__.HTMLPresentationView),
/* harmony export */   Presentation: () => (/* reexport safe */ _components_presentation_Presentation__WEBPACK_IMPORTED_MODULE_0__.Presentation),
/* harmony export */   PresentationBuilder: () => (/* reexport safe */ _components_presentation_PresentationBuilder__WEBPACK_IMPORTED_MODULE_1__.PresentationBuilder),
/* harmony export */   ScrollTrigger: () => (/* reexport safe */ _components_scrollTrigger_ScrollTrigger__WEBPACK_IMPORTED_MODULE_6__.ScrollTrigger),
/* harmony export */   ScrollTriggerBuilder: () => (/* reexport safe */ _components_scrollTrigger_ScrollTriggerBuilder__WEBPACK_IMPORTED_MODULE_7__.ScrollTriggerBuilder),
/* harmony export */   Section: () => (/* reexport safe */ _components_section_Section__WEBPACK_IMPORTED_MODULE_2__.Section),
/* harmony export */   SectionBuilder: () => (/* reexport safe */ _components_section_SectionBuilder__WEBPACK_IMPORTED_MODULE_3__.SectionBuilder),
/* harmony export */   compilePresentation: () => (/* reexport safe */ _components_compilePresentation__WEBPACK_IMPORTED_MODULE_8__.compilePresentation),
/* harmony export */   loadFromXML: () => (/* reexport safe */ _components_loadFromXML_loadFromXML__WEBPACK_IMPORTED_MODULE_10__.loadFromXML)
/* harmony export */ });
/* harmony import */ var _components_presentation_Presentation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/presentation/Presentation */ "../../packages/presentation2/src/components/presentation/Presentation.ts");
/* harmony import */ var _components_presentation_PresentationBuilder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/presentation/PresentationBuilder */ "../../packages/presentation2/src/components/presentation/PresentationBuilder.ts");
/* harmony import */ var _components_section_Section__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/section/Section */ "../../packages/presentation2/src/components/section/Section.ts");
/* harmony import */ var _components_section_SectionBuilder__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/section/SectionBuilder */ "../../packages/presentation2/src/components/section/SectionBuilder.ts");
/* harmony import */ var _components_element_Element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/element/Element */ "../../packages/presentation2/src/components/element/Element.ts");
/* harmony import */ var _components_element_ElementBuilder__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/element/ElementBuilder */ "../../packages/presentation2/src/components/element/ElementBuilder.ts");
/* harmony import */ var _components_scrollTrigger_ScrollTrigger__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/scrollTrigger/ScrollTrigger */ "../../packages/presentation2/src/components/scrollTrigger/ScrollTrigger.ts");
/* harmony import */ var _components_scrollTrigger_ScrollTriggerBuilder__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/scrollTrigger/ScrollTriggerBuilder */ "../../packages/presentation2/src/components/scrollTrigger/ScrollTriggerBuilder.ts");
/* harmony import */ var _components_compilePresentation__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/compilePresentation */ "../../packages/presentation2/src/components/compilePresentation.ts");
/* harmony import */ var _components_presentation_htmlView_HTMLPresentationView__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/presentation/htmlView/HTMLPresentationView */ "../../packages/presentation2/src/components/presentation/htmlView/HTMLPresentationView.ts");
/* harmony import */ var _components_loadFromXML_loadFromXML__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/loadFromXML/loadFromXML */ "../../packages/presentation2/src/components/loadFromXML/loadFromXML.ts");













/***/ },

/***/ "../../packages/sanitizer/src/index.ts"
/*!*********************************************!*\
  !*** ../../packages/sanitizer/src/index.ts ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   sanitizeHTML: () => (/* binding */ sanitizeHTML),
/* harmony export */   sanitizeSVG: () => (/* binding */ sanitizeSVG)
/* harmony export */ });
/* harmony import */ var dompurify__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dompurify */ "../../node_modules/dompurify/dist/purify.es.mjs");

/**
 * Sanitize HTML string to prevent XSS attacks.
 *
 * Note: This function uses DOMPurify under the hood, however this is an implementation detail and
 * may change in the future. Do not rely on this function using DOMPurify specifically, but rather
 * just that it sanitizes HTML strings effectively.
 *
 * FIXME: This function currently only allows the default HTML profile, which will be too
 * restrictive once we start allowing things like maths.
 *
 * @param dirty The HTML string to sanitize.
 * @returns The sanitized HTML string.
 */
function sanitizeHTML(dirty) {
    return dompurify__WEBPACK_IMPORTED_MODULE_0__["default"].sanitize(dirty, {
        USE_PROFILES: { html: true },
    });
}
/**
 * Sanitize SVG string to prevent XSS attacks.
 *
 * Note: This function uses DOMPurify under the hood, however this is an implementation detail and
 * may change in the future. Do not rely on this function using DOMPurify specifically, but rather
 * just that it sanitizes SVG strings effectively.
 *
 * @param dirty The SVG string to sanitize.
 * @returns The sanitized SVG string.
 */
function sanitizeSVG(dirty) {
    return dompurify__WEBPACK_IMPORTED_MODULE_0__["default"].sanitize(dirty, {
        USE_PROFILES: { svg: true, svgFilters: true },
    });
}


/***/ },

/***/ "./src/ts/main.ts"
/*!************************!*\
  !*** ./src/ts/main.ts ***!
  \************************/
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/styles.css */ "./src/css/styles.css");
/* harmony import */ var _rippledoc_presentation2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @rippledoc/presentation2 */ "../../packages/presentation2/src/index.ts");


try {
    const p = await (0,_rippledoc_presentation2__WEBPACK_IMPORTED_MODULE_1__.loadFromXML)({ url: "presentations/demo1.xml" });
    console.log(p);
    const htmlView = new _rippledoc_presentation2__WEBPACK_IMPORTED_MODULE_1__.HTMLPresentationView({
        presentation: p,
        container: "#theContainer",
    });
    console.log(htmlView);
}
catch (e) {
    console.error("Compilation error:", e);
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ },

/***/ "../../node_modules/dompurify/dist/purify.es.mjs"
/*!*******************************************************!*\
  !*** ../../node_modules/dompurify/dist/purify.es.mjs ***!
  \*******************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ purify)
/* harmony export */ });
/*! @license DOMPurify 3.3.3 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.3/LICENSE */

const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor
} = Object;
let {
  freeze,
  seal,
  create
} = Object; // eslint-disable-line import/no-mutable-exports
let {
  apply,
  construct
} = typeof Reflect !== 'undefined' && Reflect;
if (!freeze) {
  freeze = function freeze(x) {
    return x;
  };
}
if (!seal) {
  seal = function seal(x) {
    return x;
  };
}
if (!apply) {
  apply = function apply(func, thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    return func.apply(thisArg, args);
  };
}
if (!construct) {
  construct = function construct(Func) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }
    return new Func(...args);
  };
}
const arrayForEach = unapply(Array.prototype.forEach);
const arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);
const arraySplice = unapply(Array.prototype.splice);
const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringToString = unapply(String.prototype.toString);
const stringMatch = unapply(String.prototype.match);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);
const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
const regExpTest = unapply(RegExp.prototype.test);
const typeErrorCreate = unconstruct(TypeError);
/**
 * Creates a new function that calls the given function with a specified thisArg and arguments.
 *
 * @param func - The function to be wrapped and called.
 * @returns A new function that calls the given function with a specified thisArg and arguments.
 */
function unapply(func) {
  return function (thisArg) {
    if (thisArg instanceof RegExp) {
      thisArg.lastIndex = 0;
    }
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }
    return apply(func, thisArg, args);
  };
}
/**
 * Creates a new function that constructs an instance of the given constructor function with the provided arguments.
 *
 * @param func - The constructor function to be wrapped and called.
 * @returns A new function that constructs an instance of the given constructor function with the provided arguments.
 */
function unconstruct(Func) {
  return function () {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    return construct(Func, args);
  };
}
/**
 * Add properties to a lookup table
 *
 * @param set - The set to which elements will be added.
 * @param array - The array containing elements to be added to the set.
 * @param transformCaseFunc - An optional function to transform the case of each element before adding to the set.
 * @returns The modified set with added elements.
 */
function addToSet(set, array) {
  let transformCaseFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : stringToLowerCase;
  if (setPrototypeOf) {
    // Make 'in' and truthy checks like Boolean(set.constructor)
    // independent of any properties defined on Object.prototype.
    // Prevent prototype setters from intercepting set as a this value.
    setPrototypeOf(set, null);
  }
  let l = array.length;
  while (l--) {
    let element = array[l];
    if (typeof element === 'string') {
      const lcElement = transformCaseFunc(element);
      if (lcElement !== element) {
        // Config presets (e.g. tags.js, attrs.js) are immutable.
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }
        element = lcElement;
      }
    }
    set[element] = true;
  }
  return set;
}
/**
 * Clean up an array to harden against CSPP
 *
 * @param array - The array to be cleaned.
 * @returns The cleaned version of the array
 */
function cleanArray(array) {
  for (let index = 0; index < array.length; index++) {
    const isPropertyExist = objectHasOwnProperty(array, index);
    if (!isPropertyExist) {
      array[index] = null;
    }
  }
  return array;
}
/**
 * Shallow clone an object
 *
 * @param object - The object to be cloned.
 * @returns A new object that copies the original.
 */
function clone(object) {
  const newObject = create(null);
  for (const [property, value] of entries(object)) {
    const isPropertyExist = objectHasOwnProperty(object, property);
    if (isPropertyExist) {
      if (Array.isArray(value)) {
        newObject[property] = cleanArray(value);
      } else if (value && typeof value === 'object' && value.constructor === Object) {
        newObject[property] = clone(value);
      } else {
        newObject[property] = value;
      }
    }
  }
  return newObject;
}
/**
 * This method automatically checks if the prop is function or getter and behaves accordingly.
 *
 * @param object - The object to look up the getter function in its prototype chain.
 * @param prop - The property name for which to find the getter function.
 * @returns The getter function found in the prototype chain or a fallback function.
 */
function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }
      if (typeof desc.value === 'function') {
        return unapply(desc.value);
      }
    }
    object = getPrototypeOf(object);
  }
  function fallbackValue() {
    return null;
  }
  return fallbackValue;
}

const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'search', 'section', 'select', 'shadow', 'slot', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);
const svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'enterkeyhint', 'exportparts', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'inputmode', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'part', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);
// List of SVG elements that are disallowed by default.
// We still need to know them so that we can do namespace
// checks properly in case one wants to add them to
// allow-list.
const svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
const mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'mprescripts']);
// Similarly to SVG, we want to know all MathML elements,
// even those that we disallow by default.
const mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
const text = freeze(['#text']);

const html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'exportparts', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inert', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'part', 'pattern', 'placeholder', 'playsinline', 'popover', 'popovertarget', 'popovertargetaction', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'slot', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'wrap', 'xmlns', 'slot']);
const svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'amplitude', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'exponent', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'intercept', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'mask-type', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'slope', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'tablevalues', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
const mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
const xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

// eslint-disable-next-line unicorn/better-regex
const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
const TMPLIT_EXPR = seal(/\$\{[\w\W]*/gm); // eslint-disable-line unicorn/better-regex
const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/); // eslint-disable-line no-useless-escape
const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
);
const DOCTYPE_NAME = seal(/^html$/i);
const CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);

var EXPRESSIONS = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ARIA_ATTR: ARIA_ATTR,
  ATTR_WHITESPACE: ATTR_WHITESPACE,
  CUSTOM_ELEMENT: CUSTOM_ELEMENT,
  DATA_ATTR: DATA_ATTR,
  DOCTYPE_NAME: DOCTYPE_NAME,
  ERB_EXPR: ERB_EXPR,
  IS_ALLOWED_URI: IS_ALLOWED_URI,
  IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA,
  MUSTACHE_EXPR: MUSTACHE_EXPR,
  TMPLIT_EXPR: TMPLIT_EXPR
});

/* eslint-disable @typescript-eslint/indent */
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const NODE_TYPE = {
  element: 1,
  attribute: 2,
  text: 3,
  cdataSection: 4,
  entityReference: 5,
  // Deprecated
  entityNode: 6,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
  notation: 12 // Deprecated
};
const getGlobal = function getGlobal() {
  return typeof window === 'undefined' ? null : window;
};
/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param trustedTypes The policy factory.
 * @param purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
 * @return The policy created (or null, if Trusted Types
 * are not supported or creating the policy failed).
 */
const _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
  if (typeof trustedTypes !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
    return null;
  }
  // Allow the callers to control the unique policy name
  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
  // Policy creation with duplicate names throws in Trusted Types.
  let suffix = null;
  const ATTR_NAME = 'data-tt-policy-suffix';
  if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
    suffix = purifyHostElement.getAttribute(ATTR_NAME);
  }
  const policyName = 'dompurify' + (suffix ? '#' + suffix : '');
  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML(html) {
        return html;
      },
      createScriptURL(scriptUrl) {
        return scriptUrl;
      }
    });
  } catch (_) {
    // Policy creation failed (most likely another DOMPurify script has
    // already run). Skip creating the policy, as this will only cause errors
    // if TT are enforced.
    console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
    return null;
  }
};
const _createHooksMap = function _createHooksMap() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
};
function createDOMPurify() {
  let window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();
  const DOMPurify = root => createDOMPurify(root);
  DOMPurify.version = '3.3.3';
  DOMPurify.removed = [];
  if (!window || !window.document || window.document.nodeType !== NODE_TYPE.document || !window.Element) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;
    return DOMPurify;
  }
  let {
    document
  } = window;
  const originalDocument = document;
  const currentScript = originalDocument.currentScript;
  const {
    DocumentFragment,
    HTMLTemplateElement,
    Node,
    Element,
    NodeFilter,
    NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap,
    HTMLFormElement,
    DOMParser,
    trustedTypes
  } = window;
  const ElementPrototype = Element.prototype;
  const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
  const remove = lookupGetter(ElementPrototype, 'remove');
  const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
  const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
  const getParentNode = lookupGetter(ElementPrototype, 'parentNode');
  // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.
  if (typeof HTMLTemplateElement === 'function') {
    const template = document.createElement('template');
    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }
  let trustedTypesPolicy;
  let emptyHTML = '';
  const {
    implementation,
    createNodeIterator,
    createDocumentFragment,
    getElementsByTagName
  } = document;
  const {
    importNode
  } = originalDocument;
  let hooks = _createHooksMap();
  /**
   * Expose whether this browser supports running the full DOMPurify.
   */
  DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined;
  const {
    MUSTACHE_EXPR,
    ERB_EXPR,
    TMPLIT_EXPR,
    DATA_ATTR,
    ARIA_ATTR,
    IS_SCRIPT_OR_DATA,
    ATTR_WHITESPACE,
    CUSTOM_ELEMENT
  } = EXPRESSIONS;
  let {
    IS_ALLOWED_URI: IS_ALLOWED_URI$1
  } = EXPRESSIONS;
  /**
   * We consider the elements and attributes below to be safe. Ideally
   * don't add any new ones but feel free to remove unwanted ones.
   */
  /* allowed element names */
  let ALLOWED_TAGS = null;
  const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);
  /* Allowed attribute names */
  let ALLOWED_ATTR = null;
  const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);
  /*
   * Configure how DOMPurify should handle custom elements and their attributes as well as customized built-in elements.
   * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
   * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
   * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
   */
  let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
    tagNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: false
    }
  }));
  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
  let FORBID_TAGS = null;
  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
  let FORBID_ATTR = null;
  /* Config object to store ADD_TAGS/ADD_ATTR functions (when used as functions) */
  const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
    tagCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    }
  }));
  /* Decide if ARIA attributes are okay */
  let ALLOW_ARIA_ATTR = true;
  /* Decide if custom data attributes are okay */
  let ALLOW_DATA_ATTR = true;
  /* Decide if unknown protocols are okay */
  let ALLOW_UNKNOWN_PROTOCOLS = false;
  /* Decide if self-closing tags in attributes are allowed.
   * Usually removed due to a mXSS issue in jQuery 3.0 */
  let ALLOW_SELF_CLOSE_IN_ATTR = true;
  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */
  let SAFE_FOR_TEMPLATES = false;
  /* Output should be safe even for XML used within HTML and alike.
   * This means, DOMPurify removes comments when containing risky content.
   */
  let SAFE_FOR_XML = true;
  /* Decide if document with <html>... should be returned */
  let WHOLE_DOCUMENT = false;
  /* Track whether config is already set on this instance of DOMPurify. */
  let SET_CONFIG = false;
  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */
  let FORCE_BODY = false;
  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
   * string (or a TrustedHTML object if Trusted Types are supported).
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */
  let RETURN_DOM = false;
  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
   * string  (or a TrustedHTML object if Trusted Types are supported) */
  let RETURN_DOM_FRAGMENT = false;
  /* Try to return a Trusted Type object instead of a string, return a string in
   * case Trusted Types are not supported  */
  let RETURN_TRUSTED_TYPE = false;
  /* Output should be free from DOM clobbering attacks?
   * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
   */
  let SANITIZE_DOM = true;
  /* Achieve full DOM Clobbering protection by isolating the namespace of named
   * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
   *
   * HTML/DOM spec rules that enable DOM Clobbering:
   *   - Named Access on Window (§7.3.3)
   *   - DOM Tree Accessors (§3.1.5)
   *   - Form Element Parent-Child Relations (§4.10.3)
   *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
   *   - HTMLCollection (§4.2.10.2)
   *
   * Namespace isolation is implemented by prefixing `id` and `name` attributes
   * with a constant string, i.e., `user-content-`
   */
  let SANITIZE_NAMED_PROPS = false;
  const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';
  /* Keep element content when removing element? */
  let KEEP_CONTENT = true;
  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */
  let IN_PLACE = false;
  /* Allow usage of profiles like html, svg and mathMl */
  let USE_PROFILES = {};
  /* Tags to ignore content of when KEEP_CONTENT is true */
  let FORBID_CONTENTS = null;
  const DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);
  /* Tags that are safe for data: URIs */
  let DATA_URI_TAGS = null;
  const DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);
  /* Attributes safe for values like "javascript:" */
  let URI_SAFE_ATTRIBUTES = null;
  const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
  const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  /* Document namespace */
  let NAMESPACE = HTML_NAMESPACE;
  let IS_EMPTY_INPUT = false;
  /* Allowed XHTML+XML namespaces */
  let ALLOWED_NAMESPACES = null;
  const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
  let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
  let HTML_INTEGRATION_POINTS = addToSet({}, ['annotation-xml']);
  // Certain elements are allowed in both SVG and HTML
  // namespace. We need to specify them explicitly
  // so that they don't get erroneously deleted from
  // HTML namespace.
  const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);
  /* Parsing of strict XHTML documents */
  let PARSER_MEDIA_TYPE = null;
  const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
  const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
  let transformCaseFunc = null;
  /* Keep a reference to config to pass to hooks */
  let CONFIG = null;
  /* Ideally, do not touch anything below this line */
  /* ______________________________________________ */
  const formElement = document.createElement('form');
  const isRegexOrFunction = function isRegexOrFunction(testValue) {
    return testValue instanceof RegExp || testValue instanceof Function;
  };
  /**
   * _parseConfig
   *
   * @param cfg optional config literal
   */
  // eslint-disable-next-line complexity
  const _parseConfig = function _parseConfig() {
    let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (CONFIG && CONFIG === cfg) {
      return;
    }
    /* Shield configuration object from tampering */
    if (!cfg || typeof cfg !== 'object') {
      cfg = {};
    }
    /* Shield configuration object from prototype pollution */
    cfg = clone(cfg);
    PARSER_MEDIA_TYPE =
    // eslint-disable-next-line unicorn/prefer-includes
    SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
    // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.
    transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;
    /* Set configuration parameters */
    ALLOWED_TAGS = objectHasOwnProperty(cfg, 'ALLOWED_TAGS') ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = objectHasOwnProperty(cfg, 'ALLOWED_ATTR') ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
    ALLOWED_NAMESPACES = objectHasOwnProperty(cfg, 'ALLOWED_NAMESPACES') ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
    URI_SAFE_ATTRIBUTES = objectHasOwnProperty(cfg, 'ADD_URI_SAFE_ATTR') ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR, transformCaseFunc) : DEFAULT_URI_SAFE_ATTRIBUTES;
    DATA_URI_TAGS = objectHasOwnProperty(cfg, 'ADD_DATA_URI_TAGS') ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS, transformCaseFunc) : DEFAULT_DATA_URI_TAGS;
    FORBID_CONTENTS = objectHasOwnProperty(cfg, 'FORBID_CONTENTS') ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
    FORBID_TAGS = objectHasOwnProperty(cfg, 'FORBID_TAGS') ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : clone({});
    FORBID_ATTR = objectHasOwnProperty(cfg, 'FORBID_ATTR') ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : clone({});
    USE_PROFILES = objectHasOwnProperty(cfg, 'USE_PROFILES') ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
    SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false; // Default true
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
    RETURN_DOM = cfg.RETURN_DOM || false; // Default false
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
    FORCE_BODY = cfg.FORCE_BODY || false; // Default false
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
    IN_PLACE = cfg.IN_PLACE || false; // Default false
    IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
    NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
    MATHML_TEXT_INTEGRATION_POINTS = cfg.MATHML_TEXT_INTEGRATION_POINTS || MATHML_TEXT_INTEGRATION_POINTS;
    HTML_INTEGRATION_POINTS = cfg.HTML_INTEGRATION_POINTS || HTML_INTEGRATION_POINTS;
    CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
    }
    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }
    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }
    /* Parse profile info */
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, text);
      ALLOWED_ATTR = create(null);
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html$1);
        addToSet(ALLOWED_ATTR, html);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg$1);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl$1);
        addToSet(ALLOWED_ATTR, mathMl);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    /* Prevent function-based ADD_ATTR / ADD_TAGS from leaking across calls */
    if (!objectHasOwnProperty(cfg, 'ADD_TAGS')) {
      EXTRA_ELEMENT_HANDLING.tagCheck = null;
    }
    if (!objectHasOwnProperty(cfg, 'ADD_ATTR')) {
      EXTRA_ELEMENT_HANDLING.attributeCheck = null;
    }
    /* Merge configuration parameters */
    if (cfg.ADD_TAGS) {
      if (typeof cfg.ADD_TAGS === 'function') {
        EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
      } else {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }
        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }
    }
    if (cfg.ADD_ATTR) {
      if (typeof cfg.ADD_ATTR === 'function') {
        EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
      } else {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }
        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }
    }
    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
    }
    if (cfg.FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }
      addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
    }
    if (cfg.ADD_FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }
      addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
    }
    /* Add #text in case KEEP_CONTENT is set to true */
    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }
    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
    }
    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ['tbody']);
      delete FORBID_TAGS.tbody;
    }
    if (cfg.TRUSTED_TYPES_POLICY) {
      if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      }
      if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      }
      // Overwrite existing TrustedTypes policy.
      trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
      // Sign local variables required by `sanitize`.
      emptyHTML = trustedTypesPolicy.createHTML('');
    } else {
      // Uninitialized policy, attempt to initialize the internal dompurify policy.
      if (trustedTypesPolicy === undefined) {
        trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
      }
      // If creating the internal policy succeeded sign internal variables.
      if (trustedTypesPolicy !== null && typeof emptyHTML === 'string') {
        emptyHTML = trustedTypesPolicy.createHTML('');
      }
    }
    // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.
    if (freeze) {
      freeze(cfg);
    }
    CONFIG = cfg;
  };
  /* Keep track of all possible SVG and MathML tags
   * so that we can perform the namespace checks
   * correctly. */
  const ALL_SVG_TAGS = addToSet({}, [...svg$1, ...svgFilters, ...svgDisallowed]);
  const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
  /**
   * @param element a DOM element whose namespace is being checked
   * @returns Return false if the element has a
   *  namespace that a spec-compliant parser would never
   *  return. Return true otherwise.
   */
  const _checkValidNamespace = function _checkValidNamespace(element) {
    let parent = getParentNode(element);
    // In JSDOM, if we're inside shadow DOM, then parentNode
    // can be null. We just simulate parent in this case.
    if (!parent || !parent.tagName) {
      parent = {
        namespaceURI: NAMESPACE,
        tagName: 'template'
      };
    }
    const tagName = stringToLowerCase(element.tagName);
    const parentTagName = stringToLowerCase(parent.tagName);
    if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
      return false;
    }
    if (element.namespaceURI === SVG_NAMESPACE) {
      // The only way to switch from HTML namespace to SVG
      // is via <svg>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'svg';
      }
      // The only way to switch from MathML to SVG is via`
      // svg if parent is either <annotation-xml> or MathML
      // text integration points.
      if (parent.namespaceURI === MATHML_NAMESPACE) {
        return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      }
      // We only allow elements that are defined in SVG
      // spec. All others are disallowed in SVG namespace.
      return Boolean(ALL_SVG_TAGS[tagName]);
    }
    if (element.namespaceURI === MATHML_NAMESPACE) {
      // The only way to switch from HTML namespace to MathML
      // is via <math>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'math';
      }
      // The only way to switch from SVG to MathML is via
      // <math> and HTML integration points
      if (parent.namespaceURI === SVG_NAMESPACE) {
        return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
      }
      // We only allow elements that are defined in MathML
      // spec. All others are disallowed in MathML namespace.
      return Boolean(ALL_MATHML_TAGS[tagName]);
    }
    if (element.namespaceURI === HTML_NAMESPACE) {
      // The only way to switch from SVG to HTML is via
      // HTML integration points, and from MathML to HTML
      // is via MathML text integration points
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      // We disallow tags that are specific for MathML
      // or SVG and should never appear in HTML namespace
      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    }
    // For XHTML and XML documents that support custom namespaces
    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
      return true;
    }
    // The code should never reach this place (this means
    // that the element somehow got namespace that is not
    // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
    // Return false just in case.
    return false;
  };
  /**
   * _forceRemove
   *
   * @param node a DOM node
   */
  const _forceRemove = function _forceRemove(node) {
    arrayPush(DOMPurify.removed, {
      element: node
    });
    try {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      getParentNode(node).removeChild(node);
    } catch (_) {
      remove(node);
    }
  };
  /**
   * _removeAttribute
   *
   * @param name an Attribute name
   * @param element a DOM node
   */
  const _removeAttribute = function _removeAttribute(name, element) {
    try {
      arrayPush(DOMPurify.removed, {
        attribute: element.getAttributeNode(name),
        from: element
      });
    } catch (_) {
      arrayPush(DOMPurify.removed, {
        attribute: null,
        from: element
      });
    }
    element.removeAttribute(name);
    // We void attribute values for unremovable "is" attributes
    if (name === 'is') {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
        try {
          _forceRemove(element);
        } catch (_) {}
      } else {
        try {
          element.setAttribute(name, '');
        } catch (_) {}
      }
    }
  };
  /**
   * _initDocument
   *
   * @param dirty - a string of dirty markup
   * @return a DOM, filled with the dirty markup
   */
  const _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    let doc = null;
    let leadingWhitespace = null;
    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    } else {
      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
      const matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }
    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
      // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
      dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
    }
    const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
    /*
     * Use the DOMParser API by default, fallback later if needs be
     * DOMParser not work for svg when has multiple root element.
     */
    if (NAMESPACE === HTML_NAMESPACE) {
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_) {}
    }
    /* Use createHTMLDocument in case DOMParser is not available */
    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, 'template', null);
      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
      } catch (_) {
        // Syntax error if dirtyPayload is invalid xml
      }
    }
    const body = doc.body || doc.documentElement;
    if (dirty && leadingWhitespace) {
      body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
    }
    /* Work on whole document or just its body */
    if (NAMESPACE === HTML_NAMESPACE) {
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
    }
    return WHOLE_DOCUMENT ? doc.documentElement : body;
  };
  /**
   * Creates a NodeIterator object that you can use to traverse filtered lists of nodes or elements in a document.
   *
   * @param root The root element or node to start traversing on.
   * @return The created NodeIterator
   */
  const _createNodeIterator = function _createNodeIterator(root) {
    return createNodeIterator.call(root.ownerDocument || root, root,
    // eslint-disable-next-line no-bitwise
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
  };
  /**
   * _isClobbered
   *
   * @param element element to check for clobbering attacks
   * @return true if clobbered, false if safe
   */
  const _isClobbered = function _isClobbered(element) {
    return element instanceof HTMLFormElement && (typeof element.nodeName !== 'string' || typeof element.textContent !== 'string' || typeof element.removeChild !== 'function' || !(element.attributes instanceof NamedNodeMap) || typeof element.removeAttribute !== 'function' || typeof element.setAttribute !== 'function' || typeof element.namespaceURI !== 'string' || typeof element.insertBefore !== 'function' || typeof element.hasChildNodes !== 'function');
  };
  /**
   * Checks whether the given object is a DOM node.
   *
   * @param value object to check whether it's a DOM node
   * @return true is object is a DOM node
   */
  const _isNode = function _isNode(value) {
    return typeof Node === 'function' && value instanceof Node;
  };
  function _executeHooks(hooks, currentNode, data) {
    arrayForEach(hooks, hook => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  }
  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   * @param currentNode to check for permission to exist
   * @return true if node was killed, false if left alive
   */
  const _sanitizeElements = function _sanitizeElements(currentNode) {
    let content = null;
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
    /* Check if element is clobbered or can clobber */
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Now let's check the element's type and name */
    const tagName = transformCaseFunc(currentNode.nodeName);
    /* Execute a hook if present */
    _executeHooks(hooks.uponSanitizeElement, currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS
    });
    /* Detect mXSS attempts abusing namespace confusion */
    if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(/<[/\w!]/g, currentNode.innerHTML) && regExpTest(/<[/\w!]/g, currentNode.textContent)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove any occurrence of processing instructions */
    if (currentNode.nodeType === NODE_TYPE.progressingInstruction) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove any kind of possibly harmful comments */
    if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(/<[/\w]/g, currentNode.data)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove element if anything forbids its presence */
    if (!(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName])) {
      /* Check if we have a custom element to handle */
      if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName)) {
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) {
          return false;
        }
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) {
          return false;
        }
      }
      /* Keep content except for bad-listed elements */
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
        const parentNode = getParentNode(currentNode) || currentNode.parentNode;
        const childNodes = getChildNodes(currentNode) || currentNode.childNodes;
        if (childNodes && parentNode) {
          const childCount = childNodes.length;
          for (let i = childCount - 1; i >= 0; --i) {
            const childClone = cloneNode(childNodes[i], true);
            childClone.__removalCount = (currentNode.__removalCount || 0) + 1;
            parentNode.insertBefore(childClone, getNextSibling(currentNode));
          }
        }
      }
      _forceRemove(currentNode);
      return true;
    }
    /* Check whether element has a valid namespace */
    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Make sure that older browsers don't get fallback-tag mXSS */
    if ((tagName === 'noscript' || tagName === 'noembed' || tagName === 'noframes') && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Sanitize element content to be template-safe */
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
      /* Get the element's text content */
      content = currentNode.textContent;
      arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
        content = stringReplace(content, expr, ' ');
      });
      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, {
          element: currentNode.cloneNode()
        });
        currentNode.textContent = content;
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeElements, currentNode, null);
    return false;
  };
  /**
   * _isValidAttribute
   *
   * @param lcTag Lowercase tag name of containing element.
   * @param lcName Lowercase attribute name.
   * @param value Attribute value.
   * @return Returns true if `value` is valid, otherwise false.
   */
  // eslint-disable-next-line complexity
  const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    /* FORBID_ATTR must always win, even if ADD_ATTR predicate would allow it */
    if (FORBID_ATTR[lcName]) {
      return false;
    }
    /* Make sure attribute cannot clobber */
    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
      return false;
    }
    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */
    if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR, lcName)) ; else if (EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      if (
      // First condition does a very basic check if a) it's basically a valid custom element tagname AND
      // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
      _isBasicCustomElement(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName, lcTag)) ||
      // Alternative, second condition checks if it's an `is`-attribute, AND
      // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
        return false;
      }
      /* Check value is safe. First, is attr inert? If so, is safe */
    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if (value) {
      return false;
    } else ;
    return true;
  };
  /**
   * _isBasicCustomElement
   * checks if at least one dash is included in tagName, and it's not the first char
   * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
   *
   * @param tagName name of the tag of the node to sanitize
   * @returns Returns true if the tag name meets the basic criteria for a custom element, otherwise false.
   */
  const _isBasicCustomElement = function _isBasicCustomElement(tagName) {
    return tagName !== 'annotation-xml' && stringMatch(tagName, CUSTOM_ELEMENT);
  };
  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param currentNode to sanitize
   */
  const _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
    const {
      attributes
    } = currentNode;
    /* Check if we have attributes; if not we might have a text node */
    if (!attributes || _isClobbered(currentNode)) {
      return;
    }
    const hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR,
      forceKeepAttr: undefined
    };
    let l = attributes.length;
    /* Go backwards over all attributes; safely remove bad ones */
    while (l--) {
      const attr = attributes[l];
      const {
        name,
        namespaceURI,
        value: attrValue
      } = attr;
      const lcName = transformCaseFunc(name);
      const initValue = attrValue;
      let value = name === 'value' ? initValue : stringTrim(initValue);
      /* Execute a hook if present */
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
      _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
      value = hookEvent.attrValue;
      /* Full DOM Clobbering protection via namespace isolation,
       * Prefix id and name attributes with `user-content-`
       */
      if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
        // Remove the attribute with this value
        _removeAttribute(name, currentNode);
        // Prefix the value and later re-create the attribute with the sanitized value
        value = SANITIZE_NAMED_PROPS_PREFIX + value;
      }
      /* Work around a security issue with comments inside attributes */
      if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Make sure we cannot easily use animated hrefs, even if animations are allowed */
      if (lcName === 'attributename' && stringMatch(value, 'href')) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Did the hooks approve of the attribute? */
      if (hookEvent.forceKeepAttr) {
        continue;
      }
      /* Did the hooks approve of the attribute? */
      if (!hookEvent.keepAttr) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Work around a security issue in jQuery 3.0 */
      if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Sanitize attribute content to be template-safe */
      if (SAFE_FOR_TEMPLATES) {
        arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
          value = stringReplace(value, expr, ' ');
        });
      }
      /* Is `value` valid for this attribute? */
      const lcTag = transformCaseFunc(currentNode.nodeName);
      if (!_isValidAttribute(lcTag, lcName, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Handle attributes that require Trusted Types */
      if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function') {
        if (namespaceURI) ; else {
          switch (trustedTypes.getAttributeType(lcTag, lcName)) {
            case 'TrustedHTML':
              {
                value = trustedTypesPolicy.createHTML(value);
                break;
              }
            case 'TrustedScriptURL':
              {
                value = trustedTypesPolicy.createScriptURL(value);
                break;
              }
          }
        }
      }
      /* Handle invalid data-* attribute set by try-catching it */
      if (value !== initValue) {
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
            currentNode.setAttribute(name, value);
          }
          if (_isClobbered(currentNode)) {
            _forceRemove(currentNode);
          } else {
            arrayPop(DOMPurify.removed);
          }
        } catch (_) {
          _removeAttribute(name, currentNode);
        }
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
  };
  /**
   * _sanitizeShadowDOM
   *
   * @param fragment to iterate over recursively
   */
  const _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    let shadowNode = null;
    const shadowIterator = _createNodeIterator(fragment);
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
    while (shadowNode = shadowIterator.nextNode()) {
      /* Execute a hook if present */
      _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
      /* Sanitize tags and elements */
      _sanitizeElements(shadowNode);
      /* Check attributes next */
      _sanitizeAttributes(shadowNode);
      /* Deep shadow DOM detected */
      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
  };
  // eslint-disable-next-line complexity
  DOMPurify.sanitize = function (dirty) {
    let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let body = null;
    let importedNode = null;
    let currentNode = null;
    let returnNode = null;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */
    IS_EMPTY_INPUT = !dirty;
    if (IS_EMPTY_INPUT) {
      dirty = '<!-->';
    }
    /* Stringify, in case dirty is an object */
    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      if (typeof dirty.toString === 'function') {
        dirty = dirty.toString();
        if (typeof dirty !== 'string') {
          throw typeErrorCreate('dirty is not a string, aborting');
        }
      } else {
        throw typeErrorCreate('toString is not a function');
      }
    }
    /* Return dirty HTML if DOMPurify cannot run */
    if (!DOMPurify.isSupported) {
      return dirty;
    }
    /* Assign config vars */
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }
    /* Clean up removed elements */
    DOMPurify.removed = [];
    /* Check if dirty is correctly typed for IN_PLACE */
    if (typeof dirty === 'string') {
      IN_PLACE = false;
    }
    if (IN_PLACE) {
      /* Do some early pre-sanitization to avoid unsafe root nodes */
      if (dirty.nodeName) {
        const tagName = transformCaseFunc(dirty.nodeName);
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
        }
      }
    } else if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!---->');
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else if (importedNode.nodeName === 'HTML') {
        body = importedNode;
      } else {
        // eslint-disable-next-line unicorn/prefer-dom-node-append
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
      // eslint-disable-next-line unicorn/prefer-includes
      dirty.indexOf('<') === -1) {
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }
      /* Initialize the document to work on */
      body = _initDocument(dirty);
      /* Check we have a DOM node from the data */
      if (!body) {
        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
      }
    }
    /* Remove first element node (ours) if FORCE_BODY is set */
    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }
    /* Get node iterator */
    const nodeIterator = _createNodeIterator(IN_PLACE ? dirty : body);
    /* Now start iterating over the created document */
    while (currentNode = nodeIterator.nextNode()) {
      /* Sanitize tags and elements */
      _sanitizeElements(currentNode);
      /* Check attributes next */
      _sanitizeAttributes(currentNode);
      /* Shadow DOM detected, sanitize it */
      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }
    }
    /* If we sanitized `dirty` in-place, return it. */
    if (IN_PLACE) {
      return dirty;
    }
    /* Return sanitized string or DOM */
    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);
        while (body.firstChild) {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }
      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
        /*
          AdoptNode() is not used because internal state is not reset
          (e.g. the past names map of a HTMLFormElement), this is safe
          in theory but we would rather not risk another attack vector.
          The state that is cloned by importNode() is explicitly defined
          by the specs.
        */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }
      return returnNode;
    }
    let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    /* Serialize doctype if allowed */
    if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
      serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
    }
    /* Sanitize final string template-safe */
    if (SAFE_FOR_TEMPLATES) {
      arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
        serializedHTML = stringReplace(serializedHTML, expr, ' ');
      });
    }
    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };
  DOMPurify.setConfig = function () {
    let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _parseConfig(cfg);
    SET_CONFIG = true;
  };
  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
  };
  DOMPurify.isValidAttribute = function (tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }
    const lcTag = transformCaseFunc(tag);
    const lcName = transformCaseFunc(attr);
    return _isValidAttribute(lcTag, lcName, value);
  };
  DOMPurify.addHook = function (entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }
    arrayPush(hooks[entryPoint], hookFunction);
  };
  DOMPurify.removeHook = function (entryPoint, hookFunction) {
    if (hookFunction !== undefined) {
      const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
      return index === -1 ? undefined : arraySplice(hooks[entryPoint], index, 1)[0];
    }
    return arrayPop(hooks[entryPoint]);
  };
  DOMPurify.removeHooks = function (entryPoint) {
    hooks[entryPoint] = [];
  };
  DOMPurify.removeAllHooks = function () {
    hooks = _createHooksMap();
  };
  return DOMPurify;
}
var purify = createDOMPurify();


//# sourceMappingURL=purify.es.mjs.map


/***/ },

/***/ "../../node_modules/marked/lib/marked.esm.js"
/*!***************************************************!*\
  !*** ../../node_modules/marked/lib/marked.esm.js ***!
  \***************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Hooks: () => (/* binding */ P),
/* harmony export */   Lexer: () => (/* binding */ x),
/* harmony export */   Marked: () => (/* binding */ D),
/* harmony export */   Parser: () => (/* binding */ b),
/* harmony export */   Renderer: () => (/* binding */ y),
/* harmony export */   TextRenderer: () => (/* binding */ $),
/* harmony export */   Tokenizer: () => (/* binding */ w),
/* harmony export */   defaults: () => (/* binding */ T),
/* harmony export */   getDefaults: () => (/* binding */ M),
/* harmony export */   lexer: () => (/* binding */ Jt),
/* harmony export */   marked: () => (/* binding */ g),
/* harmony export */   options: () => (/* binding */ Qt),
/* harmony export */   parse: () => (/* binding */ Wt),
/* harmony export */   parseInline: () => (/* binding */ Kt),
/* harmony export */   parser: () => (/* binding */ Xt),
/* harmony export */   setOptions: () => (/* binding */ jt),
/* harmony export */   use: () => (/* binding */ Ft),
/* harmony export */   walkTokens: () => (/* binding */ Ut)
/* harmony export */ });
/**
 * marked v17.0.5 - a markdown parser
 * Copyright (c) 2018-2026, MarkedJS. (MIT License)
 * Copyright (c) 2011-2018, Christopher Jeffrey. (MIT License)
 * https://github.com/markedjs/marked
 */

/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */

function M(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var T=M();function G(u){T=u}var _={exec:()=>null};function k(u,e=""){let t=typeof u=="string"?u:u.source,n={replace:(r,i)=>{let s=typeof i=="string"?i:i.source;return s=s.replace(m.caret,"$1"),t=t.replace(r,s),n},getRegex:()=>new RegExp(t,e)};return n}var be=(()=>{try{return!!new RegExp("(?<=1)(?<!1)")}catch{return!1}})(),m={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:u=>new RegExp(`^( {0,3}${u})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:u=>new RegExp(`^ {0,${Math.min(3,u-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:u=>new RegExp(`^ {0,${Math.min(3,u-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:u=>new RegExp(`^ {0,${Math.min(3,u-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:u=>new RegExp(`^ {0,${Math.min(3,u-1)}}#`),htmlBeginRegex:u=>new RegExp(`^ {0,${Math.min(3,u-1)}}<(?:[a-z].*>|!--)`,"i"),blockquoteBeginRegex:u=>new RegExp(`^ {0,${Math.min(3,u-1)}}>`)},Re=/^(?:[ \t]*(?:\n|$))+/,Te=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Oe=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,C=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,we=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Q=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,se=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,ie=k(se).replace(/bull/g,Q).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),ye=k(se).replace(/bull/g,Q).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),j=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Pe=/^[^\n]+/,F=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,Se=k(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",F).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),$e=k(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Q).getRegex(),v="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",U=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,_e=k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",U).replace("tag",v).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),oe=k(j).replace("hr",C).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",v).getRegex(),Le=k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",oe).getRegex(),K={blockquote:Le,code:Te,def:Se,fences:Oe,heading:we,hr:C,html:_e,lheading:ie,list:$e,newline:Re,paragraph:oe,table:_,text:Pe},ne=k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",C).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",v).getRegex(),Me={...K,lheading:ye,table:ne,paragraph:k(j).replace("hr",C).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",ne).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",v).getRegex()},ze={...K,html:k(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",U).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:_,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:k(j).replace("hr",C).replace("heading",` *#{1,6} *[^
]`).replace("lheading",ie).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Ee=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Ie=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,ae=/^( {2,}|\\)\n(?!\s*$)/,Ae=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,z=/[\p{P}\p{S}]/u,H=/[\s\p{P}\p{S}]/u,W=/[^\s\p{P}\p{S}]/u,Ce=k(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,H).getRegex(),le=/(?!~)[\p{P}\p{S}]/u,Be=/(?!~)[\s\p{P}\p{S}]/u,De=/(?:[^\s\p{P}\p{S}]|~)/u,qe=k(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",be?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),ue=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,ve=k(ue,"u").replace(/punct/g,z).getRegex(),He=k(ue,"u").replace(/punct/g,le).getRegex(),pe="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",Ze=k(pe,"gu").replace(/notPunctSpace/g,W).replace(/punctSpace/g,H).replace(/punct/g,z).getRegex(),Ge=k(pe,"gu").replace(/notPunctSpace/g,De).replace(/punctSpace/g,Be).replace(/punct/g,le).getRegex(),Ne=k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,W).replace(/punctSpace/g,H).replace(/punct/g,z).getRegex(),Qe=k(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,z).getRegex(),je="^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",Fe=k(je,"gu").replace(/notPunctSpace/g,W).replace(/punctSpace/g,H).replace(/punct/g,z).getRegex(),Ue=k(/\\(punct)/,"gu").replace(/punct/g,z).getRegex(),Ke=k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),We=k(U).replace("(?:-->|$)","-->").getRegex(),Xe=k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",We).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),q=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/,Je=k(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label",q).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),ce=k(/^!?\[(label)\]\[(ref)\]/).replace("label",q).replace("ref",F).getRegex(),he=k(/^!?\[(ref)\](?:\[\])?/).replace("ref",F).getRegex(),Ve=k("reflink|nolink(?!\\()","g").replace("reflink",ce).replace("nolink",he).getRegex(),re=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,X={_backpedal:_,anyPunctuation:Ue,autolink:Ke,blockSkip:qe,br:ae,code:Ie,del:_,delLDelim:_,delRDelim:_,emStrongLDelim:ve,emStrongRDelimAst:Ze,emStrongRDelimUnd:Ne,escape:Ee,link:Je,nolink:he,punctuation:Ce,reflink:ce,reflinkSearch:Ve,tag:Xe,text:Ae,url:_},Ye={...X,link:k(/^!?\[(label)\]\((.*?)\)/).replace("label",q).getRegex(),reflink:k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",q).getRegex()},N={...X,emStrongRDelimAst:Ge,emStrongLDelim:He,delLDelim:Qe,delRDelim:Fe,url:k(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",re).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:k(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",re).getRegex()},et={...N,br:k(ae).replace("{2,}","*").getRegex(),text:k(N.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},B={normal:K,gfm:Me,pedantic:ze},E={normal:X,gfm:N,breaks:et,pedantic:Ye};var tt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ke=u=>tt[u];function O(u,e){if(e){if(m.escapeTest.test(u))return u.replace(m.escapeReplace,ke)}else if(m.escapeTestNoEncode.test(u))return u.replace(m.escapeReplaceNoEncode,ke);return u}function J(u){try{u=encodeURI(u).replace(m.percentDecode,"%")}catch{return null}return u}function V(u,e){let t=u.replace(m.findPipe,(i,s,a)=>{let o=!1,l=s;for(;--l>=0&&a[l]==="\\";)o=!o;return o?"|":" |"}),n=t.split(m.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;r<n.length;r++)n[r]=n[r].trim().replace(m.slashPipe,"|");return n}function I(u,e,t){let n=u.length;if(n===0)return"";let r=0;for(;r<n;){let i=u.charAt(n-r-1);if(i===e&&!t)r++;else if(i!==e&&t)r++;else break}return u.slice(0,n-r)}function de(u,e){if(u.indexOf(e[1])===-1)return-1;let t=0;for(let n=0;n<u.length;n++)if(u[n]==="\\")n++;else if(u[n]===e[0])t++;else if(u[n]===e[1]&&(t--,t<0))return n;return t>0?-2:-1}function ge(u,e=0){let t=e,n="";for(let r of u)if(r==="	"){let i=4-t%4;n+=" ".repeat(i),t+=i}else n+=r,t++;return n}function fe(u,e,t,n,r){let i=e.href,s=e.title||null,a=u[1].replace(r.other.outputLinkReplace,"$1");n.state.inLink=!0;let o={type:u[0].charAt(0)==="!"?"image":"link",raw:t,href:i,title:s,text:a,tokens:n.inlineTokens(a)};return n.state.inLink=!1,o}function nt(u,e,t){let n=u.match(t.other.indentCodeCompensation);if(n===null)return e;let r=n[1];return e.split(`
`).map(i=>{let s=i.match(t.other.beginningSpace);if(s===null)return i;let[a]=s;return a.length>=r.length?i.slice(r.length):i}).join(`
`)}var w=class{options;rules;lexer;constructor(e){this.options=e||T}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let n=t[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?n:I(n,`
`)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let n=t[0],r=nt(n,t[3]||"",this.rules);return{type:"code",raw:n,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:r}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let n=t[2].trim();if(this.rules.other.endingHash.test(n)){let r=I(n,"#");(this.options.pedantic||!r||this.rules.other.endingSpaceChar.test(r))&&(n=r.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:I(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let n=I(t[0],`
`).split(`
`),r="",i="",s=[];for(;n.length>0;){let a=!1,o=[],l;for(l=0;l<n.length;l++)if(this.rules.other.blockquoteStart.test(n[l]))o.push(n[l]),a=!0;else if(!a)o.push(n[l]);else break;n=n.slice(l);let p=o.join(`
`),c=p.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");r=r?`${r}
${p}`:p,i=i?`${i}
${c}`:c;let d=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(c,s,!0),this.lexer.state.top=d,n.length===0)break;let h=s.at(-1);if(h?.type==="code")break;if(h?.type==="blockquote"){let R=h,f=R.raw+`
`+n.join(`
`),S=this.blockquote(f);s[s.length-1]=S,r=r.substring(0,r.length-R.raw.length)+S.raw,i=i.substring(0,i.length-R.text.length)+S.text;break}else if(h?.type==="list"){let R=h,f=R.raw+`
`+n.join(`
`),S=this.list(f);s[s.length-1]=S,r=r.substring(0,r.length-h.raw.length)+S.raw,i=i.substring(0,i.length-R.raw.length)+S.raw,n=f.substring(s.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:r,tokens:s,text:i}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim(),r=n.length>1,i={type:"list",raw:"",ordered:r,start:r?+n.slice(0,-1):"",loose:!1,items:[]};n=r?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=r?n:"[*+-]");let s=this.rules.other.listItemRegex(n),a=!1;for(;e;){let l=!1,p="",c="";if(!(t=s.exec(e))||this.rules.block.hr.test(e))break;p=t[0],e=e.substring(p.length);let d=ge(t[2].split(`
`,1)[0],t[1].length),h=e.split(`
`,1)[0],R=!d.trim(),f=0;if(this.options.pedantic?(f=2,c=d.trimStart()):R?f=t[1].length+1:(f=d.search(this.rules.other.nonSpaceChar),f=f>4?1:f,c=d.slice(f),f+=t[1].length),R&&this.rules.other.blankLine.test(h)&&(p+=h+`
`,e=e.substring(h.length+1),l=!0),!l){let S=this.rules.other.nextBulletRegex(f),Y=this.rules.other.hrRegex(f),ee=this.rules.other.fencesBeginRegex(f),te=this.rules.other.headingBeginRegex(f),me=this.rules.other.htmlBeginRegex(f),xe=this.rules.other.blockquoteBeginRegex(f);for(;e;){let Z=e.split(`
`,1)[0],A;if(h=Z,this.options.pedantic?(h=h.replace(this.rules.other.listReplaceNesting,"  "),A=h):A=h.replace(this.rules.other.tabCharGlobal,"    "),ee.test(h)||te.test(h)||me.test(h)||xe.test(h)||S.test(h)||Y.test(h))break;if(A.search(this.rules.other.nonSpaceChar)>=f||!h.trim())c+=`
`+A.slice(f);else{if(R||d.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||ee.test(d)||te.test(d)||Y.test(d))break;c+=`
`+h}R=!h.trim(),p+=Z+`
`,e=e.substring(Z.length+1),d=A.slice(f)}}i.loose||(a?i.loose=!0:this.rules.other.doubleBlankLine.test(p)&&(a=!0)),i.items.push({type:"list_item",raw:p,task:!!this.options.gfm&&this.rules.other.listIsTask.test(c),loose:!1,text:c,tokens:[]}),i.raw+=p}let o=i.items.at(-1);if(o)o.raw=o.raw.trimEnd(),o.text=o.text.trimEnd();else return;i.raw=i.raw.trimEnd();for(let l of i.items){if(this.lexer.state.top=!1,l.tokens=this.lexer.blockTokens(l.text,[]),l.task){if(l.text=l.text.replace(this.rules.other.listReplaceTask,""),l.tokens[0]?.type==="text"||l.tokens[0]?.type==="paragraph"){l.tokens[0].raw=l.tokens[0].raw.replace(this.rules.other.listReplaceTask,""),l.tokens[0].text=l.tokens[0].text.replace(this.rules.other.listReplaceTask,"");for(let c=this.lexer.inlineQueue.length-1;c>=0;c--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[c].src)){this.lexer.inlineQueue[c].src=this.lexer.inlineQueue[c].src.replace(this.rules.other.listReplaceTask,"");break}}let p=this.rules.other.listTaskCheckbox.exec(l.raw);if(p){let c={type:"checkbox",raw:p[0]+" ",checked:p[0]!=="[ ]"};l.checked=c.checked,i.loose?l.tokens[0]&&["paragraph","text"].includes(l.tokens[0].type)&&"tokens"in l.tokens[0]&&l.tokens[0].tokens?(l.tokens[0].raw=c.raw+l.tokens[0].raw,l.tokens[0].text=c.raw+l.tokens[0].text,l.tokens[0].tokens.unshift(c)):l.tokens.unshift({type:"paragraph",raw:c.raw,text:c.raw,tokens:[c]}):l.tokens.unshift(c)}}if(!i.loose){let p=l.tokens.filter(d=>d.type==="space"),c=p.length>0&&p.some(d=>this.rules.other.anyLine.test(d.raw));i.loose=c}}if(i.loose)for(let l of i.items){l.loose=!0;for(let p of l.tokens)p.type==="text"&&(p.type="paragraph")}return i}}html(e){let t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){let t=this.rules.block.def.exec(e);if(t){let n=t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),r=t[2]?t[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:n,raw:t[0],href:r,title:i}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=V(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,"").split("|"),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],s={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===r.length){for(let a of r)this.rules.other.tableAlignRight.test(a)?s.align.push("right"):this.rules.other.tableAlignCenter.test(a)?s.align.push("center"):this.rules.other.tableAlignLeft.test(a)?s.align.push("left"):s.align.push(null);for(let a=0;a<n.length;a++)s.header.push({text:n[a],tokens:this.lexer.inline(n[a]),header:!0,align:s.align[a]});for(let a of i)s.rows.push(V(a,s.header.length).map((o,l)=>({text:o,tokens:this.lexer.inline(o),header:!1,align:s.align[l]})));return s}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t){let n=t[1].trim();return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:n,tokens:this.lexer.inline(n)}}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let n=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:n,tokens:this.lexer.inline(n)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){let t=this.rules.inline.link.exec(e);if(t){let n=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(n)){if(!this.rules.other.endAngleBracket.test(n))return;let s=I(n.slice(0,-1),"\\");if((n.length-s.length)%2===0)return}else{let s=de(t[2],"()");if(s===-2)return;if(s>-1){let o=(t[0].indexOf("!")===0?5:4)+t[1].length+s;t[2]=t[2].substring(0,s),t[0]=t[0].substring(0,o).trim(),t[3]=""}}let r=t[2],i="";if(this.options.pedantic){let s=this.rules.other.pedanticHrefTitle.exec(r);s&&(r=s[1],i=s[3])}else i=t[3]?t[3].slice(1,-1):"";return r=r.trim(),this.rules.other.startAngleBracket.test(r)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(n)?r=r.slice(1):r=r.slice(1,-1)),fe(t,{href:r&&r.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let r=(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal," "),i=t[r.toLowerCase()];if(!i){let s=n[0].charAt(0);return{type:"text",raw:s,text:s}}return fe(n,i,n[0],this.lexer,this.rules)}}emStrong(e,t,n=""){let r=this.rules.inline.emStrongLDelim.exec(e);if(!r||!r[1]&&!r[2]&&!r[3]&&!r[4]||r[4]&&n.match(this.rules.other.unicodeAlphaNumeric))return;if(!(r[1]||r[3]||"")||!n||this.rules.inline.punctuation.exec(n)){let s=[...r[0]].length-1,a,o,l=s,p=0,c=r[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(c.lastIndex=0,t=t.slice(-1*e.length+s);(r=c.exec(t))!=null;){if(a=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!a)continue;if(o=[...a].length,r[3]||r[4]){l+=o;continue}else if((r[5]||r[6])&&s%3&&!((s+o)%3)){p+=o;continue}if(l-=o,l>0)continue;o=Math.min(o,o+l+p);let d=[...r[0]][0].length,h=e.slice(0,s+r.index+d+o);if(Math.min(s,o)%2){let f=h.slice(1,-1);return{type:"em",raw:h,text:f,tokens:this.lexer.inlineTokens(f)}}let R=h.slice(2,-2);return{type:"strong",raw:h,text:R,tokens:this.lexer.inlineTokens(R)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let n=t[2].replace(this.rules.other.newLineCharGlobal," "),r=this.rules.other.nonSpaceChar.test(n),i=this.rules.other.startingSpaceChar.test(n)&&this.rules.other.endingSpaceChar.test(n);return r&&i&&(n=n.substring(1,n.length-1)),{type:"codespan",raw:t[0],text:n}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e,t,n=""){let r=this.rules.inline.delLDelim.exec(e);if(!r)return;if(!(r[1]||"")||!n||this.rules.inline.punctuation.exec(n)){let s=[...r[0]].length-1,a,o,l=s,p=this.rules.inline.delRDelim;for(p.lastIndex=0,t=t.slice(-1*e.length+s);(r=p.exec(t))!=null;){if(a=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!a||(o=[...a].length,o!==s))continue;if(r[3]||r[4]){l+=o;continue}if(l-=o,l>0)continue;o=Math.min(o,o+l);let c=[...r[0]][0].length,d=e.slice(0,s+r.index+c+o),h=d.slice(s,-s);return{type:"del",raw:d,text:h,tokens:this.lexer.inlineTokens(h)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let n,r;return t[2]==="@"?(n=t[1],r="mailto:"+n):(n=t[1],r=n),{type:"link",raw:t[0],text:n,href:r,tokens:[{type:"text",raw:n,text:n}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let n,r;if(t[2]==="@")n=t[0],r="mailto:"+n;else{let i;do i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(i!==t[0]);n=t[0],t[1]==="www."?r="http://"+t[0]:r=t[0]}return{type:"link",raw:t[0],text:n,href:r,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let n=this.lexer.state.inRawBlock;return{type:"text",raw:t[0],text:t[0],escaped:n}}}};var x=class u{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||T,this.options.tokenizer=this.options.tokenizer||new w,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:m,block:B.normal,inline:E.normal};this.options.pedantic?(t.block=B.pedantic,t.inline=E.pedantic):this.options.gfm&&(t.block=B.gfm,this.options.breaks?t.inline=E.breaks:t.inline=E.gfm),this.tokenizer.rules=t}static get rules(){return{block:B,inline:E}}static lex(e,t){return new u(t).lex(e)}static lexInline(e,t){return new u(t).inlineTokens(e)}lex(e){e=e.replace(m.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let n=this.inlineQueue[t];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){for(this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(m.tabCharGlobal,"    ").replace(m.spaceLine,""));e;){let r;if(this.options.extensions?.block?.some(s=>(r=s.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let s=t.at(-1);r.raw.length===1&&s!==void 0?s.raw+=`
`:t.push(r);continue}if(r=this.tokenizer.code(e)){e=e.substring(r.raw.length);let s=t.at(-1);s?.type==="paragraph"||s?.type==="text"?(s.raw+=(s.raw.endsWith(`
`)?"":`
`)+r.raw,s.text+=`
`+r.text,this.inlineQueue.at(-1).src=s.text):t.push(r);continue}if(r=this.tokenizer.fences(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.heading(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.hr(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.blockquote(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.list(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.html(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.def(e)){e=e.substring(r.raw.length);let s=t.at(-1);s?.type==="paragraph"||s?.type==="text"?(s.raw+=(s.raw.endsWith(`
`)?"":`
`)+r.raw,s.text+=`
`+r.raw,this.inlineQueue.at(-1).src=s.text):this.tokens.links[r.tag]||(this.tokens.links[r.tag]={href:r.href,title:r.title},t.push(r));continue}if(r=this.tokenizer.table(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.lheading(e)){e=e.substring(r.raw.length),t.push(r);continue}let i=e;if(this.options.extensions?.startBlock){let s=1/0,a=e.slice(1),o;this.options.extensions.startBlock.forEach(l=>{o=l.call({lexer:this},a),typeof o=="number"&&o>=0&&(s=Math.min(s,o))}),s<1/0&&s>=0&&(i=e.substring(0,s+1))}if(this.state.top&&(r=this.tokenizer.paragraph(i))){let s=t.at(-1);n&&s?.type==="paragraph"?(s.raw+=(s.raw.endsWith(`
`)?"":`
`)+r.raw,s.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=s.text):t.push(r),n=i.length!==e.length,e=e.substring(r.raw.length);continue}if(r=this.tokenizer.text(e)){e=e.substring(r.raw.length);let s=t.at(-1);s?.type==="text"?(s.raw+=(s.raw.endsWith(`
`)?"":`
`)+r.raw,s.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=s.text):t.push(r);continue}if(e){let s="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(s);break}else throw new Error(s)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let n=e,r=null;if(this.tokens.links){let o=Object.keys(this.tokens.links);if(o.length>0)for(;(r=this.tokenizer.rules.inline.reflinkSearch.exec(n))!=null;)o.includes(r[0].slice(r[0].lastIndexOf("[")+1,-1))&&(n=n.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(r=this.tokenizer.rules.inline.anyPunctuation.exec(n))!=null;)n=n.slice(0,r.index)+"++"+n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let i;for(;(r=this.tokenizer.rules.inline.blockSkip.exec(n))!=null;)i=r[2]?r[2].length:0,n=n.slice(0,r.index+i)+"["+"a".repeat(r[0].length-i-2)+"]"+n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);n=this.options.hooks?.emStrongMask?.call({lexer:this},n)??n;let s=!1,a="";for(;e;){s||(a=""),s=!1;let o;if(this.options.extensions?.inline?.some(p=>(o=p.call({lexer:this},e,t))?(e=e.substring(o.raw.length),t.push(o),!0):!1))continue;if(o=this.tokenizer.escape(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.tag(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.link(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let p=t.at(-1);o.type==="text"&&p?.type==="text"?(p.raw+=o.raw,p.text+=o.text):t.push(o);continue}if(o=this.tokenizer.emStrong(e,n,a)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.codespan(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.br(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.del(e,n,a)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.autolink(e)){e=e.substring(o.raw.length),t.push(o);continue}if(!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),t.push(o);continue}let l=e;if(this.options.extensions?.startInline){let p=1/0,c=e.slice(1),d;this.options.extensions.startInline.forEach(h=>{d=h.call({lexer:this},c),typeof d=="number"&&d>=0&&(p=Math.min(p,d))}),p<1/0&&p>=0&&(l=e.substring(0,p+1))}if(o=this.tokenizer.inlineText(l)){e=e.substring(o.raw.length),o.raw.slice(-1)!=="_"&&(a=o.raw.slice(-1)),s=!0;let p=t.at(-1);p?.type==="text"?(p.raw+=o.raw,p.text+=o.text):t.push(o);continue}if(e){let p="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(p);break}else throw new Error(p)}}return t}};var y=class{options;parser;constructor(e){this.options=e||T}space(e){return""}code({text:e,lang:t,escaped:n}){let r=(t||"").match(m.notSpaceStart)?.[0],i=e.replace(m.endingNewline,"")+`
`;return r?'<pre><code class="language-'+O(r)+'">'+(n?i:O(i,!0))+`</code></pre>
`:"<pre><code>"+(n?i:O(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}def(e){return""}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){let t=e.ordered,n=e.start,r="";for(let a=0;a<e.items.length;a++){let o=e.items[a];r+=this.listitem(o)}let i=t?"ol":"ul",s=t&&n!==1?' start="'+n+'"':"";return"<"+i+s+`>
`+r+"</"+i+`>
`}listitem(e){return`<li>${this.parser.parse(e.tokens)}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",n="";for(let i=0;i<e.header.length;i++)n+=this.tablecell(e.header[i]);t+=this.tablerow({text:n});let r="";for(let i=0;i<e.rows.length;i++){let s=e.rows[i];n="";for(let a=0;a<s.length;a++)n+=this.tablecell(s[a]);r+=this.tablerow({text:n})}return r&&(r=`<tbody>${r}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+r+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let t=this.parser.parseInline(e.tokens),n=e.header?"th":"td";return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${O(e,!0)}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){let r=this.parser.parseInline(n),i=J(e);if(i===null)return r;e=i;let s='<a href="'+e+'"';return t&&(s+=' title="'+O(t)+'"'),s+=">"+r+"</a>",s}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=J(e);if(i===null)return O(n);e=i;let s=`<img src="${e}" alt="${O(n)}"`;return t&&(s+=` title="${O(t)}"`),s+=">",s}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):"escaped"in e&&e.escaped?e.text:O(e.text)}};var $=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}checkbox({raw:e}){return e}};var b=class u{options;renderer;textRenderer;constructor(e){this.options=e||T,this.options.renderer=this.options.renderer||new y,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new $}static parse(e,t){return new u(t).parse(e)}static parseInline(e,t){return new u(t).parseInline(e)}parse(e){this.renderer.parser=this;let t="";for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let s=r,a=this.options.extensions.renderers[s.type].call({parser:this},s);if(a!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(s.type)){t+=a||"";continue}}let i=r;switch(i.type){case"space":{t+=this.renderer.space(i);break}case"hr":{t+=this.renderer.hr(i);break}case"heading":{t+=this.renderer.heading(i);break}case"code":{t+=this.renderer.code(i);break}case"table":{t+=this.renderer.table(i);break}case"blockquote":{t+=this.renderer.blockquote(i);break}case"list":{t+=this.renderer.list(i);break}case"checkbox":{t+=this.renderer.checkbox(i);break}case"html":{t+=this.renderer.html(i);break}case"def":{t+=this.renderer.def(i);break}case"paragraph":{t+=this.renderer.paragraph(i);break}case"text":{t+=this.renderer.text(i);break}default:{let s='Token with "'+i.type+'" type was not found.';if(this.options.silent)return console.error(s),"";throw new Error(s)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let n="";for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let a=this.options.extensions.renderers[i.type].call({parser:this},i);if(a!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){n+=a||"";continue}}let s=i;switch(s.type){case"escape":{n+=t.text(s);break}case"html":{n+=t.html(s);break}case"link":{n+=t.link(s);break}case"image":{n+=t.image(s);break}case"checkbox":{n+=t.checkbox(s);break}case"strong":{n+=t.strong(s);break}case"em":{n+=t.em(s);break}case"codespan":{n+=t.codespan(s);break}case"br":{n+=t.br(s);break}case"del":{n+=t.del(s);break}case"text":{n+=t.text(s);break}default:{let a='Token with "'+s.type+'" type was not found.';if(this.options.silent)return console.error(a),"";throw new Error(a)}}}return n}};var P=class{options;block;constructor(e){this.options=e||T}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens","emStrongMask"]);static passThroughHooksRespectAsync=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(){return this.block?x.lex:x.lexInline}provideParser(){return this.block?b.parse:b.parseInline}};var D=class{defaults=M();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=b;Renderer=y;TextRenderer=$;Lexer=x;Tokenizer=w;Hooks=P;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(n=n.concat(t.call(this,r)),r.type){case"table":{let i=r;for(let s of i.header)n=n.concat(this.walkTokens(s.tokens,t));for(let s of i.rows)for(let a of s)n=n.concat(this.walkTokens(a.tokens,t));break}case"list":{let i=r;n=n.concat(this.walkTokens(i.items,t));break}default:{let i=r;this.defaults.extensions?.childTokens?.[i.type]?this.defaults.extensions.childTokens[i.type].forEach(s=>{let a=i[s].flat(1/0);n=n.concat(this.walkTokens(a,t))}):i.tokens&&(n=n.concat(this.walkTokens(i.tokens,t)))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(n=>{let r={...n};if(r.async=this.defaults.async||r.async||!1,n.extensions&&(n.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){let s=t.renderers[i.name];s?t.renderers[i.name]=function(...a){let o=i.renderer.apply(this,a);return o===!1&&(o=s.apply(this,a)),o}:t.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let s=t[i.level];s?s.unshift(i.tokenizer):t[i.level]=[i.tokenizer],i.start&&(i.level==="block"?t.startBlock?t.startBlock.push(i.start):t.startBlock=[i.start]:i.level==="inline"&&(t.startInline?t.startInline.push(i.start):t.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(t.childTokens[i.name]=i.childTokens)}),r.extensions=t),n.renderer){let i=this.defaults.renderer||new y(this.defaults);for(let s in n.renderer){if(!(s in i))throw new Error(`renderer '${s}' does not exist`);if(["options","parser"].includes(s))continue;let a=s,o=n.renderer[a],l=i[a];i[a]=(...p)=>{let c=o.apply(i,p);return c===!1&&(c=l.apply(i,p)),c||""}}r.renderer=i}if(n.tokenizer){let i=this.defaults.tokenizer||new w(this.defaults);for(let s in n.tokenizer){if(!(s in i))throw new Error(`tokenizer '${s}' does not exist`);if(["options","rules","lexer"].includes(s))continue;let a=s,o=n.tokenizer[a],l=i[a];i[a]=(...p)=>{let c=o.apply(i,p);return c===!1&&(c=l.apply(i,p)),c}}r.tokenizer=i}if(n.hooks){let i=this.defaults.hooks||new P;for(let s in n.hooks){if(!(s in i))throw new Error(`hook '${s}' does not exist`);if(["options","block"].includes(s))continue;let a=s,o=n.hooks[a],l=i[a];P.passThroughHooks.has(s)?i[a]=p=>{if(this.defaults.async&&P.passThroughHooksRespectAsync.has(s))return(async()=>{let d=await o.call(i,p);return l.call(i,d)})();let c=o.call(i,p);return l.call(i,c)}:i[a]=(...p)=>{if(this.defaults.async)return(async()=>{let d=await o.apply(i,p);return d===!1&&(d=await l.apply(i,p)),d})();let c=o.apply(i,p);return c===!1&&(c=l.apply(i,p)),c}}r.hooks=i}if(n.walkTokens){let i=this.defaults.walkTokens,s=n.walkTokens;r.walkTokens=function(a){let o=[];return o.push(s.call(this,a)),i&&(o=o.concat(i.call(this,a))),o}}this.defaults={...this.defaults,...r}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return x.lex(e,t??this.defaults)}parser(e,t){return b.parse(e,t??this.defaults)}parseMarkdown(e){return(n,r)=>{let i={...r},s={...this.defaults,...i},a=this.onError(!!s.silent,!!s.async);if(this.defaults.async===!0&&i.async===!1)return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof n>"u"||n===null)return a(new Error("marked(): input parameter is undefined or null"));if(typeof n!="string")return a(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(s.hooks&&(s.hooks.options=s,s.hooks.block=e),s.async)return(async()=>{let o=s.hooks?await s.hooks.preprocess(n):n,p=await(s.hooks?await s.hooks.provideLexer():e?x.lex:x.lexInline)(o,s),c=s.hooks?await s.hooks.processAllTokens(p):p;s.walkTokens&&await Promise.all(this.walkTokens(c,s.walkTokens));let h=await(s.hooks?await s.hooks.provideParser():e?b.parse:b.parseInline)(c,s);return s.hooks?await s.hooks.postprocess(h):h})().catch(a);try{s.hooks&&(n=s.hooks.preprocess(n));let l=(s.hooks?s.hooks.provideLexer():e?x.lex:x.lexInline)(n,s);s.hooks&&(l=s.hooks.processAllTokens(l)),s.walkTokens&&this.walkTokens(l,s.walkTokens);let c=(s.hooks?s.hooks.provideParser():e?b.parse:b.parseInline)(l,s);return s.hooks&&(c=s.hooks.postprocess(c)),c}catch(o){return a(o)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let r="<p>An error occurred:</p><pre>"+O(n.message+"",!0)+"</pre>";return t?Promise.resolve(r):r}if(t)return Promise.reject(n);throw n}}};var L=new D;function g(u,e){return L.parse(u,e)}g.options=g.setOptions=function(u){return L.setOptions(u),g.defaults=L.defaults,G(g.defaults),g};g.getDefaults=M;g.defaults=T;g.use=function(...u){return L.use(...u),g.defaults=L.defaults,G(g.defaults),g};g.walkTokens=function(u,e){return L.walkTokens(u,e)};g.parseInline=L.parseInline;g.Parser=b;g.parser=b.parse;g.Renderer=y;g.TextRenderer=$;g.Lexer=x;g.lexer=x.lex;g.Tokenizer=w;g.Hooks=P;g.parse=g;var Qt=g.options,jt=g.setOptions,Ft=g.use,Ut=g.walkTokens,Kt=g.parseInline,Wt=g,Xt=b.parse,Jt=x.lex;
//# sourceMappingURL=marked.esm.js.map


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var hasSymbol = typeof Symbol === "function";
/******/ 		var webpackQueues = hasSymbol ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = hasSymbol ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = hasSymbol ? Symbol("webpack error") : "__webpack_error__";
/******/ 		
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 		
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 		
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			var handle = (deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 		
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}
/******/ 			var done = (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue))
/******/ 			body(handle, done);
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/ts/main.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=bundle.js.map