const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");

class Miner{
    constructor(blockchain, transactionPool, p2pServer,wallet) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.p2pServer = p2pServer;
        this.wallet = wallet;
    }

    async mine() {
       const validTransactions = this.transactionPool.validTransactions();
       validTransactions.push(Transaction.rewardTransaction(this.wallet,Wallet.blockchainWallet()));
       const block= await this.blockchain.addBlock(validTransactions, this.wallet.publicKey);
       //this.p2pServer.syncChains();
       this.p2pServer.broadcastBlock(block);
       this.transactionPool.clear();
       //this.p2pServer.broadcastClearTransactions();

       return block;
    }   
}

module.exports = Miner;