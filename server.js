// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// আপনার গোপন API keys এখানে রাখুন
const FIREBASE_CONFIG = {
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

// Firebase Admin SDK initialization
const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'অনুমতি প্রয়োজন' });
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

// API Routes

// 1. Firebase configuration endpoint
app.get('/api/config', (req, res) => {
    res.json({
        firebaseConfig: {
            apiKey: FIREBASE_CONFIG.apiKey,
            authDomain: FIREBASE_CONFIG.authDomain,
            projectId: FIREBASE_CONFIG.projectId,
            storageBucket: FIREBASE_CONFIG.storageBucket,
            messagingSenderId: FIREBASE_CONFIG.messagingSenderId,
            appId: FIREBASE_CONFIG.appId
        }
    });
});

// 2. Telegram notification endpoint
app.post('/api/send-notification', async (req, res) => {
    try {
        const { message } = req.body;
        
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        res.json({ success: data.ok });
    } catch (error) {
        res.status(500).json({ error: 'টেলিগ্রাম নোটিফিকেশন ব্যর্থ' });
    }
});

// 3. Order processing endpoint
app.post('/api/process-order', authenticateToken, async (req, res) => {
    try {
        const { orderData } = req.body;
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
        
        // Send Telegram notification
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
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
        
        await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown'
            })
        });
        
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
        res.status(500).json({ error: 'কার্ড ভেরিফিকেশন ব্যর্থ' });
    }
});

// 5. Balance transfer endpoint
app.post('/api/transfer-balance', authenticateToken, async (req, res) => {
    try {
        const { fromCardId, fromCardPassword, toCardId, amount } = req.body;
        
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
        res.status(500).json({ error: 'ব্যালেন্স ট্রান্সফার ব্যর্থ' });
    }
});

// 6. Check user blocked status
app.get('/api/check-user-status/:email', authenticateToken, async (req, res) => {
    try {
        const encodedEmail = req.params.email.replace(/\./g, ',');
        const snapshot = await db.ref('blockedUsersByEmail/' + encodedEmail).once('value');
        
        res.json({
            isBlocked: snapshot.exists(),
            email: req.params.email
        });
    } catch (error) {
        res.status(500).json({ error: 'স্ট্যাটাস চেক ব্যর্থ' });
    }
});

// 7. Get user orders
app.get('/api/user-orders', authenticateToken, async (req, res) => {
    try {
        const ordersRef = db.ref('orders');
        const snapshot = await ordersRef.orderByChild('email').equalTo(req.user.email).once('value');
        
        const orders = [];
        snapshot.forEach(child => {
            orders.push(child.val());
        });
        
        orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: 'অর্ডার লোড করা যায়নি' });
    }
});

// 8. Get delivery charges
app.get('/api/delivery-charge/:district', async (req, res) => {
    try {
        const district = req.params.district;
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
        res.status(500).json({ error: 'ডেলিভারি চার্জ লোড করা যায়নি' });
    }
});

// 9. Send message endpoint
app.post('/api/send-message', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
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
        res.status(500).json({ error: 'মেসেজ পাঠানো যায়নি' });
    }
});

// 10. Get user messages
app.get('/api/user-messages', authenticateToken, async (req, res) => {
    try {
        const messagesRef = db.ref('userMessages/' + req.user.uid);
        const snapshot = await messagesRef.orderByChild('timestamp').once('value');
        
        const messages = [];
        snapshot.forEach(child => {
            messages.push(child.val());
        });
        
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: 'মেসেজ লোড করা যায়নি' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'সার্ভার ইরর' });
});