export interface FoodItem {
  name: string;
  isSpecial: boolean;
}

export interface Meal {
  name: 'Breakfast' | 'Lunch' | 'Dinner';
  items: FoodItem[];
}

export type DayMenu = Meal[];

export interface WeeklyMenu {
  [key: string]: DayMenu;
}

export interface Order {
  id: number;
  studentId: string;
  items: { name: string; quantity: number }[];
  orderTime: string;
  orderStatus: 'Placed' | 'Preparing' | 'Ready for Pickup' | 'Delivered';
}

export interface Feedback {
  id: number;
  studentId: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  rating: number;
  comment: string;
  timestamp: string;
}
