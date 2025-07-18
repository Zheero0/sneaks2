
"use client"

import { useMemo } from "react"
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Order } from "@/lib/types"
import { PoundSterling, Package, Users, Search, ListFilter, AlertTriangle, TrendingUp, CalendarDays, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react"
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Separator } from "../ui/separator";

const getStatusVariant = (status: Order["status"]) => {
  switch (status) {
    case "Pending": return "default"
    case "In Progress": return "secondary"
    case "Completed": return "outline"
    case "Cancelled": return "destructive"
  }
}

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
} satisfies ChartConfig

export const AdminMobileView = (props: any) => {
    const {
        router,
        orders,
        isLoading,
        searchQuery,
        setSearchQuery,
        sortOption,
        setSortOption,
        projectionPeriod,
        setProjectionPeriod,
        selectedDate,
        setSelectedDate,
        availableSlots,
        newTime,
        setNewTime,
        filteredAndSortedOrders,
        priorityOrders,
        projectionChartData,
        handleAddTime,
        handleRemoveTime,
    } = props;

     const stats = useMemo(() => {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
    
        const receivedOrdersThisMonth = orders.filter((order: Order) => {
            if (order.status === 'Cancelled' || !order.createdAt) return false;
            try {
              return isWithinInterval(order.createdAt, { start, end });
            } catch (e) {
                return false;
            }
        });
    
        const totalRevenue = receivedOrdersThisMonth.reduce((acc: number, order: Order) => acc + (order.totalCost || 0), 0);
        const activeOrders = orders.filter((o: Order) => o.status === "Pending" || o.status === "In Progress").length;
        const totalCustomers = new Set(orders.map((o: Order) => o.userEmail)).size;
        
        return {
            totalRevenue,
            activeOrders,
            totalCustomers,
        };
      }, [orders]);
      
    return (
        <main className="flex-1 p-4 space-y-6">
            {/* Stats Cards */}
            <section>
                <Card className="bg-card/80 backdrop-blur-sm mb-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <PoundSterling className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">£{stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/80 backdrop-blur-sm mb-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeOrders}</div>
                        <p className="text-xs text-muted-foreground">Pending & In Progress</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
            </section>

            <Separator />
            
            {/* Recent Orders */}
            <section>
                 <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Recent Orders</CardTitle>
                         <div className="flex flex-col gap-2 pt-4">
                            <Input
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    <ListFilter className="h-4 w-4 mr-2" />
                                    Sort by: {sortOption.replace('-', ': ')}
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]]">
                                <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                                    <DropdownMenuRadioItem value="date-desc">Date: Newest</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="date-asc">Date: Oldest</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="price-desc">Price: High-Low</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="price-asc">Price: Low-High</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isLoading ? (
                          <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
                        ) : filteredAndSortedOrders.length > 0 ? (
                          filteredAndSortedOrders.map((order: Order) => (
                          <Card 
                            key={order.id} 
                            className="bg-secondary/50 cursor-pointer"
                            onClick={() => router.push(`/exec/admin/orders/${order.id}`)}
                          >
                            <CardContent className="p-3 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-foreground leading-tight">{order.customerName}</p>
                                  <p className="text-sm text-muted-foreground">{order.service} (x{order.quantity || 1})</p>
                                </div>
                                <Badge variant={getStatusVariant(order.status)} className="capitalize shrink-0">{order.status}</Badge>
                              </div>
                              <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t border-border/50">
                                <div className="flex items-center gap-1.5">
                                  <CalendarIcon className="h-3.5 w-3.5" />
                                  <span>{order.date}</span>
                                </div>
                                <div className="font-semibold text-foreground">
                                  £{order.totalCost?.toFixed(2) || 'N/A'}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No orders found.</div>
                      )}
                    </CardContent>
                 </Card>
            </section>

             <Separator />

             {/* Manage Availability */}
             <section>
                 <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Manage Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                        />
                        <div>
                            <Label htmlFor="newTimeMobile" className="text-muted-foreground mb-2 block">Add time slot</Label>
                            <div className="flex gap-2">
                                <Input id="newTimeMobile" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                                <Button onClick={handleAddTime}><Plus className="h-4 w-4"/></Button>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto styled-scrollbar p-1">
                            <h3 className="font-semibold mb-2">Slots for {selectedDate ? format(selectedDate, 'PPP') : '...'}</h3>
                            {availableSlots.length > 0 ? availableSlots.map((time: string) => (
                                <div key={time} className="flex justify-between items-center bg-secondary/50 p-2 rounded-md">
                                    <span className="font-mono">{time}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveTime(time)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No slots for this date.</p>
                            )}
                        </div>
                    </CardContent>
                 </Card>
             </section>
             
             <Separator />
             
             {/* Projections */}
             <section>
                <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Projections</CardTitle>
                        <CardDescription>Forecasted revenue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={projectionPeriod} onValueChange={(value) => setProjectionPeriod(value as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="7d">7d</TabsTrigger>
                                <TabsTrigger value="30d">30d</TabsTrigger>
                                <TabsTrigger value="90d">90d</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <BarChart data={projectionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `£${value}`} />
                                <ChartTooltip cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} content={<ChartTooltipContent formatter={(value) => `£${Number(value).toFixed(2)}`} />} />
                                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
             </section>
             
             <Separator />

             {/* Priority Orders */}
             <section>
                 <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Priority Orders</CardTitle>
                        <CardDescription>Jobs needing attention.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading...</div>
                        ) : priorityOrders.length > 0 ? (
                            priorityOrders.map((order: Order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50 cursor-pointer" onClick={() => router.push(`/exec/admin/orders/${order.id}`)}>
                                    <div>
                                        <p className="font-semibold">{order.customerName}</p>
                                        <p className="text-sm text-muted-foreground">{order.service}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-primary font-medium">{order.date ? `in ${formatDistanceToNow(parseISO(order.date))}` : 'No date'}</p>
                                        <Badge variant={getStatusVariant(order.status)} className="capitalize mt-1">{order.status}</Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">No active orders.</div>
                        )}
                    </CardContent>
                 </Card>
             </section>
        </main>
    )
}
