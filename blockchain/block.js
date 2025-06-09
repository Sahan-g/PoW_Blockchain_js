
const ChainUtill = require("../chain-util.js");
const { DIFFICULTY, MINE_RATE } = require("../config.js");

class Block {
    constructor(index, previousHash, timestamp, data, hash, nonce, difficulty) {
        this.index = index || 0; // Default index if not provided
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.nonce = nonce || 0;
        this.difficulty = difficulty || DIFFICULTY; // Default difficulty if not provided
    }

    toString() {
        const prevHashStr = String(this.previousHash || '').substring(0, 10) || '----';
        const hashStr = String(this.hash || '').substring(0, 10) || '----';
        return `Block -
        Index        : ${this.index}
        Previous Hash: ${prevHashStr}...
        Timestamp    : ${this.timestamp}
        Data         : ${this.data}
        Nonce        : ${this.nonce}
        Difficulty   : ${this.difficulty}
        Hash         : ${hashStr}...`;
    }

    static genesis() {
        return new this(
            0,                                      // index
            '0'.repeat(64),                         // previousHash
            1465154705,                             // timestamp
            'Genesis Block',                        // data
            'a3c6e4f8b1c2...t5u6v7w',               // hash
            1500,                                   // nonce
            DIFFICULTY                              // difficulty
    );
}

    // static mineBlock(previousBlock, data) {
    //     let hash, timestamp;

    //     const previousHash = previousBlock ? previousBlock.hash : 0;
    //     let nonce = 0;
    //     let difficulty = previousBlock ? previousBlock.difficulty : DIFFICULTY;

    //     do {
    //         nonce++;
    //         timestamp = Date.now();
    //         difficulty = Block.adjustDifficulty(previousBlock, timestamp);
    //         hash = Block.hashBlock(previousHash, timestamp, data, nonce, difficulty);
    //     } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));
    //     if (timestamp - previousBlock.timestamp < MINE_RATE) {

    //     }
    //     return new this(previousHash, timestamp, data, hash, nonce, difficulty);
    // }

    static mineBlock(previousBlock, data) {
    let hash, timestamp;

    const previousHash = previousBlock ? previousBlock.hash : '0';
    let nonce = 0;
    let difficulty = previousBlock ? previousBlock.difficulty : DIFFICULTY;
    let index = previousBlock ? previousBlock.index + 1 : 0;

    do {
        nonce++;
        timestamp = Date.now();
        difficulty = Block.adjustDifficulty(previousBlock, timestamp);
        hash = Block.hashBlock(index, previousHash, timestamp, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    if (previousBlock && previousBlock.timestamp != null) {
        const mineTime = timestamp - previousBlock.timestamp;
        if (mineTime < MINE_RATE) {
            console.log(`Block mined too fast: ${mineTime}ms`);
        }
    }

    return new this(index, previousHash, timestamp, data, hash, nonce, difficulty);
}


    static hashBlock(index,previousHash, timestamp, data, nonce, difficulty) {
        return ChainUtill.hash(`${index} + ${previousHash} + ${timestamp} + ${data} + ${nonce} + ${difficulty}`);
    }

    // static adjustDifficulty(previousBlock, timestamp) {
    //     let difficulty  = previousBlock ? previousBlock.difficulty : DIFFICULTY;

    //     if (difficulty < 1) return 1;

    //     if (timestamp < previousBlock.timestamp + MINE_RATE) {
    //         return difficulty + 1;
    //     } else {
    //         return Math.max(difficulty - 1, 1);
    //     }
    // }

static adjustDifficulty(previousBlock, timestamp) {
    let difficulty = previousBlock ? previousBlock.difficulty : DIFFICULTY;

    if (difficulty < 1) return 1;

    // If timestamp or previousBlock.timestamp is undefined or null, return current difficulty
    if (!previousBlock ) {
        return difficulty;
    }

    if (timestamp < previousBlock.timestamp + MINE_RATE) {
        return difficulty + 1;
    } else {
        return Math.max(difficulty - 1, 1);
    }
}

static fromObject(obj) {
    const {index, previousHash, timestamp, data, hash, nonce, difficulty} = obj;
    return new this(index, previousHash, timestamp, data, hash, nonce, difficulty);
}


}

module.exports = Block;
// This code defines a Block class that represents a block in a blockchain.
// Each block contains a previous hash, a timestamp, data, and its own hash.