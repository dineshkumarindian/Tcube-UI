import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class OfferLetterService {

  selectedOfferId:any;
  constructor(private http: HttpClient) { }
  private BaseUrl = environment.hostName + "api/OfferLetterDetails/";

  setOfferId(id){
    localStorage.setItem("offerId",id);
}
 getOfferId(){
    return this.selectedOfferId();
}
  createDetails(create: any): Observable<any> {
    return this.http.post(`${this.BaseUrl}add-offer`, create);
  }

   getAllOfferLetterDetails(id):Observable<any>{

    return this.http.get(`${this.BaseUrl}getAllDetails/${id}`);
  }

  getOfferLetterLength(id: any): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveOfferLetterLength/${id}`);
  }

  getNewlyAddedOfferLetter(id: any): Observable<any> {
    return this.http.get(`${this.BaseUrl}getOfferLetter/${id}`);
  }

  getActiveOrgIdOfferLetterDetails(id: any): Observable<any> {
    return this.http.get(`${this.BaseUrl}getActiveEmpWithOfferByOrgId/${id}`);
  }

  deleteOfferLetterByIdDetails(id: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}deleteOfferLetter/${id}`, id);
  }
  getOfferLetterByIdDetails(id):Observable<any>{
    return this.http.get(`${this.BaseUrl}getById/${id}`,id);
 }

updateOfferLetterDetails(id:any,details:any):Observable<any>{
  return this.http.put(`${this.BaseUrl}updateOfferLetter/${id}`,details);
}
bulkOfferLetterDelete(details:any):Observable<any>{
  return this.http.put(`${this.BaseUrl}bulkDelete`,details);
}
//******************************************** Update offer leter PDF****************************************************//
// updateOfferLetterPdf(id:any,details:any):Observable<any>{
//   return this.http.put(`${this.BaseUrl}updateOfferLetterpdf/${id}`,details);
// }

}
