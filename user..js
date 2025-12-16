// user.js - সম্পূর্ণ সার্ভার-সাইড ইন্টিগ্রেশন ভার্সন
const SERVER_URL = 'https://tiffinlinkone.onrender.com'; // আপনার সার্ভারের URL এখানে দিন

// বাংলাদেশের ৬৪ জেলার লিস্ট
const bangladeshDistricts = [
    "ঢাকা", "ফরিদপুর", "গাজীপুর", "গোপালগঞ্জ", "কিশোরগঞ্জ", "মাদারীপুর", "মানিকগঞ্জ", 
    "মুন্সীগঞ্জ", "নারায়ণগঞ্জ", "নরসিংদী", "রাজবাড়ী", "শরীয়তপুর", "টাঙ্গাইল", 
    "বান্দরবান", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "চট্টগ্রাম", "কুমিল্লা", "কক্সবাজার", 
    "ফেনী", "খাগড়াছড়ি", "লক্ষ্মীপুর", "নোয়াখালী", "রাঙ্গামাটি", "বরগুনা", "বরিশাল", 
    "ভোলা", "ঝালকাঠি", "পটুয়াখালী", "পিরোজপুর", "বাগেরহাট", "চুয়াডাঙ্গা", "যশোর", 
    "ঝিনাইদহ", "খুলনা", "কুষ্টিয়া", "মাগুরা", "মেহেরপুর", "নড়াইল", "সাতক্ষীরা", 
    "বগুড়া", "জয়পুরহাট", "নওগাঁ", "নাটোর", "চাঁপাইনবাবগঞ্জ", "পাবনা", "রাজশাহী", 
    "সিরাজগঞ্জ", "দিনাজপুর", "গাইবান্ধা", "কুড়িগ্রাম", "লালমনিরহাট", "নীলফামারী", 
    "পঞ্চগড়", "রংপুর", "ঠাকুরগাঁও", "হবিগঞ্জ", "মৌলভীবাজার", "সুনামগঞ্জ", "সিলেট", 
    "জামালপুর", "ময়মনসিংহ", "নেত্রকোণা", "শেরপুর"
];

// গ্লোবাল ভ্যারিয়েবল
let books = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let userNotifications = [];
let currentBanner = null;
let currentCategory = '';
let isUserBlocked = false;
let userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
let userAddress = JSON.parse(localStorage.getItem('userAddress')) || null;
let firebaseInitialized = false;

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const cartBody = document.getElementById('cart-body');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const proceedCheckout = document.getElementById('proceed-checkout');
const checkoutModal = document.getElementById('checkout-modal');
const confirmationModal = document.getElementById('confirmation-modal');
const finalOrderId = document.getElementById('final-order-id');
const categoryFilter = document.getElementById('category-filter');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-icon');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.getElementById('nav-links');
const cardCheckLink = document.getElementById('card-check-link');
const cardCheckModal = document.getElementById('card-check-modal');
const closeCardModal = document.getElementById('close-card-modal');
const cardCheckForm = document.getElementById('card-check-form');
const modalCardId = document.getElementById('modal-card-id');
const modalCardPassword = document.getElementById('modal-card-password');
const modalBalanceResult = document.getElementById('modal-balance-result');
const orderListLink = document.getElementById('order-list-link');
const orderListModal = document.getElementById('order-list-modal');
const closeOrderList = document.getElementById('close-order-list');
const orderListBody = document.getElementById('order-list-body');
const checkoutForm = document.getElementById('checkout-form');
const checkoutCardId = document.getElementById('checkout-card-id');
const checkoutCardPassword = document.getElementById('checkout-card-password');
const districtSelect = document.getElementById('district-select');
const summarySubtotal = document.getElementById('summary-subtotal');
const summaryShipping = document.getElementById('summary-shipping');
const summaryTotal = document.getElementById('summary-total');
const checkoutPhone = document.getElementById('checkout-phone');
const checkoutName = document.getElementById('checkout-name');
const checkoutEmail = document.getElementById('checkout-email');
const checkoutAddress = document.getElementById('checkout-address');
const editAddressBtn = document.getElementById('edit-address-btn');
const savedAddressSection = document.getElementById('saved-address-section');
const savedAddress = document.getElementById('saved-address');
const noAddress = document.getElementById('no-address');
const gmailLoginModal = document.getElementById('gmail-login-modal');
const googleLoginBtn = document.getElementById('google-login-btn');
const loginBtn = document.getElementById('login-btn');
const loginButtonContainer = document.getElementById('login-button-container');
const userDisplay = document.getElementById('user-display');
const userName = document.getElementById('user-name');
const userEmailDisplay = document.getElementById('user-email-display');
const userDropdown = document.getElementById('user-dropdown');
const userDisplayContainer = document.getElementById('user-display-container');
const logoutBtn = document.getElementById('logout-btn');
const loginStatus = document.getElementById('login-status');
const loginUserEmail = document.getElementById('login-user-email');
const balanceTransferLink = document.getElementById('balance-transfer-link');
const balanceTransferModal = document.getElementById('balance-transfer-modal');
const closeBalanceTransfer = document.getElementById('close-balance-transfer');
const balanceTransferForm = document.getElementById('balance-transfer-form');
const fromCardId = document.getElementById('from-card-id');
const fromCardPassword = document.getElementById('from-card-password');
const toCardId = document.getElementById('to-card-id');
const transferAmount = document.getElementById('transfer-amount');
const transferResult = document.getElementById('transfer-result');
const responsiveAd = document.getElementById('responsive-ad');
const adClose = document.getElementById('ad-close');
const adCta = document.getElementById('ad-cta');
const desktopAd = document.getElementById('desktop-ad');
const desktopAdClose = document.getElementById('desktop-ad-close');
const desktopAdCta = document.getElementById('desktop-ad-cta');
const notificationToggle = document.getElementById('notification-toggle');
const notificationSidebar = document.getElementById('notification-sidebar');
const closeNotification = document.getElementById('close-notification');
const notificationBody = document.getElementById('notification-body');
const notificationCount = document.getElementById('notification-count');
const noNotifications = document.getElementById('no-notifications');
const headerBanner = document.getElementById('header-banner');
const bannerImage = document.getElementById('banner-image');
const bannerTitle = document.getElementById('banner-title');
const bannerDescription = document.getElementById('banner-description');
const bannerButton = document.getElementById('banner-button');
const bannerClose = document.getElementById('banner-close');
const booksLink = document.getElementById('books-link');
const categoryMenu = document.getElementById('category-menu');
const categoryItems = document.querySelectorAll('.category-item');
const blockedOverlay = document.getElementById('blocked-overlay');
const bookDetailsModal = document.getElementById('book-details-modal');
const bookDetailsContent = document.getElementById('book-details-content');

// ==================== API FUNCTIONS ====================

