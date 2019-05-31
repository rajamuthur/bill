let secreteKey = 'Event-Bucket';
var moment = require('moment');
var jwt = require('jsonwebtoken');
// Load the bcrypt module
var bcrypt = require('bcrypt');
var Q = require('q');
const config = require('../config');
const FILES_PATH = config.APP_CONFIG.PATHS.FILES;
const uploadImgFolder = FILES_PATH.UPLOADS_IMG;
var ObjectId = require('mongoose').Types.ObjectId

module.exports = {
    getNewToken: getNewToken,
    verifyToken: verifyToken,
    genearteHashForPassword: genearteHashForPassword,
    validatePassword: validatePassword,
    getSearchCondition: getSearchCondition,
    getFieldListBySchema: getFieldListBySchema,
    getObjectIdsFromList: getObjectIdsFromList,
    addCustomFieldIntoList: addCustomFieldIntoList,
    filterByValueFromList: filterByValueFromList,
    getObjectKeyAndValFromList: getObjectKeyAndValFromList,
    uploadImgFile: uploadImgFile
}


function getNewToken(userId) {
    let payLoad = { subject: userId };
    let token = jwt.sign(payLoad, secreteKey);
    return token;
}

function verifyToken(req, resp, next) {
    if (!req.headers.authorization) {
        return resp.status(401).send('Unauthorized Access - 1');
    }
    let token = req.headers.authorization.split(' ')[1];
    if (!token || token == null) {
        return resp.status(401).send('Unauthorized Access - 2');
    }

    return jwt.verify(token, secreteKey, function (err, decoded) {
        if (err) {
            return resp.status(401).json({
                success: false,
                message: "Failed to authenticate token.",
            });
        }
        req.user = decoded.subject;
        return next();
    });
}

function genearteHashForPassword(password) {
    // Generate a salt
    var salt = bcrypt.genSaltSync(10);
    // Hash the password with the salt
    var hash = bcrypt.hashSync(password, salt);
    return hash;
}

function validatePassword(password, hashPassword) {
    // compare the hash saved in DB with the user supplied password
    return bcrypt.compareSync(password, hashPassword);
}

function isValidISODate(dateString) {
    let isValid = false;
    if (new Date(dateString) !== "Invalid Date" && !isNaN(new Date(dateString))) {
        if (dateString == new Date(dateString).toISOString()) {
            console.log("Valid date");
            isValid = true;
        }
    }
    return isValid;

}

function getFieldListBySchema(collectionSchema) {
    props = Object.keys(collectionSchema.paths);
    return props;
}

function getSearchCondition(searchCondition, fieldList) {
    let condition = {};
    let conditionList = [];
    for (var name in searchCondition) {
        let sCondition = {};
        let val = searchCondition[name];
        //Check if an element is present in an array [ECMAScript 2016]
        if (fieldList.includes(name)) {
            if (typeof val == 'string') {
                sCondition[name] = val;
            }
            let isValidDate = typeof val['dateFrom'] != 'undefined' && moment(val['dateFrom'], "YYYY-MM-DD HH:mm", true).isValid() && typeof val['dateTo'] != 'undefined' && moment(val['dateTo'], "YYYY-MM-DD HH:mm", true).isValid() ? true : false;
            console.log('fromDate: ', val['dateFrom'], 'toDate:', val['dateTo'], 'isValidDate:', isValidDate, moment(val['dateTo'], "YYYY-MM-DD HH:mm", true).isValid());
            if (isValidDate) {
                let fromDate = val['dateFrom'];
                let toDate = val['dateTo'];
                console.log('fromDate: ', fromDate, 'toDate:', toDate);
                sCondition[name] = { $gte: new Date(fromDate), $lte: new Date(toDate) };
            }
            if (name == '_id') {
                if (typeof val == 'string') { // _id: "5c94db82b370a610b422684d"
                    sCondition[name] = { $in: [new ObjectId(val)] }
                } else if (val && val.length > 0) { // _id: ["5c94db82b370a610b422684d", "5c94db82b370a610b42268df"]
                    let objIds = [];
                    for (let j = 0; j < val.length; j++) {
                        objIds.push(new ObjectId(val[j][fieldName]));
                    }
                    sCondition[name] = { $in: objIds }
                }
            }
            conditionList.push(sCondition);
        } else {
            console.log('getSearchCondition invalid search field name: ', name, 'fieldList: ', fieldList)
        }
    }
    if (conditionList.length > 0) {
        condition['$and'] = conditionList;
    }
    return condition;
}

