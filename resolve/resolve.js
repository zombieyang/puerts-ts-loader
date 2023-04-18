'use strict';

const ArrayIsArray = Array.isArray;
const JSONParse = JSON.parse;
const JSONStringify = JSON.stringify;
const ObjectGetOwnPropertyNames = Object.getOwnPropertyNames
const ObjectPrototypeHasOwnProperty = (self, ...args) => Object.prototype.hasOwnProperty.apply(self, args)
const RegExpPrototypeExec = (self, ...args) => RegExp.prototype.exec.apply(self, args)
const RegExpPrototypeSymbolReplace = (self, ...args) => RegExp.prototype.SymbolReplace.apply(self, args)
const RegExpPrototypeTest = (self, ...args) => RegExp.prototype.test.apply(self, args)
const SafeMap = Map
const SafeSet = Set
const StringPrototypeIncludes = (self, ...args) => String.prototype.includes.apply(self, args)
const StringPrototypeEndsWith = (self, ...args) => String.prototype.endsWith.apply(self, args)
const StringPrototypeIndexOf = (self, ...args) => String.prototype.indexOf.apply(self, args)
const StringPrototypeLastIndexOf = (self, ...args) => String.prototype.lastIndexOf.apply(self, args)
const StringPrototypeSlice = (self, ...args) => String.prototype.slice.apply(self, args)
const StringPrototypeStartsWith = (self, ...args) => String.prototype.startsWith.apply(self, args)

const { URL, fileURLToPath } = require('./url');
const ERR_INVALID_MODULE_SPECIFIER = function (...args) { return new Error('ERR_INVALID_MODULE_SPECIFIER:' + args.join(' ')) };
const ERR_INVALID_PACKAGE_CONFIG = function (...args) { return new Error('ERR_INVALID_PACKAGE_CONFIG:' + args.join(' ')) };
const ERR_INVALID_PACKAGE_TARGET = function (...args) { return new Error('ERR_INVALID_PACKAGE_TARGET:' + args.join(' ')) };
const ERR_MODULE_NOT_FOUND = function (...args) { return new Error('ERR_MODULE_NOT_FOUND:' + args.join(' ')) };
const ERR_PACKAGE_PATH_NOT_EXPORTED = function (...args) { return new Error('ERR_PACKAGE_PATH_NOT_EXPORTED:' + args.join(' ')) };

/**
 * @typedef {string | string[] | Record<string, unknown>} Exports
 * @typedef {'module' | 'commonjs'} PackageType
 * @typedef {{
 *   pjsonPath: string,
 *   exports?: ExportConfig,
 *   name?: string,
 *   main?: string,
 *   type?: PackageType,
 * }} PackageConfig
 */

const emittedPackageWarnings = new SafeSet();

/**
 * @param {string} match
 * @param {URL} pjsonUrl
 * @param {boolean} isExports
 * @param {string | URL | undefined} base
 * @returns {void}
 */
function emitFolderMapDeprecation(match, pjsonUrl, isExports, base) {
  const pjsonPath = fileURLToPath(pjsonUrl);

  if (emittedPackageWarnings.has(pjsonPath + '|' + match))
    return;
  emittedPackageWarnings.add(pjsonPath + '|' + match);
  process.emitWarning(
    `Use of deprecated folder mapping '${match}' in the ${isExports ?
      `'exports'` : `'imports'`} field module resolution of the package at ${pjsonPath}${base ? ` imported from ${fileURLToPath(base)}` : ''}.\n` +
    `Update this package.json to use a subpath pattern like '${match}*'.`,
    'DeprecationWarning',
    'DEP0148'
  );
}

function emitTrailingSlashPatternDeprecation(match, pjsonUrl, isExports, base) {
  const pjsonPath = fileURLToPath(pjsonUrl);
  if (emittedPackageWarnings.has(pjsonPath + '|' + match))
    return;
  emittedPackageWarnings.add(pjsonPath + '|' + match);
  process.emitWarning(
    `Use of deprecated trailing slash pattern mapping '${match}' in the ${isExports ? `'exports'` : `'imports'`} field module resolution of the ` +
    `package at ${pjsonPath}${base ? ` imported from ${fileURLToPath(base)}` :
      ''}. Mapping specifiers ending in '/' is no longer supported.`,
    'DeprecationWarning',
    'DEP0155'
  );
}

