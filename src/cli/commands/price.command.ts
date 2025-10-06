import { BadRequestException, Inject } from '@nestjs/common';
import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CryptoService } from 'src/crypto/crypto.service';
import { ForexService } from 'src/forex/forex.service';
import { MetalsService } from 'src/metals/metals.service';
import { Logger } from 'winston';

@Command({
  name: 'price',
  description: 'Get the price of a specific symbol',
  arguments: '<symbol>',
})
export class PriceCommand extends CommandRunner {
  private readonly validTypes = ['forex', 'crypto', 'metals'];

  constructor(
    private cryptoService: CryptoService,
    private forexService: ForexService,
    private metalsService: MetalsService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super();
  }
  async run(passedParams: string[], options?: { type: string }): Promise<void> {
    const [symbol] = passedParams;
    const type = options?.type;
    if (!symbol) {
      throw new BadRequestException('Symbol is required');
    }
    if (!type || !this.validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid or missing type: ${type}. Must be one of: ${this.validTypes.join(', ')}`,
      );
    }

    this.logger.info(`Fetching price for ${symbol} of type ${type}`);
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
            symbol === 'XAU'
              ? chalk.yellow(`GOLD: $${price}`)
              : chalk.gray(`SILVER: $${price}`),
          );
          break;
      }
      this.logger.info(`Price for ${symbol} of type ${type} is $${price}`);
    } catch (error) {
      this.logger.error(
        `Error fetching price for ${symbol} of type ${type}: ${error.message}`,
      );
      console.error(chalk.red(`Error fetching price: ${error.message}`));
    }
  }

  @Option({
    flags: '-t, --type <type>',
    description: 'Asset type (forex, crypto, metals)',
  })
  parseType(val: string): string {
    return val.toLowerCase();
  }
}
