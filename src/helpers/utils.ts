import { FastifyRequest } from 'fastify';
import moment from 'moment';
import Logger from '../core/Logger';

export function findIpAddress(req: FastifyRequest) {
  try {
    if (req.headers['x-forwarded-for']) {
      return req.headers['x-forwarded-for'].toString().split(',')[0];
    } else if (req.raw && req.raw.socket && req.raw.socket.remoteAddress) {
      return req.raw.socket.remoteAddress;
    }
    return req.ip;
  } catch (e) {
    Logger.error(e);
    return undefined;
  }
}

export function addMillisToCurrentDate(millis: number) {
  return moment().add(millis, 'ms').toDate();
}
