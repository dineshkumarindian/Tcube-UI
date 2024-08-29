import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private _snackBar: MatSnackBar) { }

  openSnackBarAC(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4500,
      verticalPosition: 'top',
      panelClass: ['my-snack-bar-success']
    });
  }

  openSnackBarMC(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4500,
      verticalPosition: 'top',
      panelClass: ['my-snack-bar-failed']
    });
  }

  openSnackBarSettings(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 8500,
      verticalPosition: 'top',
      panelClass: ['my-snack-bar-success']
    });
  }

  //process to call the function from one component to another component
  private subject = new Subject<any>();
  private notificationSubject = new Subject<any>();
  private reminderSubject = new Subject<any>();
  private subjectActiveClient = new Subject<any>();
  private subjectInactiveClient = new Subject<any>();
  private subjectToRole = new Subject<any>();
  private subjectActiveRole = new Subject<any>();
  private updateVersionSubject = new Subject<any>();

  //For Project Client Settings
  sendClickEvent() {
    this.subject.next();
  }

  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  //For reminder details
  sendReminderCheck() {
    this.reminderSubject.next();
  }

  getReminderCheck(): Observable<any> {
    return this.reminderSubject.asObservable();
  }

  sendUpdateVersionCheck(){
    this.updateVersionSubject.next();
  }

  getUpdateVersionCheck():Observable<any>{
    return this.updateVersionSubject.asObservable();
  }


  //For reminder details
  sendNotificationCheck() {
    this.notificationSubject.next();
  }

  getNotificationCheck(): Observable<any> {
    return this.notificationSubject.asObservable();
  }

  //to show the counts of the active and inactive client counts project/jobs settings page
  sendActiveClient() {
    this.subjectActiveClient.next();
  }

  getActiveClient(): Observable<any> {
    return this.subjectActiveClient.asObservable();
  }

  sendInactiveClient() {
    this.subjectInactiveClient.next();
  }

  getInactiveClient(): Observable<any> {
    return this.subjectInactiveClient.asObservable();
  }

  //For user Settings
  sendClickEventToRole() {
    this.subjectToRole.next();
  }

  getClickEventToRole(): Observable<any> {
    return this.subjectToRole.asObservable();
  }
  //click the role card to get the active role details 
  // in the table user settings page

  //For reminder details
  sendActiveRole() {
    this.subjectActiveRole.next();
  }

  getActiveRole(): Observable<any> {
    return this.subjectActiveRole.asObservable();
  }

}
