export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class Validators {
  // Validate full name
  static validateFullName(fullName: string): string | null {
    if (!fullName || fullName.trim().length === 0) {
      return 'Full name is required';
    }

    if (fullName.trim().length < 2) {
      return 'Full name must be at least 2 characters';
    }

    if (fullName.length > 100) {
      return 'Full name cannot exceed 100 characters';
    }

    const nameRegex = /^[A-Za-z\s\u00C0-\u024F\u1E00-\u1EFF\-'.]+$/u;
    if (!nameRegex.test(fullName)) {
      return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
    }

    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return 'Please provide both first and last name';
    }

    return null;
  }

  // Validate phone number
  static validatePhoneNumber(phone: string): string | null {
    if (!phone) {
      return 'Phone number is required';
    }

    const cleanedPhone = phone.replace(/\D/g, '');

    if (cleanedPhone.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return 'Phone number can only contain digits';
    }

    return null;
  }

  // Validate email
  static validateEmail(email: string | undefined): string | null {
    if (!email || email.trim() === '') {
      return null; // Email is optional
    }

    if (email.length > 254) {
      return 'Email cannot exceed 254 characters';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please provide a valid email address';
    }

    return null;
  }

  // Validate date of birth
  static validateDateOfBirth(dateOfBirth: string | undefined): string | null {
    if (!dateOfBirth || dateOfBirth.trim() === '') {
      return null; // Date of birth is optional
    }

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return 'Date of birth must be a valid date';
    }

    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    // Adjust age if birthday hasn't occurred this year
    const hasHadBirthday =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    const actualAge = hasHadBirthday ? age : age - 1;

    if (actualAge < 15) {
      return 'You must be at least 15 years old';
    }

    if (actualAge > 100) {
      return 'Maximum age allowed is 100 years';
    }

    return null;
  }

  // Validate gender
  static validateGender(gender: string | undefined): string | null {
    if (!gender || gender.trim() === '') {
      return null; // Gender is optional, will be set to undefined
    }

    const validGenders = [
      'Male',
      'Female',
      'Other',
      'Prefer not to say',
      'Not specified',
    ];

    if (!validGenders.includes(gender)) {
      return `Gender must be one of: ${validGenders.join(', ')}`;
    }

    return null;
  }

  // Validate complete user profile data
  static validateUserProfile(data: any): ValidationResult {
    const errors: Record<string, string> = {};

    if (data.fullName !== undefined) {
      const error = this.validateFullName(data.fullName);
      if (error) errors.fullName = error;
    }

    if (data.phone !== undefined) {
      const error = this.validatePhoneNumber(data.phone);
      if (error) errors.phone = error;
    }

    if (data.email !== undefined) {
      const error = this.validateEmail(data.email);
      if (error) errors.email = error;
    }

    if (data.dateOfBirth !== undefined) {
      const error = this.validateDateOfBirth(data.dateOfBirth);
      if (error) errors.dateOfBirth = error;
    }

    if (data.gender !== undefined) {
      const error = this.validateGender(data.gender);
      if (error) errors.gender = error;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Sanitize input data
  static sanitizeProfileData(data: any): any {
    const sanitized: any = {};

    if (data.fullName) {
      sanitized.fullName = data.fullName
        .trim()
        .split(/\s+/)
        .map(
          (part: string) =>
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(' ');
    }

    if (data.phone) {
      sanitized.phone = data.phone.replace(/\D/g, '');
    }

    if (data.email) {
      sanitized.email = data.email.toLowerCase().trim();
    }

    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      sanitized.dateOfBirth = dob.toISOString().split('T')[0];
    }

    if (data.gender !== undefined) {
      sanitized.gender = data.gender.trim() === '' ? undefined : data.gender;
    }

    return sanitized;
  }
  static validatePasswordForChange(password: string): string | null {
    if (!password) {
      return 'Password is required';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (password.length > 50) {
      return 'Password cannot exceed 50 characters';
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Password must contain at least one special character';
    }

    if (/(.)\1\1/.test(password)) {
      return 'Password cannot contain 3 or more consecutive identical characters';
    }

    // Check against common passwords
    const commonPasswords = [
      'password',
      '12345678',
      'qwerty123',
      'admin123',
      'letmein',
      'welcome123',
      'monkey123',
      'dragon123',
      'baseball123',
      'football123',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      return 'Password is too common, please choose a stronger password';
    }

    return null;
  }

  // Validate change password data
  static validateChangePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    // Validate current password
    if (!data.currentPassword || data.currentPassword.trim() === '') {
      errors.currentPassword = 'Current password is required';
    }

    // Validate new password
    const passwordError = this.validatePasswordForChange(data.newPassword);
    if (passwordError) {
      errors.newPassword = passwordError;
    }

    // Validate confirm password
    if (!data.confirmPassword || data.confirmPassword.trim() === '') {
      errors.confirmPassword = 'Please confirm your new password';
    }

    // Check if passwords match
    if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'New passwords do not match';
    }

    // Check if new password is different from current password
    if (data.newPassword === data.currentPassword) {
      errors.newPassword =
        'New password must be different from current password';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
