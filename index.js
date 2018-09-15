const express = require('express');
const app = express();
const Blockchain = require('./blockchain');
const Block = require('./block');
const blockchain = new Blockchain();

app.use(express.json())

app.get('/block/:blockHeight', (req, res, next) => {
    let blockHeight = req.params.blockHeight
    blockchain.getBlock(blockHeight, (err, block) => {
        if (err) {
            next(new Error('block not found'))
        }
        else {
            res.send({ block: block })
        }
    })
})

app.post('/block', (req, res, next) => {
    let body = req.body;
    let block = new Block(body.data)
    blockchain.addBlock(block).then((block) => {
        res.send({block: block})
    }).catch(next)
})

app.use((err, req, res, next) => {
    res.json({ error: err.message })
})
app.listen(8000, () => {
    console.log('listening on port 8000')
})