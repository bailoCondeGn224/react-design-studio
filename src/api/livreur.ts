import { livreurApiClient } from '@/lib/livreur-api-client';
import { OnlineOrder } from '@/types';
import {
  LivreurAuthResponse,
  LivreurLoginDto,
  UpdateLivreurPositionResponse,
} from '@/types/livreur';

// Espace livreur : toutes les routes /public/livreur/*, authentifiées par le
// jeton livreur (livreurApiClient), distinct des sessions admin et client.
export const livreurApi = {
  login: async (dto: LivreurLoginDto): Promise<LivreurAuthResponse> => {
    const response = await livreurApiClient.post<LivreurAuthResponse>('/public/livreur/login', dto);
    return response.data;
  },

  getOrders: async (): Promise<OnlineOrder[]> => {
    const response = await livreurApiClient.get<OnlineOrder[]>('/public/livreur/orders');
    return response.data;
  },

  markDelivered: async (orderId: string): Promise<void> => {
    await livreurApiClient.put(`/public/livreur/orders/${orderId}/deliver`);
  },

  updatePosition: async (position: {
    latitude: number;
    longitude: number;
  }): Promise<UpdateLivreurPositionResponse> => {
    const response = await livreurApiClient.put<UpdateLivreurPositionResponse>(
      '/public/livreur/position',
      position,
    );
    return response.data;
  },
};