/**
 * @param {URL} url
 * @param {URL} packageJSONUrl
 * @param {string | URL | undefined} base
 * @param {string} main
 * @returns {void}
 */
function emitLegacyIndexDeprecation(url, packageJSONUrl, base, main) {
  const format = defaultGetFormatWithoutErrors(url);
  if (format !== 'module')
    return;
  const path = fileURLToPath(url);
  const pkgPath = fileURLToPath(new URL('.', packageJSONUrl));
  const basePath = fileURLToPath(base);
  if (main)
    process.emitWarning(
      `Package ${pkgPath} has a 'main' field set to ${JSONStringify(main)}, ` +
      `excluding the full filename and extension to the resolved file at '${StringPrototypeSlice(path, pkgPath.length)}', imported from ${basePath}.\n Automatic extension resolution of the 'main' field is ` +
      'deprecated for ES modules.',
      'DeprecationWarning',
      'DEP0151'
    );
  else
    process.emitWarning(
      `No 'main' or 'exports' field defined in the package.json for ${pkgPath
      } resolving the main entry point '${StringPrototypeSlice(path, pkgPath.length)}', imported from ${basePath
      }.\nDefault 'index' lookups for the main are deprecated for ES modules.`,
      'DeprecationWarning',
      'DEP0151'
    );
}

const protocolHandlers = Object.assign(Object.create(null), {
  'file:': getFileProtocolModuleFormat,
  'node:'() { return 'builtin'; },
});
const extensionFormatMap = {
  '__proto__': null,
  '.cjs': 'commonjs',
  '.js': 'module',
  '.json': 'json',
  '.mjs': 'module',
};
const legacyExtensionFormatMap = {
  '__proto__': null,
  '.cjs': 'commonjs',
  '.js': 'commonjs',
  '.json': 'commonjs',
  '.mjs': 'module',
  '.node': 'commonjs',
};
function getLegacyExtensionFormat(ext) {
  return legacyExtensionFormatMap[ext];
}
/**
 * move from get_format.js by zombieyang
 * @param {URL | URL['href']} url
 * @param {{parentURL: string}} context
 * @returns {Promise<string> | string | undefined} only works when enabled
 */
function defaultGetFormatWithoutErrors(url, context) {
  const parsed = new URL(url);
  if (!ObjectPrototypeHasOwnProperty(protocolHandlers, parsed.protocol))
    return null;
  return protocolHandlers[parsed.protocol](parsed, context, true);
}
/**
 * @param {URL} url
 * @returns {PackageType}
 */
function getPackageType(url) {
  const packageConfig = getPackageScopeConfig(url);
  return packageConfig.type;
}
/**
 * @param {URL} url
 * @param {{parentURL: string}} context
 * @param {boolean} ignoreErrors
 * @returns {string}
 */
function getFileProtocolModuleFormat(url, context, ignoreErrors) {
  const filepath = fileURLToPath(url);
  let ext = filepath.split(".").pop();
  if (ext) ext = "." + ext
  // const ext = extname(filepath);
  if (ext === '.js') {
    return getPackageType(url) === 'module' ? 'module' : 'commonjs';
  }

  const format = extensionFormatMap[ext];
  if (format) return format;

  // if (experimentalSpecifierResolution !== 'node') {
  //   // Explicit undefined return indicates load hook should rerun format check
  //   if (ignoreErrors) return undefined;
  //   let suggestion = '';
  //   if (getPackageType(url) === 'module' && ext === '') {
  //     const config = getPackageScopeConfig(url);
  //     const fileBasename = basename(filepath);
  //     const relativePath = StringPrototypeSlice(relative(config.pjsonPath, filepath), 1);
  //     suggestion = 'Loading extensionless files is not supported inside of ' +
  //       '"type":"module" package.json contexts. The package.json file ' +
  //       `${config.pjsonPath} caused this "type":"module" context. Try ` +
  //       `changing ${filepath} to have a file extension. Note the "bin" ` +
  //       'field of package.json can point to a file with an extension, for example ' +
  //       `{"type":"module","bin":{"${fileBasename}":"${relativePath}.js"}}`;
  //   }
  //   throw new ERR_UNKNOWN_FILE_EXTENSION(ext, filepath, suggestion);
  // }

  return getLegacyExtensionFormat(ext) ?? null;
}

