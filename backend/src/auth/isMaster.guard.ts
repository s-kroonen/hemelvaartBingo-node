import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchService } from '../matches/match.service';

@Injectable()
export class IsMasterGuard implements CanActivate {
  constructor(private matchService: MatchService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.dbUser._id; // From your Auth Guard
    const matchId = request.params.matchId;

    if (!matchId) return false;

    const match = await this.matchService.findById(matchId);
    if (!match) throw new NotFoundException('Match not found');

    const isMaster = match.masters.some((id) => id.equals(userId));
    if (!isMaster) throw new ForbiddenException('You are not a master of this match');

    // Optimization: Attach match to request so controller can use it
    request.match = match;
    return true;
  }
}