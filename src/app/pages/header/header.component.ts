import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  /** Collapse state from parent */
  @Input() isCollapsed = false;

  /** Dropdown open/close state */
  isVipulDropdownOpen = false;

  constructor(private router: Router, private loginService: LoginService,private eRef: ElementRef) { }

  username: string | null = null;

  imgUrl: any = environment.imgUrl;

  ngOnInit() {
    // this.username = sessionStorage.getItem('username');
    if (typeof window !== 'undefined' && sessionStorage) {
      this.username = sessionStorage.getItem('username');
    }
  }

  /** Toggle sidebar: instantly collapse logo + inform parent */
  onToggleClick() {
    this.isCollapsed = !this.isCollapsed; // instant logo change
    this.toggleSidebar.emit();            // tell parent to toggle sidebar
  }

  /** Toggle profile dropdown */
  toggleVipulDropdown() {
    this.isVipulDropdownOpen = !this.isVipulDropdownOpen;
  }

  /** Reload home route */
  reloadHome() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  onLogout() {
    const logoutRequest = this.loginService.logout();

    if (!logoutRequest) {
      this.loginService.clearSession();
      this.router.navigate(['/login']);
      return;
    }

    logoutRequest.subscribe({
      next: () => {
        this.loginService.clearSession();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loginService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }
// onLogout() {
//   this.router.navigate(['/login']);
// }


 /** ✅ Close dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (
      this.isVipulDropdownOpen &&
      !this.eRef.nativeElement.contains(event.target)
    ) {
      this.isVipulDropdownOpen = false;
    }
  }


}
