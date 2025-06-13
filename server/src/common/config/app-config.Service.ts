import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ValidationError, validate } from 'class-validator';
import { Config } from './app-config.models';
import { plainToInstance } from 'class-transformer';
import configuration from './configuration';

@Injectable()
export class AppConfigService implements OnModuleInit {
  constructor(
    @Inject(configuration.KEY)
    public config: Config,
  ) {}
  private readonly logger = new Logger(AppConfigService.name);

  onModuleInit() {
    this.validateConfig();
  }

  async validateConfig() {
    try {
      const configDto = plainToInstance(Config, this.config);

      const errors: ValidationError[] = await validate(configDto);

      if (errors.length > 0) {
        this.logger.error('Validation errors in the .env file:');
        this.displayValidationErrors(errors);
        process.exit(1); // Terminate the application if configuration is not valid
      }
    } catch (e) {
      this.logger.error('An error occurred during validation:', e);
      process.exit(1); // Terminate the application if an error occurs
    }
  }

  displayValidationErrors(errors: ValidationError[], parentProperty = '') {
    errors.forEach((error) => {
      if (error.constraints) {
        this.logger.error(
          `Property "${parentProperty}${error.property}" failed validation: ${Object.values(error.constraints).join(', ')}`,
        );
      }
      if (error.children && error.children.length > 0) {
        this.displayValidationErrors(error.children, `${error.property}.`);
      }
    });
  }
}
