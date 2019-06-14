

var billService = require('../services/bill-service');
var categoryService = require('../services/category-service');
var itemService = require('../services/item-service');
const config = require('../../config');
const moment = require('moment');
var utilities = require('../../common/utilities');
const STATUS_CODE = config.APP_CONSTANTS.STATUS_CODE;
const async = require('async');
const path = require('path');
var billController = {};
billController.getAllBills = getAllBills;
billController.deleteBill = deleteBill;
billController.getBill = getBill;
billController.updateBill = updateBill;
billController.addBill = addBill;
billController.getBillsBySearch = getBillsBySearch;
module.exports = billController;



// Get bills List
// POST /users
// Output (Success): {"success":{"message":"Bills details."},"result":{"user":{"address":{"address_line_1":"Impiger Technologies Pvt. Ltd.","address_line_2":"","city":"city","state":"state","zipcode":75632456},"contactInfo":{"primary_phone":1234567890,"alternate_phone":1234567891,"extension":738,"fax":"1-408-999 8888"},"privileges":[{"_id":"1","privilege":"View Dashboard"},{"_id":"2","privilege":"View Users"},{"_id":"3","privilege":"Edit User"},{"_id":"4","privilege":"Create Event"},{"_id":"5","privilege":"Edit Event"},{"_id":"6","privilege":"View Event"},{"_id":"7","privilege":"View Contribution"}],"_id":"5c8a5f8680923718b491374a","name":"admin","password":"admin","gender":"male","age":27,"email":"admin@imp.com","dob":"2019-03-14T14:04:54.976Z","imgPath":"admin.jpg","status":true,"regdate":"2019-03-14T14:04:54.976Z","date_updated":"2019-03-14T14:04:54.976Z","group":"customer","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiYWRtaW5AaW1wLmNvbSIsImlhdCI6MTU1MjY1NzUxM30.C9Qd8ZxiMUXiZxg8FfcWBRA9huOxyNYEmqy2WLFrs1A"}}}
// Output (Fail): {"error":{"message":"Failed to get bills details"}}
function getAllBills(req, res, next) {
    async.waterfall([
        function (done) {
            billService.getAllBills().then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('getAllBills err: ', err);
                done(err)
            });
        }
    ], function (err, data) {
        if (err) {
            console.log('getAllBills err: ', err);
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('getAllBills final data: ', JSON.stringify(data));
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully  fetched all bills details.' }, result: { 'data': data } });
        }
    });
}

