const Wallet = require('./index');
const { INITIAL_BALANCE } = require('../config');
const ChainUtill = require('../chain-util');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    describe('constructor', () => {
        it('sets a `balance`', () => {
            expect(wallet.balance).toEqual(INITIAL_BALANCE);
        });

        it('generates a `keyPair`', () => {
            expect(wallet.keyPair).toBeDefined();
            expect(typeof wallet.keyPair.getPublic).toBe('function');
        });

        it('generates a `publicKey`', () => {
            expect(wallet.publicKey).toBeDefined();
            expect(typeof wallet.publicKey).toBe('string');
            expect(wallet.publicKey.length).toBeGreaterThan(0);
        });

        it('generates a publicKey that matches the keyPair', () => {
            const expectedPublicKey = wallet.keyPair.getPublic().encode('hex');
            expect(wallet.publicKey).toEqual(expectedPublicKey);
        });
    });
});