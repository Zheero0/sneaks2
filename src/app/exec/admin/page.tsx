
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from 'next/navigation';
import { db } from "@/lib/firebase"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import { Header } from "@/components/Header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Order } from "@/lib/types"
import { PoundSterling, Package, Users, Eye, Search, ListFilter, AlertTriangle, TrendingUp, CalendarDays, Plus, Trash2 } from "lucide-react"
import { motion } from 'framer-motion';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, addDays, eachDayOfInterval, parseISO, formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { getAvailability, addAvailability, removeAvailability } from "@/lib/availability"


const getStatusVariant = (status: Order["status"]) => {
  switch (status) {
    case "Pending":
      return "default"
    case "In Progress":
      return "secondary"
    case "Completed":
      return "outline"
    case "Cancelled":
      return "destructive"
  }
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [projectionPeriod, setProjectionPeriod] = useState<"7d" | "30d" | "90d">("30d");

  // Availability State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData: Order[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        customerName: doc.data().fullName,
        service: doc.data().serviceName,
        date: doc.data().bookingDate,
        status: doc.data().status,
        userEmail: doc.data().email,
        phoneNumber: doc.data().phoneNumber,
        totalCost: doc.data().totalCost,
        notes: doc.data().notes,
        createdAt: doc.data().createdAt?.toDate()
      }));
      setOrders(ordersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching orders: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Availability useEffect
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      getAvailability(dateString).then(slots => {
          setAvailableSlots(slots);
      });
    }
  }, [selectedDate]);


  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortOption) {
      case 'date-desc':
        filtered.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        break;
      case 'date-asc':
        filtered.sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
        break;
      case 'price-desc':
        filtered.sort((b, a) => (a.totalCost || 0) - (b.totalCost || 0));
        break;
      case 'price-asc':
        filtered.sort((a, b) => (a.totalCost || 0) - (b.totalCost || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [orders, searchQuery, sortOption]);
  
  const priorityOrders = useMemo(() => {
    return orders
      .filter(order => order.status === 'Pending' || order.status === 'In Progress')
      .sort((a, b) => {
        try {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } catch (e) {
          return 0;
        }
      })
      .slice(0, 5);
  }, [orders]);


 const stats = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    const receivedOrdersThisMonth = orders.filter(order => {
        if (order.status === 'Cancelled' || !order.createdAt) return false;
        try {
          return isWithinInterval(order.createdAt, { start, end });
        } catch (e) {
            return false;
        }
    });

    const totalRevenue = receivedOrdersThisMonth.reduce((acc, order) => acc + (order.totalCost || 0), 0);
    const activeOrders = orders.filter((o) => o.status === "Pending" || o.status === "In Progress").length;
    const totalCustomers = new Set(orders.map(o => o.userEmail)).size;
    
    return {
        totalRevenue,
        activeOrders,
        totalCustomers,
    };
  }, [orders]);
  
  const projectionChartData = useMemo(() => {
    const days = projectionPeriod === '7d' ? 7 : projectionPeriod === '30d' ? 30 : 90;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = addDays(today, days - 1);

    const dailyProjections = new Map<string, number>();

     orders.forEach(order => {
        if (order.status === 'Cancelled' || !order.date) return;
        try {
            const orderDate = parseISO(order.date);
            if(isWithinInterval(orderDate, { start: today, end: endDate })) {
                const dateKey = format(orderDate, 'yyyy-MM-dd');
                const currentTotal = dailyProjections.get(dateKey) || 0;
                dailyProjections.set(dateKey, currentTotal + (order.totalCost || 0));
            }
        } catch (e) {
        }
    });

    const dateInterval = eachDayOfInterval({ start: today, end: endDate });
    
    return dateInterval.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        return {
            date: format(day, 'MMM d'),
            revenue: dailyProjections.get(dateKey) || 0,
        };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [orders, projectionPeriod]);


  // Availability handlers
  const handleAddTime = async () => {
      if (newTime && selectedDate) {
          const dateString = format(selectedDate, 'yyyy-MM-dd');
          const success = await addAvailability(dateString, newTime);
          if (success) {
              setAvailableSlots(prev => [...prev, newTime].sort());
              setNewTime('');
              toast({ title: "Success", description: "Time slot added." });
          } else {
              toast({ variant: "destructive", title: "Error", description: "Failed to add time slot." });
          }
      }
  };

  const handleRemoveTime = async (time: string) => {
      if (selectedDate) {
          const dateString = format(selectedDate, 'yyyy-MM-dd');
          const success = await removeAvailability(dateString, time);
          if (success) {
              setAvailableSlots(prev => prev.filter(t => t !== time));
              toast({ title: "Success", description: "Time slot removed." });
          } else {
              toast({ variant: "destructive", title: "Error", description: "Failed to remove time slot." });
          }
      }
  };

  // This is a placeholder for auth check
  const isAdmin = true

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You are not authorized to view this page.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8 relative overflow-hidden">
        {/* Background Elements */}
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute -left-32 top-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -right-32 bottom-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Stats Cards */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
             <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-card/80 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors group-hover:scale-110 group-hover:-rotate-6">
                      <PoundSterling className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</div>
                      <div className="text-sm text-primary font-semibold">This Month</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-headline text-foreground mb-2 group-hover:text-primary transition-colors">
                    £{stats.totalRevenue.toFixed(2)}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">Received orders this month</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-card/80 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors group-hover:scale-110 group-hover:-rotate-6">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Active</div>
                      <div className="text-sm text-primary font-semibold">In Progress</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-headline text-foreground mb-2 group-hover:text-primary transition-colors">
                    {stats.activeOrders}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">Pending and In Progress</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-card/80 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors group-hover:scale-110 group-hover:-rotate-6">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Clients</div>
                      <div className="text-sm text-primary font-semibold">All Time</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-headline text-foreground mb-2 group-hover:text-primary transition-colors">
                    {stats.totalCustomers}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">Total unique clients</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

           <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                  <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Card className="bg-card/80 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                    <CardHeader className="relative z-10">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl font-bold font-headline text-foreground">Recent Orders</CardTitle>
                              <CardDescription className="text-muted-foreground">
                                Manage your sneaker cleaning orders with precision
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                              <div className="relative w-full sm:w-auto flex-1">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                  placeholder="Search by name..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="pl-9 w-full"
                                  />
                              </div>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                  <Button variant="outline" className="flex items-center gap-2">
                                      <ListFilter className="h-4 w-4" />
                                      <span>Sort by</span>
                                  </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                                      <DropdownMenuRadioItem value="date-desc">Date: Newest</DropdownMenuRadioItem>
                                      <DropdownMenuRadioItem value="date-asc">Date: Oldest</DropdownMenuRadioItem>
                                      <DropdownMenuRadioItem value="price-desc">Price: High to Low</DropdownMenuRadioItem>
                                      <DropdownMenuRadioItem value="price-asc">Price: Low to High</DropdownMenuRadioItem>
                                  </DropdownMenuRadioGroup>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="max-h-[600px] overflow-y-auto styled-scrollbar bg-card rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border">
                                <TableHead className="text-muted-foreground font-semibold">Customer</TableHead>
                                <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">Phone</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Price</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                                <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">Job Date</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {isLoading ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center h-24">Loading orders...</TableCell>
                                </TableRow>
                              ) : filteredAndSortedOrders.length > 0 ? (
                                filteredAndSortedOrders.map((order) => (
                                  <TableRow 
                                    key={order.id} 
                                    className="border-border hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/exec/admin/orders/${order.id}`)}
                                  >
                                    <TableCell>
                                      <div className="font-medium text-foreground">{order.customerName}</div>
                                      <div className="text-sm text-muted-foreground md:hidden">{order.date}</div>
                                    </TableCell>
                                    <TableCell className="text-foreground hidden md:table-cell">
                                      {order.phoneNumber || 'N/A'}
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">
                                      £{order.totalCost?.toFixed(2) || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={getStatusVariant(order.status)} className="capitalize">
                                        {order.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-foreground hidden md:table-cell">{order.date}</TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center h-24">No orders found.</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                  
                  <Card className="bg-card/80 backdrop-blur-sm transition-shadow duration-300">
                      <CardHeader>
                          <div className="flex items-center justify-between">
                              <div>
                                  <CardTitle className="font-headline text-2xl">Manage Availability</CardTitle>
                                  <CardDescription>Add or remove booking slots for customers.</CardDescription>
                              </div>
                              <CalendarDays className="h-6 w-6 text-primary" />
                          </div>
                      </CardHeader>
                      <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                          <div className="flex flex-col items-center">
                              <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={setSelectedDate}
                                  className="rounded-md border"
                              />
                          </div>
                          <div className="space-y-4">
                              <div>
                                  <Label htmlFor="newTime" className="text-muted-foreground mb-2 block">Add new time slot</Label>
                                  <div className="flex gap-2">
                                      <Input
                                          id="newTime"
                                          type="time"
                                          value={newTime}
                                          onChange={(e) => setNewTime(e.target.value)}
                                          className="w-full"
                                      />
                                      <Button onClick={handleAddTime}><Plus className="h-4 w-4"/></Button>
                                  </div>
                              </div>
                              <div className="space-y-2 max-h-48 overflow-y-auto styled-scrollbar p-1">
                                  <h3 className="font-semibold mb-2">Available Slots for {selectedDate ? format(selectedDate, 'PPP') : '...'}</h3>
                                  {availableSlots.length > 0 ? availableSlots.map(time => (
                                  <div key={time} className="flex justify-between items-center bg-secondary/50 p-2 rounded-md">
                                      <span className="font-mono text-foreground">{time}</span>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveTime(time)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                  </div>
                                  )) : (
                                  <p className="text-sm text-muted-foreground text-center py-4">No slots for this date.</p>
                                  )}
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              </div>
              <div className="lg:col-span-1 space-y-8">
                <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Card className="bg-card/80 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                     <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline text-2xl">Projections</CardTitle>
                                <CardDescription>Forecasted revenue from scheduled jobs.</CardDescription>
                            </div>
                            <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={projectionPeriod} onValueChange={(value) => setProjectionPeriod(value as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                          <TabsTrigger value="7d">7 Days</TabsTrigger>
                          <TabsTrigger value="30d">30 Days</TabsTrigger>
                          <TabsTrigger value="90d">90 Days</TabsTrigger>
                        </TabsList>
                      </Tabs>
                       <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                          <BarChart data={projectionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <XAxis
                                  dataKey="date"
                                  stroke="hsl(var(--muted-foreground))"
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                              />
                              <YAxis
                                  stroke="hsl(var(--muted-foreground))"
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(value) => `£${value}`}
                              />
                               <ChartTooltip
                                  cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                                  content={<ChartTooltipContent
                                    formatter={(value, name) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground">£{Number(value).toFixed(2)}</span>
                                        </div>
                                    )}
                                  />}
                              />
                              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Card className="bg-card/80 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                    <CardHeader className="relative z-10">
                      <div className="flex items-center space-x-3">
                         <div className="p-2 bg-primary/10 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-primary" />
                        </div>
                         <div>
                          <CardTitle className="text-2xl font-bold font-headline text-foreground">Priority Orders</CardTitle>
                          <CardDescription className="text-muted-foreground">Top 5 jobs needing attention.</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-4">
                      {isLoading ? (
                          <div className="text-center text-muted-foreground">Loading...</div>
                      ) : priorityOrders.length > 0 ? (
                         priorityOrders.map(order => (
                          <div 
                            key={order.id} 
                            className="flex items-center justify-between p-3 rounded-md bg-secondary/50 hover:bg-secondary/80 cursor-pointer transition-colors"
                            onClick={() => router.push(`/exec/admin/orders/${order.id}`)}
                          >
                            <div>
                              <p className="font-semibold text-foreground">{order.customerName}</p>
                              <p className="text-sm text-muted-foreground">{order.service}</p>
                            </div>
                            <div className="text-right">
                               <p className="font-medium text-sm text-primary">
                                { order.date ? `in ${formatDistanceToNow(parseISO(order.date))}` : 'No date'}
                               </p>
                              <Badge variant={getStatusVariant(order.status)} className="capitalize mt-1">{order.status}</Badge>
                            </div>
                          </div>
                         ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">No active orders.</div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
        </div>
      </main>
    </div>
  )
}