async function fetchFromAPI(endpoint, options = {}) {
    try {
        let token = null;
        if (currentUser && window.auth && auth.currentUser) {
            token = await auth.currentUser.getIdToken();
        }
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        
        const response = await fetch(`${SERVER_URL}${endpoint}`, {
            ...defaultOptions,
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showToast('সার্ভার কানেকশন সমস্যা!', 'error');
        throw error;
    }
}

// ==================== FIREBASE CONFIG LOAD ====================

async function loadFirebaseConfig() {
    try {
        const response = await fetch(`${SERVER_URL}/api/config`);
        const data = await response.json();
        
        if (!firebase.apps.length) {
            firebase.initializeApp(data.firebaseConfig);
        }
        
        window.db = firebase.database();
        window.auth = firebase.auth();
        firebaseInitialized = true;
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase config load failed:', error);
        showToast('অ্যাপ্লিকেশন কনফিগারেশন লোড করা যায়নি!', 'error');
        return false;
    }
}

// ==================== USER AUTHENTICATION ====================

async function checkIfUserBlocked(email) {
    try {
        if (!currentUser || !window.auth || !auth.currentUser) return false;
        
        const token = await auth.currentUser.getIdToken();
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(`${SERVER_URL}/api/check-user-status/${encodedEmail}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.isBlocked || false;
        }
        return false;
    } catch (error) {
        console.error('Error checking blocked user:', error);
        return false;
    }
}

async function validateUserAccess(userEmail) {
    const blocked = await checkIfUserBlocked(userEmail);
    if (blocked) {
        isUserBlocked = true;
        showBlockedOverlay();
        return false;
    }
    isUserBlocked = false;
    hideBlockedOverlay();
    return true;
}

function showBlockedOverlay() {
    blockedOverlay.classList.add('show');
    disableAllFeaturesExceptMessaging();
}

function hideBlockedOverlay() {
    blockedOverlay.classList.remove('show');
    enableAllFeatures();
}

function disableAllFeaturesExceptMessaging() {
    // ডিসেবল করার লজিক
    const elementsToDisable = [
        cartToggle, notificationToggle, searchInput, searchIcon
    ];
    
    elementsToDisable.forEach(el => {
        if (el) {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
        }
    });
    
    // নেভিগেশন লিঙ্ক ডিসেবল
    const navLinksAll = document.querySelectorAll('.nav-links a');
    navLinksAll.forEach(link => {
        if (link.id !== 'order-list-link') {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
            link.style.cursor = 'not-allowed';
        }
    });
    
    // প্রোডাক্ট কার্ড ডিসেবল
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.5';
    });
}

function enableAllFeatures() {
    // এনাবল করার লজিক
    const elementsToEnable = [
        cartToggle, notificationToggle, searchInput, searchIcon
    ];
    
    elementsToEnable.forEach(el => {
        if (el) {
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
        }
    });
    
    // নেভিগেশন লিঙ্ক এনাবল
    const navLinksAll = document.querySelectorAll('.nav-links a');
    navLinksAll.forEach(link => {
        link.style.pointerEvents = 'auto';
        link.style.opacity = '1';
        link.style.cursor = 'pointer';
    });
    
    // প্রোডাক্ট কার্ড এনাবল
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.pointerEvents = 'auto';
        card.style.opacity = '1';
    });
}

// ==================== FIREBASE AUTHENTICATION ====================

function initializeAuth() {
    if (!window.auth) return;
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('User signed in:', user.email);
            
            // ইউজার ব্লক চেক
            const blocked = await checkIfUserBlocked(user.email);
            if (blocked) {
                isUserBlocked = true;
                showToast('আপনার অ্যাকাউন্ট ব্লক করা হয়েছে! শুধু মেসেজিং ব্যবহার করতে পারবেন।', 'error');
                showBlockedOverlay();
                
                const displayName = user.displayName || user.email.split('@')[0];
                const firstName = displayName.split(' ')[0];
                
                currentUser = {
                    name: firstName,
                    fullName: displayName,
                    email: user.email,
                    uid: user.uid
                };
                
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showUserInfo();
                updateLoginUI(true);
                gmailLoginModal.classList.remove('open');
                return;
            }
            
            isUserBlocked = false;
            hideBlockedOverlay();
            
            const displayName = user.displayName || user.email.split('@')[0];
            const firstName = displayName.split(' ')[0];
            
            currentUser = {
                name: firstName,
                fullName: displayName,
                email: user.email,
                uid: user.uid
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showUserInfo();
            updateLoginUI(true);
            gmailLoginModal.classList.remove('open');
            
            // লোড নোটিফিকেশন
            loadUserNotifications();
            
            // লোড ঠিকানা
            loadUserAddress();
            
            // সফল লগইন মেসেজ
            loginStatus.style.display = 'block';
            loginUserEmail.textContent = user.email;
            
            setTimeout(() => {
                loginStatus.style.display = 'none';
            }, 3000);
            
            showToast('লগইন সফল! স্বাগতম ' + firstName, 'success');
            
        } else {
            console.log('User signed out');
            if (currentUser) {
                updateLoginUI(false);
            }
            currentUser = null;
            localStorage.removeItem('currentUser');
            userDisplayContainer.style.display = 'none';
            loginButtonContainer.style.display = 'block';
            userNotifications = [];
            updateNotificationCount();
            isUserBlocked = false;
            hideBlockedOverlay();
        }
    });
}

async function signInWithGoogle() {
    if (!window.auth) {
        showToast('অ্যাপ্লিকেশন লোড হয়নি!', 'error');
        return null;
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    try {
        const result = await auth.signInWithPopup(provider);
        console.log('Sign in successful:', result.user.email);
        return result;
    } catch (error) {
        console.error('Google login error:', error);
        let errorMessage = 'লগইনে সমস্যা হয়েছে!';
        
        if (error.code === 'auth/popup-blocked') {
            errorMessage = 'পপআপ ব্লক করা হয়েছে! ব্রাউজার সেটিংস চেক করুন।';
        } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'লগইন উইন্ডো বন্ধ করা হয়েছে।';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'নেটওয়ার্ক সমস্যা! ইন্টারনেট কানেকশন চেক করুন।';
        }
        
        showToast(errorMessage, 'error');
        return null;
    }
}

async function signOutUser() {
    if (!window.auth) return;
    
    try {
        await auth.signOut();
        showToast('লগআউট সফল!', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('লগআউটে সমস্যা হয়েছে!', 'error');
    }
}

function showUserInfo() {
    if (currentUser) {
        userName.textContent = currentUser.name;
        userEmailDisplay.textContent = currentUser.email;
        userDisplayContainer.style.display = 'block';
        loginButtonContainer.style.display = 'none';
    }
}

function updateLoginUI(isLogin) {
    if (isLogin) {
        userDisplayContainer.style.display = 'block';
        loginButtonContainer.style.display = 'none';
    } else {
        userDisplayContainer.style.display = 'none';
        loginButtonContainer.style.display = 'block';
    }
}

// ==================== ADDRESS MANAGEMENT ====================

function loadUserAddress() {
    if (!currentUser) return;
    
    const savedAddress = localStorage.getItem(`userAddress_${currentUser.email}`);
    if (savedAddress) {
        userAddress = JSON.parse(savedAddress);
        displaySavedAddress();
    } else {
        userAddress = null;
        displayNoAddress();
    }
}

function saveUserAddress(addressData) {
    if (!currentUser) return;
    
    userAddress = {
        name: addressData.name,
        email: addressData.email,
        address: addressData.address,
        phone: addressData.phone,
        district: addressData.district,
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`userAddress_${currentUser.email}`, JSON.stringify(userAddress));
    displaySavedAddress();
    showToast('ঠিকানা সংরক্ষণ করা হয়েছে!', 'success');
}

function displaySavedAddress() {
    if (userAddress) {
        savedAddress.innerHTML = `
            <p><strong>নাম:</strong> ${userAddress.name}</p>
            <p><strong>ঠিকানা:</strong> ${userAddress.address}</p>
            <p><strong>মোবাইল:</strong> ${userAddress.phone}</p>
            <p><strong>জেলা:</strong> ${userAddress.district}</p>
        `;
        savedAddress.style.display = 'block';
        noAddress.style.display = 'none';
        
        // অটো-ফিল চেকআউট ফর্ম
        checkoutName.value = userAddress.name;
        checkoutEmail.value = userAddress.email;
        checkoutAddress.value = userAddress.address;
        checkoutPhone.value = userAddress.phone;
        districtSelect.value = userAddress.district;
    } else {
        displayNoAddress();
    }
}

function displayNoAddress() {
    savedAddress.style.display = 'none';
    noAddress.style.display = 'block';
}

// ==================== NOTIFICATION SYSTEM ====================

async function loadUserNotifications() {
    if (!currentUser || !window.db) return;
    
    const notificationsRef = db.ref('notifications');
    notificationsRef.orderByChild('timestamp').on('value', (snapshot) => {
        userNotifications = [];
        
        if (!snapshot.exists()) {
            updateNotificationDisplay();
            return;
        }
        
        snapshot.forEach((childSnapshot) => {
            const notification = childSnapshot.val();
            notification.id = childSnapshot.key;
            
            if (!notification.userId || notification.userId === currentUser.uid) {
                userNotifications.push(notification);
            }
        });
        
        userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        updateNotificationDisplay();
        updateNotificationCount();
    });
}

function updateNotificationDisplay() {
    if (!currentUser) {
        noNotifications.innerHTML = '<p>নোটিফিকেশন দেখতে লগইন করুন</p>';
        noNotifications.style.display = 'block';
        return;
    }
    
    if (userNotifications.length === 0) {
        noNotifications.style.display = 'block';
        notificationBody.innerHTML = '';
    } else {
        noNotifications.style.display = 'none';
        notificationBody.innerHTML = '';
        
        userNotifications.forEach(notification => {
            const notificationDiv = document.createElement('div');
            notificationDiv.className = `notification-item ${notification.read ? '' : 'unread'}`;
            
            let notificationIcon = 'info-circle';
            if (notification.type === 'order') notificationIcon = 'shopping-bag';
            if (notification.type === 'promotion') notificationIcon = 'gift';
            if (notification.type === 'transfer') notificationIcon = 'exchange-alt';
            
            notificationDiv.innerHTML = `
                <div class="notification-icon-small">
                    <i class="fas fa-${notificationIcon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${formatNotificationTime(notification.timestamp)}</div>
                </div>
            `;
            
            notificationDiv.addEventListener('click', () => {
                markNotificationAsRead(notification.id);
            });
            
            notificationBody.appendChild(notificationDiv);
        });
    }
}

function updateNotificationCount() {
    if (!currentUser) {
        notificationCount.textContent = '0';
        notificationCount.style.display = 'none';
        return;
    }
    
    const unreadCount = userNotifications.filter(notification => !notification.read).length;
    notificationCount.textContent = unreadCount > 0 ? unreadCount.toString() : '0';
    
    if (unreadCount > 0) {
        notificationCount.style.display = 'flex';
    } else {
        notificationCount.style.display = 'none';
    }
}

function formatNotificationTime(timestamp) {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) {
        return 'এখনই';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} মিনিট আগে`;
    } else if (diffInHours < 24) {
        return `${diffInHours} ঘন্টা আগে`;
    } else if (diffInDays < 7) {
        return `${diffInDays} দিন আগে`;
    } else {
        return notificationTime.toLocaleDateString('bn-BD');
    }
}

function markNotificationAsRead(notificationId) {
    if (!currentUser || !window.db) return;
    
    const notificationRef = db.ref('notifications/' + notificationId);
    notificationRef.update({
        read: true
    }).catch(error => {
        console.error('Error marking notification as read:', error);
    });
}

// ==================== BOOK MANAGEMENT ====================

async function loadBooksFromFirebase() {
    try {
        if (!window.db) return;
        
        const booksRef = db.ref('books');
        booksRef.on('value', (snapshot) => {
            books = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const book = childSnapshot.val();
                    book.id = childSnapshot.key;
                    books.push(book);
                });
            }
            updateCategoryCounts();
            updatePriceRange();
            renderProducts(books);
        });
    } catch (error) {
        console.error('বই লোড করতে সমস্যা:', error);
        showToast('বই লোড করা যায়নি!', 'error');
    }
}

