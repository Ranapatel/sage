// ─── Transport Hub Graph ──────────────────────────────────────────────────────
// Static config of ~40 major Indian transport hubs with their corridor connections.
// Used by the AlternativeRouteEngine to find multi-step journeys when direct
// transport is unavailable.

import { HubNode } from './types';

export const HUB_GRAPH: Record<string, HubNode> = {
  // ── North India ─────────────────────────────────────────────────────────────
  delhi: {
    name: 'New Delhi', stationCode: 'NDLS', citySlug: 'new-delhi', state: 'Delhi',
    lat: 28.6139, lng: 77.2090,
    connectsTo: {
      jaipur:    { km: 280, modes: ['train', 'bus'], estTime: '4h 30m' },
      agra:      { km: 230, modes: ['train', 'bus'], estTime: '3h 00m' },
      chandigarh:{ km: 250, modes: ['train', 'bus'], estTime: '3h 30m' },
      lucknow:   { km: 550, modes: ['train', 'bus'], estTime: '8h 00m' },
      amritsar:  { km: 450, modes: ['train', 'bus'], estTime: '6h 00m' },
      dehradun:  { km: 250, modes: ['train', 'bus'], estTime: '5h 30m' },
      varanasi:  { km: 780, modes: ['train', 'bus'], estTime: '11h 00m' },
      bhopal:    { km: 750, modes: ['train', 'bus'], estTime: '10h 00m' },
    },
  },
  jaipur: {
    name: 'Jaipur', stationCode: 'JP', citySlug: 'jaipur', state: 'Rajasthan',
    lat: 26.9124, lng: 75.7873,
    connectsTo: {
      delhi:      { km: 280, modes: ['train', 'bus'], estTime: '4h 30m' },
      agra:       { km: 240, modes: ['train', 'bus'], estTime: '4h 00m' },
      udaipur:    { km: 400, modes: ['bus'], estTime: '7h 00m' },
      jodhpur:    { km: 340, modes: ['train', 'bus'], estTime: '5h 30m' },
      ahmedabad:  { km: 670, modes: ['train', 'bus'], estTime: '10h 00m' },
      bikaner:    { km: 330, modes: ['train', 'bus'], estTime: '5h 00m' },
    },
  },
  agra: {
    name: 'Agra', stationCode: 'AGC', citySlug: 'agra', state: 'Uttar Pradesh',
    lat: 27.1767, lng: 78.0081,
    connectsTo: {
      delhi:    { km: 230, modes: ['train', 'bus'], estTime: '3h 00m' },
      jaipur:   { km: 240, modes: ['train', 'bus'], estTime: '4h 00m' },
      lucknow:  { km: 370, modes: ['train', 'bus'], estTime: '6h 00m' },
      gwalior:  { km: 120, modes: ['train', 'bus'], estTime: '2h 00m' },
    },
  },
  lucknow: {
    name: 'Lucknow', stationCode: 'LKO', citySlug: 'lucknow', state: 'Uttar Pradesh',
    lat: 26.8467, lng: 80.9462,
    connectsTo: {
      delhi:    { km: 550, modes: ['train', 'bus'], estTime: '8h 00m' },
      varanasi: { km: 300, modes: ['train', 'bus'], estTime: '4h 30m' },
      agra:     { km: 370, modes: ['train', 'bus'], estTime: '6h 00m' },
      patna:    { km: 550, modes: ['train', 'bus'], estTime: '9h 00m' },
      gorakhpur:{ km: 270, modes: ['train', 'bus'], estTime: '4h 30m' },
    },
  },
  amritsar: {
    name: 'Amritsar', stationCode: 'ASR', citySlug: 'amritsar', state: 'Punjab',
    lat: 31.6340, lng: 74.8723,
    connectsTo: {
      delhi:      { km: 450, modes: ['train', 'bus'], estTime: '6h 00m' },
      chandigarh: { km: 240, modes: ['train', 'bus'], estTime: '3h 30m' },
      jammu:      { km: 200, modes: ['train', 'bus'], estTime: '3h 00m' },
    },
  },
  chandigarh: {
    name: 'Chandigarh', stationCode: 'CDG', citySlug: 'chandigarh', state: 'Chandigarh',
    lat: 30.7333, lng: 76.7794,
    connectsTo: {
      delhi:    { km: 250, modes: ['train', 'bus'], estTime: '3h 30m' },
      amritsar: { km: 240, modes: ['train', 'bus'], estTime: '3h 30m' },
      shimla:   { km: 120, modes: ['bus'], estTime: '3h 30m' },
      dehradun: { km: 170, modes: ['bus'], estTime: '3h 00m' },
    },
  },
  dehradun: {
    name: 'Dehradun', stationCode: 'DDN', citySlug: 'dehradun', state: 'Uttarakhand',
    lat: 30.3165, lng: 78.0322,
    connectsTo: {
      delhi:      { km: 250, modes: ['train', 'bus'], estTime: '5h 30m' },
      chandigarh: { km: 170, modes: ['bus'], estTime: '3h 00m' },
      haridwar:   { km: 55,  modes: ['train', 'bus'], estTime: '1h 15m' },
    },
  },
  varanasi: {
    name: 'Varanasi', stationCode: 'BSB', citySlug: 'varanasi', state: 'Uttar Pradesh',
    lat: 25.3176, lng: 82.9739,
    connectsTo: {
      delhi:   { km: 780, modes: ['train', 'bus'], estTime: '11h 00m' },
      lucknow: { km: 300, modes: ['train', 'bus'], estTime: '4h 30m' },
      patna:   { km: 300, modes: ['train', 'bus'], estTime: '5h 00m' },
      kolkata: { km: 680, modes: ['train'], estTime: '12h 00m' },
    },
  },

  // ── West India ──────────────────────────────────────────────────────────────
  mumbai: {
    name: 'Mumbai', stationCode: 'CSTM', citySlug: 'mumbai', state: 'Maharashtra',
    lat: 19.0760, lng: 72.8777,
    connectsTo: {
      pune:       { km: 150, modes: ['train', 'bus'], estTime: '3h 00m' },
      goa:        { km: 600, modes: ['train', 'bus'], estTime: '12h 00m' },
      ahmedabad:  { km: 530, modes: ['train', 'bus'], estTime: '8h 00m' },
      nagpur:     { km: 840, modes: ['train', 'bus'], estTime: '13h 00m' },
      surat:      { km: 280, modes: ['train', 'bus'], estTime: '4h 00m' },
      nashik:     { km: 170, modes: ['train', 'bus'], estTime: '3h 30m' },
      aurangabad: { km: 370, modes: ['train', 'bus'], estTime: '7h 00m' },
    },
  },
  pune: {
    name: 'Pune', stationCode: 'PUNE', citySlug: 'pune', state: 'Maharashtra',
    lat: 18.5204, lng: 73.8567,
    connectsTo: {
      mumbai:     { km: 150, modes: ['train', 'bus'], estTime: '3h 00m' },
      goa:        { km: 450, modes: ['bus'], estTime: '10h 00m' },
      nagpur:     { km: 720, modes: ['train', 'bus'], estTime: '12h 00m' },
      aurangabad: { km: 230, modes: ['bus'], estTime: '5h 00m' },
      kolhapur:   { km: 230, modes: ['bus'], estTime: '5h 00m' },
    },
  },
  ahmedabad: {
    name: 'Ahmedabad', stationCode: 'ADI', citySlug: 'ahmedabad', state: 'Gujarat',
    lat: 23.0225, lng: 72.5714,
    connectsTo: {
      mumbai:    { km: 530, modes: ['train', 'bus'], estTime: '8h 00m' },
      jaipur:    { km: 670, modes: ['train', 'bus'], estTime: '10h 00m' },
      surat:     { km: 260, modes: ['train', 'bus'], estTime: '4h 00m' },
      udaipur:   { km: 260, modes: ['bus'], estTime: '5h 00m' },
      rajkot:    { km: 220, modes: ['train', 'bus'], estTime: '4h 00m' },
      gandhinagar:{km: 30,  modes: ['bus'], estTime: '0h 45m' },
    },
  },
  surat: {
    name: 'Surat', stationCode: 'ST', citySlug: 'surat', state: 'Gujarat',
    lat: 21.1702, lng: 72.8311,
    connectsTo: {
      mumbai:    { km: 280, modes: ['train', 'bus'], estTime: '4h 00m' },
      ahmedabad: { km: 260, modes: ['train', 'bus'], estTime: '4h 00m' },
      vadodara:  { km: 150, modes: ['train', 'bus'], estTime: '2h 30m' },
    },
  },
  nagpur: {
    name: 'Nagpur', stationCode: 'NGP', citySlug: 'nagpur', state: 'Maharashtra',
    lat: 21.1458, lng: 79.0882,
    connectsTo: {
      mumbai:   { km: 840, modes: ['train', 'bus'], estTime: '13h 00m' },
      pune:     { km: 720, modes: ['train', 'bus'], estTime: '12h 00m' },
      bhopal:   { km: 350, modes: ['train', 'bus'], estTime: '6h 00m' },
      hyderabad:{ km: 500, modes: ['train', 'bus'], estTime: '8h 00m' },
      raipur:   { km: 280, modes: ['train', 'bus'], estTime: '5h 00m' },
    },
  },
  bhopal: {
    name: 'Bhopal', stationCode: 'BPL', citySlug: 'bhopal', state: 'Madhya Pradesh',
    lat: 23.2599, lng: 77.4126,
    connectsTo: {
      delhi:  { km: 750, modes: ['train', 'bus'], estTime: '10h 00m' },
      nagpur: { km: 350, modes: ['train', 'bus'], estTime: '6h 00m' },
      indore:{ km: 190, modes: ['train', 'bus'], estTime: '3h 00m' },
      gwalior:{km: 420, modes: ['train', 'bus'], estTime: '6h 00m' },
    },
  },
  indore: {
    name: 'Indore', stationCode: 'INDB', citySlug: 'indore', state: 'Madhya Pradesh',
    lat: 22.7196, lng: 75.8577,
    connectsTo: {
      bhopal:   { km: 190, modes: ['train', 'bus'], estTime: '3h 00m' },
      ahmedabad:{ km: 400, modes: ['bus'], estTime: '7h 00m' },
      nagpur:   { km: 400, modes: ['bus'], estTime: '7h 00m' },
      udaipur:  { km: 400, modes: ['bus'], estTime: '7h 00m' },
    },
  },

  // ── South India ─────────────────────────────────────────────────────────────
  hyderabad: {
    name: 'Hyderabad', stationCode: 'SC', citySlug: 'hyderabad', state: 'Telangana',
    lat: 17.3850, lng: 78.4867,
    connectsTo: {
      bangalore:  { km: 570, modes: ['train', 'bus'], estTime: '9h 00m' },
      chennai:    { km: 630, modes: ['train', 'bus'], estTime: '10h 00m' },
      hubli:      { km: 360, modes: ['train', 'bus'], estTime: '8h 00m' },
      vijayawada: { km: 280, modes: ['train', 'bus'], estTime: '5h 00m' },
      nagpur:     { km: 500, modes: ['train', 'bus'], estTime: '8h 00m' },
      goa:        { km: 660, modes: ['bus'], estTime: '14h 00m' },
      secunderabad:{km: 10,  modes: ['train'], estTime: '0h 20m' },
    },
  },
  bangalore: {
    name: 'Bengaluru', stationCode: 'SBC', citySlug: 'bengaluru', state: 'Karnataka',
    lat: 12.9716, lng: 77.5946,
    connectsTo: {
      hyderabad:  { km: 570, modes: ['train', 'bus'], estTime: '9h 00m' },
      chennai:    { km: 350, modes: ['train', 'bus'], estTime: '6h 00m' },
      mysore:     { km: 150, modes: ['train', 'bus'], estTime: '3h 00m' },
      hubli:      { km: 410, modes: ['train', 'bus'], estTime: '7h 00m' },
      coimbatore: { km: 370, modes: ['train', 'bus'], estTime: '7h 00m' },
      mangalore:  { km: 350, modes: ['bus'], estTime: '6h 30m' },
      goa:        { km: 560, modes: ['bus'], estTime: '10h 00m' },
    },
  },
  chennai: {
    name: 'Chennai', stationCode: 'MAS', citySlug: 'chennai', state: 'Tamil Nadu',
    lat: 13.0827, lng: 80.2707,
    connectsTo: {
      bangalore:  { km: 350, modes: ['train', 'bus'], estTime: '6h 00m' },
      hyderabad:  { km: 630, modes: ['train', 'bus'], estTime: '10h 00m' },
      coimbatore: { km: 500, modes: ['train', 'bus'], estTime: '8h 00m' },
      madurai:    { km: 460, modes: ['train', 'bus'], estTime: '7h 00m' },
      pondicherry:{ km: 170, modes: ['bus'], estTime: '3h 30m' },
      tirupati:   { km: 130, modes: ['train', 'bus'], estTime: '3h 00m' },
    },
  },
  hubli: {
    name: 'Hubballi', stationCode: 'UBL', citySlug: 'hubli', state: 'Karnataka',
    lat: 15.3647, lng: 75.1240,
    connectsTo: {
      hyderabad: { km: 360, modes: ['train', 'bus'], estTime: '8h 00m' },
      bangalore: { km: 410, modes: ['train', 'bus'], estTime: '7h 00m' },
      goa:       { km: 180, modes: ['train', 'bus'], estTime: '4h 00m' },
      gokarna:   { km: 140, modes: ['bus', 'taxi'], estTime: '3h 00m' },
      belgaum:   { km: 100, modes: ['bus'], estTime: '2h 30m' },
      dharwad:   { km: 20,  modes: ['bus', 'auto'], estTime: '0h 45m' },
    },
  },
  goa: {
    name: 'Madgaon', stationCode: 'MAO', citySlug: 'panaji', state: 'Goa',
    lat: 15.2993, lng: 74.1240,
    connectsTo: {
      mumbai:    { km: 600, modes: ['train', 'bus'], estTime: '12h 00m' },
      pune:      { km: 450, modes: ['bus'], estTime: '10h 00m' },
      hubli:     { km: 180, modes: ['train', 'bus'], estTime: '4h 00m' },
      bangalore: { km: 560, modes: ['bus'], estTime: '10h 00m' },
      hyderabad: { km: 660, modes: ['bus'], estTime: '14h 00m' },
      gokarna:   { km: 70,  modes: ['bus', 'taxi'], estTime: '2h 00m' },
    },
  },
  gokarna: {
    name: 'Gokarna', stationCode: 'GKN', citySlug: 'gokarna', state: 'Karnataka',
    lat: 14.5479, lng: 74.3188,
    connectsTo: {
      hubli: { km: 140, modes: ['bus', 'taxi'], estTime: '3h 00m' },
      goa:   { km: 70,  modes: ['bus', 'taxi'], estTime: '2h 00m' },
      mangalore: { km: 230, modes: ['bus'], estTime: '5h 00m' },
    },
  },
  mysore: {
    name: 'Mysore', stationCode: 'MYS', citySlug: 'mysore', state: 'Karnataka',
    lat: 12.2958, lng: 76.6394,
    connectsTo: {
      bangalore: { km: 150, modes: ['train', 'bus'], estTime: '3h 00m' },
      mangalore: { km: 250, modes: ['bus'], estTime: '5h 00m' },
      ooty:      { km: 160, modes: ['bus'], estTime: '4h 00m' },
    },
  },
  coimbatore: {
    name: 'Coimbatore', stationCode: 'CBE', citySlug: 'coimbatore', state: 'Tamil Nadu',
    lat: 11.0168, lng: 76.9558,
    connectsTo: {
      bangalore: { km: 370, modes: ['train', 'bus'], estTime: '7h 00m' },
      chennai:   { km: 500, modes: ['train', 'bus'], estTime: '8h 00m' },
      madurai:   { km: 220, modes: ['train', 'bus'], estTime: '4h 30m' },
      ooty:      { km: 90,  modes: ['bus'], estTime: '3h 30m' },
    },
  },
  madurai: {
    name: 'Madurai', stationCode: 'MDU', citySlug: 'madurai', state: 'Tamil Nadu',
    lat: 9.9252, lng: 78.1198,
    connectsTo: {
      chennai:    { km: 460, modes: ['train', 'bus'], estTime: '7h 00m' },
      coimbatore: { km: 220, modes: ['train', 'bus'], estTime: '4h 30m' },
      rameswaram: { km: 170, modes: ['train', 'bus'], estTime: '3h 30m' },
      kanyakumari:{ km: 250, modes: ['train', 'bus'], estTime: '5h 00m' },
    },
  },
  kochi: {
    name: 'Kochi', stationCode: 'ERS', citySlug: 'kochi', state: 'Kerala',
    lat: 9.9312, lng: 76.2673,
    connectsTo: {
      coimbatore: { km: 190, modes: ['train', 'bus'], estTime: '4h 00m' },
      thiruvananthapuram: { km: 210, modes: ['train', 'bus'], estTime: '4h 30m' },
      thrissur:   { km: 80,  modes: ['train', 'bus'], estTime: '1h 30m' },
      mangalore:  { km: 420, modes: ['train', 'bus'], estTime: '8h 00m' },
    },
  },
  thiruvananthapuram: {
    name: 'Thiruvananthapuram', stationCode: 'TVC', citySlug: 'thiruvananthapuram', state: 'Kerala',
    lat: 8.5241, lng: 76.9366,
    connectsTo: {
      kochi:      { km: 210, modes: ['train', 'bus'], estTime: '4h 30m' },
      madurai:    { km: 310, modes: ['bus'], estTime: '6h 00m' },
      kanyakumari:{ km: 90,  modes: ['bus'], estTime: '2h 00m' },
    },
  },
  mangalore: {
    name: 'Mangalore', stationCode: 'MAJN', citySlug: 'mangalore', state: 'Karnataka',
    lat: 12.9141, lng: 74.8560,
    connectsTo: {
      bangalore: { km: 350, modes: ['bus'], estTime: '6h 30m' },
      kochi:     { km: 420, modes: ['train', 'bus'], estTime: '8h 00m' },
      mysore:    { km: 250, modes: ['bus'], estTime: '5h 00m' },
      gokarna:   { km: 230, modes: ['bus'], estTime: '5h 00m' },
    },
  },
  vijayawada: {
    name: 'Vijayawada', stationCode: 'BZA', citySlug: 'vijayawada', state: 'Andhra Pradesh',
    lat: 16.5062, lng: 80.6480,
    connectsTo: {
      hyderabad: { km: 280, modes: ['train', 'bus'], estTime: '5h 00m' },
      chennai:   { km: 450, modes: ['train', 'bus'], estTime: '7h 00m' },
      visakhapatnam: { km: 350, modes: ['train', 'bus'], estTime: '5h 30m' },
      guntur:    { km: 40,  modes: ['bus', 'train'], estTime: '1h 00m' },
    },
  },
  visakhapatnam: {
    name: 'Visakhapatnam', stationCode: 'VSKP', citySlug: 'visakhapatnam', state: 'Andhra Pradesh',
    lat: 17.6868, lng: 83.2185,
    connectsTo: {
      vijayawada: { km: 350, modes: ['train', 'bus'], estTime: '5h 30m' },
      hyderabad:  { km: 620, modes: ['train', 'bus'], estTime: '10h 00m' },
      bhubaneswar:{ km: 440, modes: ['train', 'bus'], estTime: '7h 00m' },
    },
  },

  // ── East India ──────────────────────────────────────────────────────────────
  kolkata: {
    name: 'Kolkata', stationCode: 'HWH', citySlug: 'kolkata', state: 'West Bengal',
    lat: 22.5726, lng: 88.3639,
    connectsTo: {
      varanasi:   { km: 680, modes: ['train'], estTime: '12h 00m' },
      patna:      { km: 580, modes: ['train', 'bus'], estTime: '8h 00m' },
      bhubaneswar:{ km: 440, modes: ['train', 'bus'], estTime: '7h 00m' },
      ranchi:     { km: 410, modes: ['train', 'bus'], estTime: '7h 00m' },
      guwahati:   { km: 1000,modes: ['train'], estTime: '18h 00m' },
    },
  },
  patna: {
    name: 'Patna', stationCode: 'PNBE', citySlug: 'patna', state: 'Bihar',
    lat: 25.5941, lng: 85.1376,
    connectsTo: {
      kolkata:   { km: 580, modes: ['train', 'bus'], estTime: '8h 00m' },
      varanasi:  { km: 300, modes: ['train', 'bus'], estTime: '5h 00m' },
      lucknow:   { km: 550, modes: ['train', 'bus'], estTime: '9h 00m' },
      ranchi:    { km: 330, modes: ['train', 'bus'], estTime: '6h 00m' },
      bodhgaya:  { km: 110, modes: ['bus'], estTime: '2h 30m' },
    },
  },
  bhubaneswar: {
    name: 'Bhubaneswar', stationCode: 'BBS', citySlug: 'bhubaneswar', state: 'Odisha',
    lat: 20.2961, lng: 85.8245,
    connectsTo: {
      kolkata:       { km: 440, modes: ['train', 'bus'], estTime: '7h 00m' },
      visakhapatnam: { km: 440, modes: ['train', 'bus'], estTime: '7h 00m' },
      ranchi:        { km: 370, modes: ['bus'], estTime: '7h 00m' },
      puri:          { km: 60,  modes: ['train', 'bus'], estTime: '1h 30m' },
    },
  },
  ranchi: {
    name: 'Ranchi', stationCode: 'RNC', citySlug: 'ranchi', state: 'Jharkhand',
    lat: 23.3441, lng: 85.3096,
    connectsTo: {
      kolkata:   { km: 410, modes: ['train', 'bus'], estTime: '7h 00m' },
      patna:     { km: 330, modes: ['train', 'bus'], estTime: '6h 00m' },
      bhubaneswar:{km: 370, modes: ['bus'], estTime: '7h 00m' },
    },
  },

  // ── Tourist Destinations (non-hub endpoints) ────────────────────────────────
  rishikesh: {
    name: 'Rishikesh', stationCode: 'RKSH', citySlug: 'rishikesh', state: 'Uttarakhand',
    lat: 30.0869, lng: 78.2676,
    connectsTo: {
      dehradun: { km: 25, modes: ['bus', 'auto'], estTime: '0h 45m' },
      haridwar: { km: 25, modes: ['bus'], estTime: '0h 45m' },
      delhi:    { km: 260, modes: ['bus'], estTime: '6h 00m' },
    },
  },
  manali: {
    name: 'Manali', stationCode: 'MANALI', citySlug: 'manali', state: 'Himachal Pradesh',
    lat: 32.2396, lng: 77.1887,
    connectsTo: {
      delhi:      { km: 570, modes: ['bus'], estTime: '12h 00m' },
      chandigarh: { km: 310, modes: ['bus'], estTime: '7h 00m' },
      shimla:     { km: 250, modes: ['bus'], estTime: '6h 00m' },
      kullu:      { km: 40,  modes: ['bus'], estTime: '1h 00m' },
    },
  },
  ooty: {
    name: 'Ooty', stationCode: 'UAM', citySlug: 'ooty', state: 'Tamil Nadu',
    lat: 11.4064, lng: 76.6932,
    connectsTo: {
      coimbatore: { km: 90,  modes: ['bus'], estTime: '3h 30m' },
      mysore:     { km: 160, modes: ['bus'], estTime: '4h 00m' },
      bangalore:  { km: 270, modes: ['bus'], estTime: '6h 00m' },
    },
  },
  pondicherry: {
    name: 'Pondicherry', stationCode: 'PDY', citySlug: 'pondicherry', state: 'Puducherry',
    lat: 11.9416, lng: 79.8083,
    connectsTo: {
      chennai:    { km: 170, modes: ['bus'], estTime: '3h 30m' },
      bangalore:  { km: 370, modes: ['bus'], estTime: '7h 00m' },
      madurai:    { km: 330, modes: ['bus'], estTime: '6h 00m' },
    },
  },
  rameswaram: {
    name: 'Rameswaram', stationCode: 'RMM', citySlug: 'rameswaram', state: 'Tamil Nadu',
    lat: 9.2876, lng: 79.3129,
    connectsTo: {
      madurai:     { km: 170, modes: ['train', 'bus'], estTime: '3h 30m' },
      kanyakumari: { km: 310, modes: ['bus'], estTime: '6h 00m' },
    },
  },
};

