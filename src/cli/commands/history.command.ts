import { BadRequestException, Inject } from '@nestjs/common';
import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CryptoService } from 'src/crypto/crypto.service';
import { ForexService } from 'src/forex/forex.service';
import { MetalsService } from 'src/metals/metals.service';
import { Logger } from 'winston';

interface HistoriclPrice {
  date: string;
  price: number;
}

@Command({
  name: 'history',
  description: 'Fetch historical prices for a specific symbol',
  arguments: '<symbol>',
})
export class HistoryCommand extends CommandRunner {
  private readonly validTypes = ['forex', 'crypto', 'metals'];

  constructor(
    private cryptoService: CryptoService,
    private forexService: ForexService,
    private metalsService: MetalsService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super();
  }
  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const [symbol] = passedParams;
    const type = options?.type;
    const days = options?.days || 7;

    if (!symbol) {
      throw new BadRequestException('Symbol is required');
    }
    if (!type || !this.validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid or missing type: ${type}. Must be one of: ${this.validTypes.join(', ')}`,
      );
    }
    if (days < 1 || days > 30) {
      throw new BadRequestException('Days must be between 1 and 30');
    }

    this.logger.info(
      `Fetching historical prices for ${symbol} (type: ${type}, days: ${days})`,
    );

    try {
      let history: HistoriclPrice[];
      switch (type) {
        case 'crypto':
          console.log(
            chalk.yellow(
              'Warning: Historical data for crypto is not provided by the API. Using placeholder data.',
            ),
          );
          history = await this.cryptoService.getCryptoPriceHistory(
            symbol,
            days,
          );
          break;
        case 'forex':
          history = await this.forexService.getForexPriceHistory(symbol, days);
          break;
        case 'metals':
          console.log(
            chalk.yellow(
              'Warning: Historical data for metals is not provided by the API. Using placeholder data.',
            ),
          );
          history = await this.metalsService.getMetalsPriceHistory(
            symbol,
            days,
          );
          break;
        default:
          throw new BadRequestException('Invalid type');
      }
      console.log(
        chalk.blue(`Historical prices for ${symbol.toUpperCase()} (${type}):`),
      );
      history.forEach(({ date, price }) => {
        const color =
          type === 'crypto'
            ? chalk.blue
            : type === 'forex'
              ? chalk.green
              : symbol.toUpperCase() === 'XAU'
                ? chalk.yellow
                : chalk.gray;
        console.log(color(`${date}: $${price}`));
      });
      this.logger.info(
        `Fetched ${history.length} historical prices for ${symbol}`,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching history for ${symbol}: ${error.message}`,
      );
      console.error(chalk.red(`Error: ${error.message}`));
    }
  }

  @Option({
    flags: '-t, --type <type>',
    description: 'Asset type (forex, crypto, metals)',
  })
  parseType(val: string): string {
    return val.toLowerCase();
  }

  @Option({
    flags: '-d, --days [days]',
    description: 'Number of days for historical data (1-30, default: 7)',
  })
  parseDays(val: string): number {
    const days = parseInt(val, 10);
    if (isNaN(days) || days < 1 || days > 30) {
      throw new BadRequestException('Days must be a number between 1 and 30');
    }
    return days;
  }
}
