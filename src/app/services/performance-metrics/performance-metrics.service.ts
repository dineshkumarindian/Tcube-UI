import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class PerformanceMetricsService {
  private BaseUrl = environment.hostName + "api/performancemetrics/";
  constructor(private http: HttpClient) { }

  getTimeTrackerChartbyStatus(data): Observable<any> {
    return this.http.put(`${this.BaseUrl}getuserperfomancemeticsdata`, data);
  }
}
