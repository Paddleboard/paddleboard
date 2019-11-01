import { DeveloperAccountType, SourceControlProvider } from "@paddleboard/contracts";

export type SourceControlProviderInitializer = (options?: any) => SourceControlProvider;

export interface SourceControlFactoryRegistrationOptions {
  type: DeveloperAccountType;
  factory: SourceControlProviderInitializer;
}

export class SourceControlProviderFactory {
  private static registry: { [key: string]: SourceControlFactoryRegistrationOptions } = {};

  /**
   * Registers a source control provider
   * @param options The source control provider registration options
   */
  public static register(options: SourceControlFactoryRegistrationOptions) {
    SourceControlProviderFactory.registry[options.type] = options;
  }

  /**
   * Creates an instance of the specified source control provider
   * @param type The source control provider type
   * @param options The source control provider options
   */
  public static create(type: DeveloperAccountType, options?: any) {
    const registrationOptions = SourceControlProviderFactory.registry[type];
    if (!registrationOptions) {
      throw new Error(`No source control provider with type '${type}' has been registered`);
    }

    return registrationOptions.factory(options);
  }
}
