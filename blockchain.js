/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256')
//leveldb
const level = require('level')
const chainDB = './chainData'
const db = level(chainDB, { valueEncoding: 'json' });
const Block = require('./block');
// Blockchain Class
class Blockchain {
    constructor() {
        let blockchain = this;
        blockchain.getBlockHeight((err, height) => {
            if (err) {
                blockchain.addBlock(new Block('First block in the chain - Genesis block')).then((v) => {
                    console.log(v)
                }).catch((e) => { console.log('error', e) })
            }
            else {
                console.log('Genesis block already exist')
            }
        })
    }

    async addBlock(newBlock) {
        //CHECK IF persist
        // console.log(this.getBlock(0))
        let blockchain = this;
        //if no genisi will get undefined 
        let genesisBlock = await blockchain.getBlockSync(0);
        if (genesisBlock == undefined) {
            newBlock.height = 0;
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            // newBlock.previousBlockHash = ''
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            let block = await blockchain.putBlockSync(newBlock, newBlock.height);
            return newBlock;
        }
        else {
            let blockHeight = await blockchain.getBlockHeightSync();
            newBlock.height = blockHeight + 1;
            newBlock.previousBlockHash = await blockchain.getPreviousBlockHashSync(newBlock.height)
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            let block = await blockchain.putBlockSync(newBlock, newBlock.height);
            return newBlock;
        }
    }
    //get block by height
    //helper method returning a promise
    getBlockWrapper(blockHeight) {
        //return promise
        return new Promise((resolve, reject) => {
            db.get(`block${blockHeight}`, (err, block) => {
                if (err) reject(err)
                else resolve(block)
            })
        })
    }
    async  getBlockSync(blockHeight) {
        try {
            let block = await this.getBlockWrapper(blockHeight);
            return block
        } catch (err) {
            return undefined
        }
    }
    getBlock(blockHeight, cb) {
        db.get(`block${blockHeight}`, (err, block) => {
            if (err) cb(err)
            else cb(null, block)
        })
    }

    getBlocksByAddress(address, callback){
        //read db
        let input= db.createReadStream()
        let blocks = []
        input.on('data', function(data) {
            let body = data.value.body
            if(data.key != 'blockHeight'){
                if(address == body.address){
                    blocks.push(data.value)
                }
            }
          }).on('error', function(err) {
            return callback(err)
            // return console.log('Unable to read data stream!', err)
          }).on('close', function() {
            callback(null, blocks)
          });
    }
    getBlockByHash(hash, callback){
        //read db
        let input= db.createReadStream()
        input.on('data', function(data) {
            if(data.key != 'blockHeight'){
                if(hash == data.value.hash){
                    input.destroy()
                    return callback(null, data.value)
                }
            }
          }).on('error', function(err) {
            return callback(err)
            // return console.log('Unable to read data stream!', err)
          }).on('close', function() {
            // callback(null, val)
          });
    }



    //get blockchain height
    //this is getBlockHeight
    getBlockHeightWrapper() {
        //return promise
        return new Promise((resolve, reject) => {
            db.get(`blockHeight`, (err, blockHeight) => {
                if (err) reject(err)
                else resolve(blockHeight)
            })
        })
    }
    //used in add block
    async  getBlockHeightSync() {
        try {
            let blockHeight = await this.getBlockHeightWrapper();
            return blockHeight
        } catch (err) {
            return undefined;
        }
    }
    //used in constrctor
    getBlockHeight(cb) {
        db.get('blockHeight', (err, height) => {
            if (err) cb(err)
            else cb(null, height)
        })
    }

    // get Previous Block Hash
    getPreviousBlockHashWrapper(blockHeight) {
        //return promise
        return new Promise((resolve, reject) => {
            db.get(`block${blockHeight - 1}`, (err, block) => {
                if (err) reject(err)
                else resolve(block.hash)
            })
        })
    }
    async  getPreviousBlockHashSync(blockHeight) {
        try {
            let blockHash = await this.getPreviousBlockHashWrapper(blockHeight);
            return blockHash
        } catch (err) {
            return undefined
        }
    }
    getPreviousBlockHash(blockHeight, cb) {
        db.get(`block${blockHeight - 1}`, (err, block) => {
            if (err) cb(err)
            else cb(null, block.hash)
        })
    }
    //add block to the chain
    async putBlockSync(block, height) {
        db.put('blockHeight', height, (err) => {
            db.put(`block${height}`, block, (err) => {
                if (err) throw new Error(err)
                else return ''
            })
        })
    }
    async validateBlock(blockHeight) {
        let block = await this.getBlockSync(blockHeight);
        let blockHash = block.hash;
        block.hash = ''
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        //add more security by checking for previus hash
        let securityAdded = true;
        if (block.height != 0) {
            let previousBlockHash = await this.getPreviousBlockHashSync(block.height);
            if(block.previousBlockHash !== previousBlockHash )
                securityAdded = false;
        } 
        if (blockHash === validBlockHash && securityAdded) {
            return true;
        } else {
            console.log('\nBlock #' + blockHeight + ' invalid hash:')
            console.log('\x1b[36m%s\x1b[0m', 'should be:' + blockHash);
            console.log('\x1b[31m%s\x1b[0m', 'found after validating:' + validBlockHash);
            return false;
        }
    }
    //
    // Validate blockchain
    async validateChain() {
        let errorLog = [];
        let chainHight = await this.getBlockHeightSync();
        for (var i = 0; i <= chainHight; i++) {
            // validate block
            let validBlock = await this.validateBlock(i);
            if (!validBlock) {
                errorLog.push(i);
            }
            //dont compare blocks hash link for last block
            if (i != chainHight) {
                // compare blocks hash link
                let block = await this.getBlockSync(i);
                let blockHash = block.hash
                let nextBlock = await this.getBlockSync(i + 1);
                let previousHash = nextBlock.previousBlockHash;
                if (blockHash !== previousHash) {
                    errorLog.push(i);
                }
            }
        }
        if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
            return 'Error: In blocks:' + errorLog;
        } else {
            // console.log('No errors detected');
            return 'No errors detected'
        }
    }
}

module.exports = new Blockchain()