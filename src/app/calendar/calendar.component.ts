import {Component, OnInit} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CalendarEntry, CalendarService} from './calendar.service';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  entries: CalendarEntry[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
  providers: [DatePipe]
})
export class CalendarComponent implements OnInit {
  viewDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ];

  showModal = false;
  isViewingEntry = false;
  isEditing = false;
  selectedDate: Date | null = null;
  selectedEntry: CalendarEntry | null = null;

  entryText = '';
  entryPicture = '';

  elapsedTime: { months: number, weeks: number, days: number } = { months: 0, weeks: 0, days: 0 };
  calendarAmount: number = 0;

  constructor(
    private datePipe: DatePipe,
    private calendarService: CalendarService
  ) {}

  ngOnInit() {
    this.viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.generateCalendar();
    this.calculateTimeSince();
    this.fetchCalendarAmount();
  }

  calculateTimeSince() {
    const startDate = new Date(2026, 2, 2); // March 5th 2026
    const today = new Date();

    let d1 = startDate < today ? startDate : today;
    let d2 = startDate < today ? today : startDate;

    let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());

    let d1PlusMonths = new Date(d1.getFullYear(), d1.getMonth() + months, d1.getDate());

    if (d1PlusMonths > d2) {
      months--;
      d1PlusMonths = new Date(d1.getFullYear(), d1.getMonth() + months, d1.getDate());
    }

    const diffTime = Math.abs(d2.getTime() - d1PlusMonths.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    this.elapsedTime = { months, weeks, days };
  }

  async fetchCalendarAmount() {
    try {
      this.calendarAmount = await this.calendarService.getCalendarAmount();
    } catch (error) {
      console.error('Error fetching calendar amount:', error);
    }
  }

  previousMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  goToCurrentMonth() {
    this.viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.generateCalendar();
  }

  get currentMonthYear(): string {
    return this.datePipe.transform(this.viewDate, 'MMMM yyyy') || '';
  }

  private async generateCalendar() {
    const start = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    const end = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);

    const days: CalendarDay[] = [];

    let monthEntries: CalendarEntry[] = [];
    try {
      const firstDayOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
      monthEntries = await this.calendarService.getCalendarEntries(firstDayOfMonth);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }

    const paddingDays = start.getDay() === 0 ? 6 : start.getDay() - 1;
    for (let i = paddingDays; i > 0; i--) {
      const d = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1 - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: this.isToday(d),
        entries: this.getEntriesForDate(d, monthEntries)
      });
    }

    for (let i = 1; i <= end.getDate(); i++) {
      const d = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: this.isToday(d),
        entries: this.getEntriesForDate(d, monthEntries)
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: this.isToday(d),
        entries: this.getEntriesForDate(d, monthEntries)
      });
    }

    this.calendarDays = days;
  }

  private getEntriesForDate(date: Date, entries: CalendarEntry[]): CalendarEntry[] {
    return entries.filter(entry => {
      const entryDate = new Date(entry.entryDate);
      return entryDate.getDate() === date.getDate() &&
             entryDate.getMonth() === date.getMonth() &&
             entryDate.getFullYear() === date.getFullYear();
    });
  }

  private isToday(date: Date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  openModal(day: CalendarDay) {
    if (day.entries.length > 0) {
      // View existing entry
      this.isViewingEntry = true;
      this.isEditing = false;
      this.selectedEntry = day.entries[0]; // Assuming one entry per day for now
      this.selectedDate = day.date;
      // Pre-fill form in case they click edit
      this.entryText = this.selectedEntry.text;
      this.entryPicture = this.selectedEntry.picture || '';
    } else {
      // Add new entry
      this.isViewingEntry = false;
      this.isEditing = false;
      this.selectedDate = day.date;
      this.entryText = '';
      this.entryPicture = '';
    }
    this.showModal = true;
  }

  startEditing() {
    this.isViewingEntry = false;
    this.isEditing = true;
  }

  cancelEditing() {
    if (this.selectedEntry) {
        this.isViewingEntry = true;
        this.isEditing = false;
        // Reset the form back to the saved entry
        this.entryText = this.selectedEntry.text;
        this.entryPicture = this.selectedEntry.picture || '';
    } else {
        this.closeModal();
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedDate = null;
    this.selectedEntry = null;
    this.isViewingEntry = false;
    this.isEditing = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result.split(',')[1];
        this.entryPicture = base64String;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveEntry() {
    if (!this.entryText || !this.selectedDate) {
      alert('Text is required.');
      return;
    }

    const entry: CalendarEntry = {
      entryDate: this.selectedDate.toISOString(),
      text: this.entryText,
      picture: this.entryPicture || undefined
    };

    try {
      if (this.isEditing && this.selectedEntry && this.selectedEntry.id) {
          await this.calendarService.updateCalendarEntry(this.selectedEntry.id, entry);
      } else {
          await this.calendarService.addCalendarEntry(entry);
      }
      this.closeModal();
      this.generateCalendar();
    } catch (error) {
      console.error(error);
      alert('Error saving entry.');
    }
  }
}
