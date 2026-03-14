import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Weather from './Weather';

jest.mock('axios');

const mockWeather = {
  name: 'London',
  sys: { country: 'GB' },
  weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
  main: { temp: 15, feels_like: 14, humidity: 70 },
  wind: { speed: 5 },
};

const mockForecast = {
  list: [
    { dt_txt: '2025-03-15 12:00:00', main: { temp: 16 }, weather: [{ description: 'clear', icon: '01d' }] },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  process.env.REACT_APP_WEATHER_API_KEY = 'test-key';
});

test('shows empty state when no city and no data', () => {
  render(<Weather />);
  expect(screen.getByText(/enter a city name or use the location button/i)).toBeInTheDocument();
});

test('search button is disabled when input is empty', () => {
  render(<Weather />);
  const input = screen.getByPlaceholderText(/enter city name/i);
  const button = screen.getByRole('button', { name: /search/i });
  expect(input).toHaveValue('');
  expect(button).toBeDisabled();
});

test('shows loading then weather on successful fetch', async () => {
  axios.get.mockResolvedValueOnce({ data: mockWeather }).mockResolvedValueOnce({ data: mockForecast });
  localStorage.setItem('lastCity', 'London');

  render(<Weather />);

  await waitFor(() => {
    expect(screen.getByText(/London, GB/i)).toBeInTheDocument();
  });
  expect(screen.getByText(/15°C/)).toBeInTheDocument();
});

test('shows error on city not found', async () => {
  axios.get.mockRejectedValue({ response: { status: 404 } });
  localStorage.setItem('lastCity', 'InvalidCityXYZ');

  render(<Weather />);

  await waitFor(() => {
    expect(screen.getByText(/city not found/i)).toBeInTheDocument();
  });
});

test('Enter key triggers search', async () => {
  axios.get.mockResolvedValueOnce({ data: mockWeather }).mockResolvedValueOnce({ data: mockForecast });
  render(<Weather />);
  const input = screen.getByPlaceholderText(/enter city name/i);
  await userEvent.type(input, 'Paris{Enter}');
  await waitFor(() => {
    expect(axios.get).toHaveBeenCalled();
  });
});
