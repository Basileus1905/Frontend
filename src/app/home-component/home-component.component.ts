import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth-service.service';
import { ShoppingItemServiceService } from '../shopping-item-service.service';
import { ShoppingItem } from '../shopping-item';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-component.component.html',
  styleUrl: './home-component.component.css'
})
export class HomeComponent implements OnInit {
  username: string = 'User';
  activeShoppingItems: ShoppingItem[] = [];
  removedShoppingItems: ShoppingItem[] = [];
  isLoading = false;

  // New item properties
  newItemName: string = '';
  isAddingItem = false;
  addItemError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private shoppingItemService: ShoppingItemServiceService
  ) {}

  ngOnInit(): void {
    console.log('Home component initialized');

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.username = user.username;
        this.loadShoppingItems();
      } else {
        // Redirect to login if not authenticated
        this.router.navigate(['/login']);
      }
    });
  }

  async loadShoppingItems(): Promise<void> {
    this.isLoading = true;
    try {
      console.log('Fetching shopping items...');
      const response = await this.shoppingItemService.getShoppingItems();
      console.log('Shopping items received:', response);

      this.activeShoppingItems = response.activeShoppingItem || [];
      this.removedShoppingItems = response.removedShoppingItem || [];
    } catch (error: any) {
      console.error('Error loading shopping items:', error);

      // Handle authentication errors
      if (error.status === 401 || error.status === 403) {
        console.log('Authentication error, redirecting to login');
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async addItem(): Promise<void> {
    // Reset error
    this.addItemError = '';

    // Validate input
    if (!this.newItemName.trim()) {
      this.addItemError = 'Please enter an item name';
      return;
    }

    this.isAddingItem = true;

    try {
      // Create new shopping item object
      const newItem: ShoppingItem = {
        id: null as unknown as number,
        itemName: this.newItemName,
        dateAdded: new Date(),
        dateRemoved: null as unknown as Date, // Set as null initially
        addedBy: "Ensar"
      };

      console.log('Adding new item:', newItem);

      // Call service to add item
      const response = await this.shoppingItemService.addShoppingItem(newItem);

      // Update lists with response
      this.activeShoppingItems = response.activeShoppingItem || [];
      this.removedShoppingItems = response.removedShoppingItem || [];

      // Clear input field after successful add
      this.newItemName = '';

      console.log('Item added successfully');
    } catch (error: any) {
      console.error('Error adding shopping item:', error);
      this.addItemError = error.message || 'Failed to add item. Please try again.';

      // Handle authentication errors
      if (error.status === 401 || error.status === 403) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    } finally {
      this.isAddingItem = false;
    }
  }

  async removeItem(id: number): Promise<void> {
    try {
      const response = await this.shoppingItemService.updateShoppingItem(id);
      this.activeShoppingItems = response.activeShoppingItem || [];
      this.removedShoppingItems = response.removedShoppingItem || [];
    } catch (error: any) {
      console.error('Error removing shopping item:', error);
      if (error.status === 401 || error.status === 403) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    }
  }

  logout(): void {
    console.log('Logout clicked');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
