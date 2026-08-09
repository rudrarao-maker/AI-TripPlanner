/**
 * Centralized API client for standardizing fetch requests, error handling, and headers.
 */
export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);

    // If it's a streaming response or explicitly requested as raw, return the raw response
    if (config.headers && (config.headers as Record<string, string>)["Accept"] === "text/event-stream") {
      return response;
    }

    if (!response.ok) {
      let errorMessage = "An error occurred";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    console.error(`[API Client Error] ${endpoint}:`, error);
    throw error;
  }
}
