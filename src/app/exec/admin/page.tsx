"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Order } from "@/lib/types"
import { PoundSterling, Package, Users, Edit, CalendarIcon, Clock, Plus, Trash2, Settings } from "lucide-react"

// Mock data for orders
const initialOrders: Order[] = [
  {
    id: "ORD001",
    customerName: "Alice Johnson",
    service: "Standard Wash",
    date: "2024-07-20",
    status: "Completed",
    userEmail: "alice@example.com",
  },
  {
    id: "ORD002",
    customerName: "Bob Williams",
    service: "Express Wash",
    date: "2024-07-21",
    status: "In Progress",
    userEmail: "bob@example.com",
  },
  {
    id: "ORD003",
    customerName: "Charlie Brown",
    service: "Same-Day VIP",
    date: "2024-07-21",
    status: "Pending",
    userEmail: "charlie@example.com",
  },
  {
    id: "ORD004",
    customerName: "Diana Prince",
    service: "Standard Wash",
    date: "2024-07-22",
    status: "Pending",
    userEmail: "diana@example.com",
  },
  {
    id: "ORD005",
    customerName: "Ethan Hunt",
    service: "Standard Wash",
    date: "2024-07-19",
    status: "Completed",
    userEmail: "ethan@example.com",
  },
  {
    id: "ORD006",
    customerName: "Fiona Glenanne",
    service: "Express Wash",
    date: "2024-07-22",
    status: "Cancelled",
    userEmail: "fiona@example.com",
  },
]

