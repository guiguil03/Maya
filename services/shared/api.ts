import { API_BASE_URL } from '../auth.service';

export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0,
  baseUrlOverride?: string,
): Promise<T> => {
  const baseUrl = baseUrlOverride ?? API_BASE_URL;
  const url = `${baseUrl}${endpoint}`;

  // S'assurer que les headers sont correctement passés
  const finalOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
    },
  };

  console.log('🌐 [API Call] Requête:', {
    url,
    method: finalOptions.method || 'GET',
    hasHeaders: !!finalOptions.headers,
    headersKeys: finalOptions.headers ? Object.keys(finalOptions.headers as Record<string, string>) : [],
    hasBody: !!finalOptions.body,
    bodyPreview: finalOptions.body ? (typeof finalOptions.body === 'string' ? finalOptions.body.substring(0, 200) + (finalOptions.body.length > 200 ? '...' : '') : String(finalOptions.body).substring(0, 200)) : undefined,
  });

  // Log du body complet si présent
  if (finalOptions.body && typeof finalOptions.body === 'string') {
    console.log('📤 [API Call] Body JSON envoyé:', finalOptions.body);
    try {
      const bodyParsed = JSON.parse(finalOptions.body);
      console.log('📤 [API Call] Body JSON parsé:', JSON.stringify(bodyParsed, null, 2));
    } catch (e) {
      console.log('📤 [API Call] Body n\'est pas du JSON valide:', finalOptions.body);
    }
  }

  const response = await fetch(url, finalOptions);

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const errorMessage = `HTTP ${response.status}: ${errorText}`;
    
    // Si erreur 401, logger plus d'informations pour le debug
    if (response.status === 401) {
      console.error('❌ [API] Erreur 401 - Non autorisé:', {
        url,
        method: finalOptions.method || 'GET',
        hasAuthHeader: !!(finalOptions.headers as Record<string, string>)?.Authorization,
        authHeaderPreview: (finalOptions.headers as Record<string, string>)?.Authorization?.substring(0, 30) + '...',
      });
    }
    
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
};

