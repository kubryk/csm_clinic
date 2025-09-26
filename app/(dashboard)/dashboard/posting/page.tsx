'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    Upload,
    Image as ImageIcon,
    Video,
    FileText,
    Send,
    Calendar,
    Clock,
    Users,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Music
} from 'lucide-react';
import { getSocialMediaIntegrationsClient } from '@/lib/api/social-media';

interface Customer {
    id: string;
    name: string;
}

interface SocialMediaTarget {
    id: string;
    name: string;
    identifier: string;
    picture: string;
    disabled: boolean;
    profile: string;
    customer?: Customer;
    source: 'postiz' | 'blotato';
    sourceId: string;
}

// Function to get platform icon
const getPlatformIcon = (identifier: string) => {
    const identifierLower = identifier.toLowerCase();

    switch (identifierLower) {
        case 'facebook':
            return <Facebook className="h-4 w-4 text-blue-600" />;
        case 'linkedin':
            return <Linkedin className="h-4 w-4 text-blue-700" />;
        case 'instagram':
            return <Instagram className="h-4 w-4 text-pink-600" />;
        case 'twitter':
        case 'x':
            return <Twitter className="h-4 w-4 text-blue-400" />;
        case 'youtube':
            return <Youtube className="h-4 w-4 text-red-600" />;
        case 'tiktok':
            return <Music className="h-4 w-4 text-black" />;
        default:
            return <Users className="h-4 w-4 text-gray-500" />;
    }
};


const mediaTypes = [
    { value: 'image', label: 'Зображення', icon: <ImageIcon className="h-4 w-4" /> },
    { value: 'video', label: 'Відео', icon: <Video className="h-4 w-4" /> }
];

const scheduleOptions = [
    { value: 'now', label: 'Опублікувати зараз' },
    { value: 'schedule', label: 'Запланувати на пізніше' }
];

