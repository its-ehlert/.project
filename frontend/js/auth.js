// Authentication Manager for Online Book Store
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.init();
    }

    // Initialize authentication
    init() {
        if (this.isInitialized) return;
        
        // Load user from localStorage
        this.loadUser();
        
        // Check for expired sessions
        this.checkSessionExpiry();
        
        this.isInitialized = true;
    }

    // Load user from localStorage
    loadUser() {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                this.currentUser = UserFactory.createUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error loading user:', error);
            this.logout();
        }
    }

    // Save user to localStorage
    saveUser(userData) {
        try {
            this.currentUser = UserFactory.createUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('loginTime', Date.now().toString());
        } catch (error) {
            console.error('Error saving user:', error);
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null && this.currentUser.isActive;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.isAuthenticated() && this.currentUser.role === role;
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole('admin');
    }

    // Check if user is customer
    isCustomer() {
        return this.hasRole('customer');
    }

    // Check session expiry
    checkSessionExpiry() {
        const loginTime = localStorage.getItem('loginTime');
        if (loginTime) {
            const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
            const currentTime = Date.now();
            
            if (currentTime - parseInt(loginTime) > sessionDuration) {
                this.logout();
                showNotification('Session expired. Please login again.', 'info');
            }
        }
    }

    // Register new user
    async register(userData) {
        try {
            showLoadingSpinner();
            
            const response = await api.register(userData);
            
            if (response.success) {
                this.saveUser(response.user);
                showNotification('Registration successful!', 'success');
                
                // Redirect based on role
                if (response.user.role === 'admin') {
                    window.location.href = '/pages/admin.html';
                } else {
                    window.location.href = '/';
                }
                
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

    // Login user
    async login(credentials) {
        try {
            showLoadingSpinner();
            
            // Add role to credentials if not present
            if (!credentials.role) {
                credentials.role = 'customer'; // Default role
            }
            
            const response = await api.login(credentials);
            
            if (response.success) {
                this.saveUser(response.user);
                showNotification('Login successful!', 'success');
                
                // Redirect based on role
                if (response.user.role === 'admin') {
                    window.location.href = '/pages/admin.html';
                } else {
                    // Check for redirect parameter
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirect = urlParams.get('redirect');
                    if (redirect) {
                        window.location.href = redirect;
                    } else {
                        window.location.href = '/';
                    }
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

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('cart');
        
        // Redirect to login page
        window.location.href = '/pages/login.html';
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            showLoadingSpinner();
            
            const response = await api.updateProfile(profileData);
            
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

    // Reset password
    async resetPassword(email) {
        try {
            showLoadingSpinner();
            
            const response = await api.resetPassword(email);
            
            if (response.success) {
                showNotification('Password reset email sent!', 'success');
                return true;
            } else {
                showNotification(response.message || 'Password reset failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Password reset error:', error);
            showNotification('Password reset failed. Please try again.', 'error');
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

    // Require customer role for customer pages
    requireCustomer(redirectUrl = '/') {
        if (!this.isCustomer()) {
            showNotification('Access denied. Customer account required.', 'error');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Check if user can access specific resource
    canAccess(resource) {
        if (!this.isAuthenticated()) return false;
        return this.currentUser.canAccess(resource);
    }

    // Get user permissions
    getPermissions() {
        if (!this.isAuthenticated()) return [];
        
        if (this.isAdmin()) {
            return this.currentUser.permissions;
        }
        
        return [];
    }
}

// Initialize authentication manager
const auth = new AuthManager();

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
    auth.checkSessionExpiry();
}, 60000);

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        auth.checkSessionExpiry();
    }
}); 