import * as jwt from 'jwt-simple';
import { PricingContext } from '../configuration/PricingContext';
import { decode, encode } from 'jwt-simple';
import { FeatureStatus } from './pricing-evaluator';
import { PricingTokenError } from '../exceptions/PricingTokenError';

/**
 * Utility class for handling JSON Web Tokens related to pricing.
 */
export class PricingJwtUtils {
    private static context: PricingContext;
  
    /**
     * Decodes a Pricing JSON Web Token.
     * 
     * @param token - The JWT to decode.
     * @returns The decoded token as a Record<string, any.
     * @throws {PricingTokenError} If the token is not found or expired.
     */
    static decodeToken(token: string | undefined): Record<string, any> {
        
        if (token === undefined || token === null){
            throw new PricingTokenError("Pricing token not found");
        }else if (this.isJwtExpired(token)){
            throw new PricingTokenError("Pricing token expired");
        }

        const decodedToken = decode(token, this.context.getJwtSecret());
        
        return decodedToken;
    }

    /**
     * Encodes a set of claims into a JSON Web Token (JWT).
     * 
     * @param claims - The claims to encode into the token.
     * @returns The encoded JWT.
     * @throws {PricingTokenError} If required claims are missing.
     */
    static encodeToken(claims: Record<string, any>): string {

        if (!claims){
            throw new PricingTokenError("[ERROR] Claims not found when encoding token");
        }else if (!claims.sub){
            throw new PricingTokenError("[ERROR] Subject not found in claims when encoding token");
        }else if (!claims.userContext){
            throw new PricingTokenError("[ERROR] User context not found in claims when encoding token");
        }

        claims.exp = Math.floor(Date.now()) + this.context.getJwtExpiration();

        const encodedToken = encode(claims, this.context.getJwtSecret(), 'HS512', {
            header: { alg: 'HS512', typ: 'JWT' },
          });
        
        return encodedToken;
    }

    /**
     * Extracts the evaluated features from a Pricing JSON Web Token (JWT).
     * 
     * @param token - The JWT to extract features from.
     * @returns The features as a Record<string, {@link FeatureStatus}>.
     */
    static getFeaturesFromJwtToken(token: string): Record<string, FeatureStatus> {
        const decodedToken: Record<string, any> = this.decodeToken(token);
        const tokenFeatures: Record<string, FeatureStatus> = decodedToken.features;
        
        return tokenFeatures;
    }
    
    /**
     * Extracts the subject from a Pricing JSON Web Token (JWT).
     * 
     * @param token - The JWT to extract the subject from.
     * @returns The subject as a string.
     */
    static getSubjectFromJwtToken(token: string): string{
        const decodedToken: Record<string, any> = this.decodeToken(token);
        const tokenSubject: string = decodedToken.sub;
        
        return tokenSubject;
    }

    /**
     * Updates the features in a Pricing JSON Web Token (JWT).
     * 
     * @param oldToken - The JWT to update.
     * @param newFeatureStatuses - A *Record<string, {@link FeatureStatus}>* showcasing the new features evaluation to update in the token.
     * @returns The updated JWT.
     */
    static updateTokenFeatures(oldToken: string, newFeatureStatuses: Record<string, FeatureStatus>): string{
        const decodedToken: Record<string, any> = this.decodeToken(oldToken);
        decodedToken.features = newFeatureStatuses;
        
        return this.encodeToken(decodedToken);
    }

    /**
     * Updates a specific feature in a Pricing JSON Web Token (JWT).
     * 
     * @param oldToken - The JWT to update.
     * @param newFeatureStatuses - A *Record<string, {@link FeatureStatus}>* showcasing the new features evaluation to update in the token.
     * @returns The updated JWT.
     */
    static updateEvalOfTokenFeature(oldToken: string, featureToChangeEval: string, newEval: string): string{
        const decodedToken: Record<string, any> = this.decodeToken(oldToken);
        decodedToken.features[featureToChangeEval].eval = newEval;
        
        return this.encodeToken(decodedToken);
    }

    /**
     * Configures the {@links PricingContext} that will be used to perform the JWT operations.
     * 
     * @param context - The {@link PricingContext} to set.
     */
    static setContext(context: PricingContext) {
        this.context = context;
    }

    /**
     * Checks if a JSON Web Token is expired.
     * 
     * @param token - The JWT to check.
     * @returns *true* if the token is expired, *false* otherwise.
     */
    private static isJwtExpired(token: string){
        const decodedToken: Record<string, any> = jwt.decode(token, this.context.getJwtSecret());
        
        return decodedToken.exp < new Date().getTime();
    }
  }