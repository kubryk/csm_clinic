interface Customer {
    id: string;
    name: string;
}

interface SocialMediaIntegration {
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

interface SocialMediaResponse {
    integrations: SocialMediaIntegration[];
    categories: string[];
}

export async function getSocialMediaIntegrations(): Promise<SocialMediaResponse> {
    const apiKey = process.env.POSTIZ_API_KEY;
    const webhookUrl = process.env.BLOTATO_PROFILES_URL;
    const postizUrl = process.env.POSTIZ_BASE_URL;

    if (!apiKey) {
        throw new Error('POSTIZ_API_KEY is not configured');
    }

    if (!webhookUrl) {
        throw new Error('BLOTATO_PROFILES_URL is not configured');
    }

    if (!postizUrl) {
        throw new Error('POSTIZ_BASE_URL is not configured');
    }

    try {
        // Fetch from both endpoints
        const [postizResponse, n8nResponse] = await Promise.allSettled([
            fetch(`${postizUrl}/api/public/v1/integrations`, {
                method: 'GET',
                headers: {
                    'Authorization': `${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }),
            fetch(webhookUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        ]);

        let allIntegrations: SocialMediaIntegration[] = [];

        // Process Postiz integrations
        if (postizResponse.status === 'fulfilled' && postizResponse.value.ok) {
            const postizData = await postizResponse.value.json();
            console.log('Postiz Data received:', postizData);

            const postizIntegrations: SocialMediaIntegration[] = postizData.map((item: any) => ({
                id: `postiz-${item.id}`,
                name: item.name,
                identifier: item.identifier,
                picture: item.picture,
                disabled: item.disabled,
                profile: item.profile,
                customer: item.customer,
                source: 'postiz' as const,
                sourceId: item.id
            }));

            console.log('Postiz Integrations transformed:', postizIntegrations);
            allIntegrations = [...allIntegrations, ...postizIntegrations];
        }

        // Process N8N integrations
        if (n8nResponse.status === 'fulfilled' && n8nResponse.value.ok) {
            const n8nData = await n8nResponse.value.json();
            console.log('N8N Data received:', n8nData);

            // Handle both single object and array responses
            const n8nItems = Array.isArray(n8nData) ? n8nData : (n8nData ? [n8nData] : []);

            // Transform N8N data to match our format
            const n8nIntegrations: SocialMediaIntegration[] = n8nItems.map((item: any, index: number) => ({
                id: `blotato-${item.row_number || index}`,
                name: item.Соцмережа || item.Профіль || `Blotato Integration ${index + 1}`,
                identifier: item.Соцмережа?.toLowerCase() || 'unknown',
                picture: '', // N8N data doesn't include pictures
                disabled: false, // Assume all N8N integrations are active
                profile: item.Профіль || '',
                customer: item.Напрямок ? {
                    id: `blotato-customer-${item.row_number || index}`,
                    name: item.Напрямок
                } : undefined,
                source: 'blotato' as const,
                sourceId: item.blotato_id || `row_${item.row_number || index}`
            }));

            console.log('N8N Integrations transformed:', n8nIntegrations);
            allIntegrations = [...allIntegrations, ...n8nIntegrations];
        }

        // Transform and sort the combined API response by customer
        const transformedData: SocialMediaResponse = {
            integrations: allIntegrations.sort((a: SocialMediaIntegration, b: SocialMediaIntegration) => {
                // Sort by customer name first, then by integration name
                const customerA = a.customer?.name || '';
                const customerB = b.customer?.name || '';

                if (customerA !== customerB) {
                    return customerA.localeCompare(customerB);
                }

                return a.name.localeCompare(b.name);
            }),
            categories: [] // API doesn't seem to return categories, so we'll use an empty array
        };

        console.log('Final combined integrations:', transformedData.integrations);
        return transformedData;
    } catch (error) {
        console.error('Error fetching social media integrations:', error);
        throw error;
    }
}

export async function getSocialMediaIntegrationsClient(): Promise<SocialMediaResponse> {
    try {
        const response = await fetch('/api/social-media', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching social media integrations:', error);
        throw error;
    }
}