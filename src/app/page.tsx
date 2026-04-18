'use client';

import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import StudentView from "@/components/student-view";
import ManagerView from "@/components/manager-view";
import { Utensils } from "lucide-react";
import type { Feedback, Order, WeeklyMenu } from "@/lib/types";
import { 
  addFeedback as addFeedbackAction,
  addOrder as addOrderAction,
  getFeedback,
  getOrders,
  getWeeklyMenu,
  setWeeklyMenu as setWeeklyMenuAction,
  setAnnouncement as setAnnouncementAction,
  getAnnouncement,
  markOrderAsDelivered as markOrderAsDeliveredAction
} from '@/app/actions';
import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";

export type UserRole = 'student' | 'manager';

function AppContent() {
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [announcement, setAnnouncement] = useState<string>('');
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // For QR code feedback deeplinking
  const searchParams = useSearchParams();
  const feedbackMeal = searchParams.get('meal');
  const [initialTab, setInitialTab] = useState<'order' | 'feedback' | 'history' | 'favorites'>('order');

  useEffect(() => {
    if (feedbackMeal && userRole === 'student') {
        setInitialTab('feedback');
    }
  }, [feedbackMeal, userRole]);


  useEffect(() => {
    if (!userRole) {
      setLoading(false);
      return;
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        const [menu, feedback, currentOrders, currentAnnouncement] = await Promise.all([
          getWeeklyMenu(),
          getFeedback(),
          getOrders(),
          getAnnouncement(),
        ]);
        setWeeklyMenu(menu);
        setFeedbackData(feedback);
        setOrders(currentOrders);
        setAnnouncement(currentAnnouncement);
      } catch (error) {
        console.error("Failed to fetch initial data:", error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up an interval to refresh orders for the manager to see live updates
    if (userRole === 'manager') {
        const intervalId = setInterval(async () => {
            const currentOrders = await getOrders();
            setOrders(currentOrders);
        }, 5000); // Refresh every 5 seconds
        return () => clearInterval(intervalId);
    }
  }, [userRole]);

  const refreshOrders = async () => {
    const currentOrders = await getOrders();
    setOrders(currentOrders);
  };
  
  const refreshFeedback = async () => {
      const feedback = await getFeedback();
      setFeedbackData(feedback);
  }

  const addFeedback = async (newFeedback: Omit<Feedback, 'id'>) => {
    await addFeedbackAction(newFeedback);
    await refreshFeedback();
  };

  const addOrder = async (newOrder: Omit<Order, 'id' | 'orderTime' | 'orderStatus'>) => {
    const updatedOrders = await addOrderAction(newOrder);
    setOrders(updatedOrders);
  };
  
  const handleSetWeeklyMenu = async (menu: WeeklyMenu) => {
    const updatedMenu = await setWeeklyMenuAction(menu);
    setWeeklyMenu(updatedMenu);
  };

  const handleRefreshMenu = async () => {
    const updatedMenu = await getWeeklyMenu();
    setWeeklyMenu(updatedMenu);
  }
  
  const handleSetAnnouncement = async (message: string) => {
    const updatedAnnouncement = await setAnnouncementAction(message);
    setAnnouncement(updatedAnnouncement);
  };

  const handleMarkOrderAsDelivered = async (orderId: number) => {
    await markOrderAsDeliveredAction(orderId);
    await refreshOrders();
  }

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
    setWeeklyMenu(null);
    setFeedbackData([]);
    setOrders([]);
    setAnnouncement('');
  }
  
  // First, handle the case where we are not logged in.
  if (!userRole) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }
  
  // Next, handle the loading state *after* a role has been selected.
  if (loading) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
            <Utensils className="w-12 h-12 mr-4 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold font-headline text-foreground mt-4">Loading MessMate...</h1>
            <p className="text-muted-foreground mt-2">Getting everything ready for you.</p>
        </div>
    );
  }
  
  // Finally, if we are logged in and not loading, show the main content.
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center">
          <Utensils className="w-8 h-8 mr-4 text-foreground" />
          <h1 className="text-4xl sm:text-3xl font-bold font-headline text-foreground">MessMate</h1>
        </div>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </header>
      <main className="p-4 md:p-8">
        {userRole === 'student' && weeklyMenu && (
          <StudentView 
            addFeedback={addFeedback} 
            addOrder={addOrder} 
            weeklyMenu={weeklyMenu}
            orders={orders}
            announcement={announcement}
            initialTab={initialTab}
            feedbackMeal={feedbackMeal as 'Breakfast' | 'Lunch' | 'Dinner' | null}
            refreshOrders={refreshOrders}
          />
        )}
        {userRole === 'manager' && weeklyMenu && (
          <ManagerView 
            feedbackData={feedbackData} 
            orders={orders}
            weeklyMenu={weeklyMenu}
            setWeeklyMenu={handleSetWeeklyMenu}
            announcement={announcement}
            setAnnouncement={handleSetAnnouncement}
            markOrderAsDelivered={handleMarkOrderAsDelivered}
            refreshOrders={refreshOrders}
            refreshMenu={handleRefreshMenu}
          />
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </React.Suspense>
  )
}
