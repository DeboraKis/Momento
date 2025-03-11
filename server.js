const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Atlas connection string - replace with your connection string
const uri = "mongodb+srv://deborakis1994:Szrtlk24@cluster0.1ndxz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Database connection
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to Atlas SQL Database');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

connectToDatabase();

// Routes
// Create a new capsule
app.post('/capsules', async (req, res) => {
    try {
        const capsule = {
            title: req.body.title,
            message: req.body.message,
            lockDate: new Date(req.body.lockDate),
            createdAt: new Date()
        };

        const result = await client
            .db('timeCapsuleDB')
            .collection('capsules')
            .insertOne(capsule);

        res.status(201).json({ ...capsule, id: result.insertedId });
    } catch (error) {
        console.error('Error creating capsule:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get all capsules
app.get('/capsules', async (req, res) => {
    try {
        const capsules = await client
            .db('timeCapsuleDB')
            .collection('capsules')
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        res.json(capsules);
    } catch (error) {
        console.error('Error fetching capsules:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a capsule
app.delete('/capsules/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const result = await client
            .db('timeCapsuleDB')
            .collection('capsules')
            .deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }

        res.json({ message: 'Capsule deleted successfully' });
    } catch (error) {
        console.error('Error deleting capsule:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling
process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