function updateCategoryCounts() {
    const categories = {
        'all': books.length,
        'story': books.filter(book => book.category === 'story').length,
        'science': books.filter(book => book.category === 'science').length,
        'history': books.filter(book => book.category === 'history').length,
        'biography': books.filter(book => book.category === 'biography').length,
        'children': books.filter(book => book.category === 'children').length
    };

    document.getElementById('count-all')?.textContent = categories.all;
    document.getElementById('count-story')?.textContent = categories.story;
    document.getElementById('count-science')?.textContent = categories.science;
    document.getElementById('count-history')?.textContent = categories.history;
    document.getElementById('count-biography')?.textContent = categories.biography;
    document.getElementById('count-children')?.textContent = categories.children;
}

function updatePriceRange() {
    if (books.length === 0) return;
    
    const maxBookPrice = Math.max(...books.map(book => book.price));
    const maxPrice = Math.max(1000, maxBookPrice);
    
    priceRange.max = maxPrice;
    
    if (parseInt(priceRange.value) > maxPrice) {
        priceRange.value = maxPrice;
        priceValue.textContent = maxPrice;
    }
}

// ==================== CARD & PAYMENT APIs ====================

async function getCardFromFirebase(cardId, cardPassword) {
    try {
        if (!currentUser) {
            return { success: false, message: 'লগইন প্রয়োজন!' };
        }
        
        const response = await fetchFromAPI('/api/verify-card', {
            method: 'POST',
            body: JSON.stringify({ cardId, cardPassword })
        });
        
        return response;
    } catch (error) {
        console.error('কার্ড ভেরিফিকেশন ব্যর্থ:', error);
        return { success: false, message: 'কার্ড চেক করতে সমস্যা হয়েছে!' };
    }
}

async function transferBalance(fromCardId, fromCardPassword, toCardId, amount) {
    try {
        if (!currentUser) {
            return { success: false, message: 'লগইন প্রয়োজন!' };
        }
        
        const response = await fetchFromAPI('/api/transfer-balance', {
            method: 'POST',
            body: JSON.stringify({ fromCardId, fromCardPassword, toCardId, amount })
        });
        
        return response;
    } catch (error) {
        console.error('ব্যালেন্স ট্রান্সফার ব্যর্থ:', error);
        return { success: false, message: 'ব্যালেন্স ট্রান্সফার করতে সমস্যা হয়েছে!' };
    }
}

async function getDeliveryCharge(district) {
    try {
        const encodedDistrict = encodeURIComponent(district);
        const response = await fetch(`${SERVER_URL}/api/delivery-charge/${encodedDistrict}`);
        const data = await response.json();
        return data.charge || 100;
    } catch (error) {
        console.error('ডেলিভারি চার্জ লোড করতে সমস্যা:', error);
        return 100;
    }
}

async function getUserOrders() {
    try {
        if (!currentUser) {
            return [];
        }
        
        const response = await fetchFromAPI('/api/user-orders');
        return response.orders || [];
    } catch (error) {
        console.error('অর্ডার লোড করা যায়নি:', error);
        return [];
    }
}

async function sendToTelegram(message) {
    try {
        const response = await fetchFromAPI('/api/send-notification', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        return response.success || false;
    } catch (error) {
        console.error('টেলিগ্রাম নোটিফিকেশন ব্যর্থ:', error);
        return false;
    }
}

// ==================== ORDER PROCESSING ====================

async function processOrder(orderData) {
    try {
        if (!currentUser) {
            return { success: false, message: 'লগইন প্রয়োজন!' };
        }
        
        const response = await fetchFromAPI('/api/process-order', {
            method: 'POST',
            body: JSON.stringify({ orderData })
        });
        
        return response;
    } catch (error) {
        console.error('অর্ডার প্রসেসিং ব্যর্থ:', error);
        return { success: false, message: 'অর্ডার প্রসেস করতে সমস্যা হয়েছে!' };
    }
}

// ==================== BANNER SYSTEM ====================

async function loadBannerFromFirebase() {
    try {
        if (!window.db) return;
        
        const bannerRef = db.ref('headerBanner');
        bannerRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                currentBanner = snapshot.val();
                displayBanner(currentBanner);
            } else {
                hideBanner();
            }
        });
    } catch (error) {
        console.error('ব্যানার লোড করতে সমস্যা:', error);
        hideBanner();
    }
}

function displayBanner(bannerData) {
    if (!bannerData || !bannerData.isActive) {
        hideBanner();
        return;
    }

    bannerTitle.textContent = bannerData.title || 'বিশেষ অফার';
    bannerDescription.textContent = bannerData.description || 'আজই অর্ডার করুন!';
    bannerButton.textContent = bannerData.buttonText || 'অর্ডার করুন';
    bannerButton.href = bannerData.buttonUrl || '#';

    if (bannerData.imageUrl) {
        bannerImage.src = bannerData.imageUrl;
        bannerImage.classList.add('show');
    } else {
        bannerImage.classList.remove('show');
    }

    setTimeout(() => {
        headerBanner.classList.add('show');
    }, 1000);
}

