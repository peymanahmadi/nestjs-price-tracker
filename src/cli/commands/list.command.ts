import { Command, CommandRunner, Option } from 'nest-commander';
import chalk from 'chalk';
import { BadRequestException } from '@nestjs/common';
import { CryptoService } from 'src/crypto/crypto.service';
import { ForexService } from 'src/forex/forex.service';
import { MetalsService } from 'src/metals/metals.service';

@Command({ name: 'list', description: 'List all available symbols' })
export class ListCommand extends CommandRunner {
  private readonly validTypes = ['forex', 'crypto', 'metals', 'all'];
  private readonly symbols = {
    crypto: ['bitcoin', 'ethereum'],
    forex: ['eur/usd', 'gbp/usd'],
    metals: ['XAU', 'XAG'],
  };

  constructor(
    private cryptoService: CryptoService,
    private forexService: ForexService,
    private readonly metalsService: MetalsService,
  ) {
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
      if (type === 'crypto' || type === 'all') {
        for (const symbol of this.symbols.crypto) {
          const price = await this.cryptoService.getCryptoPrice(symbol);
          console.log(chalk.blue(`${symbol.toUpperCase()}/USD: $${price}`));
        }
      }

      if (type === 'forex' || type === 'all') {
        for (const symbol of this.symbols.forex) {
          const price = await this.forexService.getForexPrice(symbol);
          console.log(chalk.green(`${symbol.toUpperCase()}: $${price}`));
        }
      }

      if (type === 'metals' || type === 'all') {
        for (const symbol of this.symbols.metals) {
          const price = await this.metalsService.getMetalsPrice(symbol);
          console.log(
            symbol === 'XAU'
              ? chalk.yellow(`GOLD: $${price}`)
              : chalk.gray(`SILVER: $${price}`),
          );
        }
      }
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
