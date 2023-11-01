const { URL } = require('whatwg-url')

function getPathFromURLPosix(url) {
    if (url.hostname !== '') {
        throw new ERR_INVALID_FILE_URL_HOST(platform);
    }
    const pathname = url.pathname;
    for (let n = 0; n < pathname.length; n++) {
        if (pathname[n] === '%') {
            const third = pathname.codePointAt(n + 2) | 0x20;
            if (pathname[n + 1] === '2' && third === 102) {
                throw new ERR_INVALID_FILE_URL_PATH(
                    'must not include encoded / characters'
                );
            }
        }
    }
    return decodeURIComponent(pathname);
} const forwardSlashRegEx = /\//g;
const CHAR_LOWERCASE_A = 97
const CHAR_LOWERCASE_Z = 122

function getPathFromURLWin32(url) {
    const hostname = url.hostname;
    let pathname = url.pathname;
    for (let n = 0; n < pathname.length; n++) {
        if (pathname[n] === '%') {
            const third = pathname.codePointAt(n + 2) | 0x20;
            if ((pathname[n + 1] === '2' && third === 102) || // 2f 2F /
                (pathname[n + 1] === '5' && third === 99)) {  // 5c 5C \
                throw new Error('ERR_INVALID_FILE_URL_PATH: ' +
                    'must not include encoded \\ or / characters'
                );
            }
        }
    }
    pathname = pathname.replace(forwardSlashRegEx, '\\');
    pathname = decodeURIComponent(pathname);
    if (hostname !== '') {
        // If hostname is set, then we have a UNC path
        // Pass the hostname through domainToUnicode just in case
        // it is an IDN using punycode encoding. We do not need to worry
        // about percent encoding because the URL parser will have
        // already taken care of that for us. Note that this only
        // causes IDNs with an appropriate `xn--` prefix to be decoded.

        // TODO by zombieyang
        // return `\\\\${domainToUnicode(hostname)}${pathname}`;
        throw new Error('hostname must be empty: ' + hostname);
    }
    // Otherwise, it's a local path that requires a drive letter
    const letter = pathname.codePointAt(1) | 0x20;
    const sep = pathname[2];
    if (letter < CHAR_LOWERCASE_A || letter > CHAR_LOWERCASE_Z ||   // a..z A..Z
        (sep !== ':')) {
        throw new new Error('ERR_INVALID_FILE_URL_PATH' + ': must be absolute');
    }
    return pathname.slice(1);
}

function fileURLToPath(path) {
    if (typeof path === 'string')
        path = new URL(path);
    else if (!(path instanceof URL))
        throw new Error(['ERR_INVALID_ARG_TYPE ', 'path', ['string', 'URL'], path].join(' '));
    if (path.protocol !== 'file:')
        throw new Error(['ERR_INVALID_URL_SCHEME ', 'file'].join(' '));
    return isWindows() ? getPathFromURLWin32(path) : getPathFromURLPosix(path);
}

function isWindows() {
    return CS.UnityEngine.Application.platform == 7
}


export { fileURLToPath, URL }