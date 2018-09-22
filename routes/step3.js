const express = require('express');
const router = express.Router()
const httpStatus = require('http-status-codes');
const httpStatusMsg = require('http-status-code');
const blockchain = require('../blockchain');

router.get('/stars/address\::address', (req, res, next) => {
    blockchain.getBlocksByAddress(req.params.address, (err, blocks) => {
        if (err)
            return next(err)
        //story dececod
        res.send(blocks)
    })
})
router.get('/stars/hash\::hash', (req, res, next) => {
    blockchain.getBlockByHash(req.params.hash, (err, block) => {
        if (err)
            return next(err)
        //story dececod
        res.send(block)
    })
})

module.exports = router