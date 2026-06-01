const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
const JWT_SECRET = 'mysecret123';
let db, users;

async function connectDB() {
    const uri = "mongodb+srv://bharath:password1234@cluster0.tlwgfmy.mongodb.net/?appName=Cluster0";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
    
    await client.connect();
    console.log("Connected to MongoDB!");
    db = client.db('userdb');
    users = db.collection('users');
}

connectDB();

// Simple auth middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        next();
    });
}

// Register endpoint
app.post('/register', async (req, res) => {
    const result = await users.insertOne(req.body);
    res.status(201).json({ 
        message: 'User registered successfully'
    });
});

// Sign-in endpoint
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    
    // Find user
    const user = await users.findOne({ username , password });
    if (user == null) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ 
        message: 'Sign in successful', 
        username: user?.username,
        token
    });
});

//app.use(authenticateToken)

// Protected test endpoint
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ 
        message: 'This is a dashboard data it will big in real time'
    });
});

// Public test endpoint
app.get('/public', (req, res) => {
    res.json({ message: 'This is a public route' });
});

app.listen(3000, () => {
    console.log('🚀 JWT Auth Server running on http://localhost:3000');
});