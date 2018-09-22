const db = require('../validateDB/index')
const dbValidated = require('../validatedDB/index')
class Step1Helper {
    static pushToValidationRoutine(address, requestTimeStamp, cb) {
        return new Promise((resolve, reject) => {
            let key = address
            let value = requestTimeStamp
            db.put(key, value).then(() => resolve()).catch((err) => reject(err))
        })
    }

    static popFromValidationRoutine(address) {
        return new Promise((resolve, reject) => {
            let key = address
            db.del(key).then(() => resolve()).catch((err) => reject(err))
        })
    }
    static getFromValidationRoutine(address) {
        return new Promise((resolve, reject) => {
            let key = address
            db.get(key).then((value) => resolve(value)).catch((err) => reject(err))
        })
    }
    static pushValidated(address, validated){
        return new Promise((resolve, reject)=>{
            let key = address
            let value = validated
            dbValidated.put(key, value).then(() => resolve()).catch((err) => reject(err))
        })
    }
    static popFromValidated(address) {
        return new Promise((resolve, reject) => {
            let key = address
            dbValidated.del(key).then(() => resolve()).catch((err) => reject(err))
        })
    }
    static getFromValidated(address) {
        return new Promise((resolve, reject) => {
            let key = address
            dbValidated.get(key).then((value) => resolve(value)).catch((err) => reject(err))
        })
    }

}
module.exports = Step1Helper
