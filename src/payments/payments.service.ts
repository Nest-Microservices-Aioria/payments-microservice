import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripe_secret)

    async createPaymentSession(paymentSessionDto: PaymentSessionDto){

        const { currency, items, orderId } = paymentSessionDto;

        const lineItems = items.map( item => {
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name:item.name
                    },
                    unit_amount: Math.round( item.price * 100 ),
                },
                quantity: item.quantity
            }
        })

        const session = await this.stripe.checkout.sessions.create({
            // use my order ID here
            payment_intent_data: {
                metadata: {
                  orderId: orderId
                }
            },

            line_items: lineItems,
            mode: 'payment',
            success_url: envs.stripe_success_url,
            cancel_url: envs.stripe_cancel_url,

        });

        return session;
    }

    async stripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];

        let event: Stripe.Event;
    
        // // Real
        const endpointSecret = envs.stripe_endpoin_secret;
    
        try {
          event = this.stripe.webhooks.constructEvent(
            req['rawBody'],
            sig,
            endpointSecret,
          );
        } catch (err) {
          res.status(400).send(`Webhook Error: ${err.message}`);
          return;
        }
        
        switch( event.type ) {
          case 'charge.succeeded': 
            const chargeSucceeded = event.data.object;
            // TODO: llamar nuestro microservicio
            console.log({
              metadata: chargeSucceeded.metadata,
              orderId: chargeSucceeded.metadata.orderId,
            });
          break;
          
          default:
            console.log(`Event ${ event.type } not handled`);
        }
    
        console.log({event});
        return res.status(200).json({ sig });
      }

}
