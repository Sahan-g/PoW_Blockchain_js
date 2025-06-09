const { Level } = require('level');

const DB_PATH = process.env.DB_PATH || './chaindata';

class BlockchainDB {
    constructor() {
        this.db = new Level(DB_PATH, {
            valueEncoding: 'json' // automatically handles stringifying and parsing.
        });
    }
    
    async saveChain(chain) {
        try {
            await this.db.put('blockchain', chain);
            console.log('Blockchain saved to DB successfully.');

        } catch (error) {
            console.error('Failed to save blockchain:', error);
        }
    }

    async getChain() {
        try {
            const chain = await this.db.get('blockchain');
            console.log('Blockchain retrieved from DB successfully.');
            return chain;

        } catch (error) {
            if (error.code==='LEVEL_NOT_FOUND') {
                console.log('Blockchain not found in DB, returning empty chain.');
                return [];
            }
            console.error('Failed to retrieve blockchain:', error);
            throw error;
        }
    }
}

module.exports = new BlockchainDB();