import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorAlert from '../ErrorAlert';

describe('ErrorAlert', () => {
  it('renders error message', () => {
    const message = 'Test error message';
    render(<ErrorAlert message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders with custom severity', () => {
    const message = 'Test warning message';
    render(<ErrorAlert message={message} severity="warning" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardWarning');
  });
});
