
"use client"

import { useMemo } from "react"
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Order } from "@/lib/types"
import { PoundSterling, Package, Users, Eye, Search, ListFilter, AlertTriangle, TrendingUp, CalendarDays, Plus, Trash2, Calendar as CalendarIcon, Tag } from "lucide-react"
import { format, parseISO, formatDistanceToNow, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"

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

export const AdminDesktopView = (props: any) => {
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
         <main className="flex-1 p-4 md:p-8 relative overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <div className="absolute -left-32 top-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute -right-32 bottom-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <PoundSterling className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">£{stats.totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeOrders}</div>
                            <p className="text-xs text-muted-foreground">Pending and In Progress</p>
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
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-xl font-bold font-headline">Recent Orders</CardTitle>
                                        <CardDescription>Manage your sneaker cleaning orders.</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8 w-full sm:w-64"
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
                            <CardContent>
                                <div className="max-h-[600px] overflow-y-auto styled-scrollbar">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Service</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Job Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                <TableRow><TableCell colSpan={6} className="text-center h-24">Loading orders...</TableCell></TableRow>
                                            ) : filteredAndSortedOrders.length > 0 ? (
                                                filteredAndSortedOrders.map((order: Order) => (
                                                    <TableRow key={order.id} className="cursor-pointer" onClick={() => router.push(`/exec/admin/orders/${order.id}`)}>
                                                        <TableCell><div className="font-medium">{order.customerName}</div></TableCell>
                                                        <TableCell>{order.service} (x{order.quantity || 1})</TableCell>
                                                        <TableCell>£{order.totalCost?.toFixed(2) || 'N/A'}</TableCell>
                                                        <TableCell><Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge></TableCell>
                                                        <TableCell>{order.date}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="outline" size="sm" asChild><Link href={`/exec/admin/orders/${order.id}`}><Eye className="h-4 w-4 mr-1" />View</Link></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow><TableCell colSpan={6} className="text-center h-24">No orders found.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="font-headline text-2xl">Manage Availability</CardTitle>
                                        <CardDescription>Add or remove booking slots.</CardDescription>
                                    </div>
                                    <CalendarDays className="h-6 w-6 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                                <div className="flex flex-col items-center">
                                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="newTime" className="text-muted-foreground mb-2 block">Add time slot</Label>
                                        <div className="flex gap-2">
                                            <Input id="newTime" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full" />
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <Card className="bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="font-headline text-2xl">Projections</CardTitle>
                                        <CardDescription>Forecasted revenue.</CardDescription>
                                    </div>
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={projectionPeriod} onValueChange={(value) => setProjectionPeriod(value as any)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                        <TabsTrigger value="7d">7d</TabsTrigger>
                                        <TabsTrigger value="30d">30d</TabsTrigger>
                                        <TabsTrigger value="90d">90d</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                                    <BarChart data={projectionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `£${value}`} />
                                        <ChartTooltip cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} content={<ChartTooltipContent formatter={(value) => `£${Number(value).toFixed(2)}`} />} />
                                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="font-headline text-2xl">Priority Orders</CardTitle>
                                        <CardDescription>Jobs needing attention.</CardDescription>
                                    </div>
                                    <AlertTriangle className="h-6 w-6 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? (
                                    <div className="text-center">Loading...</div>
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
                                    <div className="text-center py-8">No active orders.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
