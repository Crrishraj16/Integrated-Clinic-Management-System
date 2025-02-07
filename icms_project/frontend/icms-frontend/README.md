# Integrated Clinic Management System (ICMS)

A comprehensive clinic management solution built with React, TypeScript, and Material-UI.

## Features

- **Appointment Management**
  - Schedule and manage appointments
  - Track appointment status
  - Send reminders
  - Manage waiting list

- **Clinical Management**
  - Patient records and medical history
  - Prescription management
  - Lab orders and results
  - Vaccination records

- **Billing Management**
  - Invoice creation and management
  - Payment processing
  - Insurance claims handling

- **Inventory Management**
  - Item tracking and stock management
  - Purchase orders
  - Supplier management
  - Low stock alerts

- **Disease Database**
  - Disease information management
  - Symptom-based search
  - Treatment protocols
  - Medication recommendations

- **Chat Support**
  - Real-time messaging
  - File attachments
  - Message history
  - Unread message indicators

## Tech Stack

- React 18
- TypeScript
- Material-UI (MUI)
- React Router v6
- Axios
- Socket.io (for real-time features)
- React Hook Form with Yup validation
- Vite
- Vitest for testing
- Cypress for E2E testing

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/icms-frontend.git
   cd icms-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```
   Update the environment variables in `.env` with your configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Testing

- Run unit tests:
  ```bash
  npm test
  ```

- Run tests with UI:
  ```bash
  npm run test:ui
  ```

- Run E2E tests:
  ```bash
  npm run test:e2e
  ```

- Generate coverage report:
  ```bash
  npm run test:coverage
  ```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── config/          # Configuration files
├── hooks/           # Custom React hooks
├── layouts/         # Layout components
├── pages/           # Page components
│   ├── appointments/
│   ├── billing/
│   ├── chat/
│   ├── clinical/
│   ├── disease/
│   ├── inventory/
│   └── patients/
├── services/        # API services
├── store/           # State management
├── types/           # TypeScript interfaces
└── utils/           # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@icms.com or join our Slack channel.
