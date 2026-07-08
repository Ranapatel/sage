import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrainCard } from '../components/transport/TrainCard';

// Mock auth store
jest.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { currency: 'INR' },
  }),
}));

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
}));

const mockTrain = {
  trainNumber: '12345',
  trainName: 'Test Express',
  departure: '10:00',
  arrival: '18:00',
  duration: '8h 00m',
  runsOn: ['Mon', 'Tue'],
  availableClasses: [
    {
      class: '3A',
      className: 'AC 3 Tier',
      available: true,
      price: 1500,
      availability: 'AVAILABLE 24',
    },
  ],
  bookingUrl: 'https://makemytrip.com/railways/test',
  originCode: 'NDLS',
  destinationCode: 'CSTM',
};

describe('TrainCard', () => {
  it('renders train details correctly', () => {
    render(<TrainCard train={mockTrain} />);
    
    expect(screen.getByText('Test Express')).toBeInTheDocument();
    expect(screen.getByText('#12345')).toBeInTheDocument();
    expect(screen.getByText('NDLS')).toBeInTheDocument();
    expect(screen.getByText('CSTM')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('18:00')).toBeInTheDocument();
    expect(screen.getByText('8h 00m')).toBeInTheDocument();
    expect(screen.getByText('Mon · Tue')).toBeInTheDocument();
  });
});
