// Send the same file (like angular's index.html) for any route
module.exports = function (filepath) {
    return function (req, res, next) {
        res.sendFile(filepath);
    };
};
