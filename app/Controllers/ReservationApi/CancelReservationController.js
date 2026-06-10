import ReservationModel from '../../Models/ReservationModel.js';

const CANCEL_BLOCKED_MESSAGES = {
    CHECKED_IN:  'Não é possível cancelar uma reserva com hóspede no quarto',
    CHECKED_OUT: 'Reserva já encerrada',
    CANCELLED:   'Reserva já cancelada'
};

export default async function CancelReservationController(request, response) {
    try {
        const { id } = request.params;
        const tenantId = request.user.tenantId;

        const reservation = await ReservationModel.findOne({ where: { id, tenant_id: tenantId } });
        if (!reservation) return response.status(404).json({ error: 'Reserva não encontrada' });

        const blockedMessage = CANCEL_BLOCKED_MESSAGES[reservation.status];
        if (blockedMessage) {
            return response.status(422).json({ error: blockedMessage });
        }

        reservation.status = 'CANCELLED';
        await reservation.save();

        return response.json(reservation);
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Erro interno do servidor' });
    }
}
