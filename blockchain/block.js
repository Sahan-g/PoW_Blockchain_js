
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

    //     static genesis() {
    //         return new this(
    //             0,                                      // index
    //             '0'.repeat(64),                         // previousHash
    //             1465154705,                             // timestamp
    //             ['Genesis Block'],                        // data
    //             'a3c6e4f8b1c2...t5u6v7w',               // hash
    //             1500,                                   // nonce
    //             DIFFICULTY                              // difficulty
    //     );
    // }

   static genesis() {
    return new this(
        0, // index
        '0', // previousHash
        1749575939497, // timestamp
        [
            {
                "id": "fb03d160-461e-11f0-a873-317a3b58584b",
                "input": {
                    "timestamp": 1749575932278,
                    "amount": 500,
                    "address": "04e6a5f2b6937e522983dac76a7d80b3f36405597f044d9d6e244abcf60058ce52460c38e1a16130ab8a1a41b6ef7ee4d39699fb3bf6bb91ec0ea5f4556ec56705",
                    "signature": {
                        "r": "70835cce1bfae94fdd391077ff129fec0aa0b6a30d9f470020fc4be4f90daa54",
                        "s": "6ba6e9c5e55d4745fde911e4e1df5fe0ea877d2b0125d8c38bb45f79791415d",
                        "recoveryParam": 0
                    }
                },
                "outputs": [
                    {
                        "amount": 477,
                        "address": "04e6a5f2b6937e522983dac76a7d80b3f36405597f044d9d6e244abcf60058ce52460c38e1a16130ab8a1a41b6ef7ee4d39699fb3bf6bb91ec0ea5f4556ec56705"
                    },
                    {
                        "amount": 23,
                        "address": "042a0cae8a3b7f3dfb1e57239422b150c28a4702afa0065a9730c80d2f07bfff0efbf960358b24ca1f45ff38531a2593c23647d55d7d11da3b8214421c6d1ab044"
                    }
                ]
            },
            {
                "id": "fd695fb0-461e-11f0-a873-317a3b58584b",
                "input": {
                    "timestamp": 1749575936299,
                    "amount": 500,
                    "address": "0400b0e2e54ea13f9987d8fe60222af6e4470b50101183eb1b0df7b1e57b967d902bc2ee466cc94963fab2114fcc74f80937ae78d69ea7df42288f619a109dc793",
                    "signature": {
                        "r": "cb135a0d087ce70cbf2ff1a2440c4a034b78dbdbc24bf005f895f1ce1cf04f3f",
                        "s": "b5a2fad7f2e90accd1d6d9c4efa9c8b0dae8a0785a13871dfbf1200967857e31",
                        "recoveryParam": 0
                    }
                },
                "outputs": [
                    {
                        "amount": 50,
                        "address": "04e6a5f2b6937e522983dac76a7d80b3f36405597f044d9d6e244abcf60058ce52460c38e1a16130ab8a1a41b6ef7ee4d39699fb3bf6bb91ec0ea5f4556ec56705"
                    }
                ]
            }
        ], // data
        '0000ed9e07bf3d957688ed7ac3b93aa78c24afaad55056818faab9f03be9aaec', // hash
        89701, // nonce
        4 // difficulty
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


    static hashBlock(index, previousHash, timestamp, data, nonce, difficulty) {
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
        if (!previousBlock) {
            return difficulty;
        }

        if (timestamp < previousBlock.timestamp + MINE_RATE) {
            return difficulty + 1;
        } else {
            return Math.max(difficulty - 1, 1);
        }
    }


    static isValidBlock(block) {
        if (!block) return false;
        const { index, previousHash, timestamp, data, nonce, difficulty, hash } = block;
        const validHash = ChainUtill.hash(`${index} + ${previousHash} + ${timestamp} + ${data} + ${nonce} + ${difficulty}`);
        return (
            hash === validHash &&
            hash.substring(0, difficulty) === '0'.repeat(difficulty)
        );
    }

    static fromObject(obj) {
        const { index, previousHash, timestamp, data, hash, nonce, difficulty } = obj;
        return new this(index, previousHash, timestamp, data, hash, nonce, difficulty);
    }


}

module.exports = Block;
// This code defines a Block class that represents a block in a blockchain.
// Each block contains a previous hash, a timestamp, data, and its own hash.