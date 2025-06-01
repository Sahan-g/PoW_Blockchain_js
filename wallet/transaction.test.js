describe('Transaction.transactionWithOutputs', () => {
    let Transaction, senderWallet, outputs, transaction, ChainUtill;

    beforeEach(() => {
        Transaction = require('./transaction');
        ChainUtill = require('../chain-util');

        senderWallet = {
            balance: 100,
            publicKey: 'sender-public-key',
            sign: jest.fn().mockReturnValue('signature')
        };

        outputs = [
            { amount: 60, address: 'recipient-address' },
            { amount: 40, address: senderWallet.publicKey }
        ];
    });

    it('creates a transaction instance', () => {
        transaction = Transaction.transactionWithOutputs({ senderWallet, outputs });
        expect(transaction).toBeInstanceOf(Transaction);
    });

    it('sets the outputs correctly', () => {
        transaction = Transaction.transactionWithOutputs({ senderWallet, outputs });
        expect(transaction.outputs).toEqual(outputs);
    });

    it('calls signTransaction with the transaction and senderWallet', () => {
        const signSpy = jest.spyOn(Transaction, 'signTransaction');
        transaction = Transaction.transactionWithOutputs({ senderWallet, outputs });
        expect(signSpy).toHaveBeenCalledWith(transaction, senderWallet);
        signSpy.mockRestore();
    });

    it('sets the input with correct address and signature', () => {
        transaction = Transaction.transactionWithOutputs({ senderWallet, outputs });
        expect(transaction.input.address).toBe(senderWallet.publicKey);
        expect(transaction.input.signature).toBe('signature');
    });

    it('generates a unique id for the transaction', () => {
        transaction = Transaction.transactionWithOutputs({ senderWallet, outputs });
        expect(transaction.id).toBeDefined();
    });
});
