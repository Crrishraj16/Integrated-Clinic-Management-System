describe('Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display registration form', () => {
    cy.contains('Create your account');
    cy.contains('Account Details');
    cy.contains('Personal Information');
    cy.contains('Role Selection');
  });

  it('should show validation errors for empty fields', () => {
    cy.contains('Next').click();
    cy.contains('Please fill in all fields');
  });

  it('should validate email format', () => {
    cy.get('input[name="email"]').type('invalid-email');
    cy.contains('Next').click();
    cy.contains('Please enter a valid email address');
  });

  it('should validate password match', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password124');
    cy.contains('Next').click();
    cy.contains('Passwords do not match');
  });

  it('should complete registration successfully', () => {
    // Step 1: Account Details
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.contains('Next').click();

    // Step 2: Personal Information
    cy.get('input[name="fullName"]').type('John Doe');
    cy.get('input[name="phone"]').type('+1234567890');
    cy.contains('Next').click();

    // Step 3: Role Selection
    cy.get('input[name="role"]').parent().click();
    cy.contains('Doctor').click();
    
    // Submit registration
    cy.contains('Register').click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
    cy.contains('Registration successful');
  });

  it('should handle server errors', () => {
    // Intercept the registration request
    cy.intercept('POST', '/auth/register', {
      statusCode: 400,
      body: {
        detail: 'Email already registered'
      }
    }).as('registerRequest');

    // Step 1: Account Details
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.contains('Next').click();

    // Step 2: Personal Information
    cy.get('input[name="fullName"]').type('John Doe');
    cy.get('input[name="phone"]').type('+1234567890');
    cy.contains('Next').click();

    // Step 3: Role Selection
    cy.get('input[name="role"]').parent().click();
    cy.contains('Doctor').click();
    
    // Submit registration
    cy.contains('Register').click();
    
    // Should show error message
    cy.contains('Email already registered');
  });
});
