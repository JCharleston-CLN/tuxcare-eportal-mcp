import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthConfig, AuthManager } from './auth.js';

export interface Server {
  id: string;
  ip: string;
  hostname: string;
  key: string;
  feed: string;
  registered: string;
  checkin: string;
  updated: string;
  euname: string;
  release: string;
  kernel_id: string;
  patch_level: number;
  patch_type: string;
  tags: string | null;
  uptime: number;
  version: string;
  virt: string;
  kcare_version: string;
  distro: string;
  distro_version: string;
  machine: string;
  processor: string;
}

export interface ServerListResponse {
  count: number;
  limit: number;
  offset: number;
  result: Server[];
}

export interface RegisterResponse {
  server_id: string;
}

export interface ErrorResponse {
  error: string;
}

export interface DeleteResponse {
  result: number;
}

export interface Feed {
  name: string;
  auto: boolean;
  deploy_after: number;
}

export interface FeedListResponse {
  result: Feed[];
}

export interface Key {
  key: string;
  feed: string;
  note: string | null;
  server_limit: number;
}

export interface KeyListResponse {
  result: Key[];
}

export interface Patchset {
  patchset: string;
  status: 'enabled' | 'disabled' | 'not-downloaded' | 'undeployed';
}

export interface PatchsetListResponse {
  result: Patchset[];
}

export interface User {
  id: number;
  username: string;
  description: string;
  readonly: boolean;
}

export interface UserListResponse {
  result: User[];
}

export interface ServerListFilters {
  hostname?: string;
  ip?: string;
  service_id?: string;
  feed?: string;
  key?: string;
  registered_age?: number;
  checkin_age?: number;
  updated_age?: number;
  is_updated?: boolean;
  limit?: number;
  offset?: number;
  only_count?: boolean;
  tag?: string;
}

export interface PatchsetFilters {
  feed?: string;
  product?: 'kernel' | 'user' | 'qemu' | 'db';
}

export interface PatchsetManageOptions {
  patchset: string;
  feed: string[];
  action: 'enable' | 'disable' | 'enable-upto' | 'undeploy-downto';
  product?: 'kernel' | 'user' | 'qemu' | 'db';
}

export class EPortalClient {
  private client: AxiosInstance;
  private authManager: AuthManager;

  constructor(baseURL: string, authConfig: AuthConfig) {
    this.authManager = new AuthManager(authConfig);
    
    this.client = axios.create({
      baseURL: baseURL.endsWith('/') ? baseURL : `${baseURL}/`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...this.authManager.getHeaders()
      }
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your credentials.');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        }
        if (error.response?.data?.error) {
          throw new Error(`API Error: ${error.response.data.error}`);
        }
        throw error;
      }
    );
  }

  // Server Management
  async listServers(filters: ServerListFilters = {}): Promise<ServerListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<ServerListResponse> = await this.client.get(
      'admin/api/servers',
      { params }
    );
    
    return response.data;
  }

  async registerHost(key: string, hostname?: string): Promise<RegisterResponse> {
    const data = new URLSearchParams();
    data.append('key', key);
    if (hostname) {
      data.append('hostname', hostname);
    }

    const response: AxiosResponse<RegisterResponse> = await this.client.post(
      'admin/api/register',
      data,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    return response.data;
  }

  async unregisterHost(options: { hostname?: string; ip?: string; server_id?: string }): Promise<DeleteResponse> {
    const params = new URLSearchParams();
    
    if (options.hostname) params.append('hostname', options.hostname);
    if (options.ip) params.append('ip', options.ip);
    if (options.server_id) params.append('server_id', options.server_id);

    if (params.toString() === '') {
      throw new Error('At least one parameter (hostname, ip, or server_id) is required');
    }

    const response: AxiosResponse<DeleteResponse> = await this.client.post(
      'admin/api/delete_server',
      null,
      { params }
    );
    
    return response.data;
  }

  async bulkUnregisterHosts(checkin_age: number): Promise<DeleteResponse> {
    if (checkin_age < 1) {
      throw new Error('checkin_age must be greater than or equal to 1');
    }

    const response: AxiosResponse<DeleteResponse> = await this.client.delete(
      'admin/api/servers',
      { params: { checkin_age } }
    );
    
    return response.data;
  }

  // Feed Management
  async listFeeds(): Promise<FeedListResponse> {
    const response: AxiosResponse<FeedListResponse> = await this.client.get('admin/api/feeds/');
    return response.data;
  }

  async createOrModifyFeed(feed: { name: string; auto?: boolean; deploy_after?: number }): Promise<{ result: Feed }> {
    const data = new URLSearchParams();
    data.append('name', feed.name);
    if (feed.auto !== undefined) data.append('auto', feed.auto.toString());
    if (feed.deploy_after !== undefined) data.append('deploy_after', feed.deploy_after.toString());

    const response: AxiosResponse<{ result: Feed }> = await this.client.post(
      'admin/api/feeds/',
      data,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    return response.data;
  }

  async deleteFeed(name: string): Promise<DeleteResponse> {
    const response: AxiosResponse<DeleteResponse> = await this.client.delete(`admin/api/feeds/${name}`);
    return response.data;
  }

  // Key Management
  async listKeys(): Promise<KeyListResponse> {
    const response: AxiosResponse<KeyListResponse> = await this.client.get('admin/api/keys/');
    return response.data;
  }

  async createOrModifyKey(keyData: { 
    key?: string; 
    feed?: string; 
    note?: string; 
    server_limit?: number 
  }): Promise<{ result: Key }> {
    const data = new URLSearchParams();
    if (keyData.key) data.append('key', keyData.key);
    if (keyData.feed) data.append('feed', keyData.feed);
    if (keyData.note) data.append('note', keyData.note);
    if (keyData.server_limit !== undefined) data.append('server_limit', keyData.server_limit.toString());

    const response: AxiosResponse<{ result: Key }> = await this.client.post(
      'admin/api/keys/',
      data,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    return response.data;
  }

  async deleteKey(key: string): Promise<DeleteResponse> {
    const response: AxiosResponse<DeleteResponse> = await this.client.delete(`admin/api/keys/${key}`);
    return response.data;
  }

  // Patchset Management
  async listPatchsets(filters: PatchsetFilters = {}): Promise<PatchsetListResponse> {
    const params = new URLSearchParams();
    if (filters.feed) params.append('feed', filters.feed);
    if (filters.product) params.append('product', filters.product);

    const response: AxiosResponse<PatchsetListResponse> = await this.client.get(
      'admin/api/patchsets/',
      { params }
    );
    
    return response.data;
  }

  async managePatchsets(options: PatchsetManageOptions): Promise<{ result: string }> {
    const params = new URLSearchParams();
    params.append('patchset', options.patchset);
    options.feed.forEach(feed => params.append('feed', feed));
    params.append('action', options.action);
    if (options.product) params.append('product', options.product);

    const response: AxiosResponse<{ result: string }> = await this.client.post(
      'admin/api/patchsets/manage',
      null,
      { params }
    );
    
    return response.data;
  }

  // User Management
  async listUsers(): Promise<UserListResponse> {
    const response: AxiosResponse<UserListResponse> = await this.client.get('admin/api/users/');
    return response.data;
  }

  // Server Tagging
  async setTags(server_id: string, tags?: string): Promise<{ result: string }> {
    const params = new URLSearchParams();
    params.append('server_id', server_id);
    if (tags) params.append('tags', tags);

    const response: AxiosResponse<{ result: string }> = await this.client.post(
      'admin/api/set_tags',
      null,
      { params }
    );
    
    return response.data;
  }
}