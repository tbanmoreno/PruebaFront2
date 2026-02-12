import { useQuery } from '@tanstack/react-query'
import api from '../api/api'

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/productos');
      // Aquí aplicamos el mapeo que discutimos antes para mantener coherencia
      return data.map(p => ({
        id: p.id,
        name: p.nombre,
        price: p.precio,
        stock: p.cantidad,
        description: p.descripcion
      }));
    }
  });
};