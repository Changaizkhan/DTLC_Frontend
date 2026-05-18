import { useMutation, useQueryClient } from '@tanstack/react-query';
import { extractAuthToken } from '../../lib/extractAuthToken';
import {
  clearAccessToken,
  setAccessToken,
} from '../../lib/authStorage';
import { loginRequest } from '../../services/authService';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      const token = extractAuthToken(data);
      if (token) setAccessToken(token);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      clearAccessToken();
      queryClient.clear();
    },
  });
}
