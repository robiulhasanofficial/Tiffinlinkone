// server.js - Fixed Version
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // node-fetch যোগ করুন
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000; // Render.com uses port 10000

// Middleware
app.use(cors());
app.use(express.json());

// Log environment check
console.log('🚀 Server starting...');
console.log('📁 Current directory:', __dirname);
console.log('⚙️ Environment:', process.env.NODE_ENV || 'development');
console.log('🔧 PORT:', process.env.PORT);

// Firebase Admin SDK initialization with error handling
let admin, db;
try {
    // Firebase credentials from environment variables (Render.com এ সেট করতে হবে)
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    console.log('✅ Firebase Config Loaded:', {
        hasApiKey: !!process.env.FIREBASE_API_KEY,
        hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasTelegramToken: !!process.env.TELEGRAM_BOT_TOKEN
    });

    // Firebase Admin SDK initialization
    admin = require('firebase-admin');
    
    // Check if Firebase Admin is already initialized
    if (!admin.apps.length) {
        // Use environment variables for service account
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY ? 
                process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log('✅ Firebase Admin SDK initialized');
    } else {
        console.log('✅ Firebase Admin SDK already initialized');
    }

    db = admin.database();
    console.log('✅ Firebase Database connected');

} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('⚠️ Running in simulation mode (Firebase not available)');
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'অনুমতি প্রয়োজন' });
    }
    
    if (!admin) {
        // If Firebase is not available, simulate authentication
        req.user = {
            uid: 'simulated-user-id',
            email: 'test@example.com',
            name: 'Test User'
        };
        return next();
    }
    
    admin.auth().verifyIdToken(token)
        .then(decodedToken => {
            req.user = decodedToken;
            next();
        })
        .catch(error => {
            res.status(403).json({ error: 'অবৈধ টোকেন' });
        });
};

// ==================== API ROUTES ====================

// Health check endpoint (একদম প্রথমে)
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'TiffinLink API',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        firebase: !!admin
    });
});

// 1. Firebase configuration endpoint
app.get('/api/config', (req, res) => {
    res.json({
        firebaseConfig: {
            apiKey: process.env.FIREBASE_API_KEY || 'not-configured',
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'not-configured',
            projectId: process.env.FIREBASE_PROJECT_ID || 'not-configured',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'not-configured',
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'not-configured',
            appId: process.env.FIREBASE_APP_ID || 'not-configured'
        },
        status: 'online',
        mode: process.env.NODE_ENV || 'development'
    });
});

// 2. Telegram notification endpoint
app.post('/api/send-notification', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
            return res.json({ 
                success: true, 
                message: 'Telegram notification simulated (credentials not configured)',
                testMode: true 
            });
        }
        
        const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        res.json({ success: data.ok });
    } catch (error) {
        console.error('Telegram error:', error);
        res.status(500).json({ error: 'টেলিগ্রাম নোটিফিকেশন ব্যর্থ' });
    }
});

