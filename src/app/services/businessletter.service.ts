import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from  'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

// business letter services
export class InternshipletterService {
  selectedInternId:any;
  constructor(private http:HttpClient) { }
  private url = environment.hostName + "api/businessDetails/";
    setInternId(id:any){
        localStorage.setItem("internId",id);
    }
    getInternId(){
        return this.selectedInternId();
    }
    createBusinessDetails(create:any):Observable<any>{
        return this.http.post(`${this.url}create`,create);
    }
    getAllBusinessDetails(id:any):Observable<any>{

        return  this.http.get(`${this.url}getall/${id}`);
    }
    getByIdBusinessDetails(id:any):Observable<any>{
        return this.http.get(`${this.url}getById/${id}`,id);
    }
    deleteByIdBusinessDetails(id:any):Observable<any>{
        return this.http.put(`${this.url}delete/${id}`,id);
    }
    
    updateBusinessDetails(id:any,details:any):Observable<any>{
        return this.http.put(`${this.url}update/${id}`,details);
    }
    getActiveOrgIdBusinessDetails(id:any):Observable<any>{
        return this.http.get(`${this.url}getActiveBusinessByOrgId/${id}`);
    }
    getBusinessLetterLength(id:any):Observable<any>{
        return this.http.get(`${this.url}getActiveBusinessLetterLength/${id}`);
    }
    getNewlyAddedBusinessLetter(id:any):Observable<any>{
        return this.http.get(`${this.url}getBusinessLetter/${id}`);
    }
    bulkDeleteBusinessDetails(details:any):Observable<any>{
        return this.http.put(`${this.url}bulkDelete`,details);
    }
    getActiveOrgIdBusinessDetailsNew(id:any):Observable<any>{
        let formdata = {
            "org_id": id
          }
        return this.http.put(`${this.url}getActiveBusinessDetailsByOrgIdNew`,formdata);
    }

}
