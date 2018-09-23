const express = require('express');
const router = express.Router()
const bitcoinMessage = require('bitcoinjs-message');
const httpStatus = require('http-status-codes');
const httpStatusMsg = require('http-status-code');
const Step1Helper = require('./step1Helper')


router.post('/requestValidation', async function (req, res, next) {
    let address = req.body.address
    if (address == undefined) {
        return res.status(httpStatus.BAD_REQUEST)
            .json({
                error: httpStatusMsg.getMessage(httpStatus.BAD_REQUEST)
            })
    }
    let elem;
    try {
        //get if exist 
        elem = await Step1Helper.getFromValidationRoutine(address)
        let validationWindow = elem.requestTimeStamp - timeNow() + 300
        if (validationWindow > 0) {
            //validation window did not expire
            let requestTimeStamp = elem.requestTimeStamp
            return res.json({
                address: address,
                requestTimeStamp: elem.requestTimeStamp,
                message: `${address}:${requestTimeStamp}:starRegistry`,
                validationWindow: elem.requestTimeStamp - timeNow() + 300 <= 0 ? 0 : elem.requestTimeStamp - timeNow() + 300
            })
        } else {
            //validation window expire
            requestTimeStamp = timeNow()
            //update
            let save = await Step1Helper.pushToValidationRoutine(address, { address: address, requestTimeStamp: requestTimeStamp })
            return res.json({
                address: address,
                requestTimeStamp: requestTimeStamp,
                message: `${address}:${requestTimeStamp}:starRegistry`,
                validationWindow: requestTimeStamp - timeNow() + 300 <= 0 ? 0 : requestTimeStamp - timeNow() + 300
            })
        }
    } catch (err) {
        //new request
        let requestTimeStamp = timeNow()
        try {
            let save = await Step1Helper.pushToValidationRoutine(address, { address: address, requestTimeStamp: requestTimeStamp })
            return res.json({
                address: address,
                requestTimeStamp: requestTimeStamp,
                message: `${address}:${requestTimeStamp}:starRegistry`,
                validationWindow: requestTimeStamp - timeNow() + 300 <= 0 ? 0 : requestTimeStamp - timeNow() + 300
            })
        }
        catch (err) {
            next(err)
        }
    }
})

router.post('/message-signature/validate', async function (req, res, next) {
    //address, signature 
    if (req.body.address == undefined || req.body.signature == undefined) {
        return res.status(httpStatus.BAD_REQUEST)
            .json({
                error: httpStatusMsg.getMessage(httpStatus.BAD_REQUEST)
            })
    }
    let address = req.body.address
    let elem;
    try {
        elem = await Step1Helper.getFromValidationRoutine(address)

        let requestTimeStamp = elem.requestTimeStamp
        let signingTimeStamp = timeNow()

        if (requestTimeStamp - signingTimeStamp + 300 <= 0) {
            return res.status(401).json({ error: 'Time out' })
        }

        let message = `${address}:${requestTimeStamp}:starRegistry`
        let signature = req.body.signature

        let registerStar = false;
        let messageSignature = 'invalid';
        //if verified
        if (bitcoinMessage.verify(message, address, signature)) {
            registerStar = true
            messageSignature = 'valid'
            try {
                await Step1Helper.popFromValidationRoutine(address)
                //push to validated
                await Step1Helper.pushValidated(address,{valid: true, requestTimeStamp: requestTimeStamp} )
                return res.json({
                    registerStar: registerStar,
                    status: {
                        address: address,
                        requestTimeStamp: requestTimeStamp,
                        message: message,
                        validationWindow: requestTimeStamp - signingTimeStamp + 300 <= 0 ? 0 : requestTimeStamp - signingTimeStamp + 300,
                        messageSignature: messageSignature
                    }
                })
            } catch (err) {
                next(err)
            }
        }
    } catch (err) {
        try{
            //validated {valid: boolean, requestTimeStamp: Date() }
            let  validated = await Step1Helper.getFromValidated(address)
            if(validated.valid && validated.requestTimeStamp - timeNow() + 300 > 0){
                return res.json({ message: 'Validated go ahead and notarize' })
            }
            if(validated.requestTimeStamp - timeNow() + 300 <= 0){
                return res.json({ message: 'Timeout' })
            }
            if(!validated.valid){
                return res.json({ message: 'Request for Validation again to register a new star' })
            }
        }catch(err){
            return res.status(404).json({ error: 'No entry' })
        }
    }
})

function timeNow() {
    return new Date().getTime().toString().slice(0, -3);
}
module.exports = router