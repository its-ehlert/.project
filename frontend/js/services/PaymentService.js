// Payment Service - Demonstrating Polymorphism
class PaymentMethod {
    constructor() {
        this.isEnabled = true;
    }

    processPayment(amount, orderData) {
        throw new Error('processPayment must be implemented by subclass');
    }

    validatePayment(paymentData) {
        throw new Error('validatePayment must be implemented by subclass');
    }

    getProcessingFee() {
        return 0;
    }

    getEstimatedProcessingTime() {
        return '2-3 business days';
    }
}

class CreditCardPayment extends PaymentMethod {
    constructor() {
        super();
        this.name = 'Credit Card';
        this.icon = 'fas fa-credit-card';
    }

    processPayment(amount, orderData) {
        const { cardNumber, expiryDate, cvv, cardholderName } = orderData.payment;
        
        // Validate card details
        if (!this.validateCard(cardNumber, expiryDate, cvv)) {
            throw new Error('Invalid card details');
        }

        // Simulate payment processing
        console.log(`Processing ${this.name} payment for $${amount}`);
        
        return {
            success: true,
            transactionId: this.generateTransactionId(),
            amount: amount,
            method: this.name,
            processingTime: this.getEstimatedProcessingTime()
        };
    }

    validatePayment(paymentData) {
        const { cardNumber, expiryDate, cvv } = paymentData;
        return this.validateCard(cardNumber, expiryDate, cvv);
    }

    validateCard(cardNumber, expiryDate, cvv) {
        // Basic validation
        return cardNumber && cardNumber.length >= 13 && 
               expiryDate && cvv && cvv.length >= 3;
    }

    generateTransactionId() {
        return 'CC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getProcessingFee() {
        return 2.50; // $2.50 processing fee
    }

    getEstimatedProcessingTime() {
        return 'Immediate';
    }
}

class PayPalPayment extends PaymentMethod {
    constructor() {
        super();
        this.name = 'PayPal';
        this.icon = 'fab fa-paypal';
    }

    processPayment(amount, orderData) {
        const { paypalEmail } = orderData.payment;
        
        if (!this.validatePayPalEmail(paypalEmail)) {
            throw new Error('Invalid PayPal email');
        }

        console.log(`Processing ${this.name} payment for $${amount}`);
        
        return {
            success: true,
            transactionId: this.generateTransactionId(),
            amount: amount,
            method: this.name,
            processingTime: this.getEstimatedProcessingTime()
        };
    }

    validatePayment(paymentData) {
        const { paypalEmail } = paymentData;
        return this.validatePayPalEmail(paypalEmail);
    }

    validatePayPalEmail(email) {
        return email && email.includes('@') && email.includes('.');
    }

    generateTransactionId() {
        return 'PP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getProcessingFee() {
        return 0; // PayPal fees are percentage-based
    }

    getEstimatedProcessingTime() {
        return '1-2 business days';
    }
}

class BankTransferPayment extends PaymentMethod {
    constructor() {
        super();
        this.name = 'Bank Transfer';
        this.icon = 'fas fa-university';
    }

    processPayment(amount, orderData) {
        const { accountNumber, routingNumber, accountHolderName } = orderData.payment;
        
        if (!this.validateBankDetails(accountNumber, routingNumber)) {
            throw new Error('Invalid bank details');
        }

        console.log(`Processing ${this.name} payment for $${amount}`);
        
        return {
            success: true,
            transactionId: this.generateTransactionId(),
            amount: amount,
            method: this.name,
            processingTime: this.getEstimatedProcessingTime()
        };
    }

    validatePayment(paymentData) {
        const { accountNumber, routingNumber } = paymentData;
        return this.validateBankDetails(accountNumber, routingNumber);
    }

    validateBankDetails(accountNumber, routingNumber) {
        return accountNumber && accountNumber.length >= 8 && 
               routingNumber && routingNumber.length === 9;
    }

    generateTransactionId() {
        return 'BT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getProcessingFee() {
        return 5.00; // $5.00 processing fee
    }

    getEstimatedProcessingTime() {
        return '3-5 business days';
    }
}

class CryptoPayment extends PaymentMethod {
    constructor() {
        super();
        this.name = 'Cryptocurrency';
        this.icon = 'fab fa-bitcoin';
        this.supportedCoins = ['BTC', 'ETH', 'LTC', 'USDC'];
    }

    processPayment(amount, orderData) {
        const { cryptoType, walletAddress } = orderData.payment;
        
        if (!this.validateCryptoDetails(cryptoType, walletAddress)) {
            throw new Error('Invalid cryptocurrency details');
        }

        console.log(`Processing ${this.name} payment for $${amount} in ${cryptoType}`);
        
        return {
            success: true,
            transactionId: this.generateTransactionId(),
            amount: amount,
            method: `${this.name} (${cryptoType})`,
            processingTime: this.getEstimatedProcessingTime()
        };
    }

    validatePayment(paymentData) {
        const { cryptoType, walletAddress } = paymentData;
        return this.validateCryptoDetails(cryptoType, walletAddress);
    }

    validateCryptoDetails(cryptoType, walletAddress) {
        return this.supportedCoins.includes(cryptoType) && 
               walletAddress && walletAddress.length >= 26;
    }

    generateTransactionId() {
        return 'CR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getProcessingFee() {
        return 0; // Network fees only
    }

    getEstimatedProcessingTime() {
        return '10-30 minutes';
    }
}

// Payment Service Manager
class PaymentService {
    constructor() {
        this.paymentMethods = {
            creditCard: new CreditCardPayment(),
            paypal: new PayPalPayment(),
            bankTransfer: new BankTransferPayment(),
            crypto: new CryptoPayment()
        };
    }

    getAvailableMethods() {
        return Object.entries(this.paymentMethods)
            .filter(([key, method]) => method.isEnabled)
            .map(([key, method]) => ({
                id: key,
                name: method.name,
                icon: method.icon,
                processingFee: method.getProcessingFee(),
                processingTime: method.getEstimatedProcessingTime()
            }));
    }

    processPayment(methodId, amount, orderData) {
        const method = this.paymentMethods[methodId];
        
        if (!method) {
            throw new Error(`Payment method '${methodId}' not found`);
        }

        if (!method.isEnabled) {
            throw new Error(`Payment method '${methodId}' is disabled`);
        }

        return method.processPayment(amount, orderData);
    }

    validatePayment(methodId, paymentData) {
        const method = this.paymentMethods[methodId];
        
        if (!method) {
            throw new Error(`Payment method '${methodId}' not found`);
        }

        return method.validatePayment(paymentData);
    }

    getProcessingFee(methodId) {
        const method = this.paymentMethods[methodId];
        return method ? method.getProcessingFee() : 0;
    }

    getProcessingTime(methodId) {
        const method = this.paymentMethods[methodId];
        return method ? method.getEstimatedProcessingTime() : 'Unknown';
    }
} 