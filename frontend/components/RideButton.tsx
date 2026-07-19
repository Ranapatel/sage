import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import BookUberButton from './BookUberButton';

interface RideButtonProps {
  destinationName: string;
  latitude: number | null;
  longitude: number | null;
  pickupType?: string;
  isGeocoding?: boolean;
}

export default function RideButton({
  destinationName,
  latitude,
  longitude,
  pickupType = 'my_location',
  isGeocoding = false,
}: RideButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRide = async () => {
    if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
      toast.error('Unable to generate Uber ride. Coordinates are invalid or missing.');
      return;
    }

    const payload = {
      destinationName,
      latitude,
      longitude,
      pickupType,
    };

    console.log('[RideButton] Request payload:', payload);

    setIsLoading(true);
    try {
      // POST payload validation
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await axios.post(`${apiBaseUrl}/api/transport/uber`, payload);

      console.log('[RideButton] Response JSON received:', response.data);

      if (response.data && response.data.url) {
        console.log('[RideButton] Frontend URL before opening:', response.data.url);
        window.open(response.data.url, '_blank');
        toast.success('Opening Uber App...');
      } else {
        throw new Error('Malformed server response: link not found');
      }
    } catch (error: any) {
      console.error('[Uber Booking Error]:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Server error';

      // Required: "Show toast Unable to generate Uber ride"
      toast.error(`Unable to generate Uber ride: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BookUberButton
      onClick={handleRide}
      isLoading={isLoading || isGeocoding}
      disabled={isLoading || isGeocoding || latitude == null || longitude == null}
    />
  );
}
