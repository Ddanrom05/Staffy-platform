import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Opportunity {
  id: number;
  title: string;
  organization: string;
  image: string;
  location: string;
  date: string;
  hours: string;
  category: string;
  urgent?: boolean;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  searchQuery = signal('');
  selectedCategory = signal('');

  categories = [
    'Food & Nutrition',
    'Elder Care',
    'Environment',
    'Education',
    'Animal Welfare'
  ];

  opportunities: Opportunity[] = [
    {
      id: 1,
      title: 'Community Food Distribution',
      organization: 'City Food Bank',
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=250&fit=crop',
      location: 'Downtown Community Center',
      date: 'March 5, 2026',
      hours: '8:00 AM - 4 hours',
      category: 'Food & Nutrition',
      urgent: true
    },
    {
      id: 2,
      title: 'Senior Care Companion',
      organization: 'Adult Care Foundation',
      image: 'https://images.unsplash.com/photo-1576091160550-112173f31c74?w=400&h=250&fit=crop',
      location: 'Riverside Care Home',
      date: 'March 8, 2026',
      hours: '2:00 PM - 3 hours',
      category: 'Elder Care'
    },
    {
      id: 3,
      title: 'Beach Cleanup Drive',
      organization: 'Ocean Life Initiative',
      image: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400&h=250&fit=crop',
      location: 'Harbor Beach',
      date: 'March 10, 2026',
      hours: '9:00 AM - 5 hours',
      category: 'Environment'
    },
    {
      id: 4,
      title: 'Youth Mentoring Program',
      organization: 'Education Plus',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
      location: 'Central Library',
      date: 'March 12, 2026',
      hours: '4:00 PM - 2 hours',
      category: 'Education'
    },
    {
      id: 5,
      title: 'Animal Shelter Care',
      organization: 'Paws & Love Shelter',
      image: 'https://images.unsplash.com/photo-1633722715463-d30628cbb4ee?w=400&h=250&fit=crop',
      location: 'North District Animal Center',
      date: 'March 15, 2026',
      hours: '10:00 AM - 3 hours',
      category: 'Animal Welfare'
    },
    {
      id: 6,
      title: 'Community Garden Project',
      organization: 'Green Spaces Foundation',
      image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=250&fit=crop',
      location: 'Urban Garden Plot',
      date: 'March 18, 2026',
      hours: '3:00 PM - 3 hours',
      category: 'Environment'
    }
  ];

  selectCategory(category: string) {
    this.selectedCategory.set(
      this.selectedCategory() === category ? '' : category
    );
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Food & Nutrition': '🍎',
      'Elder Care': '🏥',
      'Environment': '🌱',
      'Education': '📚',
      'Animal Welfare': '🐾'
    };
    return icons[category] || '•';
  }
}

