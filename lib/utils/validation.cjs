/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

class Validator {
  /**
   * 验证单个值
   */
  static validate(value, rules) {
    const errors = [];
    if (rules.required && (value === null || value === void 0 || value === "")) {
      errors.push(rules.message || "Value is required");
      return { valid: false, errors };
    }
    if (value === null || value === void 0) {
      return { valid: true, errors: [] };
    }
    if (rules.type) {
      const actualType = Array.isArray(value) ? "array" : typeof value;
      if (actualType !== rules.type) {
        errors.push(rules.message || `Expected type ${rules.type}, got ${actualType}`);
      }
    }
    if (typeof value === "number") {
      if (rules.min !== void 0 && value < rules.min) {
        errors.push(rules.message || `Value must be at least ${rules.min}`);
      }
      if (rules.max !== void 0 && value > rules.max) {
        errors.push(rules.message || `Value must be at most ${rules.max}`);
      }
    }
    if (typeof value === "string") {
      if (rules.min !== void 0 && value.length < rules.min) {
        errors.push(rules.message || `Length must be at least ${rules.min}`);
      }
      if (rules.max !== void 0 && value.length > rules.max) {
        errors.push(rules.message || `Length must be at most ${rules.max}`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.message || `Value does not match required pattern`);
      }
    }
    if (Array.isArray(value)) {
      if (rules.min !== void 0 && value.length < rules.min) {
        errors.push(rules.message || `Array length must be at least ${rules.min}`);
      }
      if (rules.max !== void 0 && value.length > rules.max) {
        errors.push(rules.message || `Array length must be at most ${rules.max}`);
      }
    }
    if (rules.custom) {
      const result = rules.custom(value);
      if (result === false) {
        errors.push(rules.message || "Custom validation failed");
      } else if (typeof result === "string") {
        errors.push(result);
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * 验证对象
   */
  static validateObject(obj, schema) {
    const errors = [];
    for (const key in schema) {
      const value = obj[key];
      const rules = schema[key];
      const result = this.validate(value, rules);
      if (!result.valid) {
        errors.push(...result.errors.map((err) => `${String(key)}: ${err}`));
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * 断言验证（验证失败抛出异常）
   */
  static assert(value, rules, errorPrefix = "Validation failed") {
    const result = this.validate(value, rules);
    if (!result.valid) {
      throw new ValidationError(`${errorPrefix}: ${result.errors.join(", ")}`);
    }
  }
  /**
   * 断言对象验证
   */
  static assertObject(obj, schema, errorPrefix = "Object validation failed") {
    const result = this.validateObject(obj, schema);
    if (!result.valid) {
      throw new ValidationError(`${errorPrefix}: ${result.errors.join(", ")}`);
    }
  }
}
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}
class StoreConfigValidator {
  /**
   * 验证 Store ID
   */
  static validateStoreId(id) {
    Validator.assert(id, {
      required: true,
      type: "string",
      min: 1,
      max: 100,
      pattern: /^[a-z][\w-]*$/i,
      message: "Store ID must be a valid identifier (alphanumeric, -, _)"
    }, "Invalid Store ID");
  }
  /**
   * 验证缓存配置
   */
  static validateCacheOptions(options) {
    if (options.maxSize !== void 0) {
      Validator.assert(options.maxSize, {
        type: "number",
        min: 1,
        max: 1e5,
        message: "maxSize must be between 1 and 100000"
      }, "Invalid cache config");
    }
    if (options.defaultTTL !== void 0) {
      Validator.assert(options.defaultTTL, {
        type: "number",
        min: 0,
        message: "defaultTTL must be a positive number"
      }, "Invalid cache config");
    }
  }
  /**
   * 验证持久化配置
   */
  static validatePersistOptions(options) {
    if (options.key !== void 0) {
      Validator.assert(options.key, {
        type: "string",
        min: 1,
        max: 200,
        message: "Persist key must be between 1 and 200 characters"
      }, "Invalid persist config");
    }
    if (options.paths !== void 0) {
      Validator.assert(options.paths, {
        type: "array",
        message: "paths must be an array"
      }, "Invalid persist config");
    }
  }
}
class TypeGuards {
  /**
   * 检查是否为对象
   */
  static isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  /**
   * 检查是否为普通对象
   */
  static isPlainObject(value) {
    if (!this.isObject(value))
      return false;
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
  }
  /**
   * 检查是否为空对象
   */
  static isEmptyObject(value) {
    return this.isObject(value) && Object.keys(value).length === 0;
  }
  /**
   * 检查是否为 Promise
   */
  static isPromise(value) {
    return value instanceof Promise || value !== null && typeof value === "object" && typeof value.then === "function";
  }
  /**
   * 检查是否为函数
   */
  static isFunction(value) {
    return typeof value === "function";
  }
  /**
   * 检查是否为异步函数
   */
  static isAsyncFunction(value) {
    return this.isFunction(value) && value.constructor.name === "AsyncFunction";
  }
  /**
   * 检查是否为字符串
   */
  static isString(value) {
    return typeof value === "string";
  }
  /**
   * 检查是否为非空字符串
   */
  static isNonEmptyString(value) {
    return this.isString(value) && value.trim().length > 0;
  }
  /**
   * 检查是否为数字
   */
  static isNumber(value) {
    return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
  }
  /**
   * 检查是否为正整数
   */
  static isPositiveInteger(value) {
    return this.isNumber(value) && value > 0 && Number.isInteger(value);
  }
  /**
   * 检查是否为布尔值
   */
  static isBoolean(value) {
    return typeof value === "boolean";
  }
  /**
   * 检查是否为数组
   */
  static isArray(value) {
    return Array.isArray(value);
  }
  /**
   * 检查是否为非空数组
   */
  static isNonEmptyArray(value) {
    return this.isArray(value) && value.length > 0;
  }
  /**
   * 检查是否为 null 或 undefined
   */
  static isNullOrUndefined(value) {
    return value === null || value === void 0;
  }
  /**
   * 检查是否为有效值（非 null/undefined）
   */
  static isValidValue(value) {
    return !this.isNullOrUndefined(value);
  }
}
class Assert {
  /**
   * 断言条件为真
   */
  static isTrue(condition, message) {
    if (!condition) {
      throw new AssertionError(message);
    }
  }
  /**
   * 断言条件为假
   */
  static isFalse(condition, message) {
    if (condition) {
      throw new AssertionError(message);
    }
  }
  /**
   * 断言值已定义
   */
  static isDefined(value, message = "Value must be defined") {
    if (TypeGuards.isNullOrUndefined(value)) {
      throw new AssertionError(message);
    }
  }
  /**
   * 断言值为对象
   */
  static isObject(value, message = "Value must be an object") {
    if (!TypeGuards.isObject(value)) {
      throw new AssertionError(message);
    }
  }
  /**
   * 断言值为数组
   */
  static isArray(value, message = "Value must be an array") {
    if (!TypeGuards.isArray(value)) {
      throw new AssertionError(message);
    }
  }
  /**
   * 断言值为函数
   */
  static isFunction(value, message = "Value must be a function") {
    if (!TypeGuards.isFunction(value)) {
      throw new AssertionError(message);
    }
  }
  /**
   * 断言值为字符串
   */
  static isString(value, message = "Value must be a string") {
    if (!TypeGuards.isString(value)) {
      throw new AssertionError(message);
    }
  }
  /**
   * 断言值为数字
   */
  static isNumber(value, message = "Value must be a number") {
    if (!TypeGuards.isNumber(value)) {
      throw new AssertionError(message);
    }
  }
  /**
   * 断言值在范围内
   */
  static inRange(value, min, max, message) {
    if (value < min || value > max) {
      throw new AssertionError(message || `Value must be between ${min} and ${max}`);
    }
  }
  /**
   * 断言数组非空
   */
  static notEmpty(array, message = "Array must not be empty") {
    if (!TypeGuards.isNonEmptyArray(array)) {
      throw new AssertionError(message);
    }
  }
}
class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = "AssertionError";
  }
}
class ErrorHandler {
  /**
   * 注册错误处理器
   */
  static register(type, handler) {
    this.handlers.set(type, handler);
  }
  /**
   * 处理错误
   */
  static handle(error, type = "default") {
    const handler = this.handlers.get(type) || this.handlers.get("default");
    if (handler) {
      try {
        handler(error);
      } catch (handlerError) {
        console.error("Error in error handler:", handlerError);
      }
    } else {
      console.error(`Unhandled error (${type}):`, error);
    }
  }
  /**
   * 包装异步函数，自动处理错误
   */
  static wrapAsync(fn, errorType = "default") {
    return (async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error, errorType);
        throw error;
      }
    });
  }
  /**
   * 安全执行（捕获并处理错误）
   */
  static async safeExecute(fn, errorType = "default") {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, errorType);
      return null;
    }
  }
  /**
   * 清除所有处理器
   */
  static clear() {
    this.handlers.clear();
  }
}
ErrorHandler.handlers = /* @__PURE__ */ new Map();
function safeJsonParse(json, defaultValue) {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue !== void 0 ? defaultValue : null;
  }
}
function safeJsonStringify(value, space) {
  try {
    return JSON.stringify(value, null, space);
  } catch {
    return null;
  }
}

exports.Assert = Assert;
exports.AssertionError = AssertionError;
exports.ErrorHandler = ErrorHandler;
exports.StoreConfigValidator = StoreConfigValidator;
exports.TypeGuards = TypeGuards;
exports.ValidationError = ValidationError;
exports.Validator = Validator;
exports.safeJsonParse = safeJsonParse;
exports.safeJsonStringify = safeJsonStringify;
//# sourceMappingURL=validation.cjs.map
