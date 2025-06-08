const TransactionPool = require('./transaction-pool');

describe('TransactionPool', () => {
    let transactionPool, transaction;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        transaction = { id: 'tx1', foo: 'bar' };
    });

    it('starts with an empty transactions array', () => {
        expect(transactionPool.transactions).toEqual([]);
    });

    describe('updateOrAddTransaction()', () => {
        it('adds a new transaction if it does not exist', () => {
            transactionPool.updateOrAddTransaction(transaction);
            expect(transactionPool.transactions.length).toBe(1);
            expect(transactionPool.transactions[0]).toBe(transaction);
        });

        it('updates an existing transaction if it exists', () => {
            transactionPool.updateOrAddTransaction(transaction);
            const updatedTransaction = { ...transaction, foo: 'baz' };
            transactionPool.updateOrAddTransaction(updatedTransaction);
            expect(transactionPool.transactions.length).toBe(1);
            expect(transactionPool.transactions[0].foo).toBe('baz');
        });
    });

    describe('getTransactions()', () => {
        it('returns the transactions array', () => {
            transactionPool.updateOrAddTransaction(transaction);
            expect(transactionPool.getTransactions()).toEqual([transaction]);
        });
    });

    describe('clear()', () => {
        it('empties the transactions array', () => {
            transactionPool.updateOrAddTransaction(transaction);
            expect(transactionPool.transactions.length).toBe(1);
            transactionPool.clear();
            expect(transactionPool.transactions).toEqual([]);
        });
    });
    describe('removeConfirmedTransactions()', () => {
      let transaction1, transaction2, transaction3;

      beforeEach(() => {
        transaction1 = { id: 'tx1', foo: 'bar' };
        transaction2 = { id: 'tx2', foo: 'baz' };
        transaction3 = { id: 'tx3', foo: 'qux' };
        transactionPool.updateOrAddTransaction(transaction1);
        transactionPool.updateOrAddTransaction(transaction2);
        transactionPool.updateOrAddTransaction(transaction3);
      });

      it('removes transactions that are confirmed', () => {
        const confirmedTransactions = [transaction1, transaction3];
        transactionPool.removeConfirmedTransactions(confirmedTransactions);
        expect(transactionPool.transactions).toEqual([transaction2]);
      });

      it('does not remove any transactions if none are confirmed', () => {
        const confirmedTransactions = [{ id: 'tx4' }];
        transactionPool.removeConfirmedTransactions(confirmedTransactions);
        expect(transactionPool.transactions).toEqual([transaction1, transaction2, transaction3]);
      });

      it('removes all transactions if all are confirmed', () => {
        const confirmedTransactions = [transaction1, transaction2, transaction3];
        transactionPool.removeConfirmedTransactions(confirmedTransactions);
        expect(transactionPool.transactions).toEqual([]);
      });

      it('does nothing if confirmedTransactions is empty', () => {
        transactionPool.removeConfirmedTransactions([]);
        expect(transactionPool.transactions).toEqual([transaction1, transaction2, transaction3]);
      });
    });


});