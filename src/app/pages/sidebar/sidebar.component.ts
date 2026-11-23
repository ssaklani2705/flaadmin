import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  moduleId?: number;
  label: string;
  icon?: string;
  route?: string;
  expanded?: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  modules: any[] = [];
  menuItems: MenuItem[] = [];
  selectedModuleId: number | null = null;  // ✅ Track selected submenu

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedModules = sessionStorage.getItem('modules');
      if (storedModules) {
        this.modules = JSON.parse(storedModules);
      }

      // Restore previously selected submenu from session
      const storedSelected = sessionStorage.getItem("selectedModuleDetail");
      if (storedSelected) {
        const parsed = JSON.parse(storedSelected);
        this.selectedModuleId = parsed?.moduleId || null;
      }
    }

    const allowedModuleIds = this.modules.map(m => m.moduleId);
    this.menuItems = this.filterMenuItems(this.getInitialMenu(), allowedModuleIds);

    // Auto-expand parents if child route is active
    this.expandActiveParents(this.menuItems);
  }

  private getInitialMenu(): MenuItem[] {
    return [
        {
        moduleId: -1,
        label: 'Dashboard',
        icon: 'fa fa-home',
        route: '/dashboard'
      },
      {
        label: 'Masters',
        icon: 'fa fa-briefcase',
        expanded: false,
        children: [
          { moduleId: 9, label: 'User Management', route: '/userManagement' },
          { moduleId: 1, label: 'Bank', route: '/bank' },
          { moduleId: 10, label: 'Committee Member', route: '/committeeMembers' },
          { moduleId: 11, label: 'Gallery Group', route: '/gallery-group-index' },
        ]
      },
      // {
      //   label: 'Activity',
      //   icon: 'fa fa-cogs',
      //   expanded: false,
      //   children: [
      //     { moduleId: 2, label: 'Bank User', route: '/bankuser' },
      //     { moduleId: 3, label: 'Gallery', route: '/gallery' },
      //     { moduleId: 4, label: 'Regulatory Links', route: '/regulatorylinks' },
      //     { moduleId: 5, label: 'Events and Webinar', route: '/eventsandwebinar' },
      //     { moduleId: 6, label: 'Knowledge Sharing', route: '/knowledgesharing' },
      //   ]
      // },
      {
        label: 'Reports',
        icon: 'fa fa-bar-chart',
        expanded: false,
        children: [
          { moduleId: 7, label: 'Maillog Report', route: '/maillogreport' },
          { moduleId: 8, label: 'Access Report', route: '/accessreport' },
        ]
      }
    ];
  }

  private filterMenuItems(items: MenuItem[], allowedIds: number[]): MenuItem[] {
    return items
      .map(item => {
        if (item.moduleId === -1) {
          return { ...item };
        }
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterMenuItems(item.children, allowedIds);
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
        }
        if (item.moduleId !== undefined && allowedIds.includes(item.moduleId)) {
          return { ...item };
        }
        return null;
      })
      .filter((item): item is MenuItem => item !== null);
  }

  private expandActiveParents(items: MenuItem[]) {
    items.forEach(item => {
      if (item.children) {
        if (item.children.some(child => this.isSubItemActive(child))) {
          item.expanded = true;
        }
        this.expandActiveParents(item.children);
      }
    });
  }

  toggleMenu(item: MenuItem, event: Event) {
    if (item.children && item.children.length > 0) {
      event.preventDefault();
      item.expanded = !item.expanded;
    } else if (item.route) {
      const moduleDetail = this.getModuleDetail(item.moduleId);
      this.selectedModuleId = item.moduleId || null;
      sessionStorage.setItem("selectedModuleDetail", JSON.stringify(moduleDetail));
    }
  }

  getModuleDetail(moduleId: any) {
    return this.modules.find(m => m.moduleId === moduleId) || null;
  }

  isParentActive(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => this.isSubItemActive(child));
  }

  isSubItemActive(subItem: MenuItem): boolean {
  return (
    subItem.moduleId === this.selectedModuleId ||
    (subItem.route
      ? !!this.router.isActive(subItem.route, {
          paths: 'exact',
          queryParams: 'ignored',
          fragment: 'ignored',
          matrixParams: 'ignored',
        })
      : false)
  );
}

}
