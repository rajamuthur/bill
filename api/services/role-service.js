var services = {};
services.getRoles = getRoles;
module.exports = services;
var roleModel = require('../models/role-model');

function getRoles(usergroupName) {
    return new Promise(function(resolve, reject){
        roleModel.find({'access': usergroupName}, {'privilege': 1}).then(function(data){
            console.log('getRoles data: ', data, 'for usergroupName: ', usergroupName)
            if (data.length > 0) {
                resolve(data);
            } else {
                reject({ 'code': 400, 'message': 'You dont have access. Contact Administrator', 'data': [] });
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to get user privlieges', 'data': [] });
        })
    });
}