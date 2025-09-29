'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, FileText, Loader2, Users, Instagram, Video, MessageCircle, Youtube } from 'lucide-react';

interface Post {
    id: string;
    content: string;
    publishDate: string;
    releaseURL?: string;
    state: string;
    tags: string[];
    integration: {
        id: string;
        providerIdentifier: string;
        name: string;
        picture: string;
    };
    submittedForOrganizationId?: string;
    submittedForOrderId?: string;
    intervalInDays?: number;
    group?: string;
}

interface Integration {
    id: string;
    name: string;
    identifier: string;
    picture: string;
    disabled: boolean;
    profile: string;
    customer?: {
        id: string;
        name: string;
    };
}

export default function Calendar() {
    return <div>Calendar</div>;
    // const [startDate, setStartDate] = useState('');
    // const [endDate, setEndDate] = useState('');
    // const [posts, setPosts] = useState<Post[]>([]);
    // const [integrations, setIntegrations] = useState<Integration[]>([]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState('');
    // const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
    // const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

    // // Set default dates to today and auto-fetch posts and integrations
    // useEffect(() => {
    //     const today = new Date();
    //     const todayStr = today.toISOString().split('T')[0];
    //     setStartDate(todayStr);
    //     setEndDate(todayStr);

    //     // Auto-fetch posts and integrations for today
    //     fetchPostsForDate(todayStr, todayStr);
    //     fetchIntegrations();
    // }, []);

    // const fetchIntegrations = async () => {
    //     try {
    //         const response = await fetch('/api/posting/postiz/integrations');

    //         if (!response.ok) {
    //             const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    //             console.error('Integrations API Error:', errorData);
    //             throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || errorData.details || 'Unknown error'}`);
    //         }

    //         const data = await response.json();
    //         console.log('Integrations data received:', data);
    //         setIntegrations(Array.isArray(data) ? data : []);
    //     } catch (err) {
    //         console.error('Error fetching integrations:', err);
    //         // Don't set error state for integrations, just log it
    //     }
    // };

    // const fetchPostsForDate = async (start: string, end: string) => {
    //     setLoading(true);
    //     setError('');

    //     try {
    //         // Convert dates to UTC format
    //         const startUTC = new Date(start + 'T00:00:00Z').toISOString();
    //         const endUTC = new Date(end + 'T23:59:59Z').toISOString();

    //         const response = await fetch(`/api/posts?startDate=${encodeURIComponent(startUTC)}&endDate=${encodeURIComponent(endUTC)}`);

    //         if (!response.ok) {
    //             const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    //             console.error('API Error:', errorData);
    //             throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || errorData.details || 'Unknown error'}`);
    //         }

    //         const data = await response.json();
    //         console.log('Posts data received:', data);
    //         setPosts(Array.isArray(data) ? data : data.posts || []);
    //     } catch (err) {
    //         console.error('Error fetching posts:', err);
    //         setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    //         setPosts([]);

    //         // Show helpful message for common issues
    //         if (err instanceof Error && err.message.includes('500')) {
    //             setError('Серверна помилка. Перевірте налаштування API або спробуйте пізніше.');
    //         } else if (err instanceof Error && err.message.includes('429')) {
    //             setError('Занадто багато запитів до API. Зачекайте кілька хвилин і спробуйте знову.');
    //         }
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const handleDateChange = (type: 'start' | 'end', value: string) => {
    //     if (type === 'start') {
    //         setStartDate(value);
    //     } else {
    //         setEndDate(value);
    //     }
    // };

    // const fetchPosts = async () => {
    //     if (!startDate || !endDate) {
    //         setError('Please select both start and end dates');
    //         return;
    //     }

    //     await fetchPostsForDate(startDate, endDate);
    // };

    // const formatDate = (dateString: string) => {
    //     return new Date(dateString).toLocaleDateString('uk-UA', {
    //         year: 'numeric',
    //         month: 'long',
    //         day: 'numeric',
    //         hour: '2-digit',
    //         minute: '2-digit'
    //     });
    // };

    // const getStatusColor = (state: string | undefined) => {
    //     if (!state) {
    //         return 'text-gray-600 bg-gray-100';
    //     }

    //     switch (state.toLowerCase()) {
    //         case 'published':
    //             return 'text-green-600 bg-green-100';
    //         case 'scheduled':
    //             return 'text-blue-600 bg-blue-100';
    //         case 'draft':
    //             return 'text-gray-600 bg-gray-100';
    //         case 'failed':
    //             return 'text-red-600 bg-red-100';
    //         case 'pending':
    //             return 'text-yellow-600 bg-yellow-100';
    //         default:
    //             return 'text-gray-600 bg-gray-100';
    //     }
    // };

    // const getCustomerForPost = (post: Post) => {
    //     const integration = integrations.find(int => int.id === post.integration.id);
    //     return integration?.customer;
    // };

    // const getSocialMediaIcon = (providerIdentifier: string) => {
    //     switch (providerIdentifier.toLowerCase()) {
    //         case 'instagram':
    //             return <Instagram className="h-4 w-4 text-pink-600" />;
    //         case 'tiktok':
    //             return <Video className="h-4 w-4 text-black" />;
    //         case 'facebook':
    //             return <MessageCircle className="h-4 w-4 text-blue-600" />;
    //         case 'youtube':
    //             return <Youtube className="h-4 w-4 text-red-600" />;
    //         default:
    //             return <MessageCircle className="h-4 w-4 text-gray-500" />;
    //     }
    // };

    // const getUniqueCustomers = () => {
    //     const customers = new Map();
    //     posts.forEach(post => {
    //         const customer = getCustomerForPost(post);
    //         if (customer) {
    //             customers.set(customer.id, customer);
    //         }
    //     });
    //     return Array.from(customers.values());
    // };

    // const getUniquePlatforms = () => {
    //     const platforms = new Set<string>();
    //     posts.forEach(post => {
    //         if (post.integration?.providerIdentifier) {
    //             platforms.add(post.integration.providerIdentifier);
    //         }
    //     });
    //     return Array.from(platforms);
    // };

    // const getFilteredPosts = () => {
    //     let filteredPosts = [...posts];

    //     // Filter by customer (напрямок)
    //     if (selectedCustomer !== 'all') {
    //         filteredPosts = filteredPosts.filter(post => {
    //             const customer = getCustomerForPost(post);
    //             return customer?.id === selectedCustomer;
    //         });
    //     }

    //     // Filter by platform (соцмережа)
    //     if (selectedPlatform !== 'all') {
    //         filteredPosts = filteredPosts.filter(post => {
    //             return post.integration?.providerIdentifier === selectedPlatform;
    //         });
    //     }

    //     return filteredPosts;
    // };

    // return (
    //     <div className="container mx-auto p-6 space-y-6">
    //         <div className="flex items-center justify-between">
    //             <h1 className="text-3xl font-bold">Календар постів</h1>
    //             <CalendarIcon className="h-8 w-8 text-blue-600" />
    //         </div>

    //         {/* Date Selection */}
    //         <Card>
    //             <CardHeader>
    //                 <CardTitle>Вибрати період</CardTitle>
    //             </CardHeader>
    //             <CardContent>
    //                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
    //                     <div className="space-y-2">
    //                         <Label htmlFor="startDate">Дата початку</Label>
    //                         <Input
    //                             id="startDate"
    //                             type="date"
    //                             value={startDate}
    //                             onChange={(e) => handleDateChange('start', e.target.value)}
    //                         />
    //                     </div>
    //                     <div className="space-y-2">
    //                         <Label htmlFor="endDate">Дата закінчення</Label>
    //                         <Input
    //                             id="endDate"
    //                             type="date"
    //                             value={endDate}
    //                             onChange={(e) => handleDateChange('end', e.target.value)}
    //                         />
    //                     </div>
    //                     <div>
    //                         <Button
    //                             onClick={fetchPosts}
    //                             disabled={loading}
    //                             className="w-full"
    //                         >
    //                             {loading ? (
    //                                 <>
    //                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    //                                     Завантаження...
    //                                 </>
    //                             ) : (
    //                                 <>
    //                                     <FileText className="mr-2 h-4 w-4" />
    //                                     Отримати пости
    //                                 </>
    //                             )}
    //                         </Button>
    //                     </div>
    //                 </div>
    //             </CardContent>
    //         </Card>

    //         {/* Filters */}
    //         {posts.length > 0 && (
    //             <Card>
    //                 <CardContent className="pt-6">
    //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //                         {/* Customer Filter */}
    //                         <div className="space-y-2">
    //                             <Label htmlFor="customerFilter" className="text-sm font-medium">
    //                                 Напрямок (клієнт)
    //                             </Label>
    //                             <select
    //                                 id="customerFilter"
    //                                 value={selectedCustomer}
    //                                 onChange={(e) => setSelectedCustomer(e.target.value)}
    //                                 className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    //                             >
    //                                 <option value="all">Всі напрямки</option>
    //                                 {getUniqueCustomers().map((customer) => (
    //                                     <option key={customer.id} value={customer.id}>
    //                                         {customer.name}
    //                                     </option>
    //                                 ))}
    //                             </select>
    //                         </div>

    //                         {/* Platform Filter */}
    //                         <div className="space-y-2">
    //                             <Label htmlFor="platformFilter" className="text-sm font-medium">
    //                                 Соцмережа
    //                             </Label>
    //                             <select
    //                                 id="platformFilter"
    //                                 value={selectedPlatform}
    //                                 onChange={(e) => setSelectedPlatform(e.target.value)}
    //                                 className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    //                             >
    //                                 <option value="all">Всі соцмережі</option>
    //                                 {getUniquePlatforms().map((platform) => (
    //                                     <option key={platform} value={platform}>
    //                                         {platform.charAt(0).toUpperCase() + platform.slice(1)}
    //                                     </option>
    //                                 ))}
    //                             </select>
    //                         </div>
    //                     </div>
    //                 </CardContent>
    //             </Card>
    //         )}

    //         {/* Error Message */}
    //         {error && (
    //             <Card className="border-red-200 bg-red-50">
    //                 <CardContent className="pt-6">
    //                     <div className="flex items-center justify-between">
    //                         <p className="text-red-600">{error}</p>
    //                         {error.includes('429') && (
    //                             <Button
    //                                 variant="outline"
    //                                 size="sm"
    //                                 onClick={() => {
    //                                     if (startDate && endDate) {
    //                                         fetchPostsForDate(startDate, endDate);
    //                                     }
    //                                 }}
    //                                 className="ml-4"
    //                             >
    //                                 Спробувати знову
    //                             </Button>
    //                         )}
    //                     </div>
    //                 </CardContent>
    //             </Card>
    //         )}

    //         {/* Posts List */}
    //         {posts.length > 0 && (
    //             <Card>
    //                 <CardHeader className="pb-3">
    //                     <CardTitle className="text-lg flex items-center gap-2">
    //                         <FileText className="h-4 w-4" />
    //                         {getFilteredPosts().length} з {posts.length} постів
    //                     </CardTitle>
    //                 </CardHeader>
    //                 <CardContent>
    //                     <div className="space-y-0">
    //                         {getFilteredPosts().map((post) => {
    //                             const customer = getCustomerForPost(post);
    //                             return (
    //                                 <div
    //                                     key={post.id}
    //                                     className="border-b border-gray-100 py-3 hover:bg-gray-50 hover:shadow-sm px-2 rounded cursor-pointer transition-all duration-200"
    //                                     onClick={() => {
    //                                         if (post.releaseURL) {
    //                                             window.open(post.releaseURL, '_blank', 'noopener,noreferrer');
    //                                         }
    //                                     }}
    //                                 >
    //                                     <div className="flex items-start gap-3">
    //                                         {/* Platform Avatar */}
    //                                         <div className="flex-shrink-0 relative">
    //                                             {post.integration?.picture ? (
    //                                                 <img
    //                                                     src={post.integration.picture}
    //                                                     alt={post.integration.name}
    //                                                     className="w-8 h-8 rounded-full object-cover"
    //                                                 />
    //                                             ) : (
    //                                                 <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
    //                                                     <span className="text-xs font-medium text-gray-500">
    //                                                         {post.integration?.providerIdentifier?.charAt(0).toUpperCase() || '?'}
    //                                                     </span>
    //                                                 </div>
    //                                             )}
    //                                             {/* Social Media Icon Badge */}
    //                                             {post.integration?.providerIdentifier && (
    //                                                 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
    //                                                     {getSocialMediaIcon(post.integration.providerIdentifier)}
    //                                                 </div>
    //                                             )}
    //                                         </div>

    //                                         {/* Content */}
    //                                         <div className="flex-1 min-w-0">
    //                                             <div className="flex items-center justify-between mb-1">
    //                                                 <div className="flex items-center gap-2">
    //                                                     <span className="text-sm font-medium text-gray-900">
    //                                                         {post.integration?.name || 'Unknown Platform'}
    //                                                     </span>
    //                                                     {customer && (
    //                                                         <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded flex items-center gap-1">
    //                                                             <Users className="h-3 w-3" />
    //                                                             {customer.name}
    //                                                         </span>
    //                                                     )}
    //                                                 </div>
    //                                                 <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(post.state)}`}>
    //                                                     {post.state || 'Unknown'}
    //                                                 </span>
    //                                             </div>

    //                                             <p className="text-sm text-gray-700 line-clamp-2 mb-2">{post.content}</p>

    //                                             <div className="flex items-center gap-3 text-xs text-gray-500">
    //                                                 <div className="flex items-center gap-1">
    //                                                     <Clock className="h-3 w-3" />
    //                                                     {formatDate(post.publishDate)}
    //                                                 </div>
    //                                                 {post.tags && post.tags.length > 0 && (
    //                                                     <div className="flex items-center gap-1">
    //                                                         <span>•</span>
    //                                                         <span>{post.tags.length} тегів</span>
    //                                                     </div>
    //                                                 )}
    //                                             </div>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             );
    //                         })}
    //                     </div>
    //                 </CardContent>
    //             </Card>
    //         )}

    //         {/* Loading State for Initial Load */}
    //         {loading && posts.length === 0 && (
    //             <Card>
    //                 <CardContent className="pt-6 text-center">
    //                     <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
    //                     <p className="text-gray-500">Завантаження постів...</p>
    //                 </CardContent>
    //             </Card>
    //         )}

    //         {/* No Posts Message */}
    //         {!loading && posts.length === 0 && startDate && endDate && (
    //             <Card>
    //                 <CardContent className="pt-6 text-center">
    //                     <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    //                     <p className="text-gray-500">Постів за вибраний період не знайдено</p>
    //                 </CardContent>
    //             </Card>
    //         )}
    //     </div>
    // );
}