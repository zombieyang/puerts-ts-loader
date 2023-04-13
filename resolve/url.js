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
}

function fileURLToPath(path) {
    if (typeof path === 'string')
        path = new URL(path);
    else if (!(path instanceof URL))
        throw new Error(['ERR_INVALID_ARG_TYPE ', 'path', ['string', 'URL'], path].join(' '));
    if (path.protocol !== 'file:')
        throw new Error(['ERR_INVALID_URL_SCHEME ', 'file'].join(' '));
    return getPathFromURLPosix(path);
}

export { fileURLToPath, URL }