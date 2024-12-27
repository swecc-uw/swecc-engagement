import { timestampNow } from '../../localization';
import api from '../api';

const ENDPOINT = '/admin/command/';

export enum ConsoleStream {
  Input = 'input',
  Output = 'output',
  Error = 'error',
}

// let's keep these out of types.ts, but they can
// still be available in admin related files
export type CommandResponse = {
  success?: boolean;
  output?: string;
  error?: string;
};

export type ParsedCommand = {
  command: string;
  args: string[];
  kwargs: Record<string, string | boolean>;
};

export type CommandEvent = {
  stream: ConsoleStream;
  content: string;
  timestamp: string;
};

const parseCommand = (input: string): ParsedCommand => {
  const parts = input.trim().split(/\s+/);
  const command = parts[0];
  const args: string[] = [];
  const kwargs: Record<string, string | boolean> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('--')) {
      const [key, value] = part.slice(2).split('=');
      if (value !== undefined) {
        kwargs[key] = value;
      } else if (i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
        kwargs[key] = parts[i + 1];
        i++;
      } else {
        kwargs[key] = true;
      }
    } else if (part.startsWith('-')) {
      kwargs[part.slice(1)] = true;
    } else {
      args.push(part);
    }
  }

  return { command, args, kwargs };
};

// API client helper
class AdminCommandRpcClient {
  private parsedLog: ParsedCommand[] = [];
  private inputLog: string[] = [];
  private eventLog: CommandEvent[] = [];

  private apiClient: typeof api;

  constructor(apiClient: typeof api) {
    this.apiClient = apiClient;
  }

  async help(): Promise<string> {
    return (await this.getAvailableCommands())
      .map((c) => `${c.name}: ${c.description}`)
      .join('\n\n');
  }

  async executeCommand(input: string): Promise<void> {
    const makeEvent = (stream: ConsoleStream, content: string) => ({
      stream,
      content,
      timestamp: timestampNow(),
    });

    this.eventLog.push(makeEvent(ConsoleStream.Input, input));

    try {
      this.inputLog.push(input);
      this.parsedLog.push(parseCommand(input));
      const { command, args, kwargs } = this.getLastCommandParsed();

      switch (command) {
        case 'clear':
          this.clear();
          break;
        case 'help':
          const helpMessage = await this.help();
          if (helpMessage) {
            this.eventLog.push(makeEvent(ConsoleStream.Output, helpMessage));
          }
          break;
        default:
          const { error, output }: CommandResponse = await this.send({
            command,
            args,
            kwargs,
          });

          if (error) {
            this.eventLog.push(makeEvent(ConsoleStream.Error, error));
          }

          if (output) {
            this.eventLog.push(makeEvent(ConsoleStream.Output, output));
          }
      }
    } catch (error) {
      this.eventLog.push(
        makeEvent(
          ConsoleStream.Error,
          error instanceof Error ? error.message : 'An unknown error occurred'
        )
      );
    }
  }

  async getAvailableCommands() {
    const response = await this.apiClient.get<{
      available_commands: { name: string; description: string }[];
    }>(ENDPOINT);
    return response.data.available_commands;
  }

  getLastCommandParsed() {
    return this.parsedLog[this.parsedLog.length - 1];
  }

  clear() {
    this.parsedLog = [];
    this.inputLog = [];
  }

  getInputHistory() {
    return this.inputLog;
  }

  getLastInput() {
    return this.inputLog[this.inputLog.length - 1];
  }

  getEventHistory() {
    return this.eventLog;
  }

  private async send(cmd: ParsedCommand): Promise<CommandResponse> {
    return (
      await this.apiClient.post<CommandResponse>(ENDPOINT, {
        ...cmd,
      })
    ).data;
  }
}

const adminCommandRpcClient = new AdminCommandRpcClient(api);

export default adminCommandRpcClient;
