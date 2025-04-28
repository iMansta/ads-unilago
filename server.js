const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const securityLogging = require('./middleware/securityLogger');
const routes = require('./routes');
const User = require('./models/User');
const Post = require('./models/Post');
const Group = require('./models/group');

// Carregar variáveis de ambiente
dotenv.config();

// Configurar Mongoose
mongoose.set('strictQuery', false);

const app = express();

// Configuração CORS
app.use(cors({
    origin: ['https://atletica-ads-unilago-frontend.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Middleware para log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Middleware para tratamento de CORS
app.use((req, res, next) => {
    const allowedOrigins = ['https://atletica-ads-unilago-frontend.onrender.com', 'http://localhost:3000'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '../frontend')));
}

// Headers de segurança
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});

// Middleware de segurança
app.use(securityLogging);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ads-unilago';
console.log('Connecting to MongoDB...');
console.log('URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Log URI without credentials

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000, // Increase socket timeout
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = process.env.NODE_ENV === 'production' 
            ? '/tmp/uploads'
            : 'uploads/';
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findOne({ _id: decoded.userId });
        
        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Rota de teste
app.get('/api/test', (req, res) => {
    console.log('Test route accessed');
    console.log('Request headers:', req.headers);
    
    const allowedOrigins = ['https://atletica-ads-unilago-frontend.onrender.com', 'http://localhost:3000'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        cors: {
            origin: origin || 'No origin',
            method: req.method,
            headers: req.headers
        }
    });
});

// User profile route
app.get('/api/user/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Routes
// Auth routes
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, course, semester } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            course,
            semester
        });

        await user.save();
        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'Email não encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
});

// Post routes
app.post('/api/posts', auth, upload.single('image'), async (req, res) => {
    try {
        const post = new Post({
            user: req.user._id,
            content: req.body.content,
            image: req.file ? req.file.filename : undefined
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar post' });
    }
});

app.get('/api/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar posts' });
    }
});

// Group routes
app.post('/api/groups', auth, async (req, res) => {
    try {
        const group = new Group({
            name: req.body.name,
            description: req.body.description,
            creator: req.user._id,
            members: [req.user._id]
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar grupo' });
    }
});

app.get('/api/groups', auth, async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('creator', 'name')
            .populate('members', 'name');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar grupos' });
    }
});

// Friend routes
app.post('/api/friends/add/:id', auth, async (req, res) => {
    try {
        const friend = await User.findById(req.params.id);
        if (!friend) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        req.user.friends.push(friend._id);
        await req.user.save();
        res.json({ message: 'Amigo adicionado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar amigo' });
    }
});

// Rotas
app.use('/api', routes);

// Rota para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rota para servir as páginas do frontend
app.get('/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, `../frontend/${page}.html`));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; 