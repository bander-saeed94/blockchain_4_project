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
        blocks.forEach(block => {
            let star = block.body.star
            if (star != undefined) {
                let story = block.body.star.story;
                block.body.star.storyDecoded = new Buffer(story, 'hex').toString()
            }
        });
        res.send(blocks)
    })
})
router.get('/stars/hash\::hash', (req, res, next) => {
    blockchain.getBlockByHash(req.params.hash, (err, block) => {
        if (err)
            return next(err)
        //story dececod
        let star = block.body.star
        if (star != undefined) {
            let story = block.body.star.story;
            block.body.star.storyDecoded = new Buffer(story, 'hex').toString()
        }
        res.send(block)
    })
})

module.exports = router