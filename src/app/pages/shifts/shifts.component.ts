import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Shift {
  id: number;
  title: string;
  organization: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  hours: number;
  category?: string;
  confirmed?: boolean;
}

interface Application {
  id: number;
  title: string;
  organization: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.css']
})
export class ShiftsComponent {
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  activeTab = signal<'upcoming' | 'completed'>('upcoming');
  hoursProgress = signal(73);

  shifts: Shift[] = [
    {
      id: 1,
      title: 'Beach Cleanup Drive',
      organization: 'Ocean Guardians',
      date: 'March 12, 2026',
      startTime: '7:00 AM',
      endTime: '11:00 AM',
      location: 'Santa Monica Beach',
      status: 'upcoming',
      hours: 4,
      category: 'Environmental',
      confirmed: true
    },
    {
      id: 2,
      title: 'Youth Tutoring Program',
      organization: 'Bright Futures Academy',
      date: 'March 15, 2026',
      startTime: '2:00 PM',
      endTime: '5:00 PM',
      location: 'Lincoln Elementary School',
      status: 'upcoming',
      hours: 3,
      category: 'Education',
      confirmed: true
    },
    {
      id: 3,
      title: 'Animal Shelter Care',
      organization: 'Paws & Claws Rescue',
      date: 'March 14, 2026',
      startTime: '10:00 AM',
      endTime: '1:00 PM',
      location: 'Riverdale Animal Shelter',
      status: 'upcoming',
      hours: 3,
      category: 'Animal Care',
      confirmed: true
    },
    {
      id: 4,
      title: 'Community Food Distribution',
      organization: 'City Food Bank',
      date: 'February 28, 2026',
      startTime: '9:00 AM',
      endTime: '1:00 PM',
      location: 'Downtown Community Center',
      status: 'completed',
      hours: 4
    },
    {
      id: 5,
      title: 'Senior Care Companion',
      organization: 'Golden Years Care',
      date: 'February 21, 2026',
      startTime: '2:00 PM',
      endTime: '5:00 PM',
      location: 'Sunset Retirement Home',
      status: 'completed',
      hours: 3
    },
    {
      id: 6,
      title: 'Park Maintenance',
      organization: 'City Parks Dept',
      date: 'February 14, 2026',
      startTime: '8:00 AM',
      endTime: '12:00 PM',
      location: 'Central Park',
      status: 'completed',
      hours: 4
    }
  ];

  recentApplications: Application[] = [
    {
      id: 1,
      title: 'Community Garden Project',
      organization: 'Green Thumbs Collective',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Senior Care Companion',
      organization: 'Golden Years Foundation',
      status: 'pending'
    }
  ];

  get upcomingShifts(): Shift[] {
    return this.shifts.filter(s => s.status === 'upcoming').slice(0, 3);
  }

  get completedShifts(): Shift[] {
    return this.shifts.filter(s => s.status === 'completed');
  }

  get totalHours(): number {
    return this.shifts.reduce((sum, shift) => sum + shift.hours, 0);
  }

  get hoursThisMonth(): number {
    return this.shifts
      .filter(s => s.status === 'completed')
      .reduce((sum, shift) => sum + shift.hours, 0);
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(
      category === this.selectedCategory() ? null : category
    );
  }

  selectTab(tab: 'upcoming' | 'completed'): void {
    this.activeTab.set(tab);
  }

  getCategoryIcon(category?: string): string {
    if (!category) return 'fas fa-calendar';
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('environment')) return 'fas fa-leaf';
    if (categoryLower.includes('education')) return 'fas fa-book';
    if (categoryLower.includes('health')) return 'fas fa-heart';
    if (categoryLower.includes('animal')) return 'fas fa-paw';
    if (categoryLower.includes('community')) return 'fas fa-handshake';
    
    return 'fas fa-calendar';
  }
}
