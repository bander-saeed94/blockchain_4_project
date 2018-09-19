const express = require('express');
const router = express.Router()
const validationRoutine = []
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const httpStatus = require('http-status-codes');
const httpStatusMsg = require('http-status-code');

router.post('/requestValidation', (req, res, next) => {
    if (req.body.address == undefined) {
        return res.status(httpStatus.BAD_REQUEST)
            .json({
                error: httpStatusMsg.getMessage(httpStatus.BAD_REQUEST)
            })
    }
    let requestTimeStamp = new Date().getTime().toString().slice(0, -3);
    let address = req.body.address
    let elem = validationRoutine.find((element) => {
        return element.address == address
    })
    if (elem != undefined && elem.requestTimeStamp > 0) {
        let requestTimeStamp = elem.requestTimeStamp
        return res.json({
            address: address,
            requestTimeStamp: requestTimeStamp,
            message: `${address}:${requestTimeStamp}:starRegistry`,
            validationWindow: requestTimeStamp - new Date().getTime().toString().slice(0, -3) + 300 <= 0 ? 0 : requestTimeStamp - new Date().getTime().toString().slice(0, -3) + 300
        })
    }
    if (elem != undefined) {
        validationRoutine.pop({ address: address })
    }
    validationRoutine.push({ address: address, requestTimeStamp: requestTimeStamp })
    res.json({
        address: address,
        requestTimeStamp: requestTimeStamp,
        message: `${address}:${requestTimeStamp}:starRegistry`,
        validationWindow: requestTimeStamp - new Date().getTime().toString().slice(0, -3) + 300 <= 0 ? 0 : requestTimeStamp - new Date().getTime().toString().slice(0, -3) + 300
    })
})

router.post('/message-signature/validate', (req, res, next) => {
    //address, signature 
    if (req.body.address == undefined || req.body.signature == undefined) {
        return res.status(httpStatus.BAD_REQUEST)
            .json({
                error: httpStatusMsg.getMessage(httpStatus.BAD_REQUEST)
            })
    }
    let address = req.body.address
    let elemInValidationRoutine = validationRoutine.find((element) => {
        return element.address == address
    })
    if (elemInValidationRoutine == undefined) {
        return res.status(404).json({ error: 'No entery' })
    }
    let requestTimeStamp = elemInValidationRoutine.requestTimeStamp
    let signingTimeStamp = new Date().getTime().toString().slice(0, -3);

    if (requestTimeStamp - signingTimeStamp + 300 <= 0) {
        return res.status(401).json({ error: 'Time out' })
    }
    //verify
    let message = `${address}:${requestTimeStamp}:starRegistry`
    let signature = req.body.signature
    console.log(bitcoinMessage.verify(message, address, signature))
    let registerStar = false;
    let messageSignature = 'invalid';
    //if verified
    if (bitcoinMessage.verify(message, address, signature)) {
        registerStar = true
        messageSignature = 'valid'   
        validationRoutine.pop({ address: address })
    }
    res.json({
        registerStar: registerStar,
        status: {
            address: address,
            requestTimeStamp: requestTimeStamp,
            message: message,
            validationWindow: requestTimeStamp - signingTimeStamp + 300 <= 0 ? 0 : requestTimeStamp - signingTimeStamp + 300,
            messageSignature: messageSignature
        }
    })

})

module.exports = router