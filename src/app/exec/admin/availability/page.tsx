
"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { CalendarDays, Plus, Trash2, ArrowLeft } from "lucide-react"
import { format } from "date-fns";
import { getAvailability, addAvailability, removeAvailability } from "@/lib/availability"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/Header";

export default function AvailabilityPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [newTime, setNewTime] = useState('');

    useEffect(() => {
        if (selectedDate) {
            const dateString = format(selectedDate, 'yyyy-MM-dd');
            getAvailability(dateString).then(slots => {
                setAvailableSlots(slots);
            });
        }
    }, [selectedDate]);

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

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-xl mx-auto">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
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
                        <CardContent className="flex flex-col items-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border"
                            />
                            <div className="w-full mt-4">
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
                                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto styled-scrollbar p-1">
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
            </main>
        </div>
    )
}


    