// 3. Order processing endpoint
app.post('/api/process-order', authenticateToken, async (req, res) => {
    try {
        const { orderData } = req.body;
        
        if (!orderData || !orderData.items || orderData.items.length === 0) {
            return res.status(400).json({ error: 'Invalid order data' });
        }
        
        // If Firebase is not available, simulate order processing
        if (!db) {
            const orderId = 'SIM-' + Date.now().toString().slice(-6);
            return res.json({ 
                success: true, 
                orderId: orderId,
                message: 'Order processed in simulation mode (Firebase not connected)',
                simulation: true
            });
        }
        
        const userId = req.user.uid;
        
        // Check if user is blocked
        const blockedUserRef = db.ref('blockedUsersByEmail/' + req.user.email.replace(/\./g, ','));
        const blockedSnapshot = await blockedUserRef.once('value');
        
        if (blockedSnapshot.exists()) {
            return res.status(403).json({ error: 'আপনার অ্যাকাউন্ট ব্লক করা হয়েছে' });
        }
        
        // Process order in Firebase
        const orderRef = db.ref('orders').push();
        const orderId = 'ORD-' + Date.now().toString().slice(-6);
        
        const completeOrder = {
            ...orderData,
            id: orderId,
            userId: userId,
            email: req.user.email,
            status: 'pending',
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })
        };
        
        await orderRef.set(completeOrder);
        
        // Update stock for each book
        for (const item of orderData.items) {
            const bookRef = db.ref('books/' + item.id);
            const snapshot = await bookRef.once('value');
            const book = snapshot.val();
            
            if (book && book.stock >= item.quantity) {
                const newStock = book.stock - item.quantity;
                await bookRef.update({ stock: newStock });
            } else {
                throw new Error(`"${item.title}" এর পর্যাপ্ত স্টক নেই`);
            }
        }
        
        // Send Telegram notification if configured
        if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
            const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
            const telegramMessage = `
                *নতুন অর্ডার!*
                অর্ডার: ${orderId}
                গ্রাহক: ${orderData.name}
                ইমেইল: ${req.user.email}
                মোবাইল: ${orderData.phone}
                ঠিকানা: ${orderData.address}
                জেলা: ${orderData.district}
                কার্ড: ${orderData.cardId}
                ডেলিভারি: ৳${orderData.shipping}
                মোট: ৳${orderData.total}
            `;
            
            try {
                await fetch(telegramUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: process.env.TELEGRAM_CHAT_ID,
                        text: telegramMessage,
                        parse_mode: 'Markdown'
                    })
                });
            } catch (telegramError) {
                console.error('Telegram notification failed:', telegramError);
                // Continue even if Telegram fails
            }
        }
        
        res.json({ 
            success: true, 
            orderId: orderId,
            message: 'অর্ডার সফলভাবে প্রসেস হয়েছে'
        });
        
    } catch (error) {
        console.error('Order processing error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Card verification endpoint
app.post('/api/verify-card', authenticateToken, async (req, res) => {
    try {
        const { cardId, cardPassword } = req.body;
        
        if (!cardId || !cardPassword) {
            return res.json({ 
                success: false, 
                message: 'কার্ড আইডি এবং পাসওয়ার্ড প্রয়োজন' 
            });
        }
        
        // If Firebase is not available, simulate card verification
        if (!db) {
            return res.json({
                success: true,
                message: 'কার্ড ভেরিফিকেশন সফল (সিমুলেশন মোড)',
                card: {
                    id: cardId,
                    name: 'Test User',
                    balance: 5000
                },
                simulation: true
            });
        }
        
        const cardRef = db.ref('cards/' + cardId);
        const snapshot = await cardRef.once('value');
        const card = snapshot.val();
        
        if (card && card.password === cardPassword) {
            res.json({
                success: true,
                card: {
                    id: cardId,
                    name: card.name,
                    balance: card.balance
                }
            });
        } else {
            res.json({
                success: false,
                message: 'কার্ড আইডি বা পাসওয়ার্ড ভুল!'
            });
        }
    } catch (error) {
        console.error('Card verification error:', error);
        res.status(500).json({ error: 'কার্ড ভেরিফিকেশন ব্যর্থ' });
    }
});

// 5. Balance transfer endpoint
app.post('/api/transfer-balance', authenticateToken, async (req, res) => {
    try {
        const { fromCardId, fromCardPassword, toCardId, amount } = req.body;
        
        if (!fromCardId || !fromCardPassword || !toCardId || !amount || amount <= 0) {
            return res.json({ 
                success: false, 
                message: 'সব তথ্য সঠিকভাবে পূরণ করুন!' 
            });
        }
        
        if (fromCardId === toCardId) {
            return res.json({ 
                success: false, 
                message: 'আপনি নিজের কার্ডে টাকা ট্রান্সফার করতে পারবেন না!' 
            });
        }
        
        // If Firebase is not available, simulate transfer
        if (!db) {
            return res.json({
                success: true,
                message: `সফলভাবে ৳${amount} টাকা ট্রান্সফার করা হয়েছে! (সিমুলেশন)`,
                fromNewBalance: 4500,
                toNewBalance: 5500,
                simulation: true
            });
        }
        
        // Verify from card
        const fromCardRef = db.ref('cards/' + fromCardId);
        const fromSnapshot = await fromCardRef.once('value');
        const fromCard = fromSnapshot.val();
        
        if (!fromCard || fromCard.password !== fromCardPassword) {
            return res.json({ success: false, message: 'কার্ড তথ্য ভুল!' });
        }
        
        // Check if to card exists
        const toCardRef = db.ref('cards/' + toCardId);
        const toSnapshot = await toCardRef.once('value');
        const toCard = toSnapshot.val();
        
        if (!toCard) {
            return res.json({ success: false, message: 'প্রাপকের কার্ড পাওয়া যায়নি!' });
        }
        
        // Check balance
        if (fromCard.balance < amount) {
            return res.json({ success: false, message: 'পর্যাপ্ত ব্যালেন্স নেই!' });
        }
        
        // Update balances
        const fromNewBalance = fromCard.balance - amount;
        const toNewBalance = toCard.balance + amount;
        
        await fromCardRef.update({ balance: fromNewBalance });
        await toCardRef.update({ balance: toNewBalance });
        
        // Record transaction
        const transactionRef = db.ref('transactions').push();
        await transactionRef.set({
            fromCardId: fromCardId,
            toCardId: toCardId,
            amount: amount,
            timestamp: new Date().toISOString(),
            fromCardName: fromCard.name,
            toCardName: toCard.name,
            userId: req.user.uid
        });
        
        res.json({
            success: true,
            message: `সফলভাবে ৳${amount} টাকা ট্রান্সফার করা হয়েছে!`,
            fromNewBalance: fromNewBalance,
            toNewBalance: toNewBalance
        });
        
    } catch (error) {
        console.error('Balance transfer error:', error);
        res.status(500).json({ error: 'ব্যালেন্স ট্রান্সফার ব্যর্থ' });
    }
});

// 6. Check user blocked status
app.get('/api/check-user-status/:email', authenticateToken, async (req, res) => {
    try {
        const email = req.params.email;
        
        // If Firebase is not available, simulate check
        if (!db) {
            return res.json({
                isBlocked: false,
                email: email,
                simulation: true
            });
        }
        
        const encodedEmail = email.replace(/\./g, ',');
        const snapshot = await db.ref('blockedUsersByEmail/' + encodedEmail).once('value');
        
        res.json({
            isBlocked: snapshot.exists(),
            email: email
        });
    } catch (error) {
        console.error('Check user status error:', error);
        res.status(500).json({ error: 'স্ট্যাটাস চেক ব্যর্থ' });
    }
});

// 7. Get user orders
app.get('/api/user-orders', authenticateToken, async (req, res) => {
    try {
        // If Firebase is not available, return empty orders
        if (!db) {
            return res.json({ 
                orders: [],
                message: 'Firebase not connected - simulation mode',
                simulation: true
            });
        }
        
        const ordersRef = db.ref('orders');
        const snapshot = await ordersRef.orderByChild('email').equalTo(req.user.email).once('value');
        
        const orders = [];
        snapshot.forEach(child => {
            orders.push(child.val());
        });
        
        orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json({ orders });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'অর্ডার লোড করা যায়নি' });
    }
});

