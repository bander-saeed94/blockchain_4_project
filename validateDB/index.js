const level = require('level')
const chainDB = './validateData'
const db = level(chainDB, { valueEncoding: 'json' });

class validateDB {
    put(key, value) {
        return new Promise((resolve, reject) => {
            db.put(key, value, (err) => {
                if (err)
                    return reject(err)
                resolve()
            })
        })
    }
    get(key) {
        return new Promise((resolve, reject) => {
            db.get(key, (err, value) => {
                if (err)
                    return reject(err)
                resolve(value)
            })
        })
    }
    del(key) {
        return new Promise((resolve, reject) => {
            db.del(key, (err) => {
                if (err)
                    return reject(err)
                resolve()
            })
        })
    }
}

module.exports = new validateDB()