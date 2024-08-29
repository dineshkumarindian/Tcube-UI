import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  selectedProjectId: any;

  constructor(private http: HttpClient) { }
  private BaseUrl = environment.hostName + "api/ProjectDetails/";

  setProjectId(id) {
    this.selectedProjectId = id;
    localStorage.setItem("projectId", id);
  }

  getProjectId() {
    return this.selectedProjectId;
  }

  setUsersIds(mIds , mRph , uIds , uRph){
    localStorage.setItem("managerIds", JSON.stringify(mIds));
    localStorage.setItem("managerRph", JSON.stringify(mRph));
    localStorage.setItem("UserIds", JSON.stringify(uIds));
    localStorage.setItem("UserRph", JSON.stringify(uRph));
  }

  createProject(create):Observable<any> {
    return this.http.post(`${this.BaseUrl}create`, create);
  }
  updateProject(update):Observable<any> {
    return this.http.put(`${this.BaseUrl}update`, update);
  }

  getActiveProjectDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveProjectDetailsByOrgId/${id}`,id);
  }
  getProjectDetailsByOrgIdWithRefProjectId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getProjectDetailsByOrgIdWithRefProjectId/${id}`, id);
  }

  getInactiveProjectDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getInactiveProjectDetailsByOrgId/${id}`,id);
  }
  getActiveProjectDetailsByClientId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveProjectDetailsByClientId/${id}`,id);
  }
  getInactiveProjectDetailsByClientId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getInactiveProjectDetailsByClientId/${id}`,id);
  }
  getActiveProjecIdAndNameByClientId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveProjecIdAndNameByClientId/${id}`,id);
  }
  getInactiveProjecIdAndNameByClientId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getInactiveProjecIdAndNameByClientId/${id}`,id);
  }
  getActiveProjectDetailsById(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getProjectById/${id}`,id);
  }
  updateProjectStatus(status,id): Observable<any> {
    return this.http.put(`${this.BaseUrl}updateProjectStatus/${id}`,status);
  }
  deleteProject(id) :Observable<any> {
    return this.http.put(`${this.BaseUrl}delete/${id}`,id);
  }
  bulkDelet(details): Observable<any>{
    return this.http.put(`${this.BaseUrl}bulkDelete`, details);
  }
  bulkUsers(update):Observable<any> {
    return this.http.put(`${this.BaseUrl}bulkUsers`, update);
  }
  getActiveProjecttNameListByOrgId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveProjecttNameListByOrgId/${id}`,id);
  }
  projectUserRemove(details): Observable<any> {
    return this.http.put(`${this.BaseUrl}projectUserRemove`,details);
  }

  getActiveProjectDetailsByOrgIdForFilter(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveProjectDetailsByOrgIdForFilter/${id}`,id);
  }
  getProjectByReferenceId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getProjectByReferenceId/${id}`,id);
  }
  disableUserAfterDeactivate(details):Observable<any> {
    return this.http.post(`${this.BaseUrl}disableUserAfterDeactivate`,details);
  }
  // To display the project name in add job projectname dropdown
  getProjectNameAndId(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getProjectNameAndId/${id}`,id);
  }

  // To get the project status to update the project status
  getProjectStatusById(id): Observable<any> {
    return this.http.get(`${this.BaseUrl}getProjectStatusById/${id}`,id);
  }

  //to get the all project details by status and orgid
  getProjectByOrgidAndStatusCustomData(details): Observable<any> {
    return this.http.put(`${this.BaseUrl}getallprojectsbyorgidstatuscustomdata`,details);
  }
}
