import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isMenuOpen = signal(false);
  isLoggedIn = signal(false);

  constructor(
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    this.updateSessionState();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateSessionState());
  }
  
  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('staffy_session');
    }

    this.updateSessionState();
    this.closeMenu();
    this.router.navigate(['/']);
  }

  private updateSessionState() {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoggedIn.set(false);
      return;
    }

    this.isLoggedIn.set(localStorage.getItem('staffy_session') === 'active');
  }
}
