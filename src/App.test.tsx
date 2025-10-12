import { render, screen } from '@testing-library/react';
import App from './App';
import { expect, test } from 'vitest';

test('renders headline', () => {
  render(<App />);
  const headline = screen.getByText(/Venezia/i);
  expect(headline).toBeInTheDocument();
});
