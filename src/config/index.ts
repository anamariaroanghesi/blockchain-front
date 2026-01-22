import { EnvironmentsEnum } from 'types';

export * from './sharedConfig';

// Festival Smart Contract deployed on devnet
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgq7kpf8d4eyy6umdgeug8la0ss64uxeg4cn2jsuxvsq2';
export const API_URL = 'https://devnet-api.multiversx.com';
export const sampleAuthenticatedDomains = [API_URL];
export const environment = EnvironmentsEnum.devnet;

// Festival configuration
export const FESTIVAL_ID = 8;
