import { PrismaClient } from '@prisma/client';

// Inicializa un prisma client nuevo para producción y reutiliza el existente en desarrollo
// para evitar problemas de conexión en entornos de desarrollo con hot reloading.
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!globalThis._prisma) {
    globalThis._prisma = new PrismaClient({
      log: ['error', 'warn', 'info', 'query'],
    });  
  }
  prisma = globalThis._prisma;
}

export default prisma;