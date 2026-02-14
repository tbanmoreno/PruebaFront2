import { useQuery } from '@tanstack/react-query'
import api from '../api/api'

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/productos');
      // SENIOR TIP: No renombres las propiedades aquí. 
      // Si el Backend envía 'nombreProducto', usa 'nombreProducto' en el componente.
      // Esto reduce el costo de procesamiento en el cliente y mantiene la coherencia.
      return data;
    }
  });
};