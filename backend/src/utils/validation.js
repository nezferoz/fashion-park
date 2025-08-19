// Email validation utilities
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dns = require('dns').promises;

const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email tidak boleh kosong' };
  }
  
  if (typeof email !== 'string') {
    return { isValid: false, message: 'Email harus berupa string' };
  }
  
  if (email.length > 254) {
    return { isValid: false, message: 'Email terlalu panjang (maksimal 254 karakter)' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Format email tidak valid' };
  }
  
  // Check for common invalid patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return { isValid: false, message: 'Format email tidak valid' };
  }
  
  const [localPart, domain] = email.split('@');
  
  if (localPart.length > 64) {
    return { isValid: false, message: 'Bagian lokal email terlalu panjang' };
  }
  
  // Validate local part (before @)
  if (localPart.length < 3) {
    return { isValid: false, message: 'Bagian lokal email terlalu pendek (minimal 3 karakter)' };
  }
  
  // Check for valid characters in local part
  const localPartRegex = /^[a-zA-Z0-9._%+-]+$/;
  if (!localPartRegex.test(localPart)) {
    return { isValid: false, message: 'Bagian lokal email hanya boleh berisi huruf, angka, titik, underscore, dan tanda khusus' };
  }
  
  // Check for common invalid local parts
  const invalidLocalParts = ['asal', 'bukan', 'invalid', 'test', 'fake', 'dummy', 'temp', 'tempory'];
  if (invalidLocalParts.includes(localPart.toLowerCase())) {
    return { isValid: false, message: 'Bagian lokal email tidak valid' };
  }
  
  // Check for consecutive dots or special characters
  if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, message: 'Format bagian lokal email tidak valid' };
  }
  
  if (domain.length > 253) {
    return { isValid: false, message: 'Domain email terlalu panjang' };
  }
  
  if (!domain.includes('.')) {
    return { isValid: false, message: 'Domain email tidak valid' };
  }
  
  // Check for valid TLD (Top Level Domain)
  const tld = domain.split('.').pop();
  if (tld.length < 2) {
    return { isValid: false, message: 'Domain email tidak valid' };
  }
  
  // Check for common invalid domains
  const invalidDomains = ['test', 'example', 'localhost', 'invalid'];
  if (invalidDomains.includes(domain.toLowerCase())) {
    return { isValid: false, message: 'Domain email tidak valid' };
  }
  
  return { isValid: true, message: 'Email valid' };
};

// Function to check if domain has valid MX records
const checkEmailDomain = async (domain) => {
  try {
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords.length > 0;
  } catch (error) {
    return false;
  }
};

// Enhanced email validation with domain check
const validateEmailWithDomainCheck = async (email) => {
  const basicValidation = validateEmail(email);
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  const domain = email.split('@')[1];
  const hasValidMX = await checkEmailDomain(domain);
  
  if (!hasValidMX) {
    return { isValid: false, message: 'Domain email tidak memiliki server email yang valid' };
  }
  
  return { isValid: true, message: 'Email valid dan domain aktif' };
};

const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password tidak boleh kosong' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password minimal 6 karakter' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password terlalu panjang (maksimal 128 karakter)' };
  }
  
  return { isValid: true, message: 'Password valid' };
};

const validateName = (name) => {
  if (!name) {
    return { isValid: false, message: 'Nama tidak boleh kosong' };
  }
  
  if (name.length < 2) {
    return { isValid: false, message: 'Nama minimal 2 karakter' };
  }
  
  if (name.length > 100) {
    return { isValid: false, message: 'Nama terlalu panjang (maksimal 100 karakter)' };
  }
  
  // Check for valid characters (letters, spaces, dots, hyphens)
  const nameRegex = /^[a-zA-Z\s\.\-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, message: 'Nama hanya boleh berisi huruf, spasi, titik, dan tanda hubung' };
  }
  
  return { isValid: true, message: 'Nama valid' };
};

module.exports = {
  validateEmail,
  validateEmailWithDomainCheck,
  checkEmailDomain,
  validatePassword,
  validateName
};
