

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from 'next/navigation'
import { db } from "@/lib/firebase"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { Header } from "@/components/Header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Order } from "@/lib/types"
import { ArrowLeft, Edit, Loader2, User, Mail, Phone, Package, CalendarIcon, PoundSterling, StickyNote } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const getStatusVariant = (status: Order["status"]) => {
  switch (status) {
    case "Pending": return "default"
    case "In Progress": return "secondary"
    case "Completed": return "outline"
    case "Cancelled": return "destructive"
  }
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const { toast } = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (!orderId) return

    setIsLoading(true)
    const docRef = doc(db, "orders", orderId)

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const orderData = {
          id: docSnap.id,
          customerName: docSnap.data().fullName,
          service: docSnap.data().serviceName,
          date: docSnap.data().bookingDate,
          status: docSnap.data().status,
          userEmail: docSnap.data().email,
          phoneNumber: docSnap.data().phoneNumber,
          totalCost: docSnap.data().totalCost,
          notes: docSnap.data().notes,
          deliveryMethod: docSnap.data().deliveryMethod,
          pickupAddress: docSnap.data().pickupAddress,
          quantity: docSnap.data().quantity,
          repaint: docSnap.data().repaint,
        } as Order
        setOrder(orderData)
        setNotes(orderData.notes || "")
      } else {
        console.error("No such document!")
        setOrder(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [orderId])

  const handleUpdateStatus = async (newStatus: Order["status"]) => {
    if (!order) return;
    const orderRef = doc(db, 'orders', order.id);
    try {
        await updateDoc(orderRef, {
            status: newStatus,
        });
        toast({
            title: "Status Updated",
            description: `Order status changed to ${newStatus}.`,
        });
    } catch (error) {
        console.error("Error updating order status: ", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the order status. Please try again.",
        });
    }
  }

  const handleSaveNotes = async () => {
    if (!order) return;
    const orderRef = doc(db, 'orders', order.id);
    try {
        await updateDoc(orderRef, {
            notes: notes
        });
         toast({
            title: "Notes Saved",
            description: "Your notes have been successfully saved.",
        });
    } catch (error) {
        console.error("Error saving notes: ", error);
         toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save notes. Please try again.",
        });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Order not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-headline flex items-center justify-between">
                    <span>Order #{order.id.substring(0, 7)}...</span>
                    <Badge variant={getStatusVariant(order.status)} className="capitalize text-base">{order.status}</Badge>
                  </CardTitle>
                   <CardDescription>
                      {order.date}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <User className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <Label className="text-muted-foreground">Customer</Label>
                                <p className="font-semibold text-lg">{order.customerName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Mail className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <p className="font-semibold">{order.userEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <Label className="text-muted-foreground">Phone</Label>
                                <p className="font-semibold">{order.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Package className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <Label className="text-muted-foreground">Service</Label>
                                <p className="font-semibold">{order.service} (x{order.quantity || 1})</p>
                                {order.repaint && <p className="text-sm text-muted-foreground">+ Repaint</p>}
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <PoundSterling className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <Label className="text-muted-foreground">Total</Label>
                                <p className="font-semibold">£{order.totalCost?.toFixed(2)}</p>
                            </div>
                        </div>
                         {order.deliveryMethod === 'collection' && (
                            <div className="flex items-start gap-4">
                                <User className="h-5 w-5 text-primary mt-1" />
                                <div>
                                    <Label className="text-muted-foreground">Collection Address</Label>
                                    <p className="font-semibold">{order.pickupAddress}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   <Button
                    variant={order.status === "Pending" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("Pending")}
                    className="w-full justify-start bg-yellow-500/20 border-yellow-500 text-yellow-600 hover:bg-yellow-500/30 dark:text-yellow-400"
                  >
                    Pending
                  </Button>
                  <Button
                    variant={order.status === "In Progress" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("In Progress")}
                     className="w-full justify-start bg-blue-500/20 border-blue-500 text-blue-600 hover:bg-blue-500/30 dark:text-blue-400"
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={order.status === "Completed" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("Completed")}
                     className="w-full justify-start bg-green-500/20 border-green-500 text-green-600 hover:bg-green-500/30 dark:text-green-400"
                  >
                    Completed
                  </Button>
                  <Button
                    variant={order.status === "Cancelled" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("Cancelled")}
                    className="w-full justify-start bg-red-500/20 border-red-500 text-red-600 hover:bg-red-500/30 dark:text-red-400"
                  >
                    Cancelled
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add internal notes for this order..."
                        className="min-h-[120px]"
                    />
                    <Button onClick={handleSaveNotes} className="mt-4 w-full">
                        <Edit className="h-4 w-4 mr-2"/>
                        Save Notes
                    </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
