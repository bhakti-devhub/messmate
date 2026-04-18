'use server';

import type { Feedback, Order, WeeklyMenu } from '@/lib/types';
import * as state from '@/lib/state';

// --- State Management Actions ---

export async function getFeedback() {
  try {
    return state.getFeedback();
  } catch (error) {
    console.error('Error getting feedback:', error);
    return [];
  }
}

export async function addFeedback(newFeedback: Omit<Feedback, 'id'>) {
  try {
    return state.addFeedback(newFeedback);
  } catch (error) {
    console.error('Error adding feedback:', error);
    throw new Error('Failed to add feedback.');
  }
}

export async function getOrders() {
  try {
    return state.getOrders();
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
}

export async function addOrder(newOrder: Omit<Order, 'id' | 'orderTime' | 'orderStatus'>) {
  await state.addOrder(newOrder);
  return state.getOrders();
}

export async function markOrderAsReady(orderId: number) {
    await state.updateOrderStatus(orderId, 'Preparing');
    // Simulate cooking time before it's ready
    await new Promise(resolve => setTimeout(resolve, 3000)); 
    return state.updateOrderStatus(orderId, 'Ready for Pickup');
}

export async function markOrderAsDelivered(orderId: number) {
    return state.updateOrderStatus(orderId, 'Delivered');
}

export async function markAllReadyAsDelivered() {
    return state.markAllReadyAsDelivered();
}

export async function getWeeklyMenu() {
  return state.getWeeklyMenu();
}

export async function setWeeklyMenu(newMenu: WeeklyMenu) {
  return state.setWeeklyMenu(newMenu);
}

export async function getAnnouncement() {
    return state.getAnnouncement();
}

export async function setAnnouncement(message: string) {
    return state.setAnnouncement(message);
}

export async function toggleMealSpecial(day: string, mealName: string, itemName: string) {
    return state.toggleMealSpecial(day, mealName, itemName);
}