// 8. Get delivery charges
app.get('/api/delivery-charge/:district', async (req, res) => {
    try {
        const district = req.params.district;
        
        // If Firebase is not available, use default charges
        if (!db) {
            const defaultCharges = {
                'ঢাকা': 60,
                'চট্টগ্রাম': 80,
                'খুলনা': 100,
                'রাজশাহী': 100,
                'সিলেট': 120,
                'বরিশাল': 120
            };
            
            const charge = defaultCharges[district] || 100;
            return res.json({ 
                charge: charge,
                district: district,
                simulation: true 
            });
        }
        
        const snapshot = await db.ref('deliveryCharges/' + district).once('value');
        const charge = snapshot.val();
        
        if (charge !== null) {
            res.json({ charge });
        } else {
            // Get default charge
            const defaultSnapshot = await db.ref('defaultDeliveryCharge').once('value');
            const defaultCharge = defaultSnapshot.exists() ? defaultSnapshot.val() : 100;
            res.json({ charge: defaultCharge });
        }
    } catch (error) {
        console.error('Get delivery charge error:', error);
        res.status(500).json({ error: 'ডেলিভারি চার্জ লোড করা যায়নি' });
    }
});

// 9. Send message endpoint
app.post('/api/send-message', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.json({ success: false, message: 'মেসেজ প্রয়োজন' });
        }
        
        // If Firebase is not available, simulate message sending
        if (!db) {
            return res.json({ 
                success: true, 
                message: 'মেসেজ পাঠানো হয়েছে (সিমুলেশন)',
                simulation: true
            });
        }
        
        const userId = req.user.uid;
        
        const messageRef = db.ref('userMessages/' + userId).push();
        await messageRef.set({
            text: message,
            sender: 'user',
            senderName: req.user.name || req.user.email.split('@')[0],
            senderEmail: req.user.email,
            senderUid: userId,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        res.json({ success: true, message: 'মেসেজ পাঠানো হয়েছে' });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'মেসেজ পাঠানো যায়নি' });
    }
});

// 10. Get user messages
app.get('/api/user-messages', authenticateToken, async (req, res) => {
    try {
        // If Firebase is not available, return empty messages
        if (!db) {
            return res.json({ 
                messages: [],
                simulation: true
            });
        }
        
        const messagesRef = db.ref('userMessages/' + req.user.uid);
        const snapshot = await messagesRef.orderByChild('timestamp').once('value');
        
        const messages = [];
        snapshot.forEach(child => {
            messages.push(child.val());
        });
        
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        res.json({ messages });
    } catch (error) {
        console.error('Get user messages error:', error);
        res.status(500).json({ error: 'মেসেজ লোড করা যায়নি' });
    }
});

// Test endpoint without authentication
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        service: 'TiffinLink API',
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TiffinLink API Server</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .container { max-width: 800px; margin: 0 auto; }
                h1 { color: #333; }
                .status { padding: 10px; background: #4CAF50; color: white; border-radius: 5px; }
                .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
                code { background: #eee; padding: 2px 5px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 TiffinLink API Server</h1>
                <div class="status">
                    ✅ Server is running successfully
                </div>
                
                <h3>Available Endpoints:</h3>
                <div class="endpoint">
                    <strong>GET /health</strong> - Health check
                </div>
                <div class="endpoint">
                    <strong>GET /api/test</strong> - Test endpoint
                </div>
                <div class="endpoint">
                    <strong>GET /api/config</strong> - Get Firebase configuration
                </div>
                <div class="endpoint">
                    <strong>POST /api/send-notification</strong> - Send Telegram notification
                </div>
                <div class="endpoint">
                    <strong>POST /api/process-order</strong> - Process new order
                </div>
                
                <p>Server Time: ${new Date().toLocaleString()}</p>
                <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
            </div>
        </body>
        </html>
    `);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// Start server
app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`🌐 Health endpoint: http://localhost:${port}/health`);
    console.log(`🚀 Ready to serve requests!`);
});