import { api } from '@/os';
import { Cache } from './scripts/cache';
import * as Firefish from 'firefish-js';

export const clipsCache = new Cache<Firefish.entities.Clip[]>(1000 * 60 * 30, () => api('clips/list'));
export const rolesCache = new Cache(1000 * 60 * 30, () => api('admin/roles/list'));
export const userListsCache = new Cache<Firefish.entities.UserList[]>(1000 * 60 * 30, () => api('users/lists/list'));
export const antennasCache = new Cache<Firefish.entities.Antenna[]>(1000 * 60 * 30, () => api('antennas/list'));