function hideBanner() {
    headerBanner.classList.remove('show');
    setTimeout(() => {
        headerBanner.style.display = 'none';
    }, 500);
}

// ==================== PRODUCT RENDERING ====================

function renderProducts(filteredBooks = books) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    if (filteredBooks.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--gray);padding:40px;">কোনো বই পাওয়া যায়নি</p>';
        return;
    }
    
    filteredBooks.forEach(book => {
        const div = document.createElement('div');
        div.className = 'product-card';
        
        const isOutOfStock = book.stock <= 0;
        const stockText = isOutOfStock ? 'স্টক আউট' : `স্টক: ${book.stock}`;
        const stockClass = isOutOfStock ? 'stock-out' : 'stock-available';
        
        div.innerHTML = `
            <div class="product-img">
                <img src="${book.imageUrl || book.img || 'https://via.placeholder.com/300x400?text=বই'}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/300x400?text=বই'" />
                ${book.isSpecialOffer ? '<div class="offer-badge">বিশেষ অফার</div>' : ''}
            </div>
            <div class="product-info">
                <h3>${book.title}</h3>
                <div class="rating">
                    ${'★'.repeat(Math.floor(book.rating || 0))}${'☆'.repeat(5 - Math.floor(book.rating || 0))} <span>${book.rating || 0}</span>
                </div>
                <p class="price">৳${book.price || 0}</p>
                <div class="stock-info ${stockClass}">
                    <i class="fas ${isOutOfStock ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                    ${stockText}
                </div>
                <div class="quantity">
                    <button onclick="changeQty('${book.id}', -1)" ${isOutOfStock ? 'disabled' : ''}>−</button>
                    <span id="qty-${book.id}">0</span>
                    <button onclick="changeQty('${book.id}', 1)" ${isOutOfStock ? 'disabled' : ''}>+</button>
                </div>
                <button class="add-to-cart" onclick="addToCart('${book.id}')" ${isOutOfStock ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> ${isOutOfStock ? 'স্টক আউট' : 'কার্টে যোগ করুন'}
                </button>
                <button class="view-details-btn" onclick="showBookDetails('${book.id}')">
                    <i class="fas fa-info-circle"></i> বিস্তারিত দেখুন
                </button>
            </div>
        `;
        productsGrid.appendChild(div);
    });
}

// ==================== CART MANAGEMENT ====================

window.changeQty = (id, change) => {
    if (isUserBlocked) {
        showToast('ব্লক করা ইউজাররা কেনাকাটা করতে পারবেন না!', 'error');
        return;
    }
    
    const book = books.find(b => b.id === id);
    if (book && book.stock <= 0) {
        showToast('স্টক নেই!', 'error');
        return;
    }
    
    const qtyEl = document.getElementById(`qty-${id}`);
    if (!qtyEl) return;
    
    let qty = parseInt(qtyEl.textContent) || 0;
    qty = Math.max(0, qty + change);
    
    if (book && qty > book.stock) {
        showToast(`সর্বোচ্চ ${book.stock} কপি অর্ডার করা যাবে!`, 'error');
        qty = book.stock;
    }
    
    qtyEl.textContent = qty;
};

window.addToCart = (id) => {
    if (isUserBlocked) {
        showToast('ব্লক করা ইউজাররা কেনাকাটা করতে পারবেন না!', 'error');
        return;
    }
    
    const qtyEl = document.getElementById(`qty-${id}`);
    if (!qtyEl) return;
    
    const qty = parseInt(qtyEl.textContent);
    if (qty === 0) return showToast('পরিমাণ নির্বাচন করুন!', 'error');
    
    const book = books.find(b => b.id === id);
    if (!book || book.stock <= 0) {
        showToast('স্টক নেই!', 'error');
        return;
    }
    
    if (qty > book.stock) {
        showToast(`সর্বোচ্চ ${book.stock} কপি অর্ডার করা যাবে!`, 'error');
        return;
    }
    
    const existing = cart.find(item => item.id === id);
    if (existing) {
        if (existing.quantity + qty > book.stock) {
            showToast(`সর্বোচ্চ ${book.stock} কপি অর্ডার করা যাবে!`, 'error');
            return;
        }
        existing.quantity += qty;
    } else {
        cart.push({ ...book, quantity: qty });
    }
    
    qtyEl.textContent = 0;
    updateCart();
    showToast('কার্টে যোগ হয়েছে!', 'success');
};

window.removeFromCart = (id) => {
    if (isUserBlocked) {
        showToast('ব্লক করা ইউজাররা কার্ট ম্যানেজ করতে পারবেন না!', 'error');
        return;
    }
    
    cart = cart.filter(item => item.id !== id);
    updateCart();
    showToast('পণ্য কার্ট থেকে সরানো হয়েছে', 'success');
};

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    renderCartItems();
    calculateTotal();
}

