import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Register from '../Register';
import theme from '../../theme';
import { authAPI } from '../../services/api';
// Mock the API
vi.mock('../../services/api', () => ({
    authAPI: {
        register: vi.fn(),
    },
}));
// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});
const renderRegister = () => {
    render(_jsx(BrowserRouter, { children: _jsx(ThemeProvider, { theme: theme, children: _jsx(Register, {}) }) }));
};
describe('Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders registration form with all steps', async () => {
        renderRegister();
        expect(screen.getByText('Create your account')).toBeInTheDocument();
        expect(screen.getByText('Account Details')).toBeInTheDocument();
        expect(screen.getByText('Personal Information')).toBeInTheDocument();
        expect(screen.getByText('Role Selection')).toBeInTheDocument();
    });
    it('shows validation errors for empty fields', async () => {
        renderRegister();
        const nextButton = screen.getByText('Next');
        // Try to proceed without filling in required fields
        fireEvent.click(nextButton);
        // Check for validation error
        expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
        // Fill in email with invalid format
        const emailInput = screen.getByTestId('email-input');
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.click(nextButton);
        expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
    });
    it('validates email format', async () => {
        renderRegister();
        const emailInput = screen.getByTestId('email-input');
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);
        await waitFor(() => {
            expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        });
    });
    it('validates password length', async () => {
        renderRegister();
        const emailInput = screen.getByTestId('email-input');
        const passwordInput = screen.getByTestId('password-input');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'short' } });
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);
        await waitFor(() => {
            expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
        });
    });
    it('validates password match', async () => {
        renderRegister();
        const emailInput = screen.getByTestId('email-input');
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId('confirm-password-input');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password124' } });
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);
        await waitFor(() => {
            expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        });
    });
    it('progresses through all steps with valid data', async () => {
        renderRegister();
        // Step 1: Account Details
        const emailInput = screen.getByTestId('email-input');
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId('confirm-password-input');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(screen.getByText('Next'));
        // Step 2: Personal Information
        await waitFor(() => {
            expect(screen.getByTestId('full-name-input')).toBeInTheDocument();
        });
        const fullNameInput = screen.getByTestId('full-name-input');
        const phoneNumberInput = screen.getByTestId('phone-number-input');
        fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
        fireEvent.change(phoneNumberInput, { target: { value: '+1234567890' } });
        fireEvent.click(screen.getByText('Next'));
        // Step 3: Role Selection
        await waitFor(() => {
            expect(screen.getByTestId('role-input')).toBeInTheDocument();
        });
    });
    it('handles successful registration', async () => {
        renderRegister();
        // Fill in all required fields
        const emailInput = screen.getByTestId('email-input');
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId('confirm-password-input');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(screen.getByText('Next'));
        await waitFor(() => {
            expect(screen.getByTestId('full-name-input')).toBeInTheDocument();
        });
        const fullNameInput = screen.getByTestId('full-name-input');
        const phoneNumberInput = screen.getByTestId('phone-number-input');
        fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
        fireEvent.change(phoneNumberInput, { target: { value: '+1234567890' } });
        fireEvent.click(screen.getByText('Next'));
        await waitFor(() => {
            expect(screen.getByTestId('role-input')).toBeInTheDocument();
        });
        // Mock successful registration
        authAPI.register.mockResolvedValueOnce({});
        fireEvent.click(screen.getByText('Register'));
        await waitFor(() => {
            expect(authAPI.register).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
                full_name: 'John Doe',
                phone: '+1234567890',
                role: 'staff',
            });
            expect(mockNavigate).toHaveBeenCalledWith('/login', {
                state: { message: 'Registration successful! Please login.' },
            });
        });
    });
    it('handles registration error', async () => {
        renderRegister();
        // Fill in all required fields
        const emailInput = screen.getByTestId('email-input');
        const passwordInput = screen.getByTestId('password-input');
        const confirmPasswordInput = screen.getByTestId('confirm-password-input');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(screen.getByText('Next'));
        await waitFor(() => {
            expect(screen.getByTestId('full-name-input')).toBeInTheDocument();
        });
        const fullNameInput = screen.getByTestId('full-name-input');
        const phoneNumberInput = screen.getByTestId('phone-number-input');
        fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
        fireEvent.change(phoneNumberInput, { target: { value: '+1234567890' } });
        fireEvent.click(screen.getByText('Next'));
        await waitFor(() => {
            expect(screen.getByTestId('role-input')).toBeInTheDocument();
        });
        // Mock registration error
        const errorMessage = 'Email already exists';
        authAPI.register.mockRejectedValueOnce({
            response: { data: { detail: errorMessage } },
        });
        fireEvent.click(screen.getByText('Register'));
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });
    it('toggles password visibility', async () => {
        renderRegister();
        const passwordInput = screen.getByTestId('password-input');
        const toggleButton = passwordInput.parentElement?.querySelector('button');
        expect(passwordInput).toHaveAttribute('type', 'password');
        if (toggleButton) {
            fireEvent.click(toggleButton);
            await waitFor(() => {
                expect(passwordInput).toHaveAttribute('type', 'text');
            });
        }
    });
});
