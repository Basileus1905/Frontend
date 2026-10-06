import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ShoppingItem } from './shopping-item';
import { lastValueFrom } from 'rxjs';
import { AuthService } from './auth-service.service';

interface ShoppingItemsResponse {
  activeShoppingItem: ShoppingItem[];
  removedShoppingItem: ShoppingItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingItemServiceService {
  url = 'https://ensarbackend-31591307580.europe-west1.run.app/';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Optional: Add this method to get headers with auth token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  async getShoppingItems(): Promise<ShoppingItemsResponse> {
    console.log('Fetching shopping items from API');
    try {
      const response = await lastValueFrom(
        this.http.get<ShoppingItemsResponse>(this.url)
      );

      return {
        activeShoppingItem: response.activeShoppingItem || [],
        removedShoppingItem: response.removedShoppingItem || []
      };
    } catch (error) {
      console.error('Error in getShoppingItems:', error);
      throw error;
    }
  }

  async updateShoppingItem(id: number): Promise<ShoppingItemsResponse> {
    try {
      const response = await lastValueFrom(
        this.http.put<ShoppingItemsResponse>(`${this.url}${id}`, {})
      );

      return {
        activeShoppingItem: response.activeShoppingItem || [],
        removedShoppingItem: response.removedShoppingItem || []
      };
    } catch (error) {
      console.error('Error in updateShoppingItem:', error);
      throw error;
    }
  }

  async addShoppingItem(item: ShoppingItem): Promise<ShoppingItemsResponse> {
    try {
      const response = await lastValueFrom(
        this.http.post<ShoppingItemsResponse>(this.url, item)
      );

      return {
        activeShoppingItem: response.activeShoppingItem || [],
        removedShoppingItem: response.removedShoppingItem || []
      };
    } catch (error) {
      console.error('Error in addShoppingItem:', error);
      throw error;
    }
  }
}
