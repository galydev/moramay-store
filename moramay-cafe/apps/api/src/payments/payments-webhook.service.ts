import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { GuestAccountService } from '../customers/guest-account.service';
import { CustomersRepository } from '../customers/customers.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { WompiEventPayload } from './wompi.service';

/**
 * Reacts to a validated Wompi transaction event: updates the order status,
 * creates a customer account for guest checkouts on approval (T-024), and
 * triggers the order confirmation email (T-025).
 */
@Injectable()
export class PaymentsWebhookService {
  private readonly logger = new Logger(PaymentsWebhookService.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly guestAccountService: GuestAccountService,
    private readonly customersRepository: CustomersRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleTransactionEvent(payload: WompiEventPayload): Promise<void> {
    try {
      const { transaction } = payload.data;
      const order = await this.ordersService.getOrderByPaymentReference(transaction.reference);

      if (!order) {
        this.logger.warn(`Received Wompi event for unknown reference ${transaction.reference}`);
        return;
      }

      if (transaction.status === 'APPROVED') {
        let customerId = order.customerId;

        if (order.placedAsGuest && !customerId) {
          const customer = await this.guestAccountService.findOrCreateForGuest({
            fullName: order.guestFullName ?? 'Cliente Moramay',
            email: order.guestEmail!,
            nationalId: order.guestNationalId!,
            phone: order.guestPhone ?? undefined,
            city: order.shippingCity,
            shippingAddress: order.shippingAddress,
          });
          customerId = customer.id;
        }

        const paidOrder = await this.ordersService.markAsPaid(order.id, customerId);

        const recipientEmail = order.placedAsGuest
          ? order.guestEmail!
          : (await this.customersRepository.findById(customerId!))?.email;

        if (recipientEmail) {
          await this.notificationsService.sendOrderConfirmation({
            toEmail: recipientEmail,
            orderId: paidOrder.id,
            total: paidOrder.total,
          });
        }
      } else if (
        transaction.status === 'DECLINED' ||
        transaction.status === 'ERROR' ||
        transaction.status === 'VOIDED'
      ) {
        await this.ordersService.markAsFailed(order.id);
      }
    } catch (error) {
      this.logger.error(error, 'Failed to handle Wompi transaction event');
      throw error;
    }
  }
}
