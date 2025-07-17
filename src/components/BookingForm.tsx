
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { services, availableSlotsByDate } from '@/lib/services';
import type { Service } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check as CheckIcon, CalendarIcon, Clock, Minus, Plus, User, Mail, StickyNote, CreditCard, Sparkles, MapPin, Truck, Package } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


const repaintCost = 20;

const bookingSchema = z.object({
  serviceId: z.string({ required_error: 'Please select a service.' }),
  quantity: z.number().min(1, 'Quantity must be at least 1.'),
  repaint: z.boolean().default(false),
  deliveryMethod: z.enum(['collection', 'dropoff'], { required_error: 'Please select a delivery method.' }),
  bookingDate: z.date({ required_error: 'Please select a date.' }),
  bookingTime: z.string({ required_error: 'Please select a time.' }),
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  pickupAddress: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
    if (data.deliveryMethod === 'collection') {
        return !!data.pickupAddress && data.pickupAddress.length >= 10;
    }
    return true;
}, {
    message: 'Please enter a valid pickup address.',
    path: ['pickupAddress'],
});


type BookingFormValues = z.infer<typeof bookingSchema>;

const steps = [
  { id: 'service', title: 'Select Service' },
  { id: 'delivery', title: 'Delivery Method' },
  { id: 'schedule', title: 'Schedule' },
  { id: 'details', title: 'Your Details' },
  { id: 'confirm', title: 'Confirmation' },
];

