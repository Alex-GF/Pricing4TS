import {
    Hook,
    JsonValue,
    OpenFeatureEventEmitter,
    Provider,
    ResolutionDetails,
  } from '@openfeature/server-sdk';
  import { PricingContext, PricingContextManager, evaluateFeature } from '../server';
  
  export class NodePricingDrivenFeaturesProvider implements Provider {
    readonly metadata = {
      name: 'nodejs-pricing-driven-features',
      description: 'A server provider that enables features based on pricing information',
    };
  
    readonly runsOn = 'server';
  
    events = new OpenFeatureEventEmitter();
    hooks?: Hook[] | undefined;
  
    constructor(pricingContext: PricingContext) {
      PricingContextManager.registerContext(pricingContext);
    }
  
    resolveBooleanEvaluation(
      flagKey: string,
      defaultValue: boolean
    ): Promise<ResolutionDetails<boolean>> {
      try{
          return Promise.resolve({
            value: this._evaluateFeature(flagKey).value.eval as boolean,
          });
      }catch(e){
          console.error("Error occurred during evaluation. ERROR: " + (e as Error).message);
          return Promise.resolve({
            value: defaultValue,
          });
      }
    }
  
    resolveStringEvaluation(
      flagKey: string,
      defaultValue: string
    ): Promise<ResolutionDetails<string>> {
      try{
          const result: boolean = this._evaluateFeature(flagKey).value.eval as boolean;
      
          return Promise.resolve({
            value: result.toString(),
          });
      }catch(e){
          console.error("Error occurred during evaluation. ERROR: " + (e as Error).message);
          return Promise.resolve({
            value: defaultValue,
          });
      }
    }
  
    resolveNumberEvaluation(
      flagKey: string,
      defaultValue: number
    ): Promise<ResolutionDetails<number>> {
      try{
          const result: boolean = this._evaluateFeature(flagKey).value.eval as boolean;
      
          return Promise.resolve({
            value: result ? 1 : 0,
          });
      }catch(e){
          console.error("Error occurred during evaluation. ERROR: " + (e as Error).message);
          return Promise.resolve({
            value: defaultValue,
          });
      }
    }
  
    resolveObjectEvaluation<T extends JsonValue>(
      flagKey: string,
      defaultValue: T
    ): Promise<ResolutionDetails<T>> {
      try{
          return Promise.resolve(this._evaluateFeature(flagKey) as unknown as ResolutionDetails<T>);
      }catch(e){
          console.error("Error occurred during evaluation. ERROR: " + (e as Error).message);
          return Promise.resolve({
            value: defaultValue,
          });
      }
    }
  
    _evaluateFeature(flagKey: string): ResolutionDetails<any> {
      const result = evaluateFeature(flagKey);
      return {
        value: result as any,
      };
    }
  }
  