const packageJSONCache = new SafeMap(); /* string -> PackageConfig */

/**
 * @param {string} path
 * @param {string} specifier
 * @param {string | URL | undefined} base
 * @returns {PackageConfig}
 */
function getPackageConfig(path, specifier, base) {
  const existing = packageJSONCache.get(path);
  if (existing !== undefined) {
    return existing;
  }
  if (!CS.System.IO.File.Exists(path)) {
    const packageConfig = {
      pjsonPath: path,
      exists: false,
      main: undefined,
      name: undefined,
      type: 'none',
      exports: undefined,
      imports: undefined,
    };
    packageJSONCache.set(path, packageConfig);
    return packageConfig;
  }
  const source = CS.System.IO.File.ReadAllText(path);

  let packageJSON;
  try {
    packageJSON = JSONParse(source);
  } catch (error) {
    throw new ERR_INVALID_PACKAGE_CONFIG(
      path,
      (base ? `'${specifier}' from ` : '') + fileURLToPath(base || specifier),
      error.message
    );
  }

  let { imports, main, name, type } = packageJSON;
  const { exports } = packageJSON;
  if (typeof imports !== 'object' || imports === null) imports = undefined;
  if (typeof main !== 'string') main = undefined;
  if (typeof name !== 'string') name = undefined;
  // Ignore unknown types for forwards compatibility
  if (type !== 'module' && type !== 'commonjs') type = 'none';

  const packageConfig = {
    pjsonPath: path,
    exists: true,
    main,
    name,
    type,
    exports,
    imports,
  };
  packageJSONCache.set(path, packageConfig);
  return packageConfig;
}

/**
 * @param {URL | string} resolved
 * @returns {PackageConfig}
 */
function getPackageScopeConfig(resolved) {
  let packageJSONUrl = new URL('./package.json', resolved);
  while (true) {
    const packageJSONPath = packageJSONUrl.pathname;
    if (StringPrototypeEndsWith(packageJSONPath, 'node_modules/package.json'))
      break;
    const packageConfig = getPackageConfig(fileURLToPath(packageJSONUrl),
      resolved);
    if (packageConfig.exists) return packageConfig;

    const lastPackageJSONUrl = packageJSONUrl;
    packageJSONUrl = new URL('../package.json', packageJSONUrl);

    // Terminates at root where ../package.json equals ../../package.json
    // (can't just check '/package.json' for Windows support).
    if (packageJSONUrl.pathname === lastPackageJSONUrl.pathname) break;
  }
  const packageJSONPath = fileURLToPath(packageJSONUrl);
  const packageConfig = {
    pjsonUrl: packageJSONUrl,
    pjsonPath: packageJSONPath,
    exists: false,
    main: undefined,
    name: undefined,
    type: 'none',
    exports: undefined,
    imports: undefined,
  };
  packageJSONCache.set(packageJSONPath, packageConfig);
  return packageConfig;
}

/**
 * @param {string | URL} url
 * @returns {boolean}
 */
function fileExists(url) {
  return CS.System.IO.File.Exists(fileURLToPath(url))
}

/**
 * Legacy CommonJS main resolution:
 * 1. let M = pkg_url + (json main field)
 * 2. TRY(M, M.js, M.json, M.node)
 * 3. TRY(M/index.js, M/index.json, M/index.node)
 * 4. TRY(pkg_url/index.js, pkg_url/index.json, pkg_url/index.node)
 * 5. NOT_FOUND
 * @param {URL} packageJSONUrl
 * @param {PackageConfig} packageConfig
 * @param {string | URL | undefined} base
 * @returns {URL}
 */