// ── Helper Functions ──────────────────────────────────────────────────────────

export function findHubKey(query: string): string | null {
  if (!query) return null;

  let cleanedQuery = query;
  if (query.includes(',')) {
    cleanedQuery = query.split(',')[0].trim();
  }
  const normalized = cleanedQuery.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');

  // Direct key match
  if (HUB_GRAPH[normalized.replace(/\s+/g, '')]) return normalized.replace(/\s+/g, '');
  if (HUB_GRAPH[normalized]) return normalized;

  // Match by name, citySlug, or stationCode (case-insensitive)
  for (const [key, hub] of Object.entries(HUB_GRAPH)) {
    if (
      hub.name.toLowerCase() === normalized ||
      hub.citySlug.toLowerCase() === normalized ||
      hub.stationCode.toLowerCase() === normalized ||
      hub.name.toLowerCase().includes(normalized) ||
      normalized.includes(hub.name.toLowerCase().split(' ')[0]) ||
      normalized.includes(hub.citySlug) ||
      key.includes(normalized.replace(/\s+/g, ''))
    ) {
      return key;
    }
  }

  // Partial / contains match
  for (const [key, hub] of Object.entries(HUB_GRAPH)) {
    const nameParts = hub.name.toLowerCase().split(/\s+/);
    if (nameParts.some(part => part.length > 3 && normalized.includes(part))) {
      return key;
    }
  }

  return null;
}

/**
 * Get the HubNode for a given key.
 */
export function getHub(key: string): HubNode | null {
  return HUB_GRAPH[key] || null;
}

/**
 * Find all intermediate hubs that connect origin to destination.
 * Returns candidate hub keys where origin->hub AND hub->destination both exist.
 */
export function findIntermediateHubs(originKey: string, destKey: string): string[] {
  const originHub = HUB_GRAPH[originKey];
  const destHub = HUB_GRAPH[destKey];
  if (!originHub || !destHub) return [];

  const candidates: string[] = [];

  for (const [hubKey, originConn] of Object.entries(originHub.connectsTo)) {
    // Skip if the hub is the destination itself
    if (hubKey === destKey) continue;

    const intermediateHub = HUB_GRAPH[hubKey];
    if (!intermediateHub) continue;

    // Check if this intermediate hub connects to the destination
    const destConn = intermediateHub.connectsTo[destKey];
    if (destConn) {
      candidates.push(hubKey);
    }
  }

  return candidates;
}

/**
 * Calculate haversine distance between two coordinate pairs in km.
 */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}
