const { INITIAL_BALANCE } = require("../config");
const Transaction = require("./transaction");
const ChainUtill = require("../chain-util");
const db = require("../database");

class Wallet {
  // The constructor now just sets up a placeholder.
  // The real initialization happens in loadOrCreate()
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = null;
    this.publicKey = null;
  } //

  static async loadOrCreate() {
    const wallet = new Wallet();
    let privateKey = await db.getWalletKey();

    if (privateKey) {
      // If key exists, reconstruct the keyPair from the private key string.
      wallet.keyPair = ChainUtill.ec.keyFromPrivate(privateKey, "hex");
      console.log("Wallet loaded from saved key.");
    } else {
      // If no key exists, generate a new one.
      wallet.keyPair = ChainUtill.genKeyPair();
      privateKey = wallet.keyPair.getPrivate("hex");

      await db.saveWalletKey(privateKey);
      console.log("New wallet created and key saved.");
    }

    // In either case, set the public key from the final keyPair.
    wallet.publicKey = wallet.keyPair.getPublic().encode("hex");
    return wallet;
  }

  toString() {
    return `Wallet -
            publicKey: ${this.publicKey.toString()}
            balance  : ${this.balance}`;
  }

  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }
  
  createTransaction(
    sensor_id,
    reading,
    transactionPool = null,
    metadata = null
  ) {
    if (!sensor_id) {
      throw new Error("sensor_id is required");
    }
    if (!reading || typeof reading !== "object") {
      throw new Error("reading must be a non-null object");
    }

    const tx = Transaction.fromSensorReading(this, {
      sensor_id,
      reading,
      metadata,
    });

    if (transactionPool) {
      transactionPool.updateOrAddTransaction(tx);
    }

    return tx;
  }

  calculateBalance(blockchain) {
    console.log(`Calculating balance for wallet: ${this.publicKey}`);
    let balance = this.balance;
    let transactions = [];
    blockchain.chain.forEach((block) =>
      block.data.forEach((transaction) => {
        transactions.push(transaction);
      })
    );

    const walletInputTs = transactions.filter(
      (transaction) => transaction.input.address === this.publicKey
    );
    let startTime = 0;
    if (walletInputTs.length > 0) {
      const recentInputT = walletInputTs.reduce((prev, current) => {
        return prev.timestamp > current.timestamp ? prev : current;
      });
      balance = recentInputT.outputs.find(
        (output) => output.address === this.publicKey
      ).amount;
      startTime = recentInputT.input.timestamp;
    }
    transactions.forEach((transaction) => {
      if (transaction.input.timestamp > startTime) {
        transaction.outputs.find((output) => {
          if (output.address === this.publicKey) {
            balance += output.amount;
          }
        });
      }
    });
    return balance;
  }

  static blockchainWallet() {
    const blockchainWallet = new this();
    // blockchainWallet.address = 'blockchain-wallet'; - unnecessary. public key serves as address
    blockchainWallet.keyPair = ChainUtill.genKeyPair();
    blockchainWallet.publicKey = blockchainWallet.keyPair
      .getPublic()
      .encode("hex");
    return blockchainWallet;
  }
}

module.exports = Wallet;
