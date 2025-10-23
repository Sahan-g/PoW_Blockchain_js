const webSocket = require('ws');
const axios = require('axios');

const P2P_PORT = process.env.P2P_PORT || 5001;
const BOOTSTRAP_ADDRESS =
  process.env.BOOTSTRAP_ADDRESS || "http://127.0.0.1:4000";
const P2P_HOST = process.env.P2P_HOST || "localhost";
const selfAddress = `ws://${P2P_HOST}:${P2P_PORT}`;
// const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
let peers = [];

const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS',
    block: 'BLOCK'
};

class P2PServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    async listen() {
        const server = new webSocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));
        // this.connectToPeers();
        await this.registerToBootstrap();
        console.log(`P2P Server listening on port ${P2P_PORT}`);
    }

    // connectToPeers() {
    //     peers.forEach(peer => {
    //         const socket = new webSocket(peer);
    //         socket.on('open', () => this.connectSocket(socket));
    //     });
    // }
    connectToPeers() {
        peers.forEach(peer => this.connectToPeer(peer));
    }

    connectToPeersFetchedFromBootstrap() {
        peers.forEach(peer => {
            if (peer !== selfAddress) {
                this.connectToPeer(peer)
            }
        });
    }

    async registerToBootstrap() {
    try {
      await axios.post(`${BOOTSTRAP_ADDRESS}/register`, {
        address: selfAddress,
      });
      console.log(
        `Registered peer with bootstrap at ${BOOTSTRAP_ADDRESS} as ${selfAddress}`
      );
    } catch (error) {
      console.error(`Error registering peer: ${error.message}`);
    }

    try {
      const res = await axios.get(`${BOOTSTRAP_ADDRESS}/peers`);
      peers = res.data;
      if (peers) {
        this.connectToPeersFetchedFromBootstrap();
        console.log(`Connected to peers: ${peers}`);
      }
      console.log("skiping no peers");
    } catch (error) {
      console.error(`Error obtaining peers: ${error.message}`);
    }
  }


    connectToPeer(peer) {
        const socket = new webSocket(peer);

        socket.on('open', () => {
            console.log(`Connected to peer ${peer}`);
            this.connectSocket(socket);
        });

        socket.on('error', () => {
            console.log(`Retrying peer ${peer} in 5s...`);
            setTimeout(() => this.connectToPeer(peer), 5000);
        });


        socket.on('close', () => {
            console.log(`Connection to peer ${peer} closed`);
        });
    }


    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('New peer connected');
        this.messageHandler(socket);
        this.sendChain(socket)
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;
                // case MESSAGE_TYPES.clear_transactions: will not be using this 
                //     this.transactionPool.clear();
                //     break;
                case MESSAGE_TYPES.block:
                    const isAdded = this.blockchain.addToChain(data.block);
                    if (isAdded) {
                        this.transactionPool.removeConfirmedTransactions(data.block.data);
                    }
                    break;
                default:
                    console.error(`Unknown message type: ${data.type}`);
            }

        });
    }

    sendChain(socket) {
        socket.send(JSON.stringify(
            {
                type: MESSAGE_TYPES.chain,
                chain: this.blockchain.chain
            }));
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({ type: MESSAGE_TYPES.transaction, transaction }));
    }

    syncChains() {
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        });
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    broadcastClearTransactions() {
        this.sockets.forEach(socket => {
            socket.send(JSON.stringify({ type: MESSAGE_TYPES.clear_transactions }));
        });
    }

    broadcastBlock(block) {
        this.sockets.forEach(socket => {
            socket.send(JSON.stringify({ type: MESSAGE_TYPES.block, block }));
        });
        // console.log(`BROADCASTED: ${block.toString()}`);
    }
}

module.exports = P2PServer;