import { Command, CommandRunner, Option } from 'nest-commander';
import chalk from 'chalk';
import { PriceService } from 'src/price/price.service';
import { BadRequestException } from '@nestjs/common';

@Command({ name: 'list', description: 'List all available symbols' })
export class ListCommand extends CommandRunner {
  private readonly validTypes = ['forex', 'crypto', 'metals', 'all'];

  constructor(private priceService: PriceService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: { type?: string },
  ): Promise<void> {
    const type = options?.type || 'all';
    if (!this.validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid type: ${type}. Must be one of: ${this.validTypes.join(', ')}`,
      );
    }

    console.log(chalk.blue(`Listing symbols for type: ${type}`));
    try {
      const btcPrice = await this.priceService.getCryptoPrice('bitcoin');
      console.log(chalk.blue(`BTC/USD: $${btcPrice}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  }

  @Option({
    flags: '-t, --type [type]',
    description: 'Filter symbols by type (forex, crypto, metals)',
  })
  parseType(val: string): string {
    return val.toLowerCase();
  }
}
