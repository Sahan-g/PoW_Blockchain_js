Block = require('./block.js');

class blockchain{
    constructor() {
        this.chain = [];
    }

    addBlock(data) {
        const previousBlock = this.chain[this.chain.length - 1];
        const newBlock = Block.mineBlock(previousBlock, data);
        this.chain.push(newBlock);
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

    replaceChain(newChain) {
        
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
    }
}

module.exports = blockchain;