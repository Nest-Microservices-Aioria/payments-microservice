
import 'dotenv/config'
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    STRIPE_SECRET : string;
    STRIPE_ENDPOIN_SECRET: string;
    STRIPE_SUCCESS_URL: string, 
    STRIPE_CANCEL_URL: string,
    NATS_SERVERS: string,
}

const envsSchema = joi.object({
    PORT : joi.number().required(),
    STRIPE_SECRET : joi.string().required(),
    STRIPE_ENDPOIN_SECRET : joi.string().required(),
    STRIPE_SUCCESS_URL: joi.string().required(), 
    STRIPE_CANCEL_URL: joi.string().required(),
    NATS_SERVERS: joi.string().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate( process.env );

if( error ) {
    throw new Error(`Config validation error: ${ error.message }`);
}

const envVar: EnvVars = value;

export const envs = {
    port: envVar.PORT,
    stripe_secret: envVar.STRIPE_SECRET,
    stripe_endpoin_secret: envVar.STRIPE_ENDPOIN_SECRET,
    stripe_success_url:  envVar.STRIPE_SUCCESS_URL, 
    stripe_cancel_url: envVar.STRIPE_CANCEL_URL,
    nats_servers: envVar.NATS_SERVERS,
}