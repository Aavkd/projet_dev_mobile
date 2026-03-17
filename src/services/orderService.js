import { databases } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import { productService } from './productService';
import { notificationService } from './notificationService';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ORDERS = import.meta.env.VITE_APPWRITE_COLLECTION_ORDERS;
const COLLECTION_ORDER_ITEMS = import.meta.env.VITE_APPWRITE_COLLECTION_ORDER_ITEMS;

export const orderService = {
  async createOrder(items, pickupAddressId, clientId, merchantId, total) {
    const order = await databases.createDocument(DB_ID, COLLECTION_ORDERS, ID.unique(), {
      client_id: clientId,
      merchant_id: merchantId,
      status: 'pending',
      total: total,
      pickup_address_id: pickupAddressId
    });

    for (const item of items) {
      await databases.createDocument(DB_ID, COLLECTION_ORDER_ITEMS, ID.unique(), {
        order_id: order.$id,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price
      });
      await productService.updateStock(item.product_id, -item.quantity);
    }

    await notificationService.createNotification(
      merchantId,
      'order_update',
      `New order received for €${total.toFixed(2)}`,
      { order_id: order.$id }
    );

    return order;
  },

  async listOrdersByMerchant(merchantId) {
    return databases.listDocuments(DB_ID, COLLECTION_ORDERS, [
      Query.equal('merchant_id', merchantId),
      Query.orderDesc('$createdAt')
    ]);
  },

  async listOrdersByClient(clientId) {
    return databases.listDocuments(DB_ID, COLLECTION_ORDERS, [
      Query.equal('client_id', clientId),
      Query.orderDesc('$createdAt')
    ]);
  },

  async updateOrderStatus(id, status, clientId) {
    const updatedOrder = await databases.updateDocument(DB_ID, COLLECTION_ORDERS, id, { status });
    
    let message = '';
    if (status === 'ready') message = 'Your order is ready for pickup!';
    if (status === 'done') message = 'Your order has been collected. Thank you!';
    if (status === 'cancelled') message = 'Your order has been cancelled.';

    if (message && clientId) {
      await notificationService.createNotification(
        clientId,
        status === 'ready' ? 'pickup_ready' : 'order_update',
        message,
        { order_id: id }
      );
    }

    return updatedOrder;
  },

  async getOrderItems(orderId) {
      return databases.listDocuments(DB_ID, COLLECTION_ORDER_ITEMS, [
          Query.equal('order_id', orderId)
      ]);
  }
};