export default function PostingPage() {
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const [mediaType, setMediaType] = useState('image');
    const [scheduleType, setScheduleType] = useState('now');
    const [scheduledDate, setScheduledDate] = useState('2024-12-25');
    const [scheduledTime, setScheduledTime] = useState('15:00');
    const [postText, setPostText] = useState('Тестовий пост для перевірки функціональності соціальних мереж. Це демонстраційний контент.');
    const [youtubeDescription, setYoutubeDescription] = useState('Тестовий опис для YouTube відео');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    // API state
    const [socialMediaTargets, setSocialMediaTargets] = useState<SocialMediaTarget[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Collapse state - all directions collapsed by default
    const [collapsedCustomers, setCollapsedCustomers] = useState<Set<string>>(new Set());
    const [isDirectionsCollapsed, setIsDirectionsCollapsed] = useState(false);

    // Submit state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load social media integrations on component mount
    useEffect(() => {
        const loadIntegrations = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getSocialMediaIntegrationsClient();
                setSocialMediaTargets(data.integrations);
                setCategories(data.categories);

                // Set all directions as collapsed by default
                const allDirections = new Set<string>();
                data.integrations.forEach(target => {
                    const directionName = target.customer?.name || 'Без напрямку';
                    allDirections.add(directionName);
                });
                setCollapsedCustomers(allDirections);
            } catch (err) {
                console.error('Failed to load social media integrations:', err);
                setError('Failed to load social media integrations. Please check your API configuration.');
            } finally {
                setIsLoading(false);
            }
        };

        loadIntegrations();
    }, []);

    const handleTargetToggle = (targetId: string) => {
        setSelectedTargets(prev =>
            prev.includes(targetId)
                ? prev.filter(id => id !== targetId)
                : [...prev, targetId]
        );
    };

    const handleCustomerToggle = (customerName: string) => {
        setCollapsedCustomers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(customerName)) {
                newSet.delete(customerName);
            } else {
                newSet.add(customerName);
            }
            return newSet;
        });
    };

    const handleSelectAllInDirection = (customerName: string, targets: SocialMediaTarget[]) => {
        const targetIds = targets.map(target => target.id);
        const allSelected = targetIds.every(id => selectedTargets.includes(id));

        if (allSelected) {
            // Deselect all targets in this direction
            setSelectedTargets(prev => prev.filter(id => !targetIds.includes(id)));
        } else {
            // Select all targets in this direction
            setSelectedTargets(prev => {
                const newSelection = [...prev];
                targetIds.forEach(id => {
                    if (!newSelection.includes(id)) {
                        newSelection.push(id);
                    }
                });
                return newSelection;
            });
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        if (files.length === 0) return;

        // Check if only YouTube targets are selected
        const onlyYouTubeTargets = selectedTargets.length > 0 && selectedTargets.every(targetId => {
            const target = socialMediaTargets.find(t => t.id === targetId);
            return target?.identifier === 'youtube';
        });

        // If only YouTube is selected, only allow videos
        if (onlyYouTubeTargets) {
            const hasNonVideo = files.some(file => !file.type.startsWith('video/'));
            if (hasNonVideo) {
                alert('Для YouTube можна завантажувати тільки відео файли');
                return;
            }
        }

        // Check if we're trying to upload both images and videos
        const hasImages = files.some(file => file.type.startsWith('image/'));
        const hasVideos = files.some(file => file.type.startsWith('video/'));

        if (hasImages && hasVideos) {
            alert('Не можна завантажувати одночасно зображення та відео. Виберіть або зображення, або відео.');
            return;
        }

        // Check if we already have files of different type
        if (uploadedFiles.length > 0) {
            const existingType = uploadedFiles[0].type.startsWith('image/') ? 'image' : 'video';
            const newType = files[0].type.startsWith('image/') ? 'image' : 'video';

            if (existingType !== newType) {
                alert(`Ви вже завантажили ${existingType === 'image' ? 'зображення' : 'відео'}. Не можна змішувати різні типи файлів.`);
                return;
            }
        }

        // Check file size based on media type
        const maxSize = mediaType === 'image' ? 10 * 1024 * 1024 : 400 * 1024 * 1024; // 10MB for images, 400MB for videos
        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            const maxSizeText = mediaType === 'image' ? '10МБ' : '400МБ';
            alert(`Файл занадто великий. Максимальний розмір: ${maxSizeText}`);
            return;
        }

        if (mediaType === 'image') {
            // For images: allow up to 10 files
            const newFiles = [...uploadedFiles, ...files].slice(0, 10);
            setUploadedFiles(newFiles);
        } else if (mediaType === 'video') {
            // For video: only 1 file
            setUploadedFiles([files[0]]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Check if any selected target is YouTube
    const hasYouTubeTarget = selectedTargets.some(targetId => {
        const target = socialMediaTargets.find(t => t.id === targetId);
        return target?.identifier === 'youtube';
    });

    // Check if only YouTube targets are selected
    const onlyYouTubeTargets = selectedTargets.length > 0 && selectedTargets.every(targetId => {
        const target = socialMediaTargets.find(t => t.id === targetId);
        return target?.identifier === 'youtube';
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if we have image files - if so, exclude YouTube targets
        const hasImageFiles = uploadedFiles.some(file => file.type.startsWith('image/'));

        // Filter out YouTube targets if we have image files
        const filteredTargets = hasImageFiles
            ? selectedTargets.filter(targetId => {
                const target = socialMediaTargets.find(t => t.id === targetId);
                return target?.identifier !== 'youtube';
            })
            : selectedTargets;

        const selectedTargetsData = filteredTargets.map(targetId => {
            const target = socialMediaTargets.find(t => t.id === targetId);
            return {
                id: crypto.randomUUID(), // Унікальний ID для кожного таргета
                name: target?.name,
                identifier: target?.identifier,
                profile: target?.profile,
                picture: target?.picture,
                customer: target?.customer,
                source: target?.source,
                sourceId: target?.sourceId
            };
        });

        // Create FormData for file upload
        const formData = new FormData();

        // Check if we still have YouTube targets after filtering
        const hasYouTubeAfterFilter = selectedTargetsData.some(target => target.identifier === 'youtube');

        // Add metadata as JSON string
        const metadata = {
            targets: selectedTargetsData,
            mediaType,
            scheduleType,
            scheduledDate: scheduleType === 'schedule' ? scheduledDate : null,
            scheduledTime: scheduleType === 'schedule' ? scheduledTime : null,
            postText,
            youtubeDescription: hasYouTubeAfterFilter ? youtubeDescription : null
        };

        formData.append('metadata', JSON.stringify(metadata));

        // Add files if uploaded
        uploadedFiles.forEach((file, index) => {
            formData.append(`file_${index}`, file);
        });

        console.log('Target IDs:', selectedTargetsData.map(t => ({ name: t.name, id: t.id })));
        console.log('Posting data:', metadata);
        console.log('Files:', uploadedFiles);

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/posting', {
                method: 'POST',
                body: formData,
                // Add timeout for large files (15 minutes)
                signal: AbortSignal.timeout(15 * 60 * 1000)
            });

            if (response.ok) {
                alert('Пост успішно заплановано!');
                // Reset form
                setSelectedTargets([]);
                setPostText('');
                setYoutubeDescription('');
                setUploadedFiles([]);
                setScheduledDate('');
                setScheduledTime('15:00');
                setScheduleType('now');

                // Clear file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error posting data:', error);
            alert('Помилка при надсиланні поста. Спробуйте ще раз.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
                        <p className="text-gray-600">Завантаження інтеграцій соціальних мереж...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                        >
                            Спробувати знову
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Створити пост</h1>
                <p className="text-gray-600">Опублікувати контент у ваших соціальних мережах</p>

                {/* Social Media Counter */}
                {socialMediaTargets.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-700">Доступні соціальні мережі:</h3>
                            <span className="text-xs text-gray-500">Всього: {socialMediaTargets.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(() => {
                                const platformCounts = socialMediaTargets.reduce((acc, target) => {
                                    const platform = target.identifier;
                                    if (!acc[platform]) {
                                        acc[platform] = { total: 0, postiz: 0, blotato: 0 };
                                    }
                                    acc[platform].total += 1;
                                    acc[platform][target.source] += 1;
                                    return acc;
                                }, {} as Record<string, { total: number; postiz: number; blotato: number }>);

                                return Object.entries(platformCounts).map(([platform, counts]) => (
                                    <div key={platform} className="flex items-center space-x-1 bg-white px-2 py-1 rounded-md border">
                                        {getPlatformIcon(platform)}
                                        <span className="text-xs font-medium text-gray-700 capitalize">{platform}</span>
                                        <span className="text-xs text-gray-500">({counts.total})</span>
                                        <div className="flex space-x-1">
                                            {counts.postiz > 0 && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">P:{counts.postiz}</span>
                                            )}
                                            {counts.blotato > 0 && (
                                                <span className="text-xs bg-green-100 text-green-800 px-1 rounded">B:{counts.blotato}</span>
                                            )}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Social Media Targets Selection */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle
                            className="flex items-center justify-between text-base cursor-pointer hover:bg-gray-50 transition-colors rounded p-1"
                            onClick={() => setIsDirectionsCollapsed(!isDirectionsCollapsed)}
                        >
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>Оберіть напрямки</span>
                                {isDirectionsCollapsed ? (
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        Натисніть для розгортання
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        Натисніть для згортання
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 font-normal">
                                    {selectedTargets.length} обрано
                                </span>
                                {isDirectionsCollapsed ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <ChevronUp className="h-4 w-4 text-gray-500" />
                                )}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!isDirectionsCollapsed && (
                            <div className="space-y-3">
                                {/* Group by Customer */}
                                {(() => {
                                    // Group integrations by direction
                                    const groupedByCustomer = socialMediaTargets.reduce((acc, target) => {
                                        const customerName = target.customer?.name || 'Без напрямку';
                                        if (!acc[customerName]) {
                                            acc[customerName] = [];
                                        }
                                        acc[customerName].push(target);
                                        return acc;
                                    }, {} as Record<string, SocialMediaTarget[]>);

                                    return Object.entries(groupedByCustomer).map(([customerName, targets]) => {
                                        const isCollapsed = collapsedCustomers.has(customerName);
                                        const selectedCount = targets.filter(target => selectedTargets.includes(target.id)).length;
                                        const allSelected = targets.every(target => selectedTargets.includes(target.id));

                                        return (
                                            <div key={customerName} className="border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-between p-3">
                                                    <div
                                                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 transition-colors flex-1 rounded p-1"
                                                        onClick={() => handleCustomerToggle(customerName)}
                                                    >
                                                        {isCollapsed ? (
                                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                                        )}
                                                        <h3 className="text-sm font-medium text-gray-900">{customerName}</h3>
                                                        <span className="text-xs text-gray-500">({targets.length})</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {selectedCount > 0 && (
                                                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                                                {selectedCount} обрано
                                                            </span>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSelectAllInDirection(customerName, targets);
                                                            }}
                                                            className={`text-xs px-2 py-1 h-6 ${allSelected
                                                                ? 'bg-orange-100 text-orange-800 border-orange-300'
                                                                : 'bg-gray-50 text-gray-700 border-gray-300'
                                                                }`}
                                                        >
                                                            {allSelected ? 'Скасувати все' : 'Вибрати все'}
                                                        </Button>
                                                    </div>
                                                </div>
                                                {!isCollapsed && (
                                                    <div className="p-3 pt-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {targets.map((target) => (
                                                                <div
                                                                    key={target.id}
                                                                    className={`p-2 border rounded-md cursor-pointer transition-all ${selectedTargets.includes(target.id)
                                                                        ? 'border-orange-500 bg-orange-50'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleTargetToggle(target.id);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        {getPlatformIcon(target.identifier)}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center space-x-1">
                                                                                <p className="text-sm font-medium text-gray-900 truncate">{target.name}</p>
                                                                                <span className={`text-xs px-1 py-0.5 rounded ${target.source === 'postiz'
                                                                                    ? 'bg-blue-100 text-blue-800'
                                                                                    : 'bg-green-100 text-green-800'
                                                                                    }`}>
                                                                                    {target.source}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-gray-500 truncate">@{target.profile}</p>
                                                                        </div>
                                                                        <div className={`w-2 h-2 rounded-full ${target.disabled ? 'bg-red-400' : 'bg-green-400'}`} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* YouTube Warning */}
                {(() => {
                    const hasImageFiles = uploadedFiles.some(file => file.type.startsWith('image/'));
                    const hasYouTubeTargets = selectedTargets.some(targetId => {
                        const target = socialMediaTargets.find(t => t.id === targetId);
                        return target?.identifier === 'youtube';
                    });

                    return hasImageFiles && hasYouTubeTargets ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                <p className="text-sm text-yellow-800">
                                    <strong>Увага:</strong> YouTube цілі будуть автоматично виключені з публікації, оскільки YouTube підтримує тільки відео контент.
                                </p>
                            </div>
                        </div>
                    ) : null;
                })()}

                {/* Media Type Selection */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Тип медіа</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={mediaType} onValueChange={setMediaType} className="flex space-x-4">
                            {mediaTypes.map((type) => (
                                <div key={type.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={type.value} id={type.value} />
                                    <Label htmlFor={type.value} className="flex items-center space-x-1 cursor-pointer text-sm">
                                        {type.icon}
                                        <span>{type.label}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* File Upload */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Завантажити медіа</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {uploadedFiles.length > 0
                                        ? `${uploadedFiles.length} файл(ів) завантажено`
                                        : 'Натисніть для завантаження або перетягніть файл(и)'
                                    }
                                </p>
                                <p className="text-xs text-gray-500">
                                    {mediaType === 'image'
                                        ? 'PNG, JPG, GIF до 10МБ (до 10 файлів, тільки зображення)'
                                        : 'MP4 до 400МБ (1 файл, тільки відео)'
                                    }
                                </p>
                            </div>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept={mediaType === 'image' ? 'image/*' : '.mp4,video/mp4'}
                                multiple={mediaType === 'image'}
                                onChange={handleFileUpload}
                                className="mt-2"
                            />

                            {/* Uploaded Files List */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">Завантажені файли:</h4>
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                            <div className="flex items-center space-x-2">
                                                {mediaType === 'image' ? (
                                                    <ImageIcon className="h-4 w-4 text-gray-500" />
                                                ) : (
                                                    <Video className="h-4 w-4 text-gray-500" />
                                                )}
                                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    ({(file.size / 1024 / 1024).toFixed(1)} МБ)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(index)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Post Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Контент поста</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Regular Post Text - hide if only YouTube is selected */}
                            {!onlyYouTubeTargets && (
                                <div>
                                    <Label htmlFor="postText">Текст поста (Instagram, Facebook, TikTok, LinkedIn)</Label>
                                    <textarea
                                        id="postText"
                                        value={postText}
                                        onChange={(e) => setPostText(e.target.value)}
                                        placeholder="Що у вас на думці?"
                                        className="w-full mt-2 p-3 border border-gray-300 rounded-lg resize-none"
                                        rows={4}
                                        maxLength={2000}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {postText.length}/2000 символів
                                    </p>
                                </div>
                            )}

                            {/* YouTube Description */}
                            {hasYouTubeTarget && (
                                <div>
                                    <Label htmlFor="youtubeDescription" className="flex items-center space-x-2">
                                        <Youtube className="h-4 w-4 text-red-600" />
                                        <span>Текст поста YouTube</span>
                                    </Label>
                                    <textarea
                                        id="youtubeDescription"
                                        value={youtubeDescription}
                                        onChange={(e) => setYoutubeDescription(e.target.value)}
                                        placeholder="Короткий опис для YouTube відео..."
                                        className="w-full mt-2 p-3 border border-gray-300 rounded-lg resize-none"
                                        rows={4}
                                        maxLength={100}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {youtubeDescription.length}/100 символів
                                    </p>
                                </div>
                            )}
                        </div>

                    </CardContent>
                </Card>

                {/* Scheduling */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5" />
                            <span>Планування</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup value={scheduleType} onValueChange={setScheduleType}>
                            {scheduleOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={option.value} />
                                    <Label htmlFor={option.value} className="cursor-pointer">
                                        {option.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        {scheduleType === 'schedule' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="scheduledDate">Дата</Label>
                                    <Input
                                        id="scheduledDate"
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="mt-2"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="scheduledTime">Час</Label>
                                    <Input
                                        id="scheduledTime"
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={(() => {
                            // Check if we have image files - if so, exclude YouTube targets
                            const hasImageFiles = uploadedFiles.some(file => file.type.startsWith('image/'));
                            const filteredTargets = hasImageFiles
                                ? selectedTargets.filter(targetId => {
                                    const target = socialMediaTargets.find(t => t.id === targetId);
                                    return target?.identifier !== 'youtube';
                                })
                                : selectedTargets;

                            return filteredTargets.length === 0 || (!postText.trim() && uploadedFiles.length === 0) || isSubmitting;
                        })()}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Надсилання...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                {scheduleType === 'now' ? 'Опублікувати зараз' : 'Запланувати пост'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
