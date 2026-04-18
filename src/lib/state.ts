import type { Feedback, Order, WeeklyMenu } from './types';

let feedbackData: Feedback[] = [
  {
    id: 1,
    studentId: 'S001',
    meal: 'Breakfast',
    rating: 4,
    comment: 'The pancakes were great!',
    timestamp: new Date().toISOString(),
  },
];

let orders: Order[] = [
  {
    id: 1,
    studentId: 'S001',
    items: [{ name: 'Pancakes', quantity: 1 }],
    orderTime: new Date().toISOString(),
    orderStatus: 'Placed',
  },
];

let weeklyMenu: WeeklyMenu = {
  Monday: [
    { name: 'Breakfast', items: [{ name: 'Pancakes', isSpecial: false }] },
    { name: 'Lunch', items: [{ name: 'Pasta', isSpecial: false }] },
    { name: 'Dinner', items: [{ name: 'Pizza', isSpecial: false }] },
  ],
  // ... other days
};

let announcement = 'Welcome to MessMate!';

export function getFeedback() {
  return feedbackData;
}

export function addFeedback(newFeedback: Omit<Feedback, 'id'>) {
  const feedback = { ...newFeedback, id: feedbackData.length + 1 };
  feedbackData.push(feedback);
  return feedback;
}

export function getOrders() {
  return orders;
}

export function addOrder(newOrder: Omit<Order, 'id' | 'orderTime' | 'orderStatus'>) {
  const order = {
    ...newOrder,
    id: orders.length + 1,
    orderTime: new Date().toISOString(),
    orderStatus: 'Placed' as const,
  };
  orders.push(order);
  return order;
}

export function updateOrderStatus(orderId: number, status: 'Preparing' | 'Ready for Pickup' | 'Delivered') {
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.orderStatus = status;
  }
  return order;
}

export function markAllReadyAsDelivered() {
  orders.forEach((order) => {
    if (order.orderStatus === 'Ready for Pickup') {
      order.orderStatus = 'Delivered';
    }
  });
  return orders;
}

export function getWeeklyMenu() {
  return weeklyMenu;
}

export function setWeeklyMenu(newMenu: WeeklyMenu) {
  weeklyMenu = newMenu;
  return weeklyMenu;
}

export function getAnnouncement() {
  return announcement;
}

export function setAnnouncement(message: string) {
  announcement = message;
  return announcement;
}

export function toggleMealSpecial(day: string, mealName: string, itemName: string) {
  const dayMenu = weeklyMenu[day];
  if (dayMenu) {
    const meal = dayMenu.find((m) => m.name === mealName);
    if (meal) {
      const item = meal.items.find((i) => i.name === itemName);
      if (item) {
        item.isSpecial = !item.isSpecial;
      }
    }
  }
  return weeklyMenu;
}
