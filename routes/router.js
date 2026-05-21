import { Router } from 'express';
import express from 'express';

const router = Router();

// Habilita parsing de corpo em formato JSON para todas as rotas
router.use(express.json());

// Endpoint de Health Check inicial do sistema
router.get('/health', (request, response) => {
    return response.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Sistema de Gestão de Hotel Backend'
    });
});

// Mensagem amigável para a rota raiz
router.get('/', (request, response) => {
    return response.json({
        message: 'Bem-vindo ao Backend do Sistema de Gestão de Hotel (SaaS Multi-Tenant)'
    });
});

// Em breve adicionaremos:
// router.use("/auth", authRouter);
// router.use("/rooms", roomRouter);
// router.use("/guests", guestRouter);
// router.use("/reservations", reservationRouter);

export default router;