function renderCartItems() {
    if (!cartBody) return;
    
    if (cart.length === 0) {
        cartBody.innerHTML = '<p style="text-align:center;color:var(--gray);padding:40px 20px;">কার্ট খালি</p>';
        return;
    }
    
    cartBody.innerHTML = '';
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.imageUrl || item.img || 'https://via.placeholder.com/300x400?text=বই'}" alt="${item.title}">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>৳${item.price} × ${item.quantity} = ৳${item.price * item.quantity}</p>
                <p class="stock-info ${item.stock <= 0 ? 'stock-out' : 'stock-available'}">
                    <i class="fas ${item.stock <= 0 ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                    ${item.stock <= 0 ? 'স্টক আউট' : `স্টক: ${item.stock}`}
                </p>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">×</button>
        `;
        cartBody.appendChild(div);
    });
}

function calculateTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `৳${total}`;
}

// ==================== BOOK DETAILS MODAL ====================

window.showBookDetails = async (bookId) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    const isOutOfStock = book.stock <= 0;
    const stockText = isOutOfStock ? 'স্টক নেই' : `${book.stock} কপি available`;
    const stockClass = isOutOfStock ? 'stock-out' : 'stock-available';
    
    const categoryNames = {
        'story': 'গল্প ও উপন্যাস',
        'science': 'বিজ্ঞান ও প্রযুক্তি',
        'history': 'ইতিহাস',
        'biography': 'জীবনী',
        'children': 'শিশু-কিশোর',
        'religion': 'ধর্মীয়',
        'academic': 'একাডেমিক',
        'others': 'অন্যান্য'
    };
    
    const categoryName = categoryNames[book.category] || book.category;
    const ratings = await loadBookRatings(bookId);
    const userHasRated = currentUser ? userRatings[bookId] : false;
    
    if (!bookDetailsContent) return;
    
    bookDetailsContent.innerHTML = `
        <div class="book-details-image">
            <img src="${book.imageUrl || book.img || 'https://via.placeholder.com/300x400?text=বই'}" alt="${book.title}" />
        </div>
        <div class="book-details-info">
            <h1 class="book-details-title">${book.title}</h1>
            
            <div class="book-details-meta">
                <div class="book-details-price">৳${book.price}</div>
                <div class="book-details-rating">
                    ${'★'.repeat(Math.floor(book.rating || 0))}${'☆'.repeat(5 - Math.floor(book.rating || 0))}
                    <span>${book.rating || 0}</span>
                </div>
                <div class="book-details-stock ${stockClass}">
                    <i class="fas ${isOutOfStock ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                    ${stockText}
                </div>
                <div class="book-details-category">${categoryName}</div>
            </div>
            
            ${book.description ? `
                <div class="book-details-description">
                    <h3>বইয়ের বিবরণ:</h3>
                    <p>${book.description}</p>
                </div>
            ` : ''}
            
            <div class="book-details-quantity">
                <button onclick="changeDetailsQty(-1)" ${isOutOfStock ? 'disabled' : ''}>−</button>
                <span id="details-qty">1</span>
                <button onclick="changeDetailsQty(1)" ${isOutOfStock ? 'disabled' : ''}>+</button>
            </div>
            
            <div class="book-details-actions">
                <button class="add-to-cart" onclick="addToCartFromDetails('${book.id}')" ${isOutOfStock ? 'disabled' : ''} style="flex: 2;">
                    <i class="fas fa-cart-plus"></i> ${isOutOfStock ? 'স্টক আউট' : 'কার্টে যোগ করুন'}
                </button>
                <button class="view-details-btn" onclick="bookDetailsModal.classList.remove('open')" style="flex: 1;">
                    বন্ধ করুন
                </button>
            </div>
            
            <!-- Rating System -->
            <div class="rating-system">
                <div class="rating-title">এই বইটি রেট করুন:</div>
                ${userHasRated ? `
                    <div style="background: var(--green-bg); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                        <p style="color: var(--secondary-dark); font-weight: 600;">
                            <i class="fas fa-check-circle"></i> আপনি ইতিমধ্যে এই বইটি রেটিং দিয়েছেন (${userHasRated.rating} ★)
                        </p>
                    </div>
                ` : `
                    <div class="star-rating" id="star-rating">
                        <span class="star" data-rating="1">★</span>
                        <span class="star" data-rating="2">★</span>
                        <span class="star" data-rating="3">★</span>
                        <span class="star" data-rating="4">★</span>
                        <span class="star" data-rating="5">★</span>
                    </div>
                    <div class="rating-feedback">
                        <textarea id="rating-feedback" placeholder="আপনার মতামত লিখুন (ঐচ্ছিক)"></textarea>
                        <button class="submit-rating-btn" onclick="submitRating('${book.id}')">
                            <i class="fas fa-star"></i> রেটিং সাবমিট করুন
                        </button>
                    </div>
                `}
            </div>
            
            <!-- Comments Section -->
            <div class="comments-section">
                <div class="comments-title">
                    <i class="fas fa-comments"></i> পাঠকদের রিভিউ (${ratings.length})
                </div>
                <div class="comment-list" id="comment-list">
                    ${ratings.length > 0 ? ratings.map(rating => `
                        <div class="comment-item">
                            <div class="comment-header">
                                <div class="comment-user">${rating.userName || 'অবিভাবক'}</div>
                                <div class="comment-rating">${'★'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)}</div>
                            </div>
                            ${rating.feedback ? `<div class="comment-text">${rating.feedback}</div>` : ''}
                            <div class="comment-time">${formatCommentTime(rating.timestamp)}</div>
                        </div>
                    `).join('') : `
                        <div class="no-comments">
                            <p>এখনও কোনো রিভিউ নেই। প্রথম রিভিউ দিন!</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    if (!userHasRated) {
        const stars = bookDetailsContent.querySelectorAll('.star');
        let currentRating = 0;
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                currentRating = rating;
                
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });
    }
    
    if (bookDetailsModal) {
        bookDetailsModal.classList.add('open');
    }
};

async function loadBookRatings(bookId) {
    try {
        if (!window.db) return [];
        
        const snapshot = await db.ref('bookRatings').orderByChild('bookId').equalTo(bookId).once('value');
        const ratings = [];
        
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const rating = child.val();
                ratings.push(rating);
            });
        }
        
        ratings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return ratings;
    } catch (error) {
        console.error('রেটিং লোড করতে সমস্যা:', error);
        return [];
    }
}

function formatCommentTime(timestamp) {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInDays = Math.floor((now - commentTime) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
        return 'আজ';
    } else if (diffInDays === 1) {
        return 'গতকাল';
    } else if (diffInDays < 7) {
        return `${diffInDays} দিন আগে`;
    } else {
        return commentTime.toLocaleDateString('bn-BD');
    }
}

window.changeDetailsQty = (change) => {
    const qtyEl = document.getElementById('details-qty');
    if (!qtyEl) return;
    
    let qty = parseInt(qtyEl.textContent) || 1;
    qty = Math.max(1, qty + change);
    qtyEl.textContent = qty;
};

window.addToCartFromDetails = (bookId) => {
    const qtyEl = document.getElementById('details-qty');
    if (!qtyEl) return;
    
    const qty = parseInt(qtyEl.textContent) || 1;
    const book = books.find(b => b.id === bookId);
    
    if (!book || book.stock <= 0) {
        showToast('স্টক নেই!', 'error');
        return;
    }
    
    if (qty > book.stock) {
        showToast(`সর্বোচ্চ ${book.stock} কপি অর্ডার করা যাবে!`, 'error');
        return;
    }
    
    const existing = cart.find(item => item.id === bookId);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ ...book, quantity: qty });
    }
    
    updateCart();
    if (bookDetailsModal) {
        bookDetailsModal.classList.remove('open');
    }
    showToast('কার্টে যোগ হয়েছে!', 'success');
};

window.submitRating = async (bookId) => {
    if (!currentUser) {
        showToast('রেটিং দিতে লগইন করুন!', 'error');
        return;
    }
    
    if (userRatings[bookId]) {
        showToast('আপনি ইতিমধ্যে এই বইটি রেটিং দিয়েছেন!', 'error');
        return;
    }
    
    const stars = bookDetailsContent?.querySelectorAll('.star');
    if (!stars) return;
    
    let rating = 0;
    stars.forEach(star => {
        if (star.classList.contains('active')) {
            rating = parseInt(star.dataset.rating);
        }
    });
    
    if (rating === 0) {
        showToast('দয়া করে রেটিং দিন!', 'error');
        return;
    }
    
    const feedback = document.getElementById('rating-feedback')?.value.trim() || '';
    const book = books.find(b => b.id === bookId);
    
    if (!window.db || !book) return;
    
    try {
        const ratingData = {
            bookId: bookId,
            bookTitle: book.title,
            userId: currentUser.uid,
            userName: currentUser.name,
            userEmail: currentUser.email,
            rating: rating,
            feedback: feedback,
            timestamp: new Date().toISOString()
        };
        
        const ratingRef = db.ref('bookRatings').push();
        await ratingRef.set(ratingData);
        
        userRatings[bookId] = {
            rating: rating,
            feedback: feedback,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('userRatings', JSON.stringify(userRatings));
        showToast('রেটিং সফলভাবে জমা হয়েছে!', 'success');
        
        setTimeout(() => {
            showBookDetails(bookId);
        }, 1000);
        
    } catch (error) {
        console.error('রেটিং সাবমিট করতে সমস্যা:', error);
        showToast('রেটিং সাবমিট করা যায়নি!', 'error');
    }
};

// ==================== CHECKOUT SYSTEM ====================

async function updateSummary() {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const district = districtSelect.value;
    let shipping = 0;
    
    if (district) {
        shipping = await getDeliveryCharge(district);
    }
    
    const total = subtotal + shipping;
    if (summarySubtotal) summarySubtotal.textContent = `৳${subtotal}`;
    if (summaryShipping) summaryShipping.textContent = `৳${shipping}`;
    if (summaryTotal) summaryTotal.textContent = `৳${total}`;
}

// ==================== MESSAGE SYSTEM ====================

function initializeMessageSystem() {
    // Check if message system already exists
    if (document.querySelector('.message-widget')) return;
    
    const messageWidget = document.createElement('div');
    messageWidget.className = 'message-widget';
    messageWidget.innerHTML = `
        <div class="message-container" id="message-container">
            <div class="message-header">
                <h3>সাপোর্টে মেসেজ করুন</h3>
                <button class="close-message" id="close-message">×</button>
            </div>
            <div class="message-body" id="message-body">
                <div class="no-messages" id="no-messages">
                    কোন মেসেজ নেই। এডমিনকে মেসেজ করুন!
                </div>
            </div>
            <div class="message-input-container">
                <div class="message-input-wrapper">
                    <textarea 
                        class="message-input" 
                        id="message-input" 
                        placeholder="আপনার মেসেজ লিখুন..." 
                        rows="1"
                    ></textarea>
                    <button class="send-message-btn" id="send-message-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
        <button class="message-toggle-btn" id="message-toggle-btn">
            <i class="fas fa-comments"></i>
        </button>
    `;
    document.body.appendChild(messageWidget);

    // Message system elements
    const messageToggleBtn = document.getElementById('message-toggle-btn');
    const messageContainer = document.getElementById('message-container');
    const closeMessage = document.getElementById('close-message');
    const messageBody = document.getElementById('message-body');
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const noMessages = document.getElementById('no-messages');

    // Toggle message container
    if (messageToggleBtn) {
        messageToggleBtn.addEventListener('click', () => {
            messageContainer.classList.toggle('open');
            if (messageContainer.classList.contains('open') && currentUser) {
                loadMessages();
            }
        });
    }

    if (closeMessage) {
        closeMessage.addEventListener('click', () => {
            messageContainer.classList.remove('open');
        });
    }

    // Auto-resize textarea
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 80) + 'px';
        });
    }

    async function sendMessage() {
        const messageText = messageInput?.value.trim();
        if (!messageText || !currentUser) return;

        sendMessageBtn.disabled = true;
        sendMessageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            const messageData = {
                text: messageText,
                sender: 'user',
                senderName: currentUser.name,
                senderEmail: currentUser.email,
                senderUid: currentUser.uid,
                timestamp: new Date().toISOString(),
                read: false
            };

            if (window.db) {
                const messageRef = db.ref('userMessages/' + currentUser.uid).push();
                await messageRef.set(messageData);
            }

            messageInput.value = '';
            messageInput.style.height = 'auto';

            loadMessages();
            showToast('মেসেজ পাঠানো হয়েছে!', 'success');

        } catch (error) {
            console.error('মেসেজ পাঠাতে সমস্যা:', error);
            showToast('মেসেজ পাঠানো যায়নি!', 'error');
        } finally {
            sendMessageBtn.disabled = false;
            sendMessageBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    async function loadMessages() {
        if (!currentUser || !window.db) {
            if (noMessages) {
                noMessages.textContent = 'মেসেজ পাঠাতে লগইন করুন!';
                noMessages.style.display = 'block';
            }
            return;
        }

        if (noMessages) noMessages.style.display = 'none';
        if (messageBody) messageBody.innerHTML = '<div class="message-loading"><span></span><span></span><span></span></div>';

        try {
            const messagesRef = db.ref('userMessages/' + currentUser.uid);
            messagesRef.orderByChild('timestamp').on('value', (snapshot) => {
                if (!messageBody) return;
                
                messageBody.innerHTML = '';
                
                if (!snapshot.exists()) {
                    if (noMessages) noMessages.style.display = 'block';
                    return;
                }

                const messages = [];
                snapshot.forEach((childSnapshot) => {
                    const message = childSnapshot.val();
                    messages.push(message);
                });

                messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                messages.forEach(message => {
                    displayMessage(message);
                });

                setTimeout(() => {
                    if (messageBody) {
                        messageBody.scrollTop = messageBody.scrollHeight;
                    }
                }, 100);
            });

        } catch (error) {
            console.error('মেসেজ লোড করতে সমস্যা:', error);
            if (messageBody) {
                messageBody.innerHTML = '<div class="no-messages">মেসেজ লোড করা যায়নি!</div>';
            }
        }
    }

    function displayMessage(message) {
        if (!messageBody || !noMessages) return;
        
        noMessages.style.display = 'none';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender}`;
        
        const time = new Date(message.timestamp).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric',
            hour12: true
        });

        messageDiv.innerHTML = `
            <div class="message-text">${message.text}</div>
            <div class="message-time">${time}</div>
        `;
        
        messageBody.appendChild(messageDiv);
    }

    // Check for new messages periodically
    setInterval(() => {
        if (messageContainer?.classList.contains('open') && currentUser) {
            loadMessages();
        }
    }, 10000);
}

