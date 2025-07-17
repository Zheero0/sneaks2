'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Droplets } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle Firebase auth here.
    // For this demo, we'll just redirect to admin for a specific user.
    const email = (e.currentTarget.querySelector('#email') as HTMLInputElement).value;
    if (email === 'admin@sneakswash.com') {
      router.push('/exec/admin');
    } else {
      // Non-admin users are redirected to the homepage
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="mb-8 flex items-center space-x-2 text-primary">
          <Droplets className="h-8 w-8" />
          <span className="text-2xl font-bold font-headline">SneaksWash</span>
      </div>
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
            <CardDescription>Enter your admin credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@sneakswash.com" required defaultValue="admin@sneakswash.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
             <CardDescription className="text-xs pt-2">
              <strong>Demo:</strong> Use `admin@sneakswash.com` and any password to access the admin dashboard. Any other email will redirect to the homepage.
            </CardDescription>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full font-bold" type="submit">Login</Button>
            <p className="text-xs text-center text-muted-foreground">
              <Link href="/" className="underline text-primary hover:text-primary/80">
                Return to Homepage
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