function legacyMainResolve(packageJSONUrl, packageConfig, base) {
  let guess;
  if (packageConfig.main !== undefined) {
    // Note: fs check redundances will be handled by Descriptor cache here.
    if (fileExists(guess = new URL(`./${packageConfig.main}`,
      packageJSONUrl))) {
      return guess;
    } else if (fileExists(guess = new URL(`./${packageConfig.main}.js`,
      packageJSONUrl)));
    else if (fileExists(guess = new URL(`./${packageConfig.main}.json`,
      packageJSONUrl)));
    else if (fileExists(guess = new URL(`./${packageConfig.main}.node`,
      packageJSONUrl)));
    else if (fileExists(guess = new URL(`./${packageConfig.main}/index.js`,
      packageJSONUrl)));
    else if (fileExists(guess = new URL(`./${packageConfig.main}/index.json`,
      packageJSONUrl)));
    else if (fileExists(guess = new URL(`./${packageConfig.main}/index.node`,
      packageJSONUrl)));
    else guess = undefined;
    if (guess) {
      emitLegacyIndexDeprecation(guess, packageJSONUrl, base,
        packageConfig.main);
      return guess;
    }
    // Fallthrough.
  }
  if (fileExists(guess = new URL('./index.js', packageJSONUrl)));
  // So fs.
  else if (fileExists(guess = new URL('./index.json', packageJSONUrl)));
  else if (fileExists(guess = new URL('./index.node', packageJSONUrl)));
  else guess = undefined;
  if (guess) {
    emitLegacyIndexDeprecation(guess, packageJSONUrl, base, packageConfig.main);
    return guess;
  }
  // Not found.
  throw new ERR_MODULE_NOT_FOUND(
    fileURLToPath(new URL('.', packageJSONUrl)), fileURLToPath(base));
}

/**
 * @param {string} subpath
 * @param {URL} packageJSONUrl
 * @param {string | URL | undefined} base
 */
function throwExportsNotFound(subpath, packageJSONUrl, base) {
  throw new ERR_PACKAGE_PATH_NOT_EXPORTED(
    fileURLToPath(new URL('.', packageJSONUrl)), subpath,
    base && fileURLToPath(base));
}

/**
 *
 * @param {string | URL} subpath
 * @param {URL} packageJSONUrl
 * @param {boolean} internal
 * @param {string | URL | undefined} base
 */
function throwInvalidSubpath(subpath, packageJSONUrl, internal, base) {
  const reason = `request is not a valid subpath for the '${internal ?
    'imports' : 'exports'}' resolution of ${fileURLToPath(packageJSONUrl)}`;
  throw new ERR_INVALID_MODULE_SPECIFIER(subpath, reason,
    base && fileURLToPath(base));
}

function throwInvalidPackageTarget(
  subpath, target, packageJSONUrl, internal, base) {
  if (typeof target === 'object' && target !== null) {
    target = JSONStringify(target, null, '');
  } else {
    target = `${target}`;
  }
  throw new ERR_INVALID_PACKAGE_TARGET(
    fileURLToPath(new URL('.', packageJSONUrl)), subpath, target,
    internal, base && fileURLToPath(base));
}

const invalidSegmentRegEx = /(^|\\|\/)((\.|%2e)(\.|%2e)?|(n|%6e|%4e)(o|%6f|%4f)(d|%64|%44)(e|%65|%45)(_|%5f)(m|%6d|%4d)(o|%6f|%4f)(d|%64|%44)(u|%75|%55)(l|%6c|%4c)(e|%65|%45)(s|%73|%53))(\\|\/|$)/i;
const invalidPackageNameRegEx = /^\.|%|\\/;
const patternRegEx = /\*/g;

