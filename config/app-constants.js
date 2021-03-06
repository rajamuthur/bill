var STATUS_CODE = {
    SUCCESS: 200,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    SERVER_ERROR: 500,
    INACTIVE: 601,
    EMAIL_UNVERIFIED: 602
};

var SITE_CONFIG = {
    SITE_PORT: 3000
};

var APP_CONSTANTS = {
    SITE_CONFIG: SITE_CONFIG,
    STATUS_CODE: STATUS_CODE,
    SEARCH_CONSTANTS: SEARCH_CONSTANTS
};


var SEARCH_CONSTANTS = {
    LIMIT: 2,
    SKIP: 0
};

module.exports = APP_CONSTANTS;