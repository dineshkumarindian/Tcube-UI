import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private BaseUrl = environment.hostName + "api/payments/";
  constructor(private http: HttpClient) { }

  //? Create payment order service 
  createPaymentOrder(payload: any): Observable<any> {
    return this.http.post(`${this.BaseUrl}initiate`, payload);
  }
  //? Handle payment order service 
  handlePaymentCallback(payload: any): Observable<any> {
    return this.http.post(`${this.BaseUrl}callback`, payload);
  }

  //? get payment order status
  getPaymentStatusByOrderID(orderID: string): Observable<any> {
    return this.http.get(`${this.BaseUrl}status/${orderID}`);
  }

  //? get all payment transactions 
  getAllTransactions(): Observable<any> {
    return this.http.get(`${this.BaseUrl}transactions`);
  }

  //create the stripe builder API 
  createStripePaymentCheckout(content: any) {
    return this.http.put(`${this.BaseUrl}stripe-checkout/create-session`, content);
  }

  // update the stripe success page
  stripePaymentStatusSuccessPage(content: any) {
    return this.http.put(`${this.BaseUrl}stripe-status/success`, content);
  }
  //transaction failed page
  stripePaymentStatusTransectionFailed(content: any) {
    return this.http.put(`${this.BaseUrl}stripe-status/payment-failed`, content);
  }

  //get by org payment details
  paymentHistoryofGetByOrg(orgId: any): Observable<any> {
    return this.http.get(`${this.BaseUrl}getAllByorgTransactionId/${orgId}`);
  }

  //getAllByOrgPaymentDetails
  getAllPaymentTransactionByOrg(orgId: any): Observable<any> {
    return this.http.get(`${this.BaseUrl}get-all-payment-transaction-by-org/${orgId}`);
  }

  //get few Payment transactions
  getFewPaymentTransaction(orgId: any): Observable<any> {
    return this.http.get(`${this.BaseUrl}get-few-payment-transaction/${orgId}`);
  }

  //verify the payment
  verifyPaymentDetails(data: any): Observable<any> {
    return this.http.put(`${this.BaseUrl}verify-payment`, data);
  }

  //last payment
  lastPaymentDetails(orgId: any): Observable<any> {
    return this.http.get(`${this.BaseUrl}last-payment/${orgId}`);
  }

  paymentStatusUpdate(data:any):Observable<any>{
    return this.http.put(`${this.BaseUrl}payment-status-update`,data);
  }

}

