const Block = require('./block.js');
const Blockchain = require('./index.js');

jest.mock('./block.js');

describe('Blockchain', () => {
    let blockchain;
    let mockGenesisBlock;
    let mockNewBlock;

    beforeEach(() => {
        mockGenesisBlock = { toString: jest.fn(() => 'Genesis Block') };
        mockNewBlock = { toString: jest.fn(() => 'New Block') };

        Block.genesis.mockReturnValue(mockGenesisBlock);
        Block.mineBlock.mockImplementation((prevBlock, data) => mockNewBlock);

        blockchain = new Blockchain();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('initializes with genesis block', () => {
        expect(blockchain.chain.length).toBe(1);
        expect(blockchain.chain[0]).toBe(mockGenesisBlock);
        expect(Block.genesis).toHaveBeenCalled();
    });

    test('addBlock adds a new block to the chain', () => {
        const data = 'test-data';
        const newBlock = blockchain.addBlock(data);

        expect(Block.mineBlock).toHaveBeenCalledWith(mockGenesisBlock, data);
        expect(blockchain.chain.length).toBe(2);
        expect(blockchain.chain[1]).toBe(mockNewBlock);
        expect(newBlock).toBe(mockNewBlock);
    });

    test('getLatestBlock returns the last block', () => {
        blockchain.addBlock('data1');
        expect(blockchain.getLatestBlock()).toBe(mockNewBlock);
    });

    test('toString returns string representation of the chain', () => {
        blockchain.addBlock('data1');
        const result = blockchain.toString();
        expect(mockGenesisBlock.toString).toHaveBeenCalled();
        expect(mockNewBlock.toString).toHaveBeenCalled();
        expect(result).toBe('Genesis Block\nNew Block');
    });
});

describe('isValidChain', () => {
    let blockchain;
    let mockGenesisBlock, mockBlock1, mockBlock2;

    beforeEach(() => {
        mockGenesisBlock = {
            previousHash: '----',
            hash: 'genesis-hash',
            timestamp: 0,
            data: 'genesis-data',
            toString: jest.fn(() => 'Genesis Block')
        };
        mockBlock1 = {
            previousHash: 'genesis-hash',
            hash: 'block1-hash',
            timestamp: 1,
            data: 'block1-data',
            toString: jest.fn(() => 'Block 1')
        };
        mockBlock2 = {
            previousHash: 'block1-hash',
            hash: 'block2-hash',
            timestamp: 2,
            data: 'block2-data',
            toString: jest.fn(() => 'Block 2')
        };

        Block.genesis.mockReturnValue(mockGenesisBlock);
        Block.hashBlock = jest.fn();

        blockchain = new Blockchain();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
;

    test('returns false if the genesis block is invalid', () => {
        const fakeGenesis = { ...mockGenesisBlock, data: 'fake' };
        const chain = [fakeGenesis, mockBlock1];
        expect(blockchain.isValidChain(chain)).toBe(false);
    });

    test('returns false if a block has invalid previousHash', () => {
        const badBlock1 = { ...mockBlock1, previousHash: 'wrong-hash' };
        const chain = [mockGenesisBlock, badBlock1];
        Block.hashBlock.mockReturnValue('block1-hash');
        expect(blockchain.isValidChain(chain)).toBe(false);
    });

    test('returns false if a block has invalid hash', () => {
        Block.hashBlock.mockReturnValue('not-matching-hash');
        const chain = [mockGenesisBlock, mockBlock1];
        expect(blockchain.isValidChain(chain)).toBe(false);
    });

    test('returns true for a chain with only the genesis block', () => {
        const chain = [mockGenesisBlock];
        expect(blockchain.isValidChain(chain)).toBe(true);
    });
});
describe('replaceChain', () => {
    let blockchain;
    let mockGenesisBlock, mockBlock1, mockBlock2, mockNewBlock1, mockNewBlock2;

    beforeEach(() => {
        mockGenesisBlock = {
            previousHash: '----',
            hash: 'genesis-hash',
            timestamp: 0,
            data: 'genesis-data',
            toString: jest.fn(() => 'Genesis Block')
        };
        mockBlock1 = {
            previousHash: 'genesis-hash',
            hash: 'block1-hash',
            timestamp: 1,
            data: 'block1-data',
            toString: jest.fn(() => 'Block 1')
        };
        mockBlock2 = {
            previousHash: 'block1-hash',
            hash: 'block2-hash',
            timestamp: 2,
            data: 'block2-data',
            toString: jest.fn(() => 'Block 2')
        };
        mockNewBlock1 = {
            previousHash: 'genesis-hash',
            hash: 'newblock1-hash',
            timestamp: 3,
            data: 'newblock1-data',
            toString: jest.fn(() => 'New Block 1')
        };
        mockNewBlock2 = {
            previousHash: 'newblock1-hash',
            hash: 'newblock2-hash',
            timestamp: 4,
            data: 'newblock2-data',
            toString: jest.fn(() => 'New Block 2')
        };

        Block.genesis.mockReturnValue(mockGenesisBlock);
        Block.hashBlock = jest.fn();

        blockchain = new Blockchain();
        blockchain.chain = [mockGenesisBlock, mockBlock1];
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('does not replace chain if new chain is not longer', () => {
        const newChain = [mockGenesisBlock, mockNewBlock1];
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        blockchain.replaceChain(newChain);
        expect(blockchain.chain).toEqual([mockGenesisBlock, mockBlock1]);
        expect(logSpy).toHaveBeenCalledWith('Received chain is not longer than the current chain. Ignoring.');
        logSpy.mockRestore();
    });

    test('does not replace chain if new chain is invalid', () => {
        const newChain = [mockGenesisBlock, mockNewBlock1, mockNewBlock2];
        jest.spyOn(blockchain, 'isValidChain').mockReturnValue(false);
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        blockchain.replaceChain(newChain);
        expect(blockchain.chain).toEqual([mockGenesisBlock, mockBlock1]);
        expect(logSpy).toHaveBeenCalledWith('Received chain is invalid. Ignoring.');
        logSpy.mockRestore();
    });

    test('replaces chain if new chain is longer and valid', () => {
        const newChain = [mockGenesisBlock, mockNewBlock1, mockNewBlock2];
        jest.spyOn(blockchain, 'isValidChain').mockReturnValue(true);
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        blockchain.replaceChain(newChain);
        expect(blockchain.chain).toBe(newChain);
        expect(logSpy).toHaveBeenCalledWith('Replacing the current chain with the new chain.');
        logSpy.mockRestore();
    });
});