// ==================== AD SYSTEM ====================

function initializeAdSystem() {
    // Show mobile ad after 3 seconds
    setTimeout(() => {
        if (window.innerWidth < 992 && responsiveAd) {
            responsiveAd.style.display = 'block';
            setTimeout(() => {
                responsiveAd.classList.add('show');
            }, 100);
        }
    }, 3000);
    
    // Close ad functionality
    if (adClose) {
        adClose.addEventListener('click', () => {
            responsiveAd.classList.remove('show');
            setTimeout(() => {
                responsiveAd.style.display = 'none';
            }, 400);
        });
    }
    
    if (desktopAdClose && desktopAd) {
        desktopAdClose.addEventListener('click', () => {
            desktopAd.style.display = 'none';
        });
    }
    
    // CTA button functionality
    if (adCta) {
        adCta.addEventListener('click', () => {
            document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth' });
            responsiveAd.classList.remove('show');
            setTimeout(() => {
                responsiveAd.style.display = 'none';
            }, 400);
        });
    }
    
    if (desktopAdCta) {
        desktopAdCta.addEventListener('click', () => {
            document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ==================== INITIALIZATION ====================

function initializeDeliveryCharges() {
    if (!districtSelect) return;
    
    bangladeshDistricts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
    
    districtSelect.addEventListener('change', updateSummary);
}

function initializeEventListeners() {
    // Mobile Menu
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => navLinks.classList.toggle('mobile-open'));
    }
    
    // Cart Toggle
    if (cartToggle && cartSidebar) {
        cartToggle.addEventListener('click', () => {
            if (isUserBlocked) {
                showToast('ব্লক করা ইউজাররা কার্ট দেখতে পারবেন না!', 'error');
                return;
            }
            cartSidebar.classList.add('open');
        });
    }
    
    if (closeCart && cartSidebar) {
        closeCart.addEventListener('click', () => cartSidebar.classList.remove('open'));
    }
    
    // Proceed Checkout
    if (proceedCheckout) {
        proceedCheckout.addEventListener('click', async () => {
            if (isUserBlocked) {
                showToast('ব্লক করা ইউজাররা অর্ডার দিতে পারবেন না!', 'error');
                return;
            }
            if (cart.length === 0) return showToast('কার্ট খালি!', 'error');
            
            // Stock check
            for (const item of cart) {
                const book = books.find(b => b.id === item.id);
                if (!book || book.stock < item.quantity) {
                    showToast(`"${item.title}" এর পর্যাপ্ত স্টক নেই!`, 'error');
                    return;
                }
            }
            
            if (!currentUser) {
                showToast('প্রথমে লগইন করুন!', 'error');
                if (gmailLoginModal) gmailLoginModal.classList.add('open');
                return;
            }
            
            // Auto-fill form
            if (userAddress) {
                if (checkoutName) checkoutName.value = userAddress.name;
                if (checkoutEmail) checkoutEmail.value = userAddress.email;
                if (checkoutAddress) checkoutAddress.value = userAddress.address;
                if (checkoutPhone) checkoutPhone.value = userAddress.phone;
                if (districtSelect) districtSelect.value = userAddress.district;
            } else {
                if (checkoutName) checkoutName.value = currentUser.fullName;
                if (checkoutEmail) checkoutEmail.value = currentUser.email;
            }
            
            if (cartSidebar) cartSidebar.classList.remove('open');
            if (checkoutModal) checkoutModal.classList.add('open');
            await updateSummary();
        });
    }
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if (checkoutModal) checkoutModal.classList.remove('open');
            if (confirmationModal) confirmationModal.classList.remove('open');
            if (cardCheckModal) cardCheckModal.classList.remove('open');
            if (orderListModal) orderListModal.classList.remove('open');
            if (gmailLoginModal) gmailLoginModal.classList.remove('open');
            if (balanceTransferModal) balanceTransferModal.classList.remove('open');
            if (bookDetailsModal) bookDetailsModal.classList.remove('open');
        });
    });
    
    // Edit address
    if (editAddressBtn) {
        editAddressBtn.addEventListener('click', () => {
            if (userAddress) {
                if (checkoutName) checkoutName.value = '';
                if (checkoutEmail) checkoutEmail.value = '';
                if (checkoutAddress) checkoutAddress.value = '';
                if (checkoutPhone) checkoutPhone.value = '';
                if (districtSelect) districtSelect.value = '';
                showToast('আপনি এখন নতুন ঠিকানা যোগ করতে পারেন', 'info');
            }
        });
    }
    
    // Card Check
    if (cardCheckLink) {
        cardCheckLink.addEventListener('click', () => {
            if (isUserBlocked) {
                showToast('ব্লক করা ইউজাররা কার্ড চেক করতে পারবেন না!', 'error');
                return;
            }
            if (cardCheckModal) cardCheckModal.classList.add('open');
        });
    }
    
    if (closeCardModal && cardCheckModal) {
        closeCardModal.addEventListener('click', () => cardCheckModal.classList.remove('open'));
    }
    
    if (cardCheckForm) {
        cardCheckForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isUserBlocked) {
                showToast('ব্লক করা ইউজাররা কার্ড চেক করতে পারবেন না!', 'error');
                return;
            }
            
            const id = modalCardId?.value.trim();
            const pass = modalCardPassword?.value;
            
            if (!id || !pass) {
                if (modalBalanceResult) {
                    modalBalanceResult.className = 'balance-result error';
                    modalBalanceResult.innerHTML = `<p>সব তথ্য পূরণ করুন!</p>`;
                    modalBalanceResult.style.display = 'block';
                }
                return;
            }

            const result = await getCardFromFirebase(id, pass);
            
            if (modalBalanceResult) {
                if (result.success) {
                    const card = result.card;
                    modalBalanceResult.className = 'balance-result success';
                    modalBalanceResult.innerHTML = `
                        <div class="card-info">
                            <h4><i class="fas fa-id-card"></i> কার্ড তথ্য</h4>
                            <p><strong>নাম:</strong> ${card.name}</p>
                            <p><strong>কার্ড আইডি:</strong> ${card.id}</p>
                            <div class="card-balance"><strong>ব্যালেন্স:</strong> ৳${card.balance}</div>
                        </div>
                    `;
                    showToast('ব্যালেন্স চেক সফল!', 'success');
                } else {
                    modalBalanceResult.className = 'balance-result error';
                    modalBalanceResult.innerHTML = `<p>${result.message}</p>`;
                    showToast('ভুল তথ্য!', 'error');
                }
                modalBalanceResult.style.display = 'block';
            }
        });
    }
    
    // Balance Transfer
    if (balanceTransferLink) {
        balanceTransferLink.addEventListener('click', () => {
            if (isUserBlocked) {
                showToast('ব্লক করা ইউজাররা ব্যালেন্স ট্রান্সফার করতে পারবেন না!', 'error');
                return;
            }
            if (balanceTransferModal) balanceTransferModal.classList.add('open');
        });
    }
    
    if (closeBalanceTransfer && balanceTransferModal) {
        closeBalanceTransfer.addEventListener('click', () => balanceTransferModal.classList.remove('open'));
    }
    
    if (balanceTransferForm) {
        balanceTransferForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isUserBlocked) {
                showToast('ব্লক করা ইউজাররা ব্যালেন্স ট্রান্সফার করতে পারবেন না!', 'error');
                return;
            }
            
            const fromId = fromCardId?.value.trim();
            const fromPass = fromCardPassword?.value;
            const toId = toCardId?.value.trim();
            const amount = parseInt(transferAmount?.value || 0);
            
            if (!fromId || !fromPass || !toId || !amount || amount <= 0) {
                if (transferResult) {
                    transferResult.className = 'balance-result error';
                    transferResult.innerHTML = `<p>সব তথ্য সঠিকভাবে পূরণ করুন!</p>`;
                    transferResult.style.display = 'block';
                }
                return;
            }

            if (fromId === toId) {
                if (transferResult) {
                    transferResult.className = 'balance-result error';
                    transferResult.innerHTML = `<p>আপনি নিজের কার্ডে টাকা ট্রান্সফার করতে পারবেন না!</p>`;
                    transferResult.style.display = 'block';
                }
                return;
            }

            const result = await transferBalance(fromId, fromPass, toId, amount);
            
            if (transferResult) {
                if (result.success) {
                    transferResult.className = 'balance-result success';
                    transferResult.innerHTML = `
                        <div class="card-info">
                            <h4><i class="fas fa-check-circle"></i> ট্রান্সফার সফল!</h4>
                            <p><strong>ট্রান্সফার করা হয়েছে:</strong> ৳${amount}</p>
                            <p><strong>আপনার নতুন ব্যালেন্স:</strong> ৳${result.fromNewBalance}</p>
                            <p><strong>প্রাপকের কার্ড আইডি:</strong> ${toId}</p>
                            <p><strong>ট্রান্সফার তারিখ:</strong> ${new Date().toLocaleString('bn-BD')}</p>
                        </div>
                    `;
                    showToast('ব্যালেন্স ট্রান্সফার সফল!', 'success');
                    balanceTransferForm.reset();
                } else {
                    transferResult.className = 'balance-result error';
                    transferResult.innerHTML = `<p>${result.message}</p>`;
                    showToast('ট্রান্সফার ব্যর্থ!', 'error');
                }
                transferResult.style.display = 'block';
            }
        });
    }
    
    // Order List
    if (orderListLink) {
        orderListLink.addEventListener('click', () => {
            if (isUserBlocked) {
                showToast('ব্লক করা ইউজাররা অর্ডার লিস্ট দেখতে পারবেন না!', 'error');
                return;
            }
            renderUserOrders();
            if (orderListModal) orderListModal.classList.add('open');
        });
    }
    
    if (closeOrderList && orderListModal) {
        closeOrderList.addEventListener('click', () => orderListModal.classList.remove('open'));
    }
    
    // Checkout Form
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isUserBlocked) {
                showToast('ব্লক করা ইউজাররা অর্ডার দিতে পারবেন না!', 'error');
                return;
            }
            
            if (cart.length === 0) return showToast('কার্ট খালি!', 'error');

            // Final stock check
            for (const item of cart) {
                const book = books.find(b => b.id === item.id);
                if (!book || book.stock < item.quantity) {
                    showToast(`"${item.title}" এর পর্যাপ্ত স্টক নেই!`, 'error');
                    return;
                }
            }

            const submitBtn = e.target.querySelector('.submit-order');
            if (submitBtn) {
                submitBtn.disabled = true;
                document.getElementById('order-text').textContent = 'প্রসেসিং হচ্ছে...';
                document.getElementById('order-loader').style.display = 'inline-block';
            }

            const name = checkoutName?.value.trim() || '';
            const email = checkoutEmail?.value.trim() || '';
            const address = checkoutAddress?.value.trim() || '';
            const phone = checkoutPhone?.value.trim() || '';
            const district = districtSelect?.value || '';
            const cardId = checkoutCardId?.value.trim() || '';
            const cardPass = checkoutCardPassword?.value || '';

            if (!name || !email || !address || !phone || !district || !cardId || !cardPass) {
                showToast('সব প্রয়োজনীয় তথ্য পূরণ করুন!', 'error');
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
            const shipping = await getDeliveryCharge(district);
            const total = subtotal + shipping;

            const orderData = {
                name,
                email,
                address,
                phone,
                district,
                cardId,
                items: [...cart],
                subtotal,
                shipping,
                total
            };

            const result = await processOrder(orderData);
            
            if (result.success) {
                if (checkoutModal) checkoutModal.classList.remove('open');
                if (confirmationModal) confirmationModal.classList.add('open');
                if (finalOrderId) finalOrderId.textContent = `#${result.orderId}`;
                
                // Clear cart
                cart = [];
                updateCart();
                
                // Reload books
                loadBooksFromFirebase();
                
                checkoutForm.reset();
                showToast('অর্ডার সফল!', 'success');
                
                // Save address
                if (!userAddress) {
                    saveUserAddress({
                        name: name,
                        email: email,
                        address: address,
                        phone: phone,
                        district: district
                    });
                }
            } else {
                showToast(result.message || 'অর্ডার ব্যর্থ!', 'error');
            }
            
            if (submitBtn) {
                submitBtn.disabled = false;
                document.getElementById('order-text').innerHTML = '<i class="fas fa-check-circle"></i> অর্ডার কনফার্ম করুন';
                document.getElementById('order-loader').style.display = 'none';
            }
        });
    }
    
    // Filters
    function applyFilters() {
        const category = currentCategory || (categoryFilter ? categoryFilter.value : '');
        const maxPrice = parseInt(priceRange ? priceRange.value : 1000);
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const filtered = books.filter(book => {
            const matchCategory = !category || book.category === category;
            const matchPrice = book.price <= maxPrice;
            const matchSearch = !query || book.title.toLowerCase().includes(query);
            return matchCategory && matchPrice && matchSearch;
        });
        renderProducts(filtered);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            currentCategory = categoryFilter.value;
            applyFilters();
        });
    }
    
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', () => {
            priceValue.textContent = priceRange.value;
            applyFilters();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    if (searchIcon) {
        searchIcon.addEventListener('click', applyFilters);
    }
    
    // Authentication
    if (loginBtn && gmailLoginModal) {
        loginBtn.addEventListener('click', () => gmailLoginModal.classList.add('open'));
    }
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            const result = await signInWithGoogle();
            if (result) {
                // User will be handled by auth state change
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => signOutUser());
    }
    
    // User dropdown
    if (userDisplay && userDropdown) {
        userDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
    }
    
    document.addEventListener('click', () => {
        if (userDropdown) userDropdown.classList.remove('show');
    });
    
    // Category dropdown
    if (booksLink && categoryMenu) {
        booksLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            categoryMenu.classList.toggle('show');
        });
    }
    
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const category = item.dataset.category;
            
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            currentCategory = category;
            
            if (categoryFilter) categoryFilter.value = category;
            
            applyFilters();
            
            if (window.innerWidth < 992) {
                categoryMenu.classList.remove('show');
                navLinks?.classList.remove('mobile-open');
            }
        });
    });
    
    document.addEventListener('click', () => {
        if (categoryMenu) categoryMenu.classList.remove('show');
    });
    
    // Notification sidebar
    if (notificationToggle && notificationSidebar) {
        notificationToggle.addEventListener('click', () => {
            if (isUserBlocked) {
                showToast('ব্লক করা ইউজাররা নোটিফিকেশন দেখতে পারবেন না!', 'error');
                return;
            }
            notificationSidebar.classList.add('open');
        });
    }
    
    if (closeNotification && notificationSidebar) {
        closeNotification.addEventListener('click', () => notificationSidebar.classList.remove('open'));
    }
    
    // Banner
    if (bannerClose) {
        bannerClose.addEventListener('click', () => hideBanner());
    }
    
    if (bannerButton) {
        bannerButton.addEventListener('click', () => {
            // Track click if needed
        });
    }
    
    // Modal close on outside click
    document.addEventListener('click', (e) => {
        // Close modals when clicking outside
        if (checkoutModal && checkoutModal.classList.contains('open')) {
            if (!e.target.closest('.modal-content') && !e.target.closest('#proceed-checkout')) {
                checkoutModal.classList.remove('open');
            }
        }
    });
    
    // Window resize handling
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992 && navLinks) {
            navLinks.classList.remove('mobile-open');
        }
    });
}

