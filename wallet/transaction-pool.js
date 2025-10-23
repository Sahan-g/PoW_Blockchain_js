const Transaction = require("./transaction");
class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {
    console.log("Updating or adding transaction:", transaction);
    let transactionWithId = this.transactions.find(
      (t) => t.id === transaction.id
    );
    if (transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] =
        transaction;
    } else {
      this.transactions.push(transaction);
    }
  }

  getTransactions() {
    return this.transactions;
  }

  clear() {
    this.transactions = [];
  }

  existingTransaction(address) {
    return this.transactions.find(
      (transaction) => transaction.input.address === address
    );
  }

  // validTransactions() {
  //   return this.transactions.filter(transaction => {
  //     const outputTotal = transaction.outputs.reduce((total, output) => { return total + output.amount }, 0);

  //     if (transaction.input.amount !== outputTotal) {
  //       console.error(`Invalid transaction from ${transaction.input.address}. Output total ${outputTotal} does not match input amount ${transaction.input.amount}`);
  //       return;
  //     }

  //     if (!Transaction.verifyTransaction(transaction)) {
  //       console.error(`Invalid signature from ${transaction.input.address}`);
  //       return;
  //     }

  //     return transaction;
  //   })

  // }

  validateAndVerifyTransactions() {
    console.log(`Validating ${this.transactions.length} transactions from pool`);
    
    return this.transactions.filter(transaction => {
      if (
        !transaction.id ||
        !transaction.sensor_id ||
        !transaction.timestamp ||
        !transaction.hash ||
        !transaction.input ||
        !transaction.input.address ||
        !transaction.input.signature ||
        !transaction.input.timestamp
      ) {
        console.error(`Invalid transaction: missing fields`, transaction);
        return false;
      }

      if (
        transaction.reading === undefined ||
        transaction.metadata === undefined
      ) {
        console.error(
          `Invalid transaction: missing reading or metadata`,
          transaction
        );
        return false;
      }

      if (!Transaction.verifyTransaction(transaction)) {
        console.error(`Invalid signature from ${transaction.input.address}`);
        return false;
      }

      return true;
    });
  }

  //   removeConfirmedTransactions(confirmedTransactions) {
  //     this.transactions = this.transactions.filter(
  //         t => !confirmedTransactions.find(ct => ct.id === t.id)
  //     );
  // }

  removeConfirmedTransactions(
    confirmedTransactions,
    proposerPublicKey,
    myPublicKey
  ) {
    // console.log("✅ Confirmed Transactions", confirmedTransactions);

    if (!Array.isArray(confirmedTransactions)) {
      console.warn(
        "⚠️ confirmedTransactions is not a valid array:",
        confirmedTransactions
      );
      return;
    }

    confirmedTransactions.forEach((tx) => {
      let transactionWithId = this.transactions.find((t) => t.id === tx.id);
      if (transactionWithId) {
        // console.log(`🗑️ Removing confirmed transaction ${tx.id} from the pool.`);
        this.transactions.splice(
          this.transactions.indexOf(transactionWithId),
          1
        );
      } else if (proposerPublicKey !== myPublicKey) {
        this.pendingTransactions.set(tx.id, tx);
        console.log(
          `🔖 Transaction ${tx.id} not found in pool. Added to pending transactions.`
        );
      } else {
        console.log(
          `ℹ️ Transaction ${tx.id} not found in pool. No action taken as this node is the proposer.`
        );
      }
    });
  }

}

module.exports = TransactionPool;