function resolvePackageTargetString(
  target, subpath, match, packageJSONUrl, base, pattern, internal, conditions) {

  if (subpath !== '' && !pattern && target[target.length - 1] !== '/')
    throwInvalidPackageTarget(match, target, packageJSONUrl, internal, base);

  if (!StringPrototypeStartsWith(target, './')) {
    if (internal && !StringPrototypeStartsWith(target, '../') &&
      !StringPrototypeStartsWith(target, '/')) {
      let isURL = false;
      try {
        new URL(target);
        isURL = true;
      } catch {
        // Continue regardless of error.
      }
      if (!isURL) {
        const exportTarget = pattern ?
          RegExpPrototypeSymbolReplace(patternRegEx, target, () => subpath) :
          target + subpath;
        return packageResolve(
          exportTarget, packageJSONUrl, conditions);
      }
    }
    throwInvalidPackageTarget(match, target, packageJSONUrl, internal, base);
  }

  if (RegExpPrototypeTest(invalidSegmentRegEx, StringPrototypeSlice(target, 2)))
    throwInvalidPackageTarget(match, target, packageJSONUrl, internal, base);

  const resolved = new URL(target, packageJSONUrl);
  const resolvedPath = resolved.pathname;
  const packagePath = new URL('.', packageJSONUrl).pathname;

  if (!StringPrototypeStartsWith(resolvedPath, packagePath))
    throwInvalidPackageTarget(match, target, packageJSONUrl, internal, base);

  if (subpath === '') return resolved;

  if (RegExpPrototypeTest(invalidSegmentRegEx, subpath))
    throwInvalidSubpath(match + subpath, packageJSONUrl, internal, base);

  if (pattern) {
    return new URL(
      RegExpPrototypeSymbolReplace(
        patternRegEx,
        resolved.href,
        () => subpath
      )
    );
  }

  return new URL(subpath, resolved);
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function isArrayIndex(key) {
  const keyNum = +key;
  if (`${keyNum}` !== key) return false;
  return keyNum >= 0 && keyNum < 0xFFFF_FFFF;
}

function resolvePackageTarget(packageJSONUrl, target, subpath, packageSubpath,
  base, pattern, internal, conditions) {
  if (typeof target === 'string') {
    return resolvePackageTargetString(
      target, subpath, packageSubpath, packageJSONUrl, base, pattern, internal,
      conditions);
  } else if (ArrayIsArray(target)) {
    if (target.length === 0) {
      return null;
    }

    let lastException;
    for (let i = 0; i < target.length; i++) {
      const targetItem = target[i];
      let resolveResult;
      try {
        resolveResult = resolvePackageTarget(
          packageJSONUrl, targetItem, subpath, packageSubpath, base, pattern,
          internal, conditions);
      } catch (e) {
        lastException = e;
        if (e.code === 'ERR_INVALID_PACKAGE_TARGET') {
          continue;
        }
        throw e;
      }
      if (resolveResult === undefined) {
        continue;
      }
      if (resolveResult === null) {
        lastException = null;
        continue;
      }
      return resolveResult;
    }
    if (lastException === undefined || lastException === null)
      return lastException;
    throw lastException;
  } else if (typeof target === 'object' && target !== null) {
    const keys = ObjectGetOwnPropertyNames(target);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (isArrayIndex(key)) {
        throw new ERR_INVALID_PACKAGE_CONFIG(
          fileURLToPath(packageJSONUrl), base,
          `'exports' cannot contain numeric property keys.`);
      }
    }
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === 'default' || conditions.has(key)) {
        const conditionalTarget = target[key];
        const resolveResult = resolvePackageTarget(
          packageJSONUrl, conditionalTarget, subpath, packageSubpath, base,
          pattern, internal, conditions);
        if (resolveResult === undefined)
          continue;
        return resolveResult;
      }
    }
    return undefined;
  } else if (target === null) {
    return null;
  }
  throwInvalidPackageTarget(packageSubpath, target, packageJSONUrl, internal,
    base);
}

/**
 *
 * @param {Exports} exports
 * @param {URL} packageJSONUrl
 * @param {string | URL | undefined} base
 * @returns {boolean}
 */
function isConditionalExportsMainSugar(exports, packageJSONUrl, base) {
  if (typeof exports === 'string' || ArrayIsArray(exports)) return true;
  if (typeof exports !== 'object' || exports === null) return false;

  const keys = ObjectGetOwnPropertyNames(exports);
  let isConditionalSugar = false;
  let i = 0;
  for (let j = 0; j < keys.length; j++) {
    const key = keys[j];
    const curIsConditionalSugar = key === '' || key[0] !== '.';
    if (i++ === 0) {
      isConditionalSugar = curIsConditionalSugar;
    } else if (isConditionalSugar !== curIsConditionalSugar) {
      throw new ERR_INVALID_PACKAGE_CONFIG(
        fileURLToPath(packageJSONUrl), base,
        `'exports' cannot contain some keys starting with \'.\' and some not.` +
        ' The exports object must either be an object of package subpath keys' +
        ' or an object of main entry condition name keys only.');
    }
  }
  return isConditionalSugar;
}

