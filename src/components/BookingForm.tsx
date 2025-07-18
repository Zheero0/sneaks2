
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { services } from '@/lib/services';
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
import { ArrowRight, ArrowLeft, Check as CheckIcon, Phone, Mail, StickyNote, CreditCard, Sparkles, MapPin, Truck, Package, Loader2, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getAvailability, getAvailableDates, removeAvailability } from '@/lib/availability';

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
  phoneNumber: z.string().optional(),
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
  { id: 'confirm', title: 'Confirmation & Payment' },
];

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in the environment variables.');
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ onPaymentSuccess }: { onPaymentSuccess: (orderId: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/book`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message || 'There was a problem processing your payment.',
      });
      setIsSubmitting(false);
    } else {
      onPaymentSuccess('stripe-succeeded'); 
    }
  };

  return (
    <div id="payment-form">
      <PaymentElement />
      <Button
        type="button"
        onClick={handleSubmit}
        size="lg"
        disabled={!stripe || isSubmitting}
        className="w-full mt-6"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <span>Pay & Confirm</span>
            <CreditCard className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  )
}

function BookingFormContents() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  
  const [availableDates, setAvailableDates] = React.useState<Date[]>([]);
  const [availableTimes, setAvailableTimes] = React.useState<string[]>([]);

  React.useEffect(() => {
    getAvailableDates().then(dates => {
      setAvailableDates(dates);
    });
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: 'standard',
      quantity: 1,
      repaint: false,
      pickupAddress: '',
      notes: '',
      fullName: '',
      email: '',
      phoneNumber: '',
    },
  });

  const { watch, setValue, getValues, trigger } = form;
  const watchedValues = watch();

  const selectedService = services.find(s => s.id === watchedValues.serviceId);
  const subtotal = selectedService ? selectedService.price * watchedValues.quantity : 0;
  const repaintTotal = watchedValues.repaint ? repaintCost * watchedValues.quantity : 0;
  const totalCost = subtotal + repaintTotal;

  React.useEffect(() => {
    if (watchedValues.bookingDate) {
      const dateString = format(watchedValues.bookingDate, 'yyyy-MM-dd');
      getAvailability(dateString).then(slots => {
        setAvailableTimes(slots);
      });
    } else {
      setAvailableTimes([]);
    }
  }, [watchedValues.bookingDate]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: totalCost * 100 }), // amount in cents
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
      return true;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Error',
        description: 'Could not initialize payment. Please try again.',
      });
      return false;
    }
  }

  const handleNext = async () => {
    let fieldsToValidate: (keyof BookingFormValues)[] = [];
    if (currentStep === 0) fieldsToValidate = ['serviceId', 'quantity'];
    if (currentStep === 1) fieldsToValidate = ['deliveryMethod'];
    if (currentStep === 2) fieldsToValidate = ['bookingDate', 'bookingTime'];
    if (currentStep === 3) fieldsToValidate = ['fullName', 'email', 'pickupAddress', 'phoneNumber'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep < steps.length - 1) {
        if (currentStep === steps.length - 2) { // Moving to the final step
            const paymentIntentCreated = await createPaymentIntent();
            if(paymentIntentCreated) {
                setCurrentStep(s => s + 1);
            }
        } else {
            setCurrentStep(s => s + 1);
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      setClientSecret(null); // Clear secret when going back
    }
  };

  const onPaymentSuccess = async (paymentIntentId: string) => {
     try {
      const data = getValues();
      const orderData = {
        ...data,
        bookingDate: format(data.bookingDate, 'yyyy-MM-dd'),
        totalCost,
        status: 'Pending',
        serviceName: selectedService?.name,
        createdAt: serverTimestamp(),
        paymentIntentId,
      };
      await addDoc(collection(db, 'orders'), orderData);
      
      // After successfully creating the order, remove the time slot
      try {
        const dateString = format(data.bookingDate, 'yyyy-MM-dd');
        await removeAvailability(dateString, data.bookingTime);
      } catch (error) {
          console.error("Failed to update availability, but order was created. Please manually remove the slot.", error);
          // Optionally, inform the admin about this failure.
          toast({
            variant: "destructive",
            title: "Availability Warning",
            description: "Order was created, but failed to update availability. Please manually remove the time slot.",
        });
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Your payment was successful, but we failed to save your booking. Please contact support.',
      });
    }
  };
  
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-card/80 backdrop-blur-sm">
          <div className="relative z-10">
            <CardHeader className="text-center">
              <motion.div
                className="mx-auto bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              >
                <CheckIcon className="w-8 h-8" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle className="text-3xl font-headline">Booking Confirmed!</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Thank you, {getValues('fullName')}! Your booking is complete.
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="mb-2">A confirmation email has been sent to <span className="font-semibold text-primary">{getValues('email')}</span>.</p>
                <p className="text-muted-foreground">We'll see you on {format(getValues('bookingDate'), 'PPP')} at {getValues('bookingTime')}.</p>
                <Button onClick={() => window.location.reload()} className="mt-8">Book Another Service</Button>
              </motion.div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#8EACFF',
        colorBackground: '#111111',
        colorText: '#ffffff',
      },
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <div onSubmit={(e) => e.preventDefault()}>
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="bg-card/80 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10">
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
                                      disabled={(date) => {
                                        if (!date) return true;
                                        const dateString = format(date, 'yyyy-MM-dd');
                                        const isDateAvailable = availableDates.some(d => format(d, 'yyyy-MM-dd') === dateString);
                                        const isPast = date.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                                        return !isDateAvailable || isPast;
                                      }}
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
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg">Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg">Phone (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="07123 456789" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                             </div>
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
                            <div className="mt-6">
                              {clientSecret ? (
                                <Elements stripe={stripePromise} options={options}>
                                  <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
                                </Elements>
                              ) : (
                                <div className="flex items-center justify-center h-24">
                                  <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                                  <span className="text-muted-foreground">Initializing payment...</span>
                                </div>
                              )}
                            </div>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                </AnimatePresence>

                <CardFooter className="flex justify-between items-center w-full border-t border-border pt-6">
                    <div>
                      {currentStep > 0 && (
                        <Button type="button" variant="ghost" onClick={handlePrev} className="text-muted-foreground flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back</span>
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
                           null // Payment button is now inside the CheckoutForm
                        )}
                    </div>
                </CardFooter>
              </div>
            </Card>
          </motion.div>
        </div>
      </Form>
    </FormProvider>
  );
}


export function BookingForm() {
  return <BookingFormContents />;
}