// Mock availability data
const initialAvailability = {
  "2024-07-22": ["09:00", "10:30", "14:00", "15:30"],
  "2024-07-23": ["09:00", "11:00", "13:00", "16:00"],
  "2024-07-24": ["10:00", "14:30", "16:00"],
  "2024-07-25": ["09:30", "11:30", "15:00"],
  "2024-07-26": ["09:00", "10:00", "14:00", "17:00"],
  "2024-07-27": ["10:00", "13:30", "15:30"],
  "2024-07-28": ["09:00", "11:00", "14:00", "16:30"],
}

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

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [availability, setAvailability] = useState(initialAvailability)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [newTimeSlot, setNewTimeSlot] = useState("")
  const [orderNotes, setOrderNotes] = useState("")
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  // This is a placeholder for auth check
  const isAdmin = true

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You are not authorized to view this page.</p>
      </div>
    )
  }

  const updateOrderStatus = (orderId: string, newStatus: Order["status"], notes?: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus, notes } : order)))
    setIsStatusModalOpen(false)
    setSelectedOrder(null)
    setOrderNotes("")
  }

  const addTimeSlot = () => {
    if (!selectedDate || !newTimeSlot) return

    const dateKey = selectedDate.toISOString().split("T")[0]
    setAvailability((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newTimeSlot].sort(),
    }))
    setNewTimeSlot("")
  }

  const removeTimeSlot = (dateKey: string, timeSlot: string) => {
    setAvailability((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey]?.filter((slot) => slot !== timeSlot) || [],
    }))
  }

  const getAvailabilityForDate = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0]
    return availability[dateKey] || []
  }

  const stats = {
    totalRevenue: orders.filter((o) => o.status === "Completed").length * 25, // Assuming £25 average
    activeOrders: orders.filter((o) => o.status === "Pending" || o.status === "In Progress").length,
    newCustomers: 12, // Mock data
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
          {/* Header Section */}
          <div className="text-center mb-16">
            {/* <div className="inline-flex items-center space-x-2 backdrop-blur-sm rounded-full px-6 py-3 border border-border mb-6">
              <Settings className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">Executive Dashboard</span>
            </div> */}
            <h1 className="text-4xl lg:text-6xl font-bold font-headline mb-6 tracking-tight">
              <span className="text-foreground">Control </span>
              
              <span className="gradient-text">Panel</span>
            </h1>
            <p className="md:text-xl text-md  text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Manage your sneaker cleaning empire with precision and style
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            <Card className="gradient-border-bg group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors group-hover:scale-110 group-hover:-rotate-6">
                    <PoundSterling className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</div>
                    <div className="text-sm text-primary font-semibold">Total Earned</div>
                  </div>
                </div>
                <div className="text-3xl font-bold font-headline text-foreground mb-2 group-hover:text-primary transition-colors">
                  £{stats.totalRevenue}
                </div>
                <p className="text-muted-foreground leading-relaxed">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card className="gradient-border-bg group relative overflow-hidden">
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

            <Card className="gradient-border-bg group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors group-hover:scale-110 group-hover:-rotate-6">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Growth</div>
                    <div className="text-sm text-primary font-semibold">New Clients</div>
                  </div>
                </div>
                <div className="text-3xl font-bold font-headline text-foreground mb-2 group-hover:text-primary transition-colors">
                  +{stats.newCustomers}
                </div>
                <p className="text-muted-foreground leading-relaxed">+5 since last week</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-8">
            <TabsList className="bg-card border border-border">
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="availability"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Availability
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card className="gradient-border-bg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 hover:opacity-5 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
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
                </CardHeader>
                <CardContent className="relative z-10">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground font-semibold">Order ID</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Customer</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Service</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-border hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{order.customerName}</div>
                            <div className="text-sm text-muted-foreground">{order.userEmail}</div>
                          </TableCell>
                          <TableCell className="text-foreground">{order.service}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(order.status)} className="capitalize">
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">{order.date}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setOrderNotes(order.notes || "")
                                setIsStatusModalOpen(true)
                              }}
                              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <Card className="gradient-border-bg group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold font-headline text-foreground group-hover:text-primary transition-colors">
                          Select Date
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Choose a date to manage your availability
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border border-border"
                      modifiers={{
                        available: (date) => {
                          const dateKey = date.toISOString().split("T")[0]
                          return availability[dateKey]?.length > 0
                        },
                      }}
                      modifiersStyles={{
                        available: {
                          backgroundColor: "hsl(var(--primary))",
                          color: "hsl(var(--primary-foreground))",
                          fontWeight: "bold",
                        },
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Time Slots Management */}
                <Card className="gradient-border-bg group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold font-headline text-foreground group-hover:text-primary transition-colors">
                          Time Slots
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {selectedDate
                            ? `Manage availability for ${selectedDate.toLocaleDateString()}`
                            : "Select a date to manage time slots"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    {selectedDate && (
                      <>
                        {/* Add new time slot */}
                        <div className="flex space-x-3">
                          <Input
                            type="time"
                            value={newTimeSlot}
                            onChange={(e) => setNewTimeSlot(e.target.value)}
                            className="bg-background border-border text-foreground focus:border-primary"
                          />
                          <Button
                            onClick={addTimeSlot}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Existing time slots */}
                        <div className="space-y-4">
                          <Label className="text-foreground font-semibold">Available Times</Label>
                          <div className="grid grid-cols-1 gap-3">
                            {getAvailabilityForDate(selectedDate).map((timeSlot) => (
                              <div
                                key={timeSlot}
                                className="flex items-center justify-between bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-colors group"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <Clock className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-foreground font-medium text-lg">{timeSlot}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTimeSlot(selectedDate.toISOString().split("T")[0], timeSlot)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          {getAvailabilityForDate(selectedDate).length === 0 && (
                            <div className="text-center py-12">
                              <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                                <Clock className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <p className="text-muted-foreground">No time slots set for this date</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Status Update Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Edit className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold font-headline text-foreground">
                  Update Order Status
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Update the status for order {selectedOrder?.id}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <Card className="gradient-border-bg">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-muted-foreground text-sm uppercase tracking-wider">Customer</Label>
                        <div className="text-foreground font-semibold text-lg">{selectedOrder.customerName}</div>
                        <div className="text-sm text-muted-foreground">{selectedOrder.userEmail}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm uppercase tracking-wider">Service</Label>
                        <div className="text-foreground font-medium">{selectedOrder.service}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-muted-foreground text-sm uppercase tracking-wider">Current Status</Label>
                        <div className="mt-1">
                          <Badge variant={getStatusVariant(selectedOrder.status)} className="capitalize">
                            {selectedOrder.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm uppercase tracking-wider">Date</Label>
                        <div className="text-foreground font-medium">{selectedOrder.date}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Label className="text-foreground font-semibold text-lg">Update Status</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedOrder.status === "Pending" ? "default" : "outline"}
                    onClick={() => updateOrderStatus(selectedOrder.id, "Pending", orderNotes)}
                    className="bg-yellow-500/20 border-yellow-500 text-yellow-600 hover:bg-yellow-500/30 dark:text-yellow-400"
                  >
                    Pending
                  </Button>
                  <Button
                    variant={selectedOrder.status === "In Progress" ? "default" : "outline"}
                    onClick={() => updateOrderStatus(selectedOrder.id, "In Progress", orderNotes)}
                    className="bg-blue-500/20 border-blue-500 text-blue-600 hover:bg-blue-500/30 dark:text-blue-400"
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={selectedOrder.status === "Completed" ? "default" : "outline"}
                    onClick={() => updateOrderStatus(selectedOrder.id, "Completed", orderNotes)}
                    className="bg-green-500/20 border-green-500 text-green-600 hover:bg-green-500/30 dark:text-green-400"
                  >
                    Completed
                  </Button>
                  <Button
                    variant={selectedOrder.status === "Cancelled" ? "default" : "outline"}
                    onClick={() => updateOrderStatus(selectedOrder.id, "Cancelled", orderNotes)}
                    className="bg-red-500/20 border-red-500 text-red-600 hover:bg-red-500/30 dark:text-red-400"
                  >
                    Cancelled
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Notes (Optional)</Label>
                <Textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add any notes about this order update..."
                  className="bg-background border-border text-foreground focus:border-primary min-h-[100px]"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
