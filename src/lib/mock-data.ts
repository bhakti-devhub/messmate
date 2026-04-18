import type { WeeklyMenu, Order, Feedback } from '@/lib/types';

export const initialAnnouncement = "Welcome to MessMate! All meals are being served on time today.";

export const initialWeeklyMenu: WeeklyMenu = [
  {
    day: 'Sunday',
    meals: {
      Breakfast: { name: 'Breakfast', price: 35.00, items: [{ name: 'Aloo Paratha', icon: 'UtensilsCrossed', calories: 250, diet: 'veg' }, { name: 'Curd', icon: 'Soup', calories: 50, diet: 'veg' }, { name: 'Pickle', icon: 'Cookie', calories: 20, diet: 'veg' }] },
      Lunch: { name: 'Lunch', price: 75.00, items: [{ name: 'Rajma Chawal', icon: 'UtensilsCrossed', calories: 450, diet: 'veg' }, { name: 'Salad', icon: 'Salad', calories: 30, diet: 'veg' }, { name: 'Papad', icon: 'Cookie', calories: 45, diet: 'veg' }] },
      Dinner: { name: 'Dinner', price: 110.00, items: [{ name: 'Paneer Butter Masala', icon: 'Soup', calories: 400, diet: 'veg' }, { name: 'Naan', icon: 'UtensilsCrossed', calories: 200, diet: 'veg' }, { name: 'Gulab Jamun', icon: 'Cookie', calories: 150, diet: 'veg', isSpecial: true }] },
    }
  },
  {
    day: 'Monday',
    meals: {
      Breakfast: { name: 'Breakfast', price: 30.00, items: [{ name: 'Poha', icon: 'UtensilsCrossed', calories: 200, diet: 'veg' }, { name: 'Jalebi', icon: 'Cookie', calories: 150, diet: 'veg' }] },
      Lunch: { name: 'Lunch', price: 70.00, items: [{ name: 'Roti', icon: 'UtensilsCrossed', calories: 80, diet: 'veg' }, { name: 'Aloo Sabji', icon: 'Soup', calories: 180, diet: 'veg' }, { name: 'Dal Makhni', icon: 'Soup', calories: 220, diet: 'veg' }, { name: 'Jeera Rice', icon: 'UtensilsCrossed', calories: 150, diet: 'veg' }] },
      Dinner: { name: 'Dinner', price: 100.00, items: [{ name: 'Pav Bhaji', icon: 'UtensilsCrossed', calories: 400, diet: 'veg' }, { name: 'Tava Pulao', icon: 'UtensilsCrossed', calories: 350, diet: 'veg' }] },
    }
  },
  {
    day: 'Tuesday',
    meals: {
      Breakfast: { name: 'Breakfast', price: 30.00, items: [{ name: 'Upma', icon: 'Soup', calories: 220, diet: 'veg' }, { name: 'Coconut Chutney', icon: 'Salad', calories: 60, diet: 'veg' }] },
      Lunch: { name: 'Lunch', price: 70.00, items: [{ name: 'Plain Rice', icon: 'UtensilsCrossed', calories: 130, diet: 'veg' }, { name: 'Sambar', icon: 'Soup', calories: 150, diet: 'veg' }, { name: 'Cabbage Poriyal', icon: 'UtensilsCrossed', calories: 100, diet: 'veg' }] },
      Dinner: { name: 'Dinner', price: 100.00, items: [{ name: 'Egg Curry', icon: 'Soup', calories: 250, diet: 'non-veg' }, { name: 'Chapathi', icon: 'UtensilsCrossed', calories: 80, diet: 'veg' }] },
    }
  },
  {
    day: 'Wednesday',
    meals: {
      Breakfast: { name: 'Breakfast', price: 30.00, items: [{ name: 'Idli', icon: 'UtensilsCrossed', calories: 40, diet: 'veg' }, { name: 'Sambar', icon: 'Soup', calories: 150, diet: 'veg' }, { name: 'Chutney', icon: 'Salad', calories: 60, diet: 'veg' }] },
      Lunch: { name: 'Lunch', price: 70.00, items: [{ name: 'Veg Biryani', icon: 'UtensilsCrossed', calories: 350, diet: 'veg' }, { name: 'Raita', icon: 'Soup', calories: 70, diet: 'veg' }] },
      Dinner: { name: 'Dinner', price: 100.00, items: [{ name: 'Chicken Curry', icon: 'Drumstick', calories: 300, diet: 'non-veg', isSpecial: true }, { name: 'Roti', icon: 'UtensilsCrossed', calories: 80, diet: 'veg' }] },
    }
  },
  {
    day: 'Thursday',
    meals: {
      Breakfast: { name: 'Breakfast', price: 30.00, items: [{ name: 'Wada', icon: 'Cookie', calories: 150, diet: 'veg' }, { name: 'Sambar', icon: 'Soup', calories: 150, diet: 'veg' }] },
      Lunch: { name: 'Lunch', price: 70.00, items: [{ name: 'Bisi Bele Bath', icon: 'Soup', calories: 400, diet: 'veg' }, { name: 'Boondi Raita', icon: 'Soup', calories: 100, diet: 'veg' }] },
      Dinner: { name: 'Dinner', price: 100.00, items: [{ name: 'Masala Dosa', icon: 'UtensilsCrossed', calories: 300, diet: 'veg' }, { name: 'Chutney', icon: 'Salad', calories: 60, diet: 'veg' }] },
    }
  },
  {
    day: 'Friday',
    meals: {
      Breakfast: { name: 'Breakfast', price: 35.00, items: [{ name: 'Sandwich', icon: 'Sandwich', calories: 280, diet: 'veg' }, { name: 'Coffee', icon: 'UtensilsCrossed', calories: 90, diet: 'veg' }] },
      Lunch: { name: 'Lunch', price: 75.00, items: [{ name: 'Lemon Rice', icon: 'UtensilsCrossed', calories: 300, diet: 'veg' }, { name: 'Appalam', icon: 'Cookie', calories: 45, diet: 'veg' }, { name: 'Curd Rice', icon: 'Soup', calories: 250, diet: 'veg' }] },
      Dinner: { name: 'Dinner', price: 120.00, items: [{ name: 'Special Thali', icon: 'Pizza', calories: 800, diet: 'veg' }, { name: 'Ice Cream', icon: 'Cookie', calories: 200, diet: 'veg' }] },
    }
  },
  {
    day: 'Saturday',
    meals: {
      Breakfast: { name: 'Breakfast', price: 30.00, items: [{ name: 'Poori', icon: 'UtensilsCrossed', calories: 200, diet: 'veg' }, { name: 'Saagu', icon: 'Soup', calories: 150, diet: 'veg' }] },
      Lunch: { name: 'Lunch', price: 70.00, items: [{ name: 'Roti', icon: 'UtensilsCrossed', calories: 80, diet: 'veg' }, { name: 'Chana Masala', icon: 'Soup', calories: 250, diet: 'veg' }, { name: 'Rice', icon: 'UtensilsCrossed', calories: 130, diet: 'veg' }] },
      Dinner: { name: 'Dinner', price: 100.00, items: [{ name: 'Veg Fried Rice', icon: 'UtensilsCrossed', calories: 320, diet: 'veg' }, { name: 'Gobi Manchurian', icon: 'Salad', calories: 280, diet: 'veg' }] },
    }
  },
];


export const initialOrders: Order[] = [];

export const initialFeedback: Feedback[] = [
  { id: 1, studentName: "Priya Sharma", meal: 'Lunch', rating: 4, comment: "Dal makhni was delicious, but the roti was a bit dry." },
  { id: 2, studentName: "Rohan Gupta", meal: 'Lunch', rating: 5, comment: "Loved the Aloo Sabji! Best part of the meal." },
  { id: 3, studentName: "Sneha Patel", meal: 'Dinner', rating: 2, comment: "Pav Bhaji was too spicy and the pav was hard. Disappointing." },
  { id: 4, studentName: "Amit Singh", meal: 'Dinner', rating: 3, comment: "The Tava Pulao was good, but the raita was just okay." },
  { id: 5, studentName: "Ananya Reddy", meal: 'Breakfast', rating: 5, comment: "Excellent breakfast, the Poha was fresh and tasty." },
  { id: 6, studentName: "Vikram Kumar", meal: 'Lunch', rating: 3, comment: "The jeera rice was nice, but the serving size was small." },
  { id: 7, studentName: "Isha Mehta", meal: 'Dinner', rating: 1, comment: "The papad was stale. I couldn't eat it." },
];
