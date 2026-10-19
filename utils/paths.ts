import path from 'path';

/** Where the logged-in session from auth.setup.ts is saved and reused. */
export const STORAGE_STATE = path.join(__dirname, '..', 'playwright', '.auth', 'standard-user.json');
