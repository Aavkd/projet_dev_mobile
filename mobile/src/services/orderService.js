import { ID, Query } from 'appwrite'
import { databases } from '../lib/appwrite'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../lib/env'
import { notificationService } from './notificationService'
import { productService } from './productService'

export const orderService = {
  async createOrder(items, pickupAddressId, clientId, merchantId, total) {
    const order = await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.orders, ID.unique(), {
      client_id: clientId,
      merchant_id: merchantId,
      status: 'pending',
      total,
      pickup_address_id: pickupAddressId
    })

    for (const item of items) {
      await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.orderItems, ID.unique(), {
        order_id: order.$id,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price
      })

      await productService.updateStock(item.product_id, -item.quantity)
    }

    await notificationService.createNotification(
      merchantId,
      'order_update',
      `New order received for EUR ${Number(total || 0).toFixed(2)}`,
      { order_id: order.$id }
    )

    return order
  },

  async listOrdersByMerchant(merchantId) {
    return databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.orders, [
      Query.equal('merchant_id', merchantId),
      Query.orderDesc('$createdAt'),
      Query.limit(200)
    ])
  },

  async listOrdersByClient(clientId) {
    return databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.orders, [
      Query.equal('client_id', clientId),
      Query.orderDesc('$createdAt'),
      Query.limit(200)
    ])
  },

  async updateOrderStatus(id, status, clientId) {
    const updatedOrder = await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.orders, id, { status })

    let message = ''
    if (status === 'ready') message = 'Your order is ready for pickup.'
    if (status === 'done') message = 'Your order has been collected. Thank you.'
    if (status === 'cancelled') message = 'Your order has been cancelled.'

    if (message && clientId) {
      await notificationService.createNotification(
        clientId,
        status === 'ready' ? 'pickup_ready' : 'order_update',
        message,
        { order_id: id }
      )
    }

    return updatedOrder
  },

  async getOrderItems(orderId) {
    return databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.orderItems, [
      Query.equal('order_id', orderId),
      Query.limit(200)
    ])
  }
}
