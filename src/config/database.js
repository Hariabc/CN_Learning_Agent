const mongoose = require('mongoose');

class Database {
    constructor() {
        this.isConnected = false;
    }

    async connect() {
        try {
                    if (this.isConnected) {
            return;
        }

            const mongoUri = process.env.MONGODB_URI;
            
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            this.isConnected = true;

            // Handle connection events
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                this.isConnected = false;
            });

        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error.message);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.isConnected) {
                await mongoose.disconnect();
                this.isConnected = false;
            }
        } catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error.message);
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    }
}

module.exports = new Database(); 