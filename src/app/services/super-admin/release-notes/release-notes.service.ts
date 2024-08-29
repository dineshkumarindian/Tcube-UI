import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
// import { environment } from 'src/environments/environment';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReleaseNotesService {

  selectedReleaseId: any;
  constructor(private http: HttpClient) { }
  private BaseUrl = environment.hostName + "api/ReleaseNotesDetails/";

  setReleaseId(id) {
    localStorage.setItem("releaseId", id);
  }
  getReleaseId() {
    return this.selectedReleaseId();
  }
  // createReleaseDetails(create: any): Observable<any> {
  //   return this.http.post(`${this.BaseUrl}add-release`, create);
  // }

  createReleaseDetails(create): Observable<any> {
    return this.http.post(`${this.BaseUrl}add-Release`, create);
  }

  getAllReleaseNotesDetails(): Observable<any> {
      return this.http.get(`${this.BaseUrl}getAllReleaseNotes`);
  }

  getAllReleaseNotesCustomDetails():Observable<any>{
    return this.http.get(`${this.BaseUrl}getAllCustomReleaseNotes`);
  }

  getAllReleaseNotesDetailsNew(details): Observable<any> {
    return this.http.get(`${this.BaseUrl}getAllReleaseNotesNew`,details);
  }

  getReleaseNotesLength(id: any): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveReleaseNotesLength/${id}`);
  }

  getNewlyAddedReleaseNotes(id: any): Observable<any> {
    return this.http.get(`${this.BaseUrl}getReleaseNotes/${id}`);
  }

  getActiveOrgIdReleaseNotesDetails(id: any): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveEmpWithReleaseByOrgId/${id}`);
  }

  deleteReleaseNotesByIdDetails(id: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}deleteReleaseNotes/${id}`, id);
  }

  getReleaseNotesByIdDetails(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getById/${id}`, id);
  }

  updateReleaseNotesDetails(id: any, details: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}updateReleaseNotes/${id}`, details);
  }

  updatepublishReleaseNotesDetails(id:any):Observable<any>{
    return this.http.put(`${this.BaseUrl}publishReleaseNotes/${id}`,id);
  }

  updateRePublishReleaseNotesDetails(id:any):Observable<any>{
    return this.http.put(`${this.BaseUrl}rePublishReleaseNotes/${id}`,id);
  }

  bulkReleaseNotesDelete(details: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}bulkDelete`, details);
  }

  getActiveOrgIdReleaseDetailsNew(id: any): Observable<any> {
    let formdata = {
      "org_id": id
    }
    return this.http.put(`${this.BaseUrl}getActiveReleaseDetailsByOrgIdNew`, formdata);
  }

  getViewPdfDetails(id:any):Observable<any>{
    return this.http.get(`${this.BaseUrl}getReleaseNotesPdf/${id}`,id);
  }

  update_release(Id): Observable<any> {
    return this.http.put(`${this.BaseUrl}updatenew_release/${Id}`,Id);
  }
  updatenew_release_byEmpId(EmpId): Observable<any> {
    return this.http.put(`${this.BaseUrl}updatenew_release_byEmpId/${encodeURIComponent(EmpId)}`,EmpId);
  }

  updateReleaseVersion(details: any):Observable<any>{
    return this.http.put(`${this.BaseUrl}updateReleaseVersion`,details);
  }

  getReleaseVersion():Observable<any>{
    return this.http.get(`${this.BaseUrl}getupdatereleaseversion`);
  }


}
