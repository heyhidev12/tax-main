
import { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from '@/config/api';

// API 응답 타입
interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

// 요청 옵션 타입
interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeout?: number;
  skipAuthRefresh?: boolean; // 토큰 갱신 스킵 플래그 (무한 루프 방지)
}

// 토큰 갱신 상태 관리
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * 토큰 갱신 완료 시 대기 중인 요청들에게 새 토큰 전달
 */
const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

/**
 * 토큰 갱신 대기열에 요청 추가
 */
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * 인증 토큰 가져오기
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

/**
 * 토큰 저장
 */
// api.ts faylida
export const setAuthToken = (token: string, rememberMe: boolean = false) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('accessToken', token);
  
  // 토큰 만료 시간 계산 (autoLogin: true → 1주일, false → 15분)
  const expirationTime = new Date();
  if (rememberMe) {
    expirationTime.setDate(expirationTime.getDate() + 7); // 1주일
  } else {
    expirationTime.setMinutes(expirationTime.getMinutes() + 15); // 15분
  }
  
  localStorage.setItem('tokenExpiration', expirationTime.toISOString());
  localStorage.setItem('rememberMe', rememberMe.toString());
};

/**
 * 로그아웃 처리 (토큰 제거 및 리다이렉트)
 */
const handleLogout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인 페이지가 아닌 경우에만)
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

/**
 * 토큰 갱신 요청
 */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      credentials: 'include', // 쿠키(refresh token) 포함
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const newAccessToken = data?.accessToken;

    if (newAccessToken) {
      setAuthToken(newAccessToken);
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

/**
 * 타임아웃이 있는 fetch
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * API 요청 함수 (토큰 갱신 로직 포함)
 */
export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { body, timeout = API_TIMEOUT, headers: customHeaders, skipAuthRefresh = false, ...restOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // GET 요청이 아니거나 body가 있을 때만 Content-Type 추가
  const method = restOptions.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD' || body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers,
    credentials: 'include', // 쿠키 포함 (refresh token 용)
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetchWithTimeout(url, fetchOptions, timeout);
    const data = await response.json().catch(() => null);

    // 401 에러 처리 (토큰 만료)
    if (response.status === 401 && !skipAuthRefresh && token) {
      // 이미 토큰 갱신 중인 경우, 갱신 완료를 기다림
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            // 새 토큰으로 원래 요청 재시도
            const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
            const retryOptions: RequestInit = { ...fetchOptions, headers: retryHeaders };
            
            fetchWithTimeout(url, retryOptions, timeout)
              .then(async (retryResponse) => {
                const retryData = await retryResponse.json().catch(() => null);
                if (!retryResponse.ok) {
                  resolve({
                    error: retryData?.message || `HTTP Error: ${retryResponse.status}`,
                    status: retryResponse.status,
                  });
                } else {
                  resolve({ data: retryData, status: retryResponse.status });
                }
              })
              .catch(() => {
                resolve({ error: '요청 재시도 중 오류가 발생했습니다.', status: 0 });
              });
          });
        });
      }

      // 토큰 갱신 시작
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          isRefreshing = false;
          onTokenRefreshed(newToken);

          // 새 토큰으로 원래 요청 재시도
          const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
          const retryOptions: RequestInit = { ...fetchOptions, headers: retryHeaders };
          
          const retryResponse = await fetchWithTimeout(url, retryOptions, timeout);
          const retryData = await retryResponse.json().catch(() => null);

          if (!retryResponse.ok) {
            return {
              error: retryData?.message || `HTTP Error: ${retryResponse.status}`,
              status: retryResponse.status,
            };
          }

          return {
            data: retryData,
            status: retryResponse.status,
          };
        } else {
          // 토큰 갱신 실패 → 로그아웃
          isRefreshing = false;
          refreshSubscribers = [];
          handleLogout();
          return {
            error: '세션이 만료되었습니다. 다시 로그인해주세요.',
            status: 401,
          };
        }
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return {
          error: '세션이 만료되었습니다. 다시 로그인해주세요.',
          status: 401,
        };
      }
    }

    if (!response.ok) {
      return {
        error: data?.message || `HTTP Error: ${response.status}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          error: '요청 시간이 초과되었습니다.',
          status: 408,
        };
      }
      return {
        error: error.message,
        status: 0,
      };
    }
    return {
      error: '알 수 없는 오류가 발생했습니다.',
      status: 0,
    };
  }
};

/**
 * GET 요청
 */
export const get = <T = unknown>(endpoint: string, options?: RequestOptions) =>
  apiRequest<T>(endpoint, { ...options, method: 'GET' });

/**
 * POST 요청
 */
export const post = <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiRequest<T>(endpoint, { ...options, method: 'POST', body });

/**
 * PATCH 요청
 */
export const patch = <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiRequest<T>(endpoint, { ...options, method: 'PATCH', body });

/**
 * DELETE 요청
 */
export const del = <T = unknown>(endpoint: string, options?: RequestOptions) =>
  apiRequest<T>(endpoint, { ...options, method: 'DELETE' });

/**
 * 파일 업로드 (multipart/form-data) - 토큰 갱신 로직 포함
 */
export const uploadFile = async <T = unknown>(
  endpoint: string,
  file: File,
  fieldName = 'file'
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  let token = getAuthToken();

  const formData = new FormData();
  formData.append(fieldName, file);

  const makeRequest = async (authToken: string | null): Promise<Response> => {
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      },
      API_TIMEOUT
    );
  };

  try {
    let response = await makeRequest(token);
    let data = await response.json().catch(() => null);

    // 401 에러 처리 (토큰 만료)
    if (response.status === 401 && token) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber(async (newToken: string) => {
            try {
              const retryResponse = await makeRequest(newToken);
              const retryData = await retryResponse.json().catch(() => null);
              if (!retryResponse.ok) {
                resolve({
                  error: retryData?.message || `HTTP Error: ${retryResponse.status}`,
                  status: retryResponse.status,
                });
              } else {
                resolve({ data: retryData, status: retryResponse.status });
              }
            } catch {
              resolve({ error: '파일 업로드 재시도 중 오류가 발생했습니다.', status: 0 });
            }
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          isRefreshing = false;
          onTokenRefreshed(newToken);

          response = await makeRequest(newToken);
          data = await response.json().catch(() => null);
        } else {
          isRefreshing = false;
          refreshSubscribers = [];
          handleLogout();
          return {
            error: '세션이 만료되었습니다. 다시 로그인해주세요.',
            status: 401,
          };
        }
      } catch {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return {
          error: '세션이 만료되었습니다. 다시 로그인해주세요.',
          status: 401,
        };
      }
    }

    if (!response.ok) {
      return {
        error: data?.message || `HTTP Error: ${response.status}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
        status: 0,
      };
    }
    return {
      error: '파일 업로드 중 오류가 발생했습니다.',
      status: 0,
    };
  }
};

export default {
  get,
  post,
  patch,
  del,
  uploadFile,
  request: apiRequest,
};