export function BookingForm() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: 'standard',
      quantity: 1,
      repaint: false,
    },
  });

  const { watch, setValue, getValues, trigger } = form;
  const watchedValues = watch();

  const selectedService = services.find(s => s.id === watchedValues.serviceId);
  const subtotal = selectedService ? selectedService.price * watchedValues.quantity : 0;
  const repaintTotal = watchedValues.repaint ? repaintCost * watchedValues.quantity : 0;
  const totalCost = subtotal + repaintTotal;

  const handleNext = async () => {
    let fieldsToValidate: (keyof BookingFormValues)[] = [];
    if (currentStep === 0) fieldsToValidate = ['serviceId', 'quantity'];
    if (currentStep === 1) fieldsToValidate = ['deliveryMethod'];
    if (currentStep === 2) fieldsToValidate = ['bookingDate', 'bookingTime'];
    if (currentStep === 3) fieldsToValidate = ['fullName', 'email', 'pickupAddress'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(s => s + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    try {
      const orderData = {
        ...data,
        bookingDate: format(data.bookingDate, 'yyyy-MM-dd'),
        totalCost,
        status: 'Pending',
        serviceName: selectedService?.name,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'orders'), orderData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'There was a problem confirming your booking. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTimes = watchedValues.bookingDate
    ? availableSlotsByDate[format(watchedValues.bookingDate, 'yyyy-MM-dd')] || []
    : [];
  
  if (isSubmitted) {
    return (
      <Card className="gradient-border-bg">
        <div className="relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckIcon className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-headline">Booking Confirmed!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Thank you, {getValues('fullName')}! Your booking is complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-2">A confirmation email has been sent to <span className="font-semibold text-primary">{getValues('email')}</span>.</p>
            <p className="text-muted-foreground">We'll see you on {format(getValues('bookingDate'), 'PPP')} at {getValues('bookingTime')}.</p>
            <Button onClick={() => window.location.reload()} className="mt-8">Book Another Service</Button>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="gradient-border-bg">
            <div className="relative z-10">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-primary">{`Step ${currentStep + 1} of ${steps.length}`}</p>
                  <p className="text-sm text-muted-foreground">{steps[currentStep]?.title}</p>
                </div>
                <div className="flex w-full gap-2">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={cn(
                        "h-1 rounded-full w-full bg-secondary",
                        index <= currentStep && "bg-primary"
                      )}
                    />
                  ))}
                </div>
              </CardHeader>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="min-h-[420px]">
                    {currentStep === 0 && (
                      <div className="space-y-8">
                        <div>
                          <Label className="text-lg font-semibold mb-4 block">Select Wash Type</Label>
                          <FormField
                              control={form.control}
                              name="serviceId"
                              render={({ field }) => (
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {services.map(service => (
                                      <Label key={service.id} htmlFor={service.id} className={cn(
                                          "block rounded-lg border p-4 cursor-pointer transition-all",
                                          field.value === service.id ? 'border-primary bg-primary/10 shadow-lg' : 'border-border hover:border-primary/50'
                                      )}>
                                      <RadioGroupItem value={service.id} id={service.id} className="sr-only" />
                                      <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                                      <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                                      <p className="font-bold text-xl text-white">£{service.price}</p>
                                      </Label>
                                  ))}
                                  </RadioGroup>
                              )}
                              />
                        </div>

                        <div className="grid grid-cols-2 gap-8 items-center">
                          <div>
                              <Label htmlFor="quantity" className="text-lg font-semibold mb-2 block">Quantity</Label>
                              <div className="flex items-center gap-4">
                                  <Button type="button" variant="outline" size="icon" onClick={() => setValue('quantity', Math.max(1, watchedValues.quantity - 1))}><Minus className="h-4 w-4" /></Button>
                                  <Input id="quantity" type="number" className="w-20 text-center text-lg font-bold" {...form.register('quantity', { valueAsNumber: true })} />
                                  <Button type="button" variant="outline" size="icon" onClick={() => setValue('quantity', watchedValues.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                              </div>
                          </div>
                          <FormField
                              control={form.control}
                              name="repaint"
                              render={({ field }) => (
                                  <FormItem className="flex items-center space-x-3 space-y-0 p-4 rounded-lg border border-border bg-secondary/50">
                                      <FormControl>
                                          <Checkbox checked={field.value} onCheckedChange={field.onChange} id="repaint" />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                          <FormLabel htmlFor="repaint" className="text-lg font-semibold">Add Repaint?</FormLabel>
                                          <FormDescription>+£{repaintCost} per pair</FormDescription>
                                      </div>
                                  </FormItem>
                              )}
                          />
                        </div>
                      </div>
                    )}
                    
                    {currentStep === 1 && (
                       <div>
                          <Label className="text-lg font-semibold mb-4 block">How will you get your sneakers to us?</Label>
                           <FormField
                              control={form.control}
                              name="deliveryMethod"
                              render={({ field }) => (
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Label htmlFor="collection" className={cn(
                                          "flex flex-col items-center justify-center rounded-lg border p-6 cursor-pointer transition-all h-48",
                                          field.value === "collection" ? 'border-primary bg-primary/10 shadow-lg' : 'border-border hover:border-primary/50'
                                      )}>
                                          <RadioGroupItem value="collection" id="collection" className="sr-only" />
                                          <Truck className="w-10 h-10 mb-4 text-primary"/>
                                          <h3 className="font-bold text-lg mb-1">We Collect</h3>
                                          <p className="text-sm text-muted-foreground text-center">Free courier collection from your address.</p>
                                      </Label>
                                       <Label htmlFor="dropoff" className={cn(
                                          "flex flex-col items-center justify-center rounded-lg border p-6 cursor-pointer transition-all h-48",
                                          field.value === "dropoff" ? 'border-primary bg-primary/10 shadow-lg' : 'border-border hover:border-primary/50'
                                      )}>
                                          <RadioGroupItem value="dropoff" id="dropoff" className="sr-only" />
                                          <Package className="w-10 h-10 mb-4 text-primary"/>
                                          <h3 className="font-bold text-lg mb-1">You Drop Off</h3>
                                          <p className="text-sm text-muted-foreground text-center">Drop your sneakers at our workshop.</p>
                                      </Label>
                                  </RadioGroup>
                              )}
                            />
                       </div>
                    )}

                    {currentStep === 2 && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4">
                        <div>
                          <Label className="text-lg font-semibold mb-4 block">Select Date</Label>
                          <FormField
                            control={form.control}
                            name="bookingDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                        field.onChange(date)
                                        setValue('bookingTime', ''); // Reset time when date changes
                                    }}
                                    disabled={(date) => !availableSlotsByDate[format(date, 'yyyy-MM-dd')]}
                                    initialFocus
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex flex-col mt-8 md:mt-0">
                          <Label className="text-lg font-semibold mb-4 block">Select Time Slot</Label>
                          {watchedValues.bookingDate ? (
                            <>
                              {availableTimes.length > 0 ? (
                                <FormField
                                control={form.control}
                                name="bookingTime"
                                render={({ field }) => (
                                  <FormItem>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2">
                                      {availableTimes.map((time) => (
                                        <FormItem key={time} className="flex-1">
                                          <FormControl>
                                            <RadioGroupItem value={time} id={time} className="sr-only peer" />
                                          </FormControl>
                                          <Label
                                            htmlFor={time}
                                            className="block text-center p-4 rounded-md border border-input peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer"
                                          >
                                            {time}
                                          </Label>
                                        </FormItem>
                                      ))}
                                    </RadioGroup>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/50 rounded-md p-4 text-center">
                                  <p>No slots available for this date.</p>
                                </div>
                              )}
                            </>
                          ) : (
                             <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/50 rounded-md p-8 text-center md:min-h-[290px]">
                                <p>Please select a date first.</p>
                              </div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-4">
                          <FormField control={form.control} name="fullName" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-lg">Full Name</FormLabel>
                                  <FormControl>
                                      <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField control={form.control} name="email" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-lg">Email Address</FormLabel>
                                  <FormControl>
                                      <Input type="email" placeholder="you@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                           {watchedValues.deliveryMethod === 'collection' && (
                            <FormField control={form.control} name="pickupAddress" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Pickup Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="123 Example Street, London, SW1A 0AA" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                           )}
                          <FormField control={form.control} name="notes" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-lg">Additional Notes (Optional)</FormLabel>
                                  <FormControl>
                                      <Textarea placeholder="e.g. specific stains, areas to focus on" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                      </div>
                    )}
                    {currentStep === 4 && (
                      <div>
                          <h3 className="text-2xl font-headline font-bold mb-6">Confirm Your Booking</h3>
                          <div className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
                              <div className="flex justify-between">
                                  <span className="text-muted-foreground">Service</span>
                                  <span className="font-semibold text-white">{selectedService?.name} x {watchedValues.quantity}</span>
                              </div>
                              {watchedValues.repaint && (
                                  <div className="flex justify-between">
                                      <span className="text-muted-foreground">Repaint</span>
                                      <span className="font-semibold text-white">Yes x {watchedValues.quantity}</span>
                                  </div>
                              )}
                              <div className="flex justify-between">
                                  <span className="text-muted-foreground">{watchedValues.deliveryMethod === 'collection' ? 'Collection' : 'Drop-off'} Time</span>
                                  <span className="font-semibold text-white text-right">{format(watchedValues.bookingDate, 'E, d MMM yyyy')} at {watchedValues.bookingTime}</span>
                              </div>
                               {watchedValues.deliveryMethod === 'collection' && watchedValues.pickupAddress && (
                                <div className="flex justify-between items-start">
                                  <span className="text-muted-foreground">Address</span>
                                  <span className="font-semibold text-white text-right max-w-[70%]">{watchedValues.pickupAddress}</span>
                                </div>
                               )}
                              <div className="flex justify-between">
                                  <span className="text-muted-foreground">Contact</span>
                                  <span className="font-semibold text-white text-right">{watchedValues.email}</span>
                              </div>
                              <div className="border-t border-border my-4"></div>
                              <div className="flex justify-between text-xl">
                                  <span className="text-muted-foreground">Total</span>
                                  <span className="font-bold text-primary">£{totalCost.toFixed(2)}</span>
                              </div>
                          </div>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              </AnimatePresence>

              <CardFooter className="flex justify-between items-center border-t border-border pt-6">
                  <div>
                    {currentStep > 0 && (
                      <Button type="button" variant="ghost" onClick={handlePrev} className="text-muted-foreground flex-col h-auto" disabled={isSubmitting}>
                        <ArrowLeft className="h-5 w-5 mb-1" />
                        <span className="text-xs">Back</span>
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold text-white">£{totalCost.toFixed(2)}</p>
                      </div>
                      {currentStep < steps.length -1 ? (
                          <Button type="button" onClick={handleNext} size="lg" className="flex">
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                      ) : (
                          <Button type="submit" size="lg" disabled={isSubmitting} className="flex">
                            {isSubmitting ? (
                              <span>Confirming...</span>
                            ) : (
                              <>
                                <span>Pay & Confirm</span>
                                <CreditCard className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                      )}
                  </div>
              </CardFooter>
            </div>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
}
