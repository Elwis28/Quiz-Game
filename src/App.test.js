import { render, screen } from '@testing-library/react';
import App from './App';
import axios from 'axios';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

test('shows initial loading indicator', async () => {
  axios.get.mockResolvedValue({ data: { isGameStarted: false, teams: [], loggedInTeams: [] } });
  render(<App />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
