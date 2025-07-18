
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from 'next/navigation';
import { db } from "@/lib/firebase"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import { Header } from "@/components/Header"
import { useToast } from "@/hooks/use-toast"
import { addAvailability, getAvailability, removeAvailability } from "@/lib/availability";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, addDays, eachDayOfInterval } from "date-fns";
import type { Order } from "@/lib/types";

// A custom hook to check for screen size
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [breakpoint]);

    return isMobile;
};

// We will create dedicated components for mobile and desktop views
import { AdminDesktopView } from "@/components/admin/AdminDesktopView";
import { AdminMobileView } from "@/components/admin/AdminMobileView";

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

  const isMobile = useIsMobile();

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
        quantity: doc.data().quantity,
        createdAt: doc.data().createdAt?.toDate()
      }));
      setOrders(ordersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching orders: ", error);
      setIsLoading(false);
      toast({ variant: 'destructive', title: "Error", description: "Could not fetch orders." });
    });

    return () => unsubscribe();
  }, [toast]);

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
      .filter((order: Order) => order.status === 'Pending' || order.status === 'In Progress')
      .sort((a: Order, b: Order) => {
        try {
          const dateA = a.date ? parseISO(a.date).getTime() : Number.MAX_SAFE_INTEGER;
          const dateB = b.date ? parseISO(b.date).getTime() : Number.MAX_SAFE_INTEGER;
          return dateA - dateB;
        } catch (e) {
          return 0;
        }
      })
      .slice(0, 5);
  }, [orders]);

  const projectionChartData = useMemo(() => {
    const days = projectionPeriod === '7d' ? 7 : projectionPeriod === '30d' ? 30 : 90;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = addDays(today, days - 1);

    const dailyProjections = new Map<string, number>();

     orders.forEach((order: Order) => {
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

  const commonProps = {
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
      setAvailableSlots,
      newTime,
      setNewTime,
      filteredAndSortedOrders,
      priorityOrders,
      projectionChartData,
      handleAddTime,
      handleRemoveTime,
  };

  // This is a placeholder for auth check
  const isAdmin = true;
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
       {isMobile ? <AdminMobileView {...commonProps} /> : <AdminDesktopView {...commonProps} />}
    </div>
  );
}
