
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders overview navigation', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const overviewElement = screen.getByText(/Overview/i);
  expect(overviewElement).toBeInTheDocument();
});
