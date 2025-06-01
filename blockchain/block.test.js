const Block = require('./block');
const SHA256 = require('crypto-js/sha256');
const{DIFFICULTY,MINE_RATE} = require('../config.js');

describe('Block', () => {
    describe('constructor', () => {
        it('should set properties correctly', () => {
            const block = new Block('abc', 123456, 'data', 'hash123');
            expect(block.previousHash).toBe('abc');
            expect(block.timestamp).toBe(123456);
            expect(block.data).toBe('data');
            expect(block.hash).toBe('hash123');
        });
    });


    describe('genesis', () => {
        it('should return the genesis block', () => {
            const genesis = Block.genesis();
            expect(genesis.previousHash).toBe('0');
            expect(genesis.timestamp).toBe(1465154705);
            expect(genesis.data).toBe('Genesis Block');
            expect(genesis.hash).toBe('a3c6e4f8b1c2d3e4f5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w'); // update if needed
        });
    });

    describe('mineBlock', () => {
        it('should return a Block instance', () => {
            const previousBlock = Block.genesis();
            const data = 'block-data';
            const block = Block.mineBlock(previousBlock, data);
            expect(block).toBeInstanceOf(Block);
        });

        it('should set previousHash to previous block\'s hash', () => {
            const previousBlock = Block.genesis();
            const data = 'block-data';
            const block = Block.mineBlock(previousBlock, data);
            expect(block.previousHash).toBe(previousBlock.hash);
        });

        it('should set data to the provided data', () => {
            const previousBlock = Block.genesis();
            const data = 'block-data';
            const block = Block.mineBlock(previousBlock, data);
            expect(block.data).toBe(data);
        });

        it('it lowers difficulty for slowly mined block',()=>{
            const block= new Block('abc', 123456, 'data', 'hash123', 0, DIFFICULTY);
            expect(Block.adjustDifficulty(block,block.timestamp+MINE_RATE+1000)).toBe(block.difficulty-1);

        })
        it('it increases difficulty for quickly mined block',()=>{
            const block= new Block('abc', 123456, 'data', 'hash123', 0, DIFFICULTY);
            expect(Block.adjustDifficulty(block,block.timestamp+MINE_RATE-100)).toBe(block.difficulty+1);

        })

      
    });

    
});
