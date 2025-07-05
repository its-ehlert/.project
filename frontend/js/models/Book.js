// Book Model Classes - Demonstrating Inheritance and Polymorphism
class Book {
    constructor(id, title, author, price, category, description = '') {
        this.id = id;
        this.title = title;
        this.author = author;
        this.price = price;
        this.originalPrice = price;
        this.category = category;
        this.description = description;
        this.rating = 0;
        this.reviewCount = 0;
        this.stock = 0;
        this.isActive = true;
        this.createdAt = new Date();
    }

    get discountPercentage() {
        if (this.originalPrice > this.price) {
            return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
        }
        return 0;
    }

    get isOnSale() {
        return this.discountPercentage > 0;
    }

    get isInStock() {
        return this.stock > 0;
    }

    get formattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }

    get formattedOriginalPrice() {
        return `$${this.originalPrice.toFixed(2)}`;
    }

    applyDiscount(percentage) {
        this.price = this.originalPrice * (1 - percentage / 100);
    }

    removeDiscount() {
        this.price = this.originalPrice;
    }

    updateStock(quantity) {
        this.stock = Math.max(0, this.stock + quantity);
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            price: this.price,
            originalPrice: this.originalPrice,
            category: this.category,
            description: this.description,
            rating: this.rating,
            reviewCount: this.reviewCount,
            stock: this.stock,
            isActive: this.isActive,
            discountPercentage: this.discountPercentage,
            isOnSale: this.isOnSale,
            isInStock: this.isInStock,
            formattedPrice: this.formattedPrice,
            formattedOriginalPrice: this.formattedOriginalPrice
        };
    }
}

class Ebook extends Book {
    constructor(id, title, author, price, category, description = '') {
        super(id, title, author, price, category, description);
        this.format = 'digital';
        this.fileSize = 0;
        this.downloadUrl = '';
        this.isDRMProtected = true;
    }

    get downloadAvailable() {
        return this.isInStock && this.downloadUrl;
    }

    download() {
        if (this.downloadAvailable) {
            // Simulate download process
            console.log(`Downloading ${this.title}...`);
            return this.downloadUrl;
        }
        throw new Error('Download not available');
    }

    toJSON() {
        return {
            ...super.toJSON(),
            format: this.format,
            fileSize: this.fileSize,
            downloadUrl: this.downloadUrl,
            isDRMProtected: this.isDRMProtected,
            downloadAvailable: this.downloadAvailable
        };
    }
}

class Audiobook extends Book {
    constructor(id, title, author, price, category, description = '') {
        super(id, title, author, price, category, description);
        this.format = 'audio';
        this.narrator = '';
        this.duration = 0; // in minutes
        this.audioUrl = '';
    }

    get formattedDuration() {
        const hours = Math.floor(this.duration / 60);
        const minutes = this.duration % 60;
        return `${hours}h ${minutes}m`;
    }

    play() {
        if (this.audioUrl) {
            console.log(`Playing ${this.title} narrated by ${this.narrator}`);
            return this.audioUrl;
        }
        throw new Error('Audio not available');
    }

    toJSON() {
        return {
            ...super.toJSON(),
            format: this.format,
            narrator: this.narrator,
            duration: this.duration,
            audioUrl: this.audioUrl,
            formattedDuration: this.formattedDuration
        };
    }
}

class PhysicalBook extends Book {
    constructor(id, title, author, price, category, description = '') {
        super(id, title, author, price, category, description);
        this.format = 'physical';
        this.pages = 0;
        this.dimensions = { width: 0, height: 0, depth: 0 };
        this.weight = 0;
        this.isbn = '';
        this.publisher = '';
        this.publicationDate = null;
    }

    get shippingWeight() {
        return this.weight + 0.5; // Add packaging weight
    }

    get isHeavy() {
        return this.weight > 2; // Over 2 pounds
    }

    calculateShippingCost() {
        return this.isHeavy ? 8.99 : 5.99;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            format: this.format,
            pages: this.pages,
            dimensions: this.dimensions,
            weight: this.weight,
            isbn: this.isbn,
            publisher: this.publisher,
            publicationDate: this.publicationDate,
            shippingWeight: this.shippingWeight,
            isHeavy: this.isHeavy
        };
    }
}

// Factory for creating different book types
class BookFactory {
    static createBook(bookData) {
        switch (bookData.format) {
            case 'digital':
            case 'ebook':
                return new Ebook(bookData.id, bookData.title, bookData.author, bookData.price, bookData.category, bookData.description);
            case 'audio':
            case 'audiobook':
                return new Audiobook(bookData.id, bookData.title, bookData.author, bookData.price, bookData.category, bookData.description);
            case 'physical':
            default:
                return new PhysicalBook(bookData.id, bookData.title, bookData.author, bookData.price, bookData.category, bookData.description);
        }
    }
} 