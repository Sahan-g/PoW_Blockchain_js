const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain/index');
const P2PServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');
const {TIME_INTERVAL} = require('../config');

const ENABLE_SENSOR_SIM = process.env.ENABLE_SENSOR_SIM || false;

const PORT= process.env.PORT || 3001;

const app = express();

const startServer = async () => {

    //const bc = new Blockchain();
    const bc = await Blockchain.create();
    // load wallet from db instead of creating a new instance everytime
    const wallet = await Wallet.loadOrCreate();
    const tp = new TransactionPool();
    const p2pServer = new P2PServer(bc,tp);
    const miner = new Miner(bc, p2pServer, wallet);

    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => {
        res.json(bc.chain);
    }); 

    app.post('/mine', (req, res) => {
        const data = req.body.data;
        if (!data) {
            return res.status(400).send('Data is required to mine a block.');
        }
        
        const newBlock = bc.addBlock(data, this.wallet.publicKey);

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

  app.post("/transact", (req, res) => {
    try {
        console.log(req)
      const { sensor_id, reading, metadata } = req.body;

      // Basic validation
      if (!sensor_id || typeof sensor_id !== "string") {
        return res
          .status(400)
          .json({ ok: false, error: "sensor_id is required (string)" });
      }
      if (!reading || typeof reading !== "object" || Array.isArray(reading)) {
        return res
          .status(400)
          .json({ ok: false, error: "reading must be a non-null object" });
      }
      if (
        metadata != null &&
        (typeof metadata !== "object" || Array.isArray(metadata))
      ) {
        return res
          .status(400)
          .json({ ok: false, error: "metadata must be an object if provided" });
      }

      const tx = wallet.createTransaction(sensor_id, reading, tp, metadata);
      p2pServer.transactionPool.updateOrAddTransaction(tx);
      p2pServer.broadcastTransaction(tx);

      return res.status(201).json({ ok: true, transaction: tx });
    } catch (err) {
      console.error("Failed to create transaction:", err);
      return res
        .status(500)
        .json({ ok: false, error: err.message || "internal error" });
    }
  });

    app.get('/public-key', (req, res) => {
        res.json({ publicKey: wallet.publicKey });
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Blockchain:', bc.toString());
    });

    p2pServer.listen();

    p2pServer.syncChains();

    function getNextIntervalDelay(intervalMs) {
        const now = Date.now();
        console.log(`Time to wait: ${intervalMs - (now % intervalMs)}`);
        return intervalMs - (now % intervalMs);
    }

    async function startMine() {
        const now = Date.now();
        console.log("Mining aligned");
        console.log(`Time now: ${now}`);

        const newBlock = await miner.mine(tp);
        lastMinedTimestamp = newBlock.timestamp;
        console.log(`Block mined at: ${newBlock.timestamp}`);

        const delay = getNextIntervalDelay(TIME_INTERVAL);
        setTimeout(startMine, delay);
    }
    
  function generateAndSendSensorData() {
    sensor_id = "sensor-" + Math.floor(Math.random() * 1000);
    reading = {
      value: parseFloat((Math.random() * 100).toFixed(2)),
    };
    metadata = {
        timestamp: Date.now(),
        unit: "Celsius"
    };

    const tx = wallet.createTransaction(sensor_id, reading, tp, metadata);
    p2pServer.broadcastTransaction(tx);
    tp.transactions.push(tx);
    console.log(
      "✨: Generated and broadcasted sensor data related to sensor-id: ",
      sensor_id
    );
  }

  ENABLE_SENSOR_SIM ? setInterval(generateAndSendSensorData, 10000) : console.log("❌ Sensor data simulation disabled");


    setTimeout(async () => {
        console.log(`Starting aligned mining every ${TIME_INTERVAL / 1000} seconds...`);
        await startMine();
    }, getNextIntervalDelay(TIME_INTERVAL));

}

startServer();
