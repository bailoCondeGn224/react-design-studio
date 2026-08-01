export interface Livreur {
  id: string;
  organizationId: string;
  nom: string;
  telephone: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  lastPositionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLivreurDto {
  nom: string;
  telephone: string;
  password: string;
}

export interface UpdateLivreurDto {
  nom?: string;
  telephone?: string;
  password?: string;
  isActive?: boolean;
}

export interface LivreurLoginDto {
  telephone: string;
  password: string;
}

export interface LivreurAuthResponse {
  access_token: string;
  livreur: {
    id: string;
    nom: string;
    telephone: string;
    organizationId: string;
  };
}

export interface TrackingInfo {
  latitude: number;
  longitude: number;
  livreurNom: string;
  livreurTelephone: string;
  // Destination coordinates (optional)
  destinationLatitude?: number;
  destinationLongitude?: number;
  destinationAdresse?: string;
}
