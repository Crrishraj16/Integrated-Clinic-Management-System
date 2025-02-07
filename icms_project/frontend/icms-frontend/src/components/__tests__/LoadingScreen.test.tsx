import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingScreen from '../LoadingScreen';

describe('LoadingScreen', () => {
  it('renders with default message', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const message = 'Please wait...';
    render(<LoadingScreen message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders loading spinner', () => {
    render(<LoadingScreen />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
