import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  isMenuOpen = false;
  isEnsar$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private eRef: ElementRef
  ) {
    this.isEnsar$ = this.authService.currentUser$.pipe(
      map(user => user?.username === 'Ensar')
    );
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']);
  }

  // Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(this.isMenuOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }
}
