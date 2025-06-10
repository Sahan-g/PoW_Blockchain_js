const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain/index');
const P2PServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');
const PORT= process.env.PORT || 3001;

const app = express();

const startServer = async () => {

    //const bc = new Blockchain();
    const bc = await Blockchain.create();
    const wallet = new Wallet();
    const tp = new TransactionPool();
    const p2pServer = new P2PServer(bc,tp);
    const miner = new Miner(bc, tp, p2pServer, wallet);

    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => {
        res.json(bc.chain);
    }); 

    app.post('/mine', (req, res) => {
        const data = req.body.data;
        if (!data) {
            return res.status(400).send('Data is required to mine a block.');
        }
        
        const newBlock = bc.addBlock(data);

        p2pServer.syncChains();
        res.redirect('/blocks');
    });

    app.get('/mine-transactions', (req, res) => {
        const block = miner.mine();
        console.log(`New block mined: ${block.toString()}`);
        res.redirect('/blocks');
    });

    app.get('/transaction', (req, res) => {
        res.json(tp.transactions);
    });

    app.post('/transact', (req, res) => {
        const { recipient, amount } = req.body;

        if (!recipient || !amount) {
            return res.status(400).send('Recipient and amount are required.');
        }

        const transaction = wallet.createTransaction(recipient, amount, tp,bc);
        p2pServer.broadcastTransaction(transaction);

        res.redirect('/transaction');
    });

    app.get('/public-key', (req, res) => {
        res.json({ publicKey: wallet.publicKey });
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Blockchain:', bc.toString());
    });

    p2pServer.listen();

    setInterval(() => {
        const block = miner.mine();
        console.log(`New block mined: ${block.toString()}`);
    }, 10 * 1000); // 1 minute interval for mining
}

startServer();
