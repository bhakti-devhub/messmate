'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Order, Feedback, WeeklyMenu, DailyMenu, MenuItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { UtensilsCrossed, PlusCircle, Trash2, Megaphone, Download, CheckCircle, QrCode, Printer, CheckCheck, CookingPot, Loader2, TrendingUp, ChevronDown, Star, Award, BarChart3, TrendingDown, FileDown } from 'lucide-react';
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Textarea } from './ui/textarea';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { downloadCsv, downloadPdf } from '@/lib/utils';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { markAllReadyAsDelivered as markAllReadyAsDeliveredAction, markOrderAsReady as markOrderAsReadyAction, toggleMealSpecial } from '@/app/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const announcementSchema = z.object({
    message: z.string().min(10, "Message must be at least 10 characters.").max(200, "Message cannot exceed 200 characters."),
});
type AnnouncementFormValues = z.infer<typeof announcementSchema>;

function Announcements({ announcement, setAnnouncement }: { announcement: string, setAnnouncement: (msg: string) => void }) {
    const { toast } = useToast();
    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: { message: announcement },
    });

    const onSubmit = (data: AnnouncementFormValues) => {
        setAnnouncement(data.message);
        toast({
            title: "Announcement Posted!",
            description: "Students will now see the new announcement.",
        });
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Post an Announcement</CardTitle>
                <CardDescription>Share updates or special notices with all students.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Announcement Message</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="E.g., Special dessert tonight!" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit"><Megaphone />Post Announcement</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function FeedbackQrDialog({ day, mealName }: { day: string; mealName: string; }) {
    const feedbackUrl = `${window.location.origin}?meal=${mealName}&day=${day}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(feedbackUrl)}`;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>QR Code for ${mealName} - ${day}</title></head>
                    <body style="text-align: center; margin-top: 50px;">
                        <h2>Feedback for ${mealName} on ${day}</h2>
                        <p>Scan this QR code to leave feedback.</p>
                        <img src="${qrCodeUrl}" alt="Feedback QR Code" />
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };
    
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><QrCode /> QR</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Meal QR Code</DialogTitle>
                    <DialogDescription>
                        Students can scan this code to directly open the feedback form for {mealName} on {day}.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center my-4 py-8 bg-muted rounded-lg" id="qr-code-container">
                    <Image
                        src={qrCodeUrl}
                        alt={`QR Code for ${mealName} feedback`}
                        width={250}
                        height={250}
                        data-ai-hint="qr code"
                        unoptimized
                    />
                </div>
                <DialogFooter className="sm:justify-between">
                     <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
                    <Button onClick={handlePrint}><Printer /> Print</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function MenuEditor({ weeklyMenu, setWeeklyMenu, refreshMenu }: { weeklyMenu: WeeklyMenu; setWeeklyMenu: (menu: WeeklyMenu) => void; refreshMenu: () => void }) {
    const { toast } = useToast();
    const [localMenu, setLocalMenu] = useState(() => JSON.parse(JSON.stringify(weeklyMenu)));

    const handleMenuChange = (dayName: string, mealName: string, itemIndex: number, newItemName: string) => {
        const newMenu = [...localMenu];
        const dayIndex = newMenu.findIndex(d => d.day === dayName);
        if (dayIndex === -1) return;

        const meal = newMenu[dayIndex].meals[mealName as keyof DailyMenu['meals']];
        meal.items[itemIndex].name = newItemName;
        
        setLocalMenu(newMenu);
    };

    const handleAddItem = (dayName: string, mealName: string) => {
        const newMenu = [...localMenu];
        const dayIndex = newMenu.findIndex(d => d.day === dayName);
        if (dayIndex === -1) return;
        
        const meal = newMenu[dayIndex].meals[mealName as keyof DailyMenu['meals']];
        meal.items.push({ name: "New Item", icon: 'UtensilsCrossed', calories: 100 });

        setLocalMenu(newMenu);
    };

    const handleRemoveItem = (dayName: string, mealName: string, itemIndex: number) => {
        const newMenu = [...localMenu];
        const dayIndex = newMenu.findIndex(d => d.day === dayName);
        if (dayIndex === -1) return;
        
        const meal = newMenu[dayIndex].meals[mealName as keyof DailyMenu['meals']];
        if (meal.items.length <= 1) {
            toast({ variant: 'destructive', title: "Cannot remove last item", description: "Each meal must have at least one item." });
            return;
        }
        meal.items.splice(itemIndex, 1);

        setLocalMenu(newMenu);
    }

    const handleSaveChanges = () => {
        setWeeklyMenu(localMenu);
        toast({
            title: "Menu Updated",
            description: "The weekly menu has been successfully saved."
        });
    }

    const handleToggleSpecial = async (day: string, mealName: string, itemName: string) => {
        await toggleMealSpecial(day, mealName, itemName);
        refreshMenu();
        toast({
            title: "Special Status Updated!",
            description: `${itemName} has been updated.`
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>Update the weekly menu items for students to see. Click a day to edit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                 <Accordion type="single" collapsible className="w-full">
                    {localMenu.map((day: DailyMenu) => (
                        <AccordionItem value={day.day} key={day.day}>
                            <AccordionTrigger>
                                <h3 className="font-bold text-2xl font-headline">{day.day}</h3>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-6 p-1">
                                    {Object.values(day.meals).map(meal => (
                                        <div key={meal.name} className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                            <div className='flex justify-between items-center flex-wrap gap-2'>
                                                <h4 className="font-bold text-xl">{meal.name}</h4>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => handleAddItem(day.day, meal.name)}>
                                                        <PlusCircle className="mr-2" /> Add Item
                                                    </Button>
                                                    <FeedbackQrDialog day={day.day} mealName={meal.name} />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {meal.items.map((item, index) => (
                                                    <div key={index} className="space-y-2">
                                                        <Label htmlFor={`${day.day}-${meal.name}-${index}`}>Item {index + 1}</Label>
                                                        <div className="flex items-center gap-2">
                                                            <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                id={`${day.day}-${meal.name}-${index}`}
                                                                value={item.name}
                                                                onChange={(e) => handleMenuChange(day.day, meal.name, index, e.target.value)}
                                                            />
                                                            <Button
                                                                variant={item.isSpecial ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => handleToggleSpecial(day.day, meal.name, item.name)}
                                                            >
                                                                <Award className="w-4 h-4 mr-2" /> {item.isSpecial ? 'Special' : 'Mark Special'}
                                                            </Button>
                                                            <Button variant="destructive" size="icon" onClick={() => handleRemoveItem(day.day, meal.name, index)}>
                                                                <Trash2 />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <div className="pt-6">
                  <Button onClick={handleSaveChanges}>Save All Menu Changes</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function MostOrderedItemsChart({ orders }: { orders: Order[] }) {
    const itemCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                counts[item.name] = (counts[item.name] || 0) + 1;
            });
        });
        
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Show top 10 most ordered items
    }, [orders]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp /> Most Popular Items
                </CardTitle>
                <CardDescription>A chart showing the most frequently ordered items across all meals.</CardDescription>
            </CardHeader>
            <CardContent>
                {itemCounts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart layout="vertical" data={itemCounts} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis dataKey="name" type="category" width={120} />
                            <Tooltip
                                 contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                }}
                                cursor={{ fill: 'hsl(var(--muted))' }}
                            />
                            <Legend />
                            <Bar dataKey="count" name="Times Ordered" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No order data available yet. Orders will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function OrdersView({ orders, refreshOrders, markOrderAsDelivered }: { orders: Order[], refreshOrders: () => Promise<void>, markOrderAsDelivered: (orderId: number) => Promise<void> }) {
    const { toast } = useToast();
    const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);

    const orderData = [
        { name: 'Breakfast', total: orders.filter(o => o.meal === 'Breakfast').length },
        { name: 'Lunch', total: orders.filter(o => o.meal === 'Lunch').length },
        { name: 'Dinner', total: orders.filter(o => o.meal === 'Dinner').length },
    ];

    const handleDownloadCSV = () => {
        const headers = ['Order ID', 'Student Name', 'Meal', 'Items', 'Order Time', 'Status', 'Pickup ETA', 'Notes'];
        const formattedData = orders.map(order => ({
            orderid: order.id,
            studentname: order.studentName,
            meal: order.meal,
            items: order.items.map(i => i.name).join(', '),
            ordertime: order.orderTime,
            status: order.orderStatus,
            pickupeta: order.pickupETA,
            notes: order.notes || ''
        }));
        downloadCsv(formattedData, headers, `order-report-${new Date().toISOString().split('T')[0]}.csv`);
    };
    
    const handleDownloadPDF = () => {
        const headers = ['Order ID', 'Student Name', 'Meal', 'Items', 'Order Time', 'Status', 'Pickup ETA', 'Notes'];
        const formattedData = orders.map(order => ({
            orderid: order.id,
            studentname: order.studentName,
            meal: order.meal,
            items: order.items.map(i => i.name).join(', '),
            ordertime: order.orderTime,
            status: order.orderStatus,
            pickupeta: order.pickupETA,
            notes: order.notes || ''
        }));
        downloadPdf('Order Report', headers, formattedData, `order-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleMarkAsReadyClick = async (orderId: number) => {
        setProcessingOrderId(orderId);
        await markOrderAsReadyAction(orderId);
        await refreshOrders();
        toast({
            title: "Order Ready",
            description: `Order #${orderId} is now ready for pickup.`,
        });
        setProcessingOrderId(null);
    };

    const handleMarkAsDeliveredClick = async (orderId: number) => {
        setProcessingOrderId(orderId);
        await markOrderAsDelivered(orderId);
        await refreshOrders();
        toast({
            title: "Order Delivered",
            description: `Order #${orderId} has been marked as delivered.`,
        });
        setProcessingOrderId(null);
    };

    const handleMarkAllDelivered = async () => {
        setProcessingOrderId(-1); // A special value for "all"
        await markAllReadyAsDeliveredAction();
        await refreshOrders();
        toast({
            title: "All Orders Finalized",
            description: "All 'Ready for Pickup' orders have been marked as 'Delivered'."
        })
        setProcessingOrderId(null);
    }

    const readyForPickupCount = orders.filter(o => o.orderStatus === 'Ready for Pickup').length;
    const isProcessing = (orderId: number | 'all') => {
        if (orderId === 'all') return processingOrderId === -1;
        return processingOrderId === orderId;
    }


    const renderActionCell = (order: Order) => {
        const isCurrentOrderProcessing = isProcessing(order.id);
        
        switch (order.orderStatus) {
            case 'Placed':
                return (
                    <Button size="sm" onClick={() => handleMarkAsReadyClick(order.id)} disabled={isCurrentOrderProcessing}>
                        {isCurrentOrderProcessing ? <Loader2 className="animate-spin" /> : <CookingPot className="w-4 h-4 mr-2" />}
                        Mark Ready
                    </Button>
                );
             case 'Preparing':
                 return (
                     <Button size="sm" variant="outline" disabled>
                         <Loader2 className="animate-spin mr-2" />
                         Preparing...
                     </Button>
                 );
            case 'Ready for Pickup':
                return (
                    <Button size="sm" onClick={() => handleMarkAsDeliveredClick(order.id)} disabled={isCurrentOrderProcessing}>
                         {isCurrentOrderProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Mark Delivered
                    </Button>
                );
            case 'Delivered':
                return <span className="text-sm text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Delivered</span>;
            default:
                return null;
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Orders</CardTitle>
                <CardDescription>A live log of all meal orders placed by students today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Orders Summary</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={orderData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                }}
                            />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="text-lg font-semibold">All Orders</h3>
                        <div className="flex gap-2">
                             <Button onClick={handleMarkAllDelivered} variant="outline" size="sm" disabled={readyForPickupCount === 0 || isProcessing('all')}>
                                {isProcessing('all') ? <Loader2 className="animate-spin" /> : <CheckCheck className="mr-2" />}
                                Mark All Delivered ({readyForPickupCount})
                            </Button>
                            <Button onClick={handleDownloadCSV} variant="outline" size="sm" disabled={orders.length === 0}>
                                <Download className="mr-2" />
                                Download CSV
                            </Button>
                             <Button onClick={handleDownloadPDF} variant="outline" size="sm" disabled={orders.length === 0}>
                                <FileDown className="mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Meal</TableHead>
                                    <TableHead>Pickup ETA</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length > 0 ? orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell className="font-medium">{order.studentName}</TableCell>
                                        <TableCell>{order.meal}</TableCell>
                                        <TableCell>{order.pickupETA}</TableCell>
                                        <TableCell>{order.orderStatus}</TableCell>
                                        <TableCell>
                                            {order.notes ? (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="sm">View</Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-60">
                                                        <p className="text-sm">{order.notes}</p>
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                <span className="text-muted-foreground">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {renderActionCell(order)}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No orders placed yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function FeedbackAnalysis({ feedbackData }: { feedbackData: Feedback[] }) {
    const { toast } = useToast();
    const feedbackSummary = useMemo(() => {
        if (feedbackData.length === 0) return [];
        const groupedFeedback: { [key: string]: { ratings: number[], count: number } } = {
            'Breakfast': { ratings: [], count: 0 },
            'Lunch': { ratings: [], count: 0 },
            'Dinner': { ratings: [], count: 0 },
        };

        feedbackData.forEach(f => {
            if (groupedFeedback[f.meal]) {
                groupedFeedback[f.meal].ratings.push(f.rating);
                groupedFeedback[f.meal].count++;
            }
        });
        
        return Object.entries(groupedFeedback).map(([meal, data]) => ({
            meal,
            averageRating: data.count > 0 ? (data.ratings.reduce((a, b) => a + b, 0) / data.count) : 0,
        }));
    }, [feedbackData]);
    
    const handleDownloadPDF = () => {
        if (feedbackData.length === 0) {
            toast({ variant: 'destructive', title: "No data", description: "There is no feedback to export."});
            return;
        }
        const headers = ['Feedback ID', 'Student Name', 'Meal', 'Rating', 'Comment'];
        downloadPdf('Feedback Report', headers, feedbackData, `feedback-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 /> Feedback Trend Analysis
                </CardTitle>
                <CardDescription>
                    Track the average student rating for each meal over time. Use the button to export all comments.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {feedbackSummary.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={feedbackSummary} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <XAxis dataKey="meal" />
                             <YAxis domain={[1, 5]} allowDecimals={false}/>
                             <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                }}
                             />
                             <Legend />
                             <Line type="monotone" dataKey="averageRating" name="Average Rating" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No feedback data available yet.</p>
                    </div>
                )}
                 <Button onClick={handleDownloadPDF} variant="outline" disabled={feedbackData.length === 0}>
                    <FileDown className="mr-2" />
                    Download All Feedback (PDF)
                </Button>
            </CardContent>
        </Card>
    );
}

type ManagerViewProps = {
    feedbackData: Feedback[];
    orders: Order[];
    weeklyMenu: WeeklyMenu;
    setWeeklyMenu: (menu: WeeklyMenu) => void;
    announcement: string;
    setAnnouncement: (msg: string) => void;
    markOrderAsDelivered: (orderId: number) => Promise<void>;
    refreshOrders: () => Promise<void>;
    refreshMenu: () => void;
};

export default function ManagerView({ feedbackData, orders, weeklyMenu, setWeeklyMenu, announcement, setAnnouncement, markOrderAsDelivered, refreshOrders, refreshMenu }: ManagerViewProps) {
    return (
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="popularity">Item Popularity</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="announcements">Announce</TabsTrigger>
          </TabsList>
          <TabsContent value="orders">
            <OrdersView orders={orders} markOrderAsDelivered={markOrderAsDelivered} refreshOrders={refreshOrders} />
          </TabsContent>
          <TabsContent value="popularity">
            <MostOrderedItemsChart orders={orders} />
          </TabsContent>
           <TabsContent value="feedback">
            <FeedbackAnalysis feedbackData={feedbackData} />
          </TabsContent>
          <TabsContent value="menu">
            <MenuEditor weeklyMenu={weeklyMenu} setWeeklyMenu={setWeeklyMenu} refreshMenu={refreshMenu} />
          </TabsContent>
          <TabsContent value="announcements">
            <Announcements announcement={announcement} setAnnouncement={setAnnouncement} />
          </TabsContent>
        </Tabs>
    );
}