function uploadImgFile(req, fileName) {
    let deffered = Q.defer();
    const uploadFile = req.files.document_name;
    let uploadImgPath = uploadImgFolder + fileName;
    console.log('uploadFile uploadImgPath: ', uploadImgPath, uploadFile)
    uploadFile.mv(uploadImgPath, function (err) {
        if (err) {
            console.log('uploadFile failed')
            deffered.reject(false);
        } else {
            console.log('uploadFile success')
            deffered.resolve(true);
        }
    });
    return deffered.promise;
}

/* 
Function to filter field(Ex: _id or name or ...) values from array of object
data => Data set
fieldName => field which is avaliable in given input array of object. Filter applied based on the fieldname
isObjectId => boolean. Result value should be in ObjectId or string
*/
function getObjectIdsFromList(data, fieldName, isObjectId = false) {
    let resp = [];
    if (data && data.length > 0) {
        for (let j = 0; j < data.length; j++) {
            let fieldVal = data[j][fieldName] ? data[j][fieldName] : '';
            let val = isObjectId ? new ObjectId(fieldVal) : fieldVal;
            resp.push(val);
        }
    }
    return resp;
}

/* 
Function to get {key: value} from array of object
data => Data set
keyFieldName => Field which is avaliable in array of object also its going to be the keyField of new response object
valueFieldName => Field which is avaliable in array of object also its going to be the valueField of new response object
*/
function getObjectKeyAndValFromList(data, keyFieldName, valueFieldName) {
    let resp = {};
    if (data && data.length > 0) {
        for (let j = 0; j < data.length; j++) {
            let keyFieldVal = data[j][keyFieldName];
            let valueFieldVal = data[j][valueFieldName];
            resp[keyFieldVal] = valueFieldVal;
        }
    }
    return resp;
}

/* 
Function to filter from array of object based on field name and value list
data => Data set
fieldName => field which is avaliable in given input array of object. Filter applied based on the fieldname
valueList => string or array. Filter by field value should be matched or contain in array
*/
function filterByValueFromList(data, fieldName, valueList) {
    let resp = [];
    if (data && data.length > 0) {
        for (let j = 0; j < data.length; j++) {
            if (data[j][fieldName]) {
                console.log('value: ', typeof valueList, data[j][fieldName], valueList)
                if (typeof valueList == 'string' && data[j][fieldName] == valueList) {
                    resp.push(data[j]);
                } else if (typeof valueList == 'object' && valueList.indexOf(data[j][fieldName]) !== -1) {
                    resp.push(data[j]);
                }
            }
        }
    }
    console.log('filterByValueFromList data: ', data, 'fieldName: ', fieldName, 'valueList:', valueList, 'resp:', resp)
    return resp;
}

/*
Function to add custom field 
data => Data set
customFieldName => Field needs to added into each object in array
mappedFieldName => FieldName which is avaliable in data set
mappedObjList => object Ex: {'88547sdsadFed': 'hksdf232'};
*/
function addCustomFieldIntoList(data, customFieldName, mappedFieldName, mappedObjList) {
    if (data && data.length > 0) {
        for (let j = 0; j < data.length; j++) {
            let val = mappedObjList[data[j][mappedFieldName]];
            data[j][customFieldName] = val;
        }
    }
    console.log('addCustomFieldIntoList data: ', data, 'customFieldName: ', customFieldName, 'mappedFieldName:', mappedFieldName, 'mappedObjList:', mappedObjList)
    return data;
}


