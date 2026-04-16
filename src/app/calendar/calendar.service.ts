import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';

export interface CalendarEntry {
  id?: number;
  entryDate: string;
  text: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  url = 'http://localhost:8080/dateCalendar';

  constructor(private http: HttpClient) { }

  async addCalendarEntry(entry: CalendarEntry): Promise<any> {
    try {
      return await lastValueFrom(
        this.http.post<any>(this.url, entry)
      );
    } catch (error) {
      console.error('Error in addCalendarEntry:', error);
      throw error;
    }
  }

  async updateCalendarEntry(id: number, entry: CalendarEntry): Promise<any> {
    try {
      return await lastValueFrom(
        this.http.put<any>(`${this.url}/${id}`, entry)
      );
    } catch (error) {
      console.error('Error in updateCalendarEntry:', error);
      throw error;
    }
  }

  async getCalendarEntries(date: Date): Promise<CalendarEntry[]> {
    try {
      // Format the date to YYYY-MM-DD to match the backend's expected LocalDate format
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      let params = new HttpParams().set('date', formattedDate);
      return await lastValueFrom(
        this.http.get<CalendarEntry[]>(this.url, { params })
      );
    } catch (error) {
      console.error('Error in getCalendarEntries:', error);
      return []; // Return empty array on error so UI doesn't break completely
    }
  }

  async getCalendarAmount(): Promise<number> {
    try {
      return await lastValueFrom(
        this.http.get<number>(`${this.url}/amount`)
      );
    } catch (error) {
      console.error('Error in getCalendarAmount:', error);
      return 0;
    }
  }
}