// ==================== HELPER FUNCTIONS ====================

function showToast(msg, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'error' ? 'exclamation-triangle' : 
                type === 'warning' ? 'exclamation-circle' : 'check-circle';
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${msg}`;
    document.body.appendChild(toast);
    
    // Add show class after a delay
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function renderUserOrders() {
    if (!orderListBody) return;
    
    if (!currentUser) {
        orderListBody.innerHTML = '<p style="text-align:center;color:var(--gray);padding:20px;">প্রথমে লগইন করুন</p>';
        return;
    }

    orderListBody.innerHTML = '<p style="text-align:center;color:var(--gray);padding:20px;">লোড হচ্ছে...</p>';

    try {
        const orders = await getUserOrders();
        
        if (orders.length === 0) {
            orderListBody.innerHTML = '<p style="text-align:center;color:var(--gray);padding:20px;">কোনো অর্ডার নেই</p>';
            return;
        }

        orderListBody.innerHTML = '';
        orders.forEach(order => {
            const div = document.createElement('div');
            div.className = `order-item ${order.status || 'pending'}`;
            div.innerHTML = `
                <h3 style="color:${order.status === 'delivered' ? '#1D8348' : order.status === 'cancelled' ? '#A93226' : '#2E86C1'}">
                    <i class="fas fa-shopping-bag"></i> অর্ডার #${order.id} 
                    ${order.status === 'delivered' ? '(ডেলিভার্ড)' : order.status === 'cancelled' ? '(ক্যানসেল্ড)' : '(পেন্ডিং)'}
                </h3>
                <p><i class="fas fa-calendar"></i> তারিখ: ${order.date}</p>
                <p><i class="fas fa-phone"></i> মোবাইল: ${order.phone || 'N/A'}</p>
                <p><i class="fas fa-money-bill-wave"></i> মোট: ৳${order.total}</p>
                <p><i class="fas fa-credit-card"></i> কার্ড আইডি: ${order.cardId}</p>
                <ul>${order.items.map(i => `<li>${i.title} × ${i.quantity} = ৳${i.price * i.quantity}</li>`).join('')}</ul>
            `;
            orderListBody.appendChild(div);
        });
    } catch (error) {
        console.error("অর্ডার লোডে সমস্যা:", error);
        orderListBody.innerHTML = '<p style="text-align:center;color:var(--danger);">ডাটা লোড করা যায়নি</p>';
    }
}

// ==================== INITIALIZE APP ====================

async function initializeApp() {
    try {
        console.log('Initializing app...');
        
        // Load Firebase config from server
        const firebaseLoaded = await loadFirebaseConfig();
        
        if (!firebaseLoaded) {
            showToast('অ্যাপ্লিকেশন লোড করতে সমস্যা হচ্ছে!', 'error');
            return;
        }
        
        // Initialize event listeners
        initializeEventListeners();
        initializeDeliveryCharges();
        initializeAdSystem();
        initializeMessageSystem();
        initializeAuth();
        
        // Load data
        loadBooksFromFirebase();
        loadBannerFromFirebase();
        
        // Initialize cart
        updateCart();
        
        if (priceValue && priceRange) {
            priceValue.textContent = priceRange.value;
        }
        
        // Show login modal if no user
        if (!currentUser && gmailLoginModal) {
            setTimeout(() => {
                gmailLoginModal.classList.add('open');
            }, 2000);
        }
        
        // Check user blocked status on load
        if (currentUser) {
            const blocked = await checkIfUserBlocked(currentUser.email);
            if (blocked) {
                isUserBlocked = true;
                showBlockedOverlay();
                showToast('আপনার অ্যাকাউন্ট ব্লক করা হয়েছে!', 'error');
            } else {
                loadUserNotifications();
                loadUserAddress();
            }
        }
        
        console.log('App initialized successfully');
        
    } catch (error) {
        console.error('App initialization failed:', error);
        showToast('অ্যাপ্লিকেশন লোড করা যায়নি!', 'error');
    }
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ==================== GLOBAL FUNCTIONS ====================

// Telegram test function
window.testTelegram = async () => {
    if (isUserBlocked) {
        showToast('ব্লক করা ইউজাররা টেস্ট করতে পারবেন না!', 'error');
        return;
    }
    
    const success = await sendToTelegram('টেলিগ্রাম টেস্ট সফল!');
    showToast(success ? 'টেস্ট সফল!' : 'টেস্ট ব্যর্থ!', success ? 'success' : 'error');
};

// Debug helper
window.debugCart = () => {
    console.log('Current cart:', cart);
    console.log('Current user:', currentUser);
    console.log('Books loaded:', books.length);
    alert(`কার্টে আইটেম: ${cart.length}\nইউজার: ${currentUser ? currentUser.email : 'লগইন নেই'}`);
};