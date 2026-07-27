import axios from 'axios';
import { env } from '@/config/env';

/**
 * Shared Axios instance configured with base URL and timeouts
 */
export const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
