import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('Ogden850App Main Entry', () => {
  it('renders onboarding screen without crashing', () => {
    render(<App />);
    
    // Check if the onboarding screen title is present
    expect(screen.getByText(/核心引擎/i)).toBeInTheDocument();
  });
});
