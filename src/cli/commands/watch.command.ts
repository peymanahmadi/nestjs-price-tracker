import { BadRequestException, Inject } from '@nestjs/common';
import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CryptoService } from 'src/crypto/crypto.service';
import { ForexService } from 'src/forex/forex.service';
import { MetalsService } from 'src/metals/metals.service';
import { Logger } from 'winston';

@Command({
  name: 'watch',
  description: 'Watch real-time prices for a specific symbol',
  arguments: '<symbol>',
})
export class WatchCommand extends CommandRunner {
  private readonly validTypes = ['forex', 'crypto', 'metals'];
  private interval: NodeJS.Timeout | null = null;

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
    options?: { type: string; interval?: number },
  ): Promise<void> {
    const [symbol] = passedParams;
    const type = options?.type;
    const intervalMs = (options?.interval || 10) * 1000;

    if (!symbol) {
      throw new BadRequestException('Symbol is required');
    }

    if (!type || !this.validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid or missing type: ${type}. Must be one of: ${this.validTypes.join(', ')}`,
      );
    }

    this.logger.info(
      `Start watch for ${symbol} (type: ${type}, interval: ${intervalMs}ms)`,
    );

    const fetchPrice = async () => {
      try {
        let price: number = 0;
        switch (type) {
          case 'crypto':
            price = await this.cryptoService.getCryptoPrice(symbol);
            console.log(chalk.blue(`${symbol.toUpperCase()}/USD: $${price}`));
            break;
          case 'forex':
            price = await this.forexService.getForexPrice(symbol);
            console.log(chalk.green(`${symbol.toUpperCase()}: $${price}`));
            break;
          case 'metals':
            price = await this.metalsService.getMetalsPrice(symbol);
            console.log(
              symbol.toUpperCase() === 'XAU'
                ? chalk.yellow(`GOLD: $${price}`)
                : chalk.gray(`SILVER: $${price}`),
            );
            break;
        }
        this.logger.info(`Fetched price for ${symbol}: $${price}`);
      } catch (error) {
        this.logger.error(`Error fetching ${symbol} price: ${error.message}`);
        console.error(chalk.red(`Error: ${error.message}`));
      }
    };

    await fetchPrice(); // Initial fetch
    this.interval = setInterval(fetchPrice, intervalMs);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      if (this.interval) {
        clearInterval(this.interval);
        this.logger.info(`Stopped watching ${symbol}`);
      }
      process.exit(0);
    });
  }

  @Option({
    flags: '-t, --type <type>',
    description: 'Asset type (forex, crypto, metals)',
  })
  parseType(val: string): string {
    return val.toLowerCase();
  }

  @Option({
    flags: '-i, --interval [interval]',
    description: 'Polling interval in seconds (default: 10)',
  })
  parseInterval(val: string): number {
    const interval = parseInt(val, 10);
    if (isNaN(interval) || interval < 1) {
      throw new BadRequestException('Interval must be a positive number');
    }
    return interval;
  }
}
