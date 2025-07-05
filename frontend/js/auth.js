// Authentication Management for Online Book Store
class AuthManager {
    constructor() {
        this.currentUser = this.loadUser();
        this.init();
    }

    // Initialize authentication
    init() {
        this.updateAuthUI();
        this.bindEvents();
        this.checkTokenExpiry();
    }

    // Load user from localStorage
    loadUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }

    // Save user to localStorage
    saveUser(userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        this.currentUser = userData;
        this.updateAuthUI();
    }

    // Clear user data
    clearUser() {
        localStorage.removeItem('user');
        this.currentUser = null;
        this.updateAuthUI();
    }

    // Update authentication UI
    updateAuthUI() {
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const profileLink = document.getElementById('profileLink');
        const ordersLink = document.getElementById('ordersLink');
        const logoutLink = document.getElementById('logoutLink');
        const userBtn = document.getElementById('userBtn');

        if (this.currentUser) {
            // User is logged in
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'block';
            if (ordersLink) ordersLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'block';

            // Update user button with user info
            if (userBtn) {
                userBtn.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span class="user-name">${this.currentUser.firstName || 'User'}</span>
                `;
            }
        } else {
            // User is not logged in
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
            if (profileLink) profileLink.style.display = 'none';
            if (ordersLink) ordersLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none';

            // Reset user button
            if (userBtn) {
                userBtn.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
    }

    // Bind authentication events
    bindEvents() {
        // Logout link
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Check for redirect after login
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        if (redirect && this.currentUser) {
            window.location.href = `/pages/${redirect}.html`;
        }
    }

    // Login user
    async login(credentials) {
        try {
            showLoadingSpinner();
            
            const response = await api.login(credentials);
            
            if (response.success) {
                this.saveUser(response.user);
                showNotification('Login successful!', 'success');
                
                // Redirect if specified
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                if (redirect) {
                    window.location.href = `/pages/${redirect}.html`;
                } else {
                    window.location.href = '/';
                }
                
                return true;
            } else {
                showNotification(response.message || 'Login failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Login failed. Please try again.', 'error');
            return false;
        } finally {
            hideLoadingSpinner();
        }
    }

    // Register user
    async register(userData) {
        try {
            showLoadingSpinner();
            
            const response = await api.register(userData);
            
            if (response.success) {
                this.saveUser(response.user);
                showNotification('Registration successful! Welcome to BookStore!', 'success');
                window.location.href = '/';
                return true;
            } else {
                showNotification(response.message || 'Registration failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Registration failed. Please try again.', 'error');
            return false;
        } finally {
            hideLoadingSpinner();
        }
    }

    // Logout user
    async logout() {
        try {
            if (this.currentUser && this.currentUser.token) {
                await api.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearUser();
            showNotification('Logged out successfully', 'info');
            window.location.href = '/';
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null && this.currentUser.token;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole('admin');
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check token expiry
    checkTokenExpiry() {
        if (this.currentUser && this.currentUser.expiresAt) {
            const now = new Date().getTime();
            const expiresAt = new Date(this.currentUser.expiresAt).getTime();
            
            if (now >= expiresAt) {
                // Token expired
                this.clearUser();
                showNotification('Your session has expired. Please log in again.', 'error');
                window.location.href = '/pages/login.html';
            }
        }
    }

    // Refresh token
    async refreshToken() {
        try {
            const response = await api.refreshToken();
            if (response.success) {
                this.saveUser(response.user);
                return true;
            } else {
                this.clearUser();
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.clearUser();
            return false;
        }
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            showLoadingSpinner();
            
            const response = await api.updateUserProfile(profileData);
            
            if (response.success) {
                this.saveUser(response.user);
                showNotification('Profile updated successfully!', 'success');
                return true;
            } else {
                showNotification(response.message || 'Profile update failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Profile update error:', error);
            showNotification('Profile update failed. Please try again.', 'error');
            return false;
        } finally {
            hideLoadingSpinner();
        }
    }

    // Change password
    async changePassword(passwordData) {
        try {
            showLoadingSpinner();
            
            const response = await api.changePassword(passwordData);
            
            if (response.success) {
                showNotification('Password changed successfully!', 'success');
                return true;
            } else {
                showNotification(response.message || 'Password change failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Password change error:', error);
            showNotification('Password change failed. Please try again.', 'error');
            return false;
        } finally {
            hideLoadingSpinner();
        }
    }

    // Require authentication for protected pages
    requireAuth(redirectUrl = '/pages/login.html') {
        if (!this.isAuthenticated()) {
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `${redirectUrl}?redirect=${currentUrl}`;
            return false;
        }
        return true;
    }

    // Require admin role for admin pages
    requireAdmin(redirectUrl = '/') {
        if (!this.isAdmin()) {
            showNotification('Access denied. Admin privileges required.', 'error');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
}

// Create global auth instance
const auth = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

// Login page functionality
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const email = this.querySelector('input[name="email"]').value;
                const password = this.querySelector('input[name="password"]').value;
                const rememberMe = this.querySelector('input[name="rememberMe"]').checked;
                
                if (!email || !password) {
                    showNotification('Please fill in all fields', 'error');
                    return;
                }
                
                const success = await auth.login({
                    email: email,
                    password: password,
                    rememberMe: rememberMe
                });
                
                if (success) {
                    this.reset();
                }
            });
        }

        // Show/hide password toggle
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordInput = document.querySelector('input[name="password"]');
        
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', function() {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                this.innerHTML = type === 'password' ? 
                    '<i class="fas fa-eye"></i>' : 
                    '<i class="fas fa-eye-slash"></i>';
            });
        }
    });
}

// Registration page functionality
if (window.location.pathname.includes('register.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        const registerForm = document.getElementById('registerForm');
        
        if (registerForm) {
            registerForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const firstName = this.querySelector('input[name="firstName"]').value;
                const lastName = this.querySelector('input[name="lastName"]').value;
                const email = this.querySelector('input[name="email"]').value;
                const password = this.querySelector('input[name="password"]').value;
                const confirmPassword = this.querySelector('input[name="confirmPassword"]').value;
                const agreeToTerms = this.querySelector('input[name="agreeToTerms"]').checked;
                
                // Validation
                if (!firstName || !lastName || !email || !password || !confirmPassword) {
                    showNotification('Please fill in all fields', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showNotification('Passwords do not match', 'error');
                    return;
                }
                
                if (password.length < 8) {
                    showNotification('Password must be at least 8 characters long', 'error');
                    return;
                }
                
                if (!agreeToTerms) {
                    showNotification('Please agree to the terms and conditions', 'error');
                    return;
                }
                
                const success = await auth.register({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password
                });
                
                if (success) {
                    this.reset();
                }
            });
        }

        // Password strength indicator
        const passwordInput = document.querySelector('input[name="password"]');
        const strengthIndicator = document.getElementById('passwordStrength');
        
        if (passwordInput && strengthIndicator) {
            passwordInput.addEventListener('input', function() {
                const strength = calculatePasswordStrength(this.value);
                updatePasswordStrengthIndicator(strength, strengthIndicator);
            });
        }
    });
}

// Profile page functionality
if (window.location.pathname.includes('profile.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Require authentication
        if (!auth.requireAuth()) return;
        
        const profileForm = document.getElementById('profileForm');
        
        if (profileForm) {
            // Load current user data
            const user = auth.getCurrentUser();
            if (user) {
                profileForm.querySelector('input[name="firstName"]').value = user.firstName || '';
                profileForm.querySelector('input[name="lastName"]').value = user.lastName || '';
                profileForm.querySelector('input[name="email"]').value = user.email || '';
                profileForm.querySelector('input[name="phone"]').value = user.phone || '';
            }
            
            profileForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const profileData = {
                    firstName: this.querySelector('input[name="firstName"]').value,
                    lastName: this.querySelector('input[name="lastName"]').value,
                    phone: this.querySelector('input[name="phone"]').value
                };
                
                await auth.updateProfile(profileData);
            });
        }

        // Change password form
        const changePasswordForm = document.getElementById('changePasswordForm');
        
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const currentPassword = this.querySelector('input[name="currentPassword"]').value;
                const newPassword = this.querySelector('input[name="newPassword"]').value;
                const confirmNewPassword = this.querySelector('input[name="confirmNewPassword"]').value;
                
                if (!currentPassword || !newPassword || !confirmNewPassword) {
                    showNotification('Please fill in all fields', 'error');
                    return;
                }
                
                if (newPassword !== confirmNewPassword) {
                    showNotification('New passwords do not match', 'error');
                    return;
                }
                
                if (newPassword.length < 8) {
                    showNotification('New password must be at least 8 characters long', 'error');
                    return;
                }
                
                await auth.changePassword({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                });
                
                this.reset();
            });
        }
    });
}

// Utility functions
function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}

function updatePasswordStrengthIndicator(strength, indicator) {
    const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#ff4444', '#ff8800', '#ffbb33', '#00C851', '#007E33'];
    
    indicator.textContent = strengthTexts[strength - 1] || 'Very Weak';
    indicator.style.color = strengthColors[strength - 1] || '#ff4444';
}

function showLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('show');
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('show');
    }
}

// Auto-check token expiry every minute
setInterval(() => {
    auth.checkTokenExpiry();
}, 60000);

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        auth.checkTokenExpiry();
    }
}); 