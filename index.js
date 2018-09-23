const express = require('express');
const app = express();
// const Blockchain = require('./blockchain');
const blockchain = require('./blockchain');
const Block = require('./block');
// const blockchain = new Blockchain();
const step1Routes = require('./routes/step1')
const step3Routes = require('./routes/step3')
const Step1Helper = require('./routes/step1Helper')


app.use(express.json())

app.get('/block/:blockHeight', (req, res, next) => {
    let blockHeight = req.params.blockHeight
    blockchain.getBlock(blockHeight, (err, block) => {
        if (err) {
            next(new Error('block not found'))
        }
        else {
            //story dececod
            //check if undefined (for genesis block)
            let star = block.body.star
            if (star != undefined && star != null) {
                let story = block.body.star.story;
                block.body.star.storyDecoded = new Buffer(story, 'hex').toString()
            }
            res.send(block)
        }
    })
})

app.post('/block', async function (req, res, next) {
    let body = req.body
    let address = body.address
    let star = body.star
    let ra = star.ra
    let dec = star.dec
    let story = star.story
    if (address == undefined || star == undefined ||
        ra == undefined || dec == undefined || story == undefined) {
        return next(new Error('Bad request'))
    }
    let validated;
    try {
        validated = await Step1Helper.getFromValidated(address)
        if (validated.valid && validated.requestTimeStamp - timeNow() + 300 > 0) {
            //validate access
            let s = new Buffer(body.star.story).toString('hex');
            body.star.story = s
            if (Buffer.byteLength(s, 'hex') > 500) {
                return next(new Error('Star story very long'))
            }
            // console.log(Buffer.byteLength(s, 'hex') + " bytes");
            Step1Helper.pushValidated(address, { valid: false }).then(() => {
                let block = new Block(body)
                blockchain.addBlock(block).then((block) => {
                    res.send(block)
                }).catch(next)
            }).catch(next)
        } else {
            next(new Error('Not validated Or timeout'))
        }
    }
    catch (err) {
        next(new Error('Not validated'))
    }
})

app.use(step1Routes)
app.use(step3Routes)

app.use((err, req, res, next) => {
    res.json({ error: err.message })
})
app.listen(8000, () => {
    console.log('listening on port 8000')
})