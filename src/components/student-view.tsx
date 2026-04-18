'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Meal, MenuItem as MenuItemType, Feedback, Order, WeeklyMenu, DailyMenu, DietaryType } from '@/lib/types';
import FeedbackForm from './feedback-form';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Megaphone, Clock, CookingPot, Utensils, HandPlatter, Soup, Cookie, Pizza, Salad, Sandwich, Drumstick, UtensilsCrossed, AlertCircle, Heart, Star, Award, Badge, Leaf, Beef } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const iconMap: Record<string, React.ElementType> = {
    UtensilsCrossed,
    Soup,
    Cookie,
    Pizza,
    Salad,
    Sandwich,
    Drumstick,
    Leaf,
    Beef,
};


function getPickupTime(mealName: 'Breakfast' | 'Lunch' | 'Dinner') {
  switch(mealName) {
    case 'Breakfast':
      return '7:30 AM - 9:30 AM';
    case 'Lunch':
      return '12:30 PM - 2:30 PM';
    case 'Dinner':
      return '7:30 PM - 9:30 PM';
    default:
      return 'N/A';
  }
}

function ReceiptDialog({ order, isOpen, onOpenChange }: { order: Order | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [pickupQrCodeUrl, setPickupQrCodeUrl] = useState("https://placehold.co/200x200.png");

  useEffect(() => {
    if (isOpen && order) {
      const orderId = `MESSMATE-ORDER-${order.id}`;
      setPickupQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(orderId)}`);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CheckCircle className="w-6 h-6 text-green-500" /> Order Confirmed!</DialogTitle>
          <DialogDescription>
            Your order has been placed. Show this QR code at the counter for pickup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 my-4">
          <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
            <div className="flex justify-center pb-4">
              <Image 
                  src={pickupQrCodeUrl}
                  alt="Order Pickup QR Code" 
                  width={180}
                  height={180}
                  data-ai-hint="qr code"
                  unoptimized
              />
            </div>
            <Separator />
            <h3 className="font-semibold text-lg text-center">MessMate Purchase Receipt</h3>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-mono text-xs">{`MESSMATE-ORDER-${order.id}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student Name:</span>
              <span className="font-medium">{order.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meal:</span>
              <span className="font-medium">{order.meal}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-muted-foreground">Order Time:</span>
              <span className="font-medium">{order.orderTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Pickup:</span>
              <span className="font-medium">{order.pickupETA}</span>
            </div>
            <Separator />
            <div>
              <span className="text-muted-foreground">Items Ordered:</span>
              <ul className="list-disc list-inside font-medium text-sm pl-2">
                {order.items?.map(item => <li key={item.name}>{item.name}</li>)}
              </ul>
            </div>
             {order.notes && (
                <>
                <Separator />
                <div>
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="text-sm font-medium">{order.notes}</p>
                </div>
                </>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const mealTimeRanges = {
    Breakfast: { start: 8, end: 11, label: "8:00 AM - 11:00 AM" },
    Lunch: { start: 12, end: 16, label: "12:00 PM - 4:00 PM" },
    Dinner: { start: 19.5, end: 22, label: "7:30 PM - 10:00 PM" }
};

function MenuCard({ 
    meal, 
    addOrder, 
    favoriteItems,
    toggleFavorite 
}: { 
    meal: Meal; 
    addOrder: (order: Omit<Order, 'id' | 'orderTime' | 'orderStatus'>) => void; 
    favoriteItems: string[];
    toggleFavorite: (itemName: string) => void;
}) {
  const { toast } = useToast();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<MenuItemType[]>([]);
  const [studentName, setStudentName] = useState('');
  const [pickupETA, setPickupETA] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentQrCodeUrl, setPaymentQrCodeUrl] = useState("https://placehold.co/200x200.png");
  
  const handleItemToggle = (item: MenuItemType) => {
    setSelectedItems(prev => 
      prev.some(si => si.name === item.name)
        ? prev.filter(si => si.name !== item.name)
        : [...prev, item]
    );
  };
  
  const handlePrepaidOrder = () => {
    if (!studentName.trim()) {
        toast({
            variant: 'destructive',
            title: "Name is required",
            description: "Please enter your name to place the order.",
        });
        return;
    }
    addOrder({
      studentName: studentName.trim(),
      meal: meal.name,
      items: selectedItems,
      pickupETA: pickupETA,
      notes: notes,
    });
    toast({
      title: "Prepaid Order Placed!",
      description: `Your prepaid order for ${meal.name} has been successfully placed.`,
    });
    setIsPaymentOpen(false);
    setSelectedItems([]); // Reset items after order
    setNotes(''); // Reset notes
  };

  const openPaymentDialog = () => {
    if (!studentName.trim() || !pickupETA.trim()) {
        toast({
            variant: 'destructive',
            title: "All fields are required",
            description: "Please enter your name and pickup time.",
        });
        return;
    }
     if (selectedItems.length === 0) {
        toast({
            variant: 'destructive',
            title: "No items selected",
            description: "Please select at least one item to order.",
        });
        return;
    }
    const paymentData = `upi://pay?pa=messmate@example&pn=MessMate&am=${meal.price}&cu=INR&tn=Payment for ${meal.name}`;
    setPaymentQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData)}`);
    setIsPaymentOpen(true);
  }

  const isOrderButtonDisabled = selectedItems.length === 0 || !studentName.trim() || !pickupETA.trim();

  return (
    <>
    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
            {meal.name}
          </CardTitle>
          <CardDescription>{mealTimeRanges[meal.name].label}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`student-name-${meal.name}`}>Your Name</Label>
            <Input 
                id={`student-name-${meal.name}`}
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`pickup-time-${meal.name}`}>Pickup Time</Label>
            <Input 
                id={`pickup-time-${meal.name}`}
                placeholder="e.g. In 30 mins, or 2:00 PM"
                value={pickupETA}
                onChange={(e) => setPickupETA(e.target.value)}
            />
          </div>
          <Separator />
          <div>
            <Label>Menu Items</Label>
            <ul className="space-y-3 pt-2">
              <TooltipProvider>
              {meal.items.map((item) => {
                  const IconComponent = iconMap[item.icon] || Utensils;
                  const isFavorite = favoriteItems.includes(item.name);
                  return (
                      <li key={item.name} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                              id={`${meal.name}-${item.name}`}
                              checked={selectedItems.some(si => si.name === item.name)}
                              onCheckedChange={() => handleItemToggle(item)}
                          />
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Label htmlFor={`${meal.name}-${item.name}`} className="flex items-center gap-3 cursor-pointer">
                                      <IconComponent className="w-5 h-5 text-primary" />
                                      <span>{item.name}</span>
                                      {item.isSpecial && <BadgeComponent variant="secondary" className='bg-yellow-200 text-yellow-800'><Star className="w-3 h-3 mr-1"/>Special</BadgeComponent>}
                                  </Label>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>Calories: {item.calories || 'N/A'}</p>
                              </TooltipContent>
                          </Tooltip>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => toggleFavorite(item.name)}>
                                    <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                            </TooltipContent>
                        </Tooltip>
                      </li>
                  )
              })}
              </TooltipProvider>
            </ul>
          </div>
          <Separator />
            <div className="space-y-2">
                <Label htmlFor={`notes-${meal.name}`}>Notes (Optional)</Label>
                <Textarea 
                    id={`notes-${meal.name}`}
                    placeholder="e.g. less spicy, no onions"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>
        </CardContent>
        <div className="p-6 pt-0">
           <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">{meal.price.toFixed(2)}/-</span>
              <Button onClick={openPaymentDialog} disabled={isOrderButtonDisabled} variant="destructive">Order Now</Button>
            </div>
            {isOrderButtonDisabled && <p className="text-xs text-muted-foreground text-center">Please enter name, pickup time, and select an item.</p>}
        </div>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay for {meal.name}</DialogTitle>
          <DialogDescription>
             This is a mock payment screen. Click the button below to confirm your order.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center my-4 py-8 bg-muted rounded-lg">
            <Image 
                src={paymentQrCodeUrl}
                alt="Payment QR Code"
                width={200}
                height={200}
                data-ai-hint="qr code"
                unoptimized
            />
        </div>
        <DialogFooter className="sm:justify-start">
            <Button type="button" onClick={handlePrepaidOrder}>Confirm Prepaid Order</Button>
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                Cancel
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function OrderView({ weeklyMenu, addOrder, favoriteItems, toggleFavorite, dietFilter }: { weeklyMenu: WeeklyMenu; addOrder: (order: Omit<Order, 'id' | 'orderTime' | 'orderStatus'>) => void; favoriteItems: string[]; toggleFavorite: (itemName: string) => void; dietFilter: DietaryType | 'all' }) {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' }) as DailyMenu['day'];

  const filteredMenu = useMemo(() => {
    if (dietFilter === 'all') return weeklyMenu;
    
    return weeklyMenu.map(day => ({
        ...day,
        meals: {
            Breakfast: {
                ...day.meals.Breakfast,
                items: day.meals.Breakfast.items.filter(item => item.diet === dietFilter)
            },
            Lunch: {
                ...day.meals.Lunch,
                items: day.meals.Lunch.items.filter(item => item.diet === dietFilter)
            },
            Dinner: {
                ...day.meals.Dinner,
                items: day.meals.Dinner.items.filter(item => item.diet === dietFilter)
            }
        }
    })).map(day => ({
        ...day,
        meals: {
            Breakfast: day.meals.Breakfast.items.length > 0 ? day.meals.Breakfast : { ...day.meals.Breakfast, items: [] },
            Lunch: day.meals.Lunch.items.length > 0 ? day.meals.Lunch : { ...day.meals.Lunch, items: [] },
            Dinner: day.meals.Dinner.items.length > 0 ? day.meals.Dinner : { ...day.meals.Dinner, items: [] }
        }
    }));
  }, [weeklyMenu, dietFilter]);

  const defaultTab = useMemo(() => {
    return weeklyMenu.some(d => d.day === today) ? today : weeklyMenu[0].day;
  }, [today, weeklyMenu]);

  return (
    <div className="pt-6">
      <Tabs defaultValue={defaultTab} className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7">
          {weeklyMenu.map(({ day }) => (
            <TabsTrigger key={day} value={day}>{day.substring(0,3)}</TabsTrigger>
          ))}
        </TabsList>
        {filteredMenu.map(({ day, meals }) => (
          <TabsContent key={day} value={day}>
            <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
              {meals.Breakfast.items.length > 0 ? <MenuCard meal={meals.Breakfast} addOrder={addOrder} favoriteItems={favoriteItems} toggleFavorite={toggleFavorite} /> : <Card><CardHeader><CardTitle>No {dietFilter} items</CardTitle></CardHeader></Card>}
              {meals.Lunch.items.length > 0 ? <MenuCard meal={meals.Lunch} addOrder={addOrder} favoriteItems={favoriteItems} toggleFavorite={toggleFavorite} /> : <Card><CardHeader><CardTitle>No {dietFilter} items</CardTitle></CardHeader></Card>}
              {meals.Dinner.items.length > 0 ? <MenuCard meal={meals.Dinner} addOrder={addOrder} favoriteItems={favoriteItems} toggleFavorite={toggleFavorite} /> : <Card><CardHeader><CardTitle>No {dietFilter} items</CardTitle></CardHeader></Card>}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

const OrderStatusIcon = ({ status }: { status: Order['orderStatus'] }) => {
    switch (status) {
        case 'Placed':
            return <Clock className="text-blue-500" />;
        case 'Preparing':
            return <CookingPot className="text-orange-500 animate-pulse" />;
        case 'Ready for Pickup':
            return <Utensils className="text-green-500" />;
        case 'Delivered':
            return <HandPlatter className="text-primary" />;
        default:
            return <Clock />;
    }
};

function OrderHistory({ orders }: { orders: Order[] }) {
    const [studentNameFilter, setStudentNameFilter] = useState('');
    
    const filteredOrders = useMemo(() => {
        if (!studentNameFilter.trim()) return orders;
        return orders.filter(o => o.studentName.toLowerCase().includes(studentNameFilter.toLowerCase()));
    }, [orders, studentNameFilter]);
    
    return (
        <div className="pt-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Order History</CardTitle>
                    <CardDescription>Enter your name to filter your orders, or see all recent orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Label htmlFor="order-history-name">Filter by Your Name</Label>
                        <Input 
                            id="order-history-name"
                            placeholder="Type your name to filter..."
                            value={studentNameFilter}
                            onChange={(e) => setStudentNameFilter(e.target.value)}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Meal</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.studentName}</TableCell>
                                        <TableCell>{order.meal}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {order.items?.map(item => item.name).join(', ') || 'Full Meal'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <OrderStatusIcon status={order.orderStatus} />
                                                <span>{order.orderStatus}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{order.orderTime}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            {studentNameFilter ? 'No orders found for this name.' : "No orders yet. Place one from the 'Order Food' tab!"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function FavoritesView({ weeklyMenu, favoriteItems, addOrder, toggleFavorite }: { weeklyMenu: WeeklyMenu; favoriteItems: string[]; addOrder: (order: Omit<Order, 'id' | 'orderTime' | 'orderStatus'>) => void; toggleFavorite: (itemName: string) => void; }) {
    const favoriteMeals = useMemo(() => {
        if (favoriteItems.length === 0) return [];
        const result: { day: string; meal: Meal }[] = [];
        weeklyMenu.forEach(day => {
            Object.values(day.meals).forEach(meal => {
                if (meal.items.some(item => favoriteItems.includes(item.name))) {
                    result.push({ day: day.day, meal: meal });
                }
            });
        });
        return result;
    }, [weeklyMenu, favoriteItems]);

    return (
        <div className="pt-6">
            <h2 className="text-3xl font-bold text-center font-headline">Your Favorite Items</h2>
            <p className="text-center text-muted-foreground">Here are all the upcoming meals that include your favorited items.</p>
            {favoriteMeals.length > 0 ? (
                <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                    {favoriteMeals.map(({ day, meal }) => (
                        <Card key={`${day}-${meal.name}`} className="flex flex-col border-2 border-primary/50">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{meal.name}</span>
                                    <BadgeComponent variant="outline">{day}</BadgeComponent>
                                </CardTitle>
                                <CardDescription>Serving time: {mealTimeRanges[meal.name].label}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-2">
                                    {meal.items.map(item => {
                                        const isFavorite = favoriteItems.includes(item.name);
                                        return (
                                            <li key={item.name} className={`flex items-center gap-2 ${isFavorite ? 'font-bold text-primary' : ''}`}>
                                                {isFavorite ? <Heart className="w-4 h-4 text-red-500" /> : <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />}
                                                <span>{item.name}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </CardContent>
                             <div className="p-6 pt-0">
                                <Button onClick={() => { /* This would ideally link back to the main order tab */ alert("Please go to the 'Order Food' tab to place your order."); }} className="w-full">
                                    Go to Order
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Favorites Found</h3>
                    <p className="text-muted-foreground mt-1">Click the heart icon on menu items to add them here!</p>
                </div>
            )}
        </div>
    );
}

function LiveClock() {
    const [time, setTime] = useState<string | null>(null);

    useEffect(() => {
        // This function runs only on the client side, after hydration.
        const updateClock = () => {
            setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        
        updateClock(); // Set initial time
        const timerId = setInterval(updateClock, 1000);

        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="text-sm font-mono bg-muted px-2 py-1 rounded-md">
            {time ? time : 'Loading...'}
        </div>
    );
}


type StudentViewProps = {
  addFeedback: (feedback: Omit<Feedback, 'id'>) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'orderTime' | 'orderStatus'>) => Promise<void>;
  weeklyMenu: WeeklyMenu;
  orders: Order[];
  announcement: string;
  initialTab: 'order' | 'feedback' | 'history' | 'favorites';
  feedbackMeal: 'Breakfast' | 'Lunch' | 'Dinner' | null;
  refreshOrders: () => Promise<void>;
};

export default function StudentView({ addFeedback, addOrder, weeklyMenu, orders, announcement, initialTab, feedbackMeal, refreshOrders }: StudentViewProps) {
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [dietFilter, setDietFilter] = useState<DietaryType | 'all'>('all');
  const { toast } = useToast();
  
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteItems');
    if (storedFavorites) {
        setFavoriteItems(JSON.parse(storedFavorites));
    }
  }, []);
  
  const toggleFavorite = (itemName: string) => {
    const newFavorites = favoriteItems.includes(itemName)
        ? favoriteItems.filter(name => name !== itemName)
        : [...favoriteItems, itemName];
    setFavoriteItems(newFavorites);
    localStorage.setItem('favoriteItems', JSON.stringify(newFavorites));
  };


  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // When a new order is added, show the receipt
  // Also shows notifications for order status changes.
  useEffect(() => {
    if (orders.length === 0) return;
    
    const latestOrder = orders.sort((a,b) => b.id - a.id)[0];
    
    // Check if it's a new order to show the receipt
    const isNewOrder = lastOrder === null || latestOrder.id > lastOrder.id;
    if (isNewOrder) {
        setLastOrder(latestOrder);
        setIsReceiptOpen(true);
    }
    
    // Check for status changes to show notifications
    if (lastOrder && latestOrder.id === lastOrder.id && latestOrder.orderStatus !== lastOrder.orderStatus) {
        if (latestOrder.orderStatus === 'Ready for Pickup') {
            toast({
                title: "Your Order is Ready!",
                description: `Order #${latestOrder.id} is now ready for pickup at the counter.`
            });
        }
    }
    setLastOrder(latestOrder);
  }, [orders, toast, lastOrder]);


  return (
    <>
      {announcement && (
        <Alert className="mb-4 bg-primary/10 border-primary/20">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center">
              <Megaphone className="h-4 w-4" />
              <AlertTitle className="font-headline text-primary ml-2">Latest Announcement</AlertTitle>
            </div>
            <LiveClock />
          </div>
          <AlertDescription className="pt-2">{announcement}</AlertDescription>
        </Alert>
      )}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <div className="flex justify-between items-center border-b">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
                <TabsTrigger value="order">Order Food</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="history">My Orders</TabsTrigger>
            </TabsList>
            <ToggleGroup 
                type="single"
                variant="outline"
                value={dietFilter}
                onValueChange={(value) => setDietFilter(value as DietaryType || 'all')}
            >
                <ToggleGroupItem value="all" aria-label="Toggle all">
                    All
                </ToggleGroupItem>
                <ToggleGroupItem value="veg" aria-label="Toggle vegetarian">
                    <Leaf className="w-4 h-4 mr-2" /> Veg
                </ToggleGroupItem>
                <ToggleGroupItem value="non-veg" aria-label="Toggle non-vegetarian">
                    <Beef className="w-4 h-4 mr-2" /> Non-Veg
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
        <TabsContent value="order">
          <OrderView weeklyMenu={weeklyMenu} addOrder={addOrder} favoriteItems={favoriteItems} toggleFavorite={toggleFavorite} dietFilter={dietFilter} />
        </TabsContent>
        <TabsContent value="favorites">
            <FavoritesView weeklyMenu={weeklyMenu} favoriteItems={favoriteItems} addOrder={addOrder} toggleFavorite={toggleFavorite} />
        </TabsContent>
        <TabsContent value="feedback">
          <div className="pt-6">
              <FeedbackForm addFeedback={addFeedback} preselectedMeal={feedbackMeal} />
            </div>
        </TabsContent>
        <TabsContent value="history">
            <OrderHistory orders={orders} />
        </TabsContent>
      </Tabs>
      <ReceiptDialog order={lastOrder} isOpen={isReceiptOpen} onOpenChange={setIsReceiptOpen} />
    </>
  );
}
