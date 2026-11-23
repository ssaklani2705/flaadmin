export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    username: string;
  } | null;
}