function deleteBill(req, res) {
    billService.deleteBill(req.params.id).then(function (data) {
        return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully delete bill.' } });
    }).catch((err) => {
        console.log('deleteBill err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}

function getFormattedDate(dateString, separator) {
    var todayTime = new Date(dateString);
    var day = todayTime.getDate();
    var month =  todayTime.getMonth();
    month += 1;  // JavaScript months are 0-11
    var year = todayTime.getFullYear();
    return year + separator + month + separator + day;
}

function sumByDate(data, sumFieldName, map_field1, map_field2) {
	let dataset = {};
	if(data.length > 0) {
		for(let j = 0; j < data.length; j++) {
			let name = data[j][map_field1]+'_'+getFormattedDate(data[j][map_field2], '-');
            if(typeof dataset[name] == 'undefined') {
                dataset[name] = data[j];
            } else {
                dataset[name][sumFieldName] += data[j][sumFieldName];
            }
        }
    }
	return Object.values(dataset);
}

function getBillsBySearch(req, res) {
    let searchData = req.body['filter'] || {};
    let isAdmin = req.user.group == 'admin' ? true : false;
    async.waterfall([
        function (done) {
            if(!isAdmin) {
                searchData['created_by'] = req.user.id;
            }
            billService.getBillBySearch(searchData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                done(err);
            });
        },
        function(billData, done) {
            if(billData.length > 0) {
                let itemIds = utilities.getObjectIdsFromList(billData, 'name', true);
                let filterItemData = {'_id': { $in: itemIds }}
                itemService.getAllItemBySearch(filterItemData).then(function (itemData) {
                    let mappedItemObj = utilities.getObjectKeyAndValFromList(itemData, '_id', 'category');
                    billData = utilities.addCustomFieldIntoList(billData, '_category', 'name', mappedItemObj);
                    if(searchData['category']) {
                        billData = utilities.filterByValueFromList(billData, '_category', searchData['category']);
                    }
                    console.log('Successfully fetched category:');
                    if(req.body['sumByBillDate']) {
                        billData = sumByDate(billData, 'amount', '_category', 'purchased_date');
                    }
                    done(null, billData);
                }).catch((err) => {
                    console.log('Failed to get category ids err: ', err);
                    done(err)
                });
            } else {
                done(null, billData);
            }
        }
    ], function (err, data) {
        if (err) {
            console.log('getBillsBySearch err: ', err);
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('getBillsBySearch final data: ', JSON.stringify(data));
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully  fetched all bills details withe search.' }, result: { 'data': data } });
        }
    });
}

function getBill(req, res) {
    billService.getBillById(req.params.id).then(function (data) {
        console.log('getBillById data:', data, data[0].name)
        if (data[0].name && data[0].name != '') {
            itemService.getItemById(data[0].name).then(function (itemData) {
                console.log('getItemById itemData:', itemData)
                data[0].name = itemData[0].name;
                return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully fetched bill details.' }, result: { 'data': data } });
            }).catch((err) => {
                data[0].name = '';
                return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully fetched bill details.' }, result: { 'data': data } });
            });
        } else {
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully fetched bill details.' }, result: { 'data': data } });
        }
    }).catch((err) => {
        console.log('getBillById err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}

// Update bill details
// URL: http://localhost:3000/api/bills/5c8b98f83a4a254ae8f0f8c7/
// Request: {"email":"rr@imp.com","gender":"Female","is_active":true,"name":"admin","password":"admin","age":30,"contactInfo":{"primary_phone":"9876543452","alternate_phone":"00000"},"dob":"2018-12-24"}
// Response: {"success":{"message":"Successfully updated user details."},"result":{"user":true}}
function updateBill(req, res) {
    let inputData = req.body;
    let userId = req.params.id;
    console.log('updateBill inputData:', inputData)
    async.waterfall([
        function (done) {
            if (!inputData.purchased_date) {
                done({ message: 'Purchased Date is required' });
            } else if (!inputData.amount) {
                done({ message: 'Amount is required' });
            } else {
                // let purchased_date = moment(inputData['purchased_date']).utc().toDate();
                // let purchased_date = moment.unix(inputData['purchased_date']).toDate();
                // console.log('purchased_date::', purchased_date, 'uploadFileExtension:', inputData['purchased_date'])
                const uploadFileExtension = (req.files && req.files.document_name) ? path.extname(req.files.document_name.name) : "";
                let imgName = uploadFileExtension != '' ? 'img_' + moment(new Date()).format("DD-MM-YYYY-HH-mm") +'_'+ Date.now() + uploadFileExtension : '';
                console.log('imgName::', imgName, 'uploadFileExtension:', uploadFileExtension)
                done(null, imgName);
            }
        }, function (imgName, done) {
            if(inputData.deleteImageName) {
                utilities.deleteImageFile(inputData.deleteImageName);
            }
            if (imgName != '') {
                utilities.uploadImgFile(req, imgName).then(() => {
                    done(null, imgName)
                }).catch(() => {
                    done({ message: 'Failed to upload' })
                });
            } else {
                done(null, imgName);
            }
        },
        function (imgName, done) {
            if (inputData.name && inputData.name != '') {
                inputData.name = inputData.name.toLowerCase();
                itemService.isItemExists(inputData.name).then(function (data) {
                    console.log('item not exists: ', data)
                    done(null, imgName, '-1');
                }).catch((err) => {
                    if (err.data && err.data.length > 0) {
                        console.log('item exists: ', err.data)
                        done(null, imgName, err.data[0]['_id']);
                    } else {
                        console.log('Failed to check isItemExists', err)
                        done({ message: 'Failed to add bill' });
                    }
                });
            } else {
                done(null, imgName, '');
            }
        },
        function(imgName, itemId, done) {
            categoryService.getDefaultCategoryIdByName('Other').then(function (categoryid) {
                inputData.category = typeof inputData.category == 'undefined' ? categoryid : inputData.category;
                done(null, imgName, itemId)
            }).catch((err) => {
                done(null, imgName, itemId)
            });
        },        
        function (imgName, itemId, done) {
            if (itemId == '') { // Item name is optional
                done(null, imgName);
            } else if (itemId == '-1') { // Add new Item 
                itemService.addItem(getNewItemListByName(inputData)).then(function (resp) {
                    inputData.name = resp['_id'];
                    done(null, imgName);
                }).catch((err) => {
                    console.log('updateBill err: ', err);
                    done(err);
                });
            } else { // Exisisting name
                inputData.name = itemId;
                done(null, imgName);
            }
        },
        function (imgName, done) {
            if (imgName != '') {
                inputData.document_name = imgName;
            }
            billService.updateBill(req.params.id, inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('updateBill err: ', err);
                done(err);
            });
        }
    ], function (err, billData) {
        if (err) {
            console.log('updateBill err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('updateBill data: ', billData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully updated bill details.' }, result: { 'data': billData } });
        }
    });
}

// Add new bill
// http://localhost:3000/api/bills/add/
// Request: {"email":"rr12@imp.com","gender":"Female","is_active":true,"name":"admin","password":"admin","age":30,"contactInfo":{"primary_phone":"9876543452","alternate_phone":"00000"},"dob":"2018-12-24"}
// Response: {"success":{"message":"Successfully created bill details."},"result":{"user":{"privileges":[],"_id":"5c94ac9d78afa81e8cf292d8","email":"rr12@imp.com","gender":"Female","is_active":true,"name":"admin","password":"admin","age":30,"contactInfo":{"primary_phone":9876543452,"alternate_phone":0},"dob":"2018-12-24T00:00:00.000Z","__v":0}}}
function addBill(req, res) {
    let inputData = req.body;
    // let file = req.files.image;
    console.log('addBill: ', inputData, req.files); // list of the files


    async.waterfall([
        function (done) {
            if (!inputData.purchased_date) {
                done({ message: 'Purchased Date is required' });
            }
            else if (!inputData.amount) {
                done({ message: 'Amount is required' });
            }
            else {
                const uploadFileExtension = (req.files && req.files.document_name) ? path.extname(req.files.document_name.name) : "";
                let imgName = uploadFileExtension != '' ? 'img_' + Date.now() + uploadFileExtension : '';
                console.log('imgName::', imgName, 'uploadFileExtension:', uploadFileExtension)
                done(null, imgName);
            }
        }, function (imgName, done) {
            if (imgName != '') {
                utilities.uploadImgFile(req, imgName).then(() => {
                    done(null, imgName)
                }).catch(() => {
                    done({ message: 'Failed to upload' })
                });
            } else {
                done(null, imgName);
            }
        }, function (imgName, done) {
            if (inputData.name && inputData.name != '') {
                inputData.name = inputData.name.toLowerCase();
                itemService.isItemExists(inputData.name).then(function (data) {
                    console.log('item not exists11111111111: ', data)
                    done(null, imgName, '-1');
                }).catch((err) => {
                    if (err.data && err.data.length > 0) {
                        console.log('item exists: ', err.data)
                        done(null, imgName, err.data[0]['_id']);
                    } else {
                        console.log('Failed to check isItemExists', err)
                        done({ message: 'Failed to add bill' });
                    }
                });
            } else {
                done(null, imgName, '');
            }
        },
        function(imgName, itemId, done) {
            categoryService.getDefaultCategoryIdByName('Other').then(function (categoryid) {
                inputData.category = typeof inputData.category == 'undefined' ? categoryid : inputData.category;
                done(null, imgName, itemId)
            }).catch((err) => {
                done(null, imgName, itemId)
            });
        },
        function (imgName, itemId, done) {
            if (itemId == '') { // Item name is optional
                done(null, imgName);
            } else if (itemId == '-1') { // Add new Item 
                itemService.addItem(getNewItemListByName(inputData)).then(function (resp) {
                    inputData.name = resp['_id'];
                    done(null, imgName);
                }).catch((err) => {
                    console.log('addBill err: ', err);
                    done(err);
                });
            } else { // Exisisting name
                inputData.name = itemId;
                done(null, imgName);
            }
        },
        function (imgName, done) {
            if (imgName != '') {
                inputData.document_name = imgName;
            }
            console.log('last: ', imgName, inputData)
            billService.addBill(inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('addBill err: ', err);
                done(err);
            });
        }
    ], function (err, billData) {
        if (err) {
            console.log('addBill err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('addBill data: ', billData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully created bill details.' }, result: { 'data': billData } });
        }
    });
}


function getNewItemListByName(inputData) {
    console.log('getNewItemListByName: ', inputData)
    return {
        'name': inputData.name,
        'units': [],
        'created_by': inputData.created_by,
        'is_approved': false,
        'category': inputData.category
    }
}