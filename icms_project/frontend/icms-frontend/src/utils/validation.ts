export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const isValidDateTime = (dateTime: string): boolean => {
  const dateTimeObj = new Date(dateTime);
  return dateTimeObj instanceof Date && !isNaN(dateTimeObj.getTime());
};

export const isValidCurrency = (amount: number): boolean => {
  return !isNaN(amount) && amount >= 0;
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isValidPostalCode = (postalCode: string): boolean => {
  // This is a basic example, adjust based on your country's format
  const postalCodeRegex = /^\d{5,6}$/;
  return postalCodeRegex.test(postalCode);
};

export const isValidAge = (age: number): boolean => {
  return !isNaN(age) && age >= 0 && age <= 150;
};

export const isValidBloodGroup = (bloodGroup: string): boolean => {
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validBloodGroups.includes(bloodGroup);
};

export const isValidGender = (gender: string): boolean => {
  const validGenders = ['male', 'female', 'other'];
  return validGenders.includes(gender.toLowerCase());
};