/**
 * @param {URL} packageJSONUrl
 * @param {string} packageSubpath
 * @param {PackageConfig} packageConfig
 * @param {string | URL | undefined} base
 * @param {Set<string>} conditions
 * @returns {URL}
 */
function packageExportsResolve(
  packageJSONUrl, packageSubpath, packageConfig, base, conditions) {
  let exports = packageConfig.exports;
  if (isConditionalExportsMainSugar(exports, packageJSONUrl, base))
    exports = { '.': exports };

  if (ObjectPrototypeHasOwnProperty(exports, packageSubpath) &&
    !StringPrototypeIncludes(packageSubpath, '*') &&
    !StringPrototypeEndsWith(packageSubpath, '/')) {
    const target = exports[packageSubpath];
    const resolved = resolvePackageTarget(
      packageJSONUrl, target, '', packageSubpath, base, false, false, conditions
    );

    if (resolved == null) {
      throwExportsNotFound(packageSubpath, packageJSONUrl, base);
    }

    return { resolved, exact: true };
  }

  let bestMatch = '';
  let bestMatchSubpath;
  const keys = ObjectGetOwnPropertyNames(exports);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const patternIndex = StringPrototypeIndexOf(key, '*');
    if (patternIndex !== -1 &&
      StringPrototypeStartsWith(packageSubpath,
        StringPrototypeSlice(key, 0, patternIndex))) {
      if (StringPrototypeEndsWith(packageSubpath, '/'))
        emitTrailingSlashPatternDeprecation(packageSubpath, packageJSONUrl,
          true, base);
      const patternTrailer = StringPrototypeSlice(key, patternIndex + 1);
      if (packageSubpath.length >= key.length &&
        StringPrototypeEndsWith(packageSubpath, patternTrailer) &&
        patternKeyCompare(bestMatch, key) === 1 &&
        StringPrototypeLastIndexOf(key, '*') === patternIndex) {
        bestMatch = key;
        bestMatchSubpath = StringPrototypeSlice(
          packageSubpath, patternIndex,
          packageSubpath.length - patternTrailer.length);
      }
    } else if (key[key.length - 1] === '/' &&
      StringPrototypeStartsWith(packageSubpath, key) &&
      patternKeyCompare(bestMatch, key) === 1) {
      bestMatch = key;
      bestMatchSubpath = StringPrototypeSlice(packageSubpath, key.length);
    }
  }

  if (bestMatch) {
    const target = exports[bestMatch];
    const pattern = StringPrototypeIncludes(bestMatch, '*');
    const resolved = resolvePackageTarget(
      packageJSONUrl,
      target,
      bestMatchSubpath,
      bestMatch,
      base,
      pattern,
      false,
      conditions);

    if (resolved == null) {
      throwExportsNotFound(packageSubpath, packageJSONUrl, base);
    }

    if (!pattern) {
      emitFolderMapDeprecation(bestMatch, packageJSONUrl, true, base);
    }

    return { resolved, exact: pattern };
  }

  throwExportsNotFound(packageSubpath, packageJSONUrl, base);
}

function patternKeyCompare(a, b) {
  const aPatternIndex = StringPrototypeIndexOf(a, '*');
  const bPatternIndex = StringPrototypeIndexOf(b, '*');
  const baseLenA = aPatternIndex === -1 ? a.length : aPatternIndex + 1;
  const baseLenB = bPatternIndex === -1 ? b.length : bPatternIndex + 1;
  if (baseLenA > baseLenB) return -1;
  if (baseLenB > baseLenA) return 1;
  if (aPatternIndex === -1) return 1;
  if (bPatternIndex === -1) return -1;
  if (a.length > b.length) return -1;
  if (b.length > a.length) return 1;
  return 0;
}

