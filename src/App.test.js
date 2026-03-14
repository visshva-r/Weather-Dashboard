import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Weather Dashboard title', () => {
  render(<App />);
  const title = screen.getByRole('heading', { name: /weather dashboard/i });
  expect(title).toBeInTheDocument();
});

test('renders search input', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/enter city name/i);
  expect(input).toBeInTheDocument();
});

test('renders Search button', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /search/i });
  expect(button).toBeInTheDocument();
});
