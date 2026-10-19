import { requireEnv } from '../utils/env';

export interface Credentials {
  username: string;
  password: string;
}

const password = () => requireEnv('SAUCE_PASSWORD');

/** Public Sauce Demo personas. Only the password comes from .env. */
export const users = {
  standard: (): Credentials => ({ username: requireEnv('SAUCE_USERNAME'), password: password() }),
  lockedOut: (): Credentials => ({ username: 'locked_out_user', password: password() }),
};

export interface InvalidLoginCase {
  title: string;
  username: string;
  password: string;
  expectedError: string;
}

export const invalidLogins = (): InvalidLoginCase[] => [
  {
    title: 'locked out user',
    username: 'locked_out_user',
    password: password(),
    expectedError: 'Sorry, this user has been locked out.',
  },
  {
    title: 'wrong password',
    username: requireEnv('SAUCE_USERNAME'),
    password: 'not_the_password',
    expectedError: 'Username and password do not match any user in this service',
  },
  {
    title: 'unknown username',
    username: 'no_such_user',
    password: password(),
    expectedError: 'Username and password do not match any user in this service',
  },
  {
    title: 'empty username',
    username: '',
    password: password(),
    expectedError: 'Username is required',
  },
  {
    title: 'empty password',
    username: requireEnv('SAUCE_USERNAME'),
    password: '',
    expectedError: 'Password is required',
  },
];