/**
 * @param {string} specifier
 * @param {string | URL | undefined} base
 * @returns {{ packageName: string, packageSubpath: string, isScoped: boolean }}
 */
function parsePackageName(specifier, base) {
  let separatorIndex = StringPrototypeIndexOf(specifier, '/');
  let validPackageName = true;
  let isScoped = false;
  if (specifier[0] === '@') {
    isScoped = true;
    if (separatorIndex === -1 || specifier.length === 0) {
      validPackageName = false;
    } else {
      separatorIndex = StringPrototypeIndexOf(
        specifier, '/', separatorIndex + 1);
    }
  }

  const packageName = separatorIndex === -1 ?
    specifier : StringPrototypeSlice(specifier, 0, separatorIndex);

  // Package name cannot have leading . and cannot have percent-encoding or
  // \\ separators.
  if (RegExpPrototypeExec(invalidPackageNameRegEx, packageName) !== null)
    validPackageName = false;

  if (!validPackageName) {
    throw new ERR_INVALID_MODULE_SPECIFIER(
      specifier, 'is not a valid package name', fileURLToPath(base));
  }

  const packageSubpath = '.' + (separatorIndex === -1 ? '' :
    StringPrototypeSlice(specifier, separatorIndex));

  return { packageName, packageSubpath, isScoped };
}

/**
 * @param {string} specifier
 * @param {string | URL | undefined} base
 * @param {Set<string>} conditions
 * @returns {URL}
 */
function packageResolve(specifier, base) {
  const conditions = new Set();
  conditions.add('node')
  conditions.add('import')
  const { packageName, packageSubpath, isScoped } =
    parsePackageName(specifier, base);

  // ResolveSelf
  const packageConfig = getPackageScopeConfig(base);
  if (packageConfig.exists) {
    const packageJSONUrl = packageConfig.pjsonUrl;
    if (packageConfig.name === packageName &&
      packageConfig.exports !== undefined && packageConfig.exports !== null) {
      return packageExportsResolve(
        packageJSONUrl, packageSubpath, packageConfig, base, conditions
      ).resolved;
    }
  }

  let packageJSONUrl =
    new URL('./node_modules/' + packageName + '/package.json', base);
  let packageJSONPath = fileURLToPath(packageJSONUrl);
  let lastPath;
  do {
    if (!CS.System.IO.Directory.Exists(StringPrototypeSlice(packageJSONPath, 0,
      packageJSONPath.length - 13))) {
      lastPath = packageJSONPath;
      packageJSONUrl = new URL((isScoped ?
        '../../../../node_modules/' : '../../../node_modules/') +
        packageName + '/package.json', packageJSONUrl);
      packageJSONPath = fileURLToPath(packageJSONUrl);
      continue;
    }

    // Package match.
    const packageConfig = getPackageConfig(packageJSONPath, specifier, base);
    if (packageConfig.exports !== undefined && packageConfig.exports !== null) {
      return packageExportsResolve(
        packageJSONUrl, packageSubpath, packageConfig, base, conditions
      ).resolved;
    }

    if (packageSubpath === '.') {
      return legacyMainResolve(
        packageJSONUrl,
        packageConfig,
        base
      );
    }

    return new URL(packageSubpath, packageJSONUrl);
    // Cross-platform root check.
  } while (packageJSONPath.length !== lastPath.length);

  // eslint can't handle the above code.
  // eslint-disable-next-line no-unreachable
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base));
}

function packageLoad(url) {
  const path = fileURLToPath(url);
  if (defaultGetFormatWithoutErrors(url) == 'commonjs') {
    const cjsModule = globalThis['require'](path);
    const names = Object.getOwnPropertyNames(cjsModule);
    let ret = `const mod = require('${path.replaceAll('\\', '\\\\')}')\n`;
    if (names.indexOf('default') == -1) ret += 'export default mod\n'
    return ret + names.map((name, index) => {
      if (name == 'default') return `export default mod['${name}']`
      return `const member${index} = mod['${name}']; export { member${index} as ${name} }`
    }).join('\n')

  } else {
    return CS.System.IO.File.ReadAllText(path)
  }
}


export { packageResolve, packageLoad }
