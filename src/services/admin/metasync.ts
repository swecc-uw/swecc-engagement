import { DiscordServer } from '../../types';
import api from '../api';

export function getDiscordChannelConfig(): Promise<DiscordServer> {
  return api.get('/metasync/discord').then((res) => {
    return DiscordServer.deserialize(res.data);
  });
}
