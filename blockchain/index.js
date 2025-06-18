const Block = require('./block.js');
const db = require('../database');
const ChainUtill = require('../chain-util.js');
//const Block = require('./block.js');

class Blockchain{
    constructor() {
        this.chain = [];
    }

    
    static async create() {
        const blockchain = new Blockchain()
        let chainFromDB = await db.getChain();

        if(chainFromDB && chainFromDB.length > 0) {
            console.log('Blockchain loaded from DB');
            blockchain.chain = chainFromDB.map(blockData => Block.fromObject(blockData))
        } else {
            console.log('No blockchain found. Creating genesis block...');
            const genesisBlock = Block.genesis();
            blockchain.chain = [genesisBlock];
            //blockchain.chain = [];
            await db.saveChain(blockchain.chain);
        }
        return blockchain;
    }


    async addBlock(data) {
        const previousBlock = this.chain[this.chain.length - 1];
        const newBlock = Block.mineBlock(previousBlock, data);
        this.chain.push(newBlock);
        await db.saveChain(this.chain);
        console.log('New block added and chain saved to DB.');
        console.log(`CREATED  BLOCK ADDED: ${newBlock.toString()}`);
        return newBlock;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    toString() {
        return this.chain.map(block => block.toString()).join('\n');
    }

    isValidChain(chain) {
        // if (JSON.stringify(chain[0]) != JSON.stringify(Block.genesis())) {
        //     return false;
        // }

        for (let i = 1; i < chain.length; i++) {
            const currentBlock = chain[i];
            const previousBlock = chain[i - 1];

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            if (currentBlock.hash !== Block.hashBlock(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.data, currentBlock.nonce, currentBlock.difficulty)) {
                return false;
            }
        }
        return true;
    }

    async replaceChain(newChain) {
        
        console.log(newChain)
        if (newChain.length <= this.chain.length) {
            console.log('Received chain is not longer than the current chain. Ignoring.');
            return;
        }

        if (!this.isValidChain(newChain)) {
            console.log('Received chain is invalid. Ignoring.');
            return;
        }

        console.log('Replacing the current chain with the new chain.');
        this.chain = newChain;
        await db.saveChain(this.chain);
        console.log('Replaced chain and saved it to DB.');
    }

    addToChain(block) {
        const latestBlock = this.getLatestBlock();
        console.log(this.chain.length)
        if (this.chain.length === 0 || block.previousHash === latestBlock.hash) {
            this.chain.push(block);
            return true;
        }

        const existingBlock = this.chain[block.index]; 

        if (existingBlock) {
            const isHashValid = Block.isValidBlock(block);
            const isPrevHashValid = block.previousHash === this.chain[block.index - 1]?.hash;
            console.log(`EXISTING BLOCK HASH: ${existingBlock.hash}, RECEIVED BLOCK HASH: ${block.hash}`);
            console.log(`EXISTING BLOCK PREV HASH: ${existingBlock.previousHash}, RECEIVED BLOCK PREV HASH: ${block.previousHash}`);

            if (isHashValid || isPrevHashValid) {
                if (block.timestamp < existingBlock.timestamp) {
                    this.chain[block.index] = block;
                    console.log(`Block at index ${block.index} replaced with earlier timestamp.`);
                    return true;
                } else {
                    console.log(`Received block is valid but newer, ignoring.`);
                    return false;
                }
            } else {
                console.warn(`Hash mismatch or invalid previousHash. Possible fork or attack.`);
                return false;
            }
        }

        console.warn(`Block at index ${block.index} is disconnected or invalid.`);
        return false;
    }

}

module.exports = Blockchain;