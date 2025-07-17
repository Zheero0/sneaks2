import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Order } from '@/lib/types';
import { DollarSign, Package, Users } from 'lucide-react';

// Mock data, in a real app this would be fetched from Firestore
const orders: Order[] = [
    { id: 'ORD001', customerName: 'Alice Johnson', service: 'Standard Wash', date: '2024-07-20', status: 'Completed', userEmail: 'alice@example.com' },
    { id: 'ORD002', customerName: 'Bob Williams', service: 'Express Wash', date: '2024-07-21', status: 'In Progress', userEmail: 'bob@example.com' },
    { id: 'ORD003', customerName: 'Charlie Brown', service: 'Same-Day VIP', date: '2024-07-21', status: 'Pending', userEmail: 'charlie@example.com' },
    { id: 'ORD004', customerName: 'Diana Prince', service: 'Standard Wash', date: '2024-07-22', status: 'Pending', userEmail: 'diana@example.com' },
    { id: 'ORD005', customerName: 'Ethan Hunt', service: 'Standard Wash', date: '2024-07-19', status: 'Completed', userEmail: 'ethan@example.com' },
    { id: 'ORD006', customerName: 'Fiona Glenanne', service: 'Express Wash', date: '2024-07-22', status: 'Cancelled', userEmail: 'fiona@example.com' },
];

const getStatusVariant = (status: Order['status']) => {
    switch (status) {
        case 'Pending': return 'default';
        case 'In Progress': return 'secondary';
        case 'Completed': return 'outline';
        case 'Cancelled': return 'destructive';
    }
}

export default function AdminPage() {
    // This is a placeholder for auth check
    const isAdmin = true;

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>You are not authorized to view this page.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary">
            <Header />
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-headline font-bold mb-6">Admin Dashboard</h1>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$4,294.50</div>
                                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+2</div>
                                <p className="text-xs text-muted-foreground">Pending and In Progress</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+12</div>
                                <p className="text-xs text-muted-foreground">+5 since last week</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                            <CardDescription>A list of the most recent wash orders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.id}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{order.customerName}</div>
                                                <div className="text-sm text-muted-foreground">{order.userEmail}</div>
                                            </TableCell>
                                            <TableCell>{order.service}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{order.date}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
