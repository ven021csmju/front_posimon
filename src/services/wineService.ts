import api from './api';
import type { Wine } from '../types/wine';

export const wineService = {
  getWines: async () => {
    const response = await api.get<Wine[]>('/wines');
    return response.data;
  },

  getWine: async (wineId: number) => {
    const wines = await wineService.getWines();
    return wines.find((w) => w.id === wineId) ?? null;
  },
};
