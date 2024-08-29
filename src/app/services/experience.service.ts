import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable } from "rxjs";
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
  })

export class ExperienceLetterService{
    selectedExperienceId:any;
    constructor(private http:HttpClient){}
    private url = environment.hostName+"api/experienceDetails/";
    setExperienceId(id){
        localStorage.setItem("experienceId",id);
    }
    getExperienceId(){
        return this.selectedExperienceId();
        }
    createExperienceDetails(create:any):Observable<any>{
        return this.http.post(`${this.url}create`,create);
    }
    getActiveOrgIdExperienceDetails(id:any):Observable<any>{
        return this.http.get(`${this.url}getActiveDetailsByOrgId/${id}`);
    }
    deleteByIdExperienceDetails(id:any):Observable<any>{
        return this.http.put(`${this.url}delete/${id}`,id);
    }
    updateExperiencesDetails(id:any,details:any):Observable<any>{
        return this.http.put(`${this.url}update/${id}`,details);
    }
    getByIdExperienceDetails(id:any):Observable<any>{
        return this.http.get(`${this.url}getById/${id}`,id);
    }
    deleteSelectExperienceLetter(details:any):Observable<any>{
        return this.http.put(`${this.url}bulkDelete/`,details);
    }
    
}