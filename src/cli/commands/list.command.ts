import { Command, CommandRunner } from 'nest-commander';
import chalk from 'chalk';

@Command({ name: 'list', description: 'List all available symbols' })
export class ListCommand extends CommandRunner {
  async run(): Promise<void> {
    console.log(chalk.blue('Available symbols will be listed here...'));
  }
}
