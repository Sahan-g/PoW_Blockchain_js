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


});