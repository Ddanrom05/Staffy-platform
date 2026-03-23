import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

interface VolunteerActivity {
  id: number;
  title: string;
  organization: string;
  date: string;
  hours: number;
  status: 'completado' | 'proximo';
}

interface BadgeItem {
  name: string;
  status: 'earned' | 'locked';
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  activeTab = signal<'activity' | 'skills' | 'badges'>('activity');
  isEditingProfile = signal(false);
  isEditingSkills = signal(false);
  isSavingProfile = signal(false);
  profileError = signal('');

  private readonly maxPhotoSizeInBytes = 20 * 1024 * 1024;

  userEmail = '';

  readonly forcedCountry = 'México';

  readonly mexicoStates = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Ciudad de México',
    'Coahuila',
    'Colima',
    'Durango',
    'Estado de México',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas',
  ];

  selectedState = '';

  userProfile = signal({
    initials: 'ST',
    name: '',
    memberSince: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    photoUrl: ''
  });

  editableProfile = {
    phone: '',
    location: '',
    bio: '',
    photoUrl: ''
  };

  activities: VolunteerActivity[] = [];

  skills: string[] = [];
  newSkill = '';

  badges: BadgeItem[] = [];

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedEmail = localStorage.getItem('staffy_user_email')?.trim().toLowerCase() ?? '';
    if (!storedEmail) {
      this.profileError.set('No se encontró una sesión activa. Inicia sesión nuevamente.');
      return;
    }

    this.userEmail = storedEmail;
    setTimeout(() => {
      this.loadProfile();
      this.loadSkills();
      this.loadVolunteerHistory();
      this.loadBadges();
    }, 0);
  }

  selectTab(tab: 'activity' | 'skills' | 'badges') {
    this.activeTab.set(tab);
    if (tab !== 'skills') {
      this.isEditingSkills.set(false);
      this.newSkill = '';
    }
  }

  toggleSkillsEditor() {
    const nextValue = !this.isEditingSkills();
    this.isEditingSkills.set(nextValue);
    if (!nextValue) {
      this.newSkill = '';
    }
  }

  toggleEditProfile() {
    if (this.isEditingProfile()) {
      this.cancelEditProfile();
      return;
    }

    const currentProfile = this.userProfile();
    const parsedLocation = this.parseLocation(currentProfile.location);

    this.selectedState = parsedLocation.state;

    this.editableProfile = {
      phone: currentProfile.phone,
      location: currentProfile.location,
      bio: currentProfile.bio,
      photoUrl: currentProfile.photoUrl
    };
    this.profileError.set('');
    this.isEditingProfile.set(true);
  }

  cancelEditProfile() {
    this.isEditingProfile.set(false);
    this.profileError.set('');
  }

  saveProfile() {
    if (!this.userEmail) {
      this.profileError.set('No se encontró una sesión activa.');
      return;
    }

    this.isSavingProfile.set(true);
    this.profileError.set('');

    const locationValue = this.buildLocationValue();

    this.http
      .put<UserProfileResponse>('/api/users/profile', {
        email: this.userEmail,
        phone: this.editableProfile.phone,
        location: locationValue,
        bio: this.editableProfile.bio,
        photoUrl: this.editableProfile.photoUrl,
      })
      .subscribe({
        next: (profile) => {
          this.applyProfile(profile);
          this.cancelEditProfile();
          this.isSavingProfile.set(false);
        },
        error: (error) => {
          const message =
            error?.error?.message || 'No pudimos actualizar el perfil. Inténtalo de nuevo.';
          this.profileError.set(message);
          this.isSavingProfile.set(false);
        },
      });
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.profileError.set('Selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > this.maxPhotoSizeInBytes) {
      this.profileError.set('La imagen supera el límite de 20MB.');
      if (input) {
        input.value = '';
      }
      return;
    }

    this.readFileAsDataUrl(file)
      .then((imageAsBase64) => {
        if (!imageAsBase64) {
          this.profileError.set('No se pudo cargar la imagen. Inténtalo nuevamente.');
          return;
        }

        this.editableProfile = {
          ...this.editableProfile,
          photoUrl: imageAsBase64,
        };
        this.profileError.set('');
      })
      .catch(() => {
        this.profileError.set('No se pudo procesar la imagen seleccionada.');
      })
      .finally(() => {
        if (input) {
          input.value = '';
        }
      });
  }

  removeSelectedPhoto() {
    this.editableProfile = {
      ...this.editableProfile,
      photoUrl: '',
    };
  }

  addSkill() {
    const normalized = this.newSkill.trim();

    if (!normalized) {
      return;
    }

    if (!this.userEmail) {
      return;
    }

    const alreadyExists = this.skills.some(
      (skill) => skill.toLowerCase() === normalized.toLowerCase(),
    );

    if (alreadyExists) {
      this.newSkill = '';
      return;
    }

    this.http
      .post<UserSkillResponse[]>('/api/users/skills', {
        email: this.userEmail,
        skill: normalized,
      })
      .subscribe({
        next: (skills) => {
          this.skills = skills.map((item) => item.skillName);
          this.newSkill = '';
        },
        error: (error) => {
          const message = error?.error?.message || 'No se pudo guardar la skill.';
          this.profileError.set(message);
        },
      });
  }

  removeSkill(skillToRemove: string) {
    if (!this.userEmail) {
      return;
    }

    this.http
      .delete<UserSkillResponse[]>('/api/users/skills', {
        body: {
          email: this.userEmail,
          skill: skillToRemove,
        },
      })
      .subscribe({
        next: (skills) => {
          this.skills = skills.map((item) => item.skillName);
        },
        error: (error) => {
          const message = error?.error?.message || 'No se pudo eliminar la skill.';
          this.profileError.set(message);
        },
      });
  }

  private loadProfile() {
    this.http
      .get<UserProfileResponse>(`/api/users/profile?email=${encodeURIComponent(this.userEmail)}`)
      .subscribe({
        next: (profile) => {
          this.applyProfile(profile);
          this.profileError.set('');
        },
        error: (error) => {
          const message =
            error?.error?.message || 'No pudimos cargar tu perfil en este momento.';
          this.profileError.set(message);
        },
      });
  }

  private loadSkills() {
    this.http
      .get<UserSkillResponse[]>(`/api/users/skills?email=${encodeURIComponent(this.userEmail)}`)
      .subscribe({
        next: (skills) => {
          this.skills = skills.map((item) => item.skillName);
        },
        error: (error) => {
          const message = error?.error?.message || 'No se pudieron cargar las skills.';
          this.profileError.set(message);
        },
      });
  }

  private loadVolunteerHistory() {
    this.http
      .get<VolunteerActivity[]>(`/api/users/history?email=${encodeURIComponent(this.userEmail)}`)
      .subscribe({
        next: (history) => {
          this.activities = history;
        },
        error: (error) => {
          const message = error?.error?.message || 'No se pudo cargar el historial de voluntariado.';
          this.profileError.set(message);
        },
      });
  }

  private loadBadges() {
    this.http
      .get<UserBadgeResponse[]>(`/api/users/badges?email=${encodeURIComponent(this.userEmail)}`)
      .subscribe({
        next: (badges) => {
          this.badges = badges.map((badge) => ({
            name: badge.badgeName,
            status: badge.status,
          }));
        },
        error: (error) => {
          const message = error?.error?.message || 'No se pudieron cargar las insignias.';
          this.profileError.set(message);
        },
      });
  }

  private applyProfile(profile: UserProfileResponse) {
    this.userProfile.set({
      initials: this.getInitials(profile.fullName),
      name: profile.fullName,
      memberSince: this.formatMemberSince(profile.createdAt),
      email: profile.email,
      phone: profile.phone ?? '',
      location: profile.location ?? '',
      bio: profile.bio ?? '',
      photoUrl: profile.photoUrl ?? ''
    });
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('staffy_user_name', profile.fullName);
      localStorage.setItem('staffy_user_email', profile.email);
    }
  }

  private getInitials(fullName: string): string {
    const words = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    if (words.length === 0) {
      return 'ST';
    }

    return words.map((word) => word.charAt(0).toUpperCase()).join('');
  }

  private formatMemberSince(createdAt: string): string {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
  }

  private buildLocationValue(): string | null {
    if (!this.selectedState) {
      return null;
    }

    return `${this.selectedState}, ${this.forcedCountry}`;
  }

  private parseLocation(location: string): { state: string } {
    const trimmed = location.trim();

    if (!trimmed) {
      return { state: '' };
    }

    const normalizedParts = trimmed
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (normalizedParts.length >= 2) {
      const first = normalizedParts[0];
      const second = normalizedParts[1];

      if (second === this.forcedCountry && this.mexicoStates.includes(first)) {
        return { state: first };
      }
    }

    if (this.mexicoStates.includes(trimmed)) {
      return { state: trimmed };
    }

    return { state: '' };
  }

  get totalHours(): number {
    return this.activities.reduce((sum, activity) => sum + activity.hours, 0);
  }

  get totalOpportunities(): number {
    return this.activities.length;
  }

  get totalOrganizations(): number {
    return new Set(this.activities.map((activity) => activity.organization)).size;
  }

  private readFileAsDataUrl(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
}

interface UserProfileResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserSkillResponse {
  id: number;
  skillName: string;
  createdAt: string;
}

interface UserBadgeResponse {
  id: number;
  badgeName: string;
  status: 'earned' | 'locked';
  createdAt: string;
}
