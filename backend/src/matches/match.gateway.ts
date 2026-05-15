import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {Logger, UseGuards} from '@nestjs/common';

@WebSocketGateway({
    cors: {origin: '*'},
    path: '/socket.io',
    transports: ['websocket'],// Adjust for production
})
export class MatchGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('MatchGateway');

    async handleConnection(client: Socket) {
        // Extract token from handshake for Firebase/JWT verification
        const token = client.handshake.auth?.token || client.handshake.headers?.authorization;

        if (!token) {
            this.logger.log(`Client disconnected: No token provided (${client.id})`);
            return client.disconnect();
        }

        this.logger.log(`Client connected: ${client.id}`);
    }

    @SubscribeMessage('joinMatch')
    handleJoinMatch(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { matchId: string },
    ) {
        client.join(data.matchId);
        this.logger.log(`Client ${client.id} joined room: ${data.matchId}`);
    }

    @SubscribeMessage('leaveMatch')
    handleLeaveMatch(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { matchId: string },
    ) {
        client.leave(data.matchId);
        this.logger.log(`Client ${client.id} left room: ${data.matchId}`);
    }

    // Helper method to be called from Services
    emitEventUpdate(matchId: string, eventId: string, type: 'CALL' | 'RECALL') {
        this.logger.log(`Event update: ${eventId}, for matchId: ${matchId}`);
        this.server.to(matchId).emit('eventUpdated', {matchId, eventId, type});
    }

    emitFalseBingoAlert(matchId: string, payload: { userId: string; cardId: string; message: string }) {
        this.server.to(matchId).emit('falseBingoCalled', payload);

    }

    emitBingoAlert(matchId: string, payload: {
        userId: string;
        cardId: string;
        newLines: string[];
        isFullCard: boolean;
        message: string
    }) {
        this.server.to(matchId).emit('falseBingoCalled', payload);
    }
}