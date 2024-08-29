import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  selectedEmpId: any;
  selectedClientId: any;
  selectedAccessId: any;
  selectedDesignationId: any;
  selectedLeaveTypeId: any;
  selectedHolidayId: any;

  constructor(private http: HttpClient) { }
  private EmpDetailsUrl = environment.hostName + "api/EmployeeDetails/";
  private RoleDetailsUrl = environment.hostName + "api/RoleDetails/";
  private ClientDetailsUrl = environment.hostName + "api/ClientDetails/";
  private AccessDetailsUrl = environment.hostName + "api/AccessDetails/";
  private DesignationDetailsUrl = environment.hostName + "api/DesignationDetails/";
  private LeaveTypeUrl = environment.hostName + "api/ManageLeaveTypes/";
  private HolidayUrl = environment.hostName + "api/HolidayDetails/";
  private AppIntegrationUrl = environment.hostName + "api/AppsIntegrationDetails/";

  // private IndianHolidaysUrl = "https://www.googleapis.com/calendar/v3/calendars/en.indian%23holiday%40group.v.calendar.google.com/events?key=AIzaSyALs-38QajxArtcIw5lI-3cBpYjexKk7Fw"

  getHolidaysList(country): Observable<any> {
    // return this.http.get(`https://www.googleapis.com/calendar/v3/calendars/en.${country}%23holiday%40group.v.calendar.google.com/events?key=AIzaSyBcOT_DpEQysiwFmmmZXupKpnrOdJYAhhM`)
    return this.http.get(`https://www.googleapis.com/calendar/v3/calendars/en.${country}%23holiday%40group.v.calendar.google.com/events?key=AIzaSyALs-38QajxArtcIw5lI-3cBpYjexKk7Fw`);
  }
  
  // For Emlpoyee details (user)

  setEmployeeId(id) {
    localStorage.setItem("EmpDeleteId", id);
  }

  getEmpId() {
    return this.selectedEmpId;
  }

  createEmployessDetails(details): Observable<any> {
    return this.http.post(`${this.EmpDetailsUrl}create`, details);
  }

  updateEmployee(details): Observable<any> {
    return this.http.put(`${this.EmpDetailsUrl}update`, details);
  }

  updateEmployeePersonalDetails(data): Observable<any> {
    return this.http.put(`${this.EmpDetailsUrl}updatePersonal`, data);
  }

  updateskippedLeaveDetails(data):Observable<any>{
    return this.http.put(`${this.EmpDetailsUrl}updateSkippedLeave`,data);
  }
  getskippedLeaveDetails():Observable<any>{
    return this.http.get(`${this.EmpDetailsUrl}getSkippedEmployeeLeaveDetails`);
  }

  updateProfileImage(details): Observable<any> {
    return this.http.put(`${this.EmpDetailsUrl}updateProfileImage`, details);
  }
  updateSkippedTime(details):Observable<any>{
    return this.http.put(`${this.EmpDetailsUrl}updateskippedTime`,details);
  }

  getActiveEmpDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getDetailsByOrgId/${id}`, id);
  }

  getActiveEmpSpecificDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getActiveEmpDetailsByOrgId/${id}`, id);
  }

  getActiveMobileNumberSpecificDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getActiveMobileNumberSpecificDetailsByOrgId/${id}`, id);
  }

  getActiveEmpDetailsById(id): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getEmployeeById/${encodeURIComponent(id)}`, id);
  }
  getInactiveEmpDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getInactiveDetailsByOrgId/${id}`, id);
  }

  getAllEmpDetails(): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getAllEmployeeDetails`);
  }

  getAllEmpDetailsByEmail(): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getAllEmployeeDetailsByEmail`);
  }
  getAllActiveEmpDetails(): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getAllActiveEmployeeDetails`);
  }

  deleteEmployee(id: any): Observable<any> {
    return this.http.put(`${this.EmpDetailsUrl}delete/${encodeURIComponent(id)}`, id);
  }

  bulkdeleteUser(details): Observable<any> {
    return this.http.put(`${this.EmpDetailsUrl}bulkUserdelete`, details);
  }

  deactivateEmployee(data: any): Observable<any> {
    return this.http.put(`${this.EmpDetailsUrl}deactivateEmployee/`, data);
  }
  activateEmployee(data: any): Observable<any> {
    return this.http.put(`${this.EmpDetailsUrl}activateEmployee/`, data);
  }

  bulkDeactivateUserDetails(data):Observable<any>{
    return this.http.put(`${this.EmpDetailsUrl}bulkDeactivateEmployeeDetails`,data);
  }

  bulkActivateUserDetails(data):Observable<any>{
    return this.http.put(`${this.EmpDetailsUrl}bulkActivateEmployeeDetails`,data);
  }

  updateBulkEmpDetailsFromExcel(details): Observable<any> {
    return this.http.post(`${this.EmpDetailsUrl}createBulkUserFromExcelFile`, details);
  }

  //only gets the custon details like - firstname , lastname , orgid, role, designation,,reporting manager
  getCustomActiveEmpDetailsByOrgID(id): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getCustomActiveEmpDetailsByOrgID/${id}`, id);
  }
 //only gets the custon details like - firstname , lastname , orgid, role, designation,,reporting manager
  getCustomInactiveEmpDetailsByOrgID(id): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getCustomInactiveEmpDetailsByOrgID/${id}`, id);
  }

  getEmployeeImagesByIds(ids): Observable<any> {
    return this.http.put(`${this.EmpDetailsUrl}getEmpImgsByIds`,ids);
  }
  // updateMailIssueForEmp(id):Observable<any> {
  //   return this.http.put(`${this.EmpDetailsUrl}updateMailIssueForEmp/${encodeURIComponent(id)}`, id);
  // }
// To get all country codes in db for create/update user and resgister org
    getCountryTelCode(): Observable<any>{
        return this.http.get(`${this.EmpDetailsUrl}getCountryTelCode`);
      }

  // For Role details
  setRoleId(id) {
    localStorage.setItem("roleDeleteId", id);
  }

  getRoleId() {
    return this.selectedEmpId;
  }

  createRoleDetails(details): Observable<any> {
    return this.http.post(`${this.RoleDetailsUrl}create`, details);
  }
  updateRole(details): Observable<any> {
    return this.http.put(`${this.RoleDetailsUrl}update`, details);
  }
  getActiveRoleDetailsByClientId(id): Observable<any> {
    return this.http.get(`${this.RoleDetailsUrl}getActiveRoleDetailsByOrgId/${id}`, id);
  }

  getRoleById(id): Observable<any> {
    return this.http.get(`${this.RoleDetailsUrl}getRoleById/${id}`, id);
  }

  // getRoleByName(role) : Observable<any> {
  //   return this.http.get(`${this.RoleDetailsUrl}getRoleByName`, role);
  // }
  getRoleByName(details,id) {
    let bodydata: Object = {
      "role" : details,
       "org_id" : id,
    };
    return this.http.post(`${this.DesignationDetailsUrl}getRoleByName`, JSON.stringify(bodydata));
  }

  deleteRole(id): Observable<any> {
    return this.http.put(`${this.RoleDetailsUrl}delete/${id}`, id);
  }

  getRoledetailsbyorgidandroleid(details): Observable<any>{
    return this.http.put(`${this.RoleDetailsUrl}getroledetailbyorgidroleid`, details);
  }

  bulkdeleteRole(details): Observable<any> {
    return this.http.put(`${this.RoleDetailsUrl}rolebulkdelete`, details);
  }
  
  updateRoleDetailsForEmployee(data): Observable<any>{
    return this.http.put(`${this.RoleDetailsUrl}updateroleemployee`, data);
  }
  // For project client details
  setClientId(id) {
    localStorage.setItem("clientId", id);
  }

  getClientId() {
    return this.selectedClientId;
  }

  createClient(create): Observable<any> {
    return this.http.post(`${this.ClientDetailsUrl}create`, create);
  }

  updateClient(update): Observable<any> {
    return this.http.put(`${this.ClientDetailsUrl}update`, update);
  }

  getActiveClientDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.ClientDetailsUrl}getActiveClientDetailsByOrgId/${id}`, id);
  }
  getInactiveClientDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.ClientDetailsUrl}getInactiveClientDetailsByOrgId/${id}`, id);
  }

  getClientDetailsById(id): Observable<any> {
    return this.http.get(`${this.ClientDetailsUrl}getClientById/${id}`, id);
  }
  deleteClient(id): Observable<any> {
    return this.http.put(`${this.ClientDetailsUrl}delete/${id}`, id);
  }
  activateClient(data: any): Observable<any> {
    return this.http.put(`${this.ClientDetailsUrl}activateClient/`, data);
  }
  deactivateClient(data: any): Observable<any> {
    return this.http.put(`${this.ClientDetailsUrl}deactivateClient/`, data);
  }

  getTotalCountCPJOrgDashboard(id): Observable<any> {
    return this.http.get(`${this.ClientDetailsUrl}getTotalCPJCount/${id}`, id);
  }

  bulkDeleteClientDetails(data):Observable<any>{
    return this.http.put(`${this.ClientDetailsUrl}bulkactiveDeactiveDelete`,data);
  }
  bulkDeactivateClientDetails(data):Observable<any>{
    return this.http.put(`${this.ClientDetailsUrl}bulkDeactiveClient`,data);
  }
  bulkActivateClientDetails(data):Observable<any>{
    return this.http.put(`${this.ClientDetailsUrl}bulkactiveClient`,data);
  }

  // For access details
  setAccessId(id) {
    localStorage.setItem("accessId", id);
  }
  setAccessName(accessName) {
    localStorage.setItem("accessName", accessName);
  }

  getAccessId() {
    return this.selectedAccessId;
  }

  createAccess(create): Observable<any> {
    return this.http.post(`${this.AccessDetailsUrl}create`, create);
  }

  updateAccess(update): Observable<any> {
    return this.http.put(`${this.AccessDetailsUrl}update`, update);
  }

  getActiveAccessDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.AccessDetailsUrl}getActiveAccessDetailsByOrgId/${id}`, id);
  }

  getAccessDetailsById(id): Observable<any> {
    return this.http.get(`${this.AccessDetailsUrl}getAccessById/${id}`, id);
  }

  getAccessDetailsByEmpId(id): Observable<any> {
    return this.http.get(`${this.AccessDetailsUrl}getAccessByEmpId/${encodeURIComponent(id)}`, id);
  }

  // For Designation details
  setDesignationId(id) {
    localStorage.setItem("designationId", id);
  }

  getDesignationId() {
    return this.selectedDesignationId;
  }

  createDesignationDetails(details): Observable<any> {
    return this.http.post(`${this.DesignationDetailsUrl}create`, details);
  }

  updateDesignation(details): Observable<any> {
    return this.http.put(`${this.DesignationDetailsUrl}update`, details);
  }

  getDesignationById(id): Observable<any> {
    return this.http.get(`${this.DesignationDetailsUrl}getDesignationById/${id}`, id);
  }

  getActiveDesignationDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.DesignationDetailsUrl}getActiveDesignationByOrgId/${id}`, id);
  }
  deleteDesignation(id): Observable<any> {
    return this.http.put(`${this.DesignationDetailsUrl}delete/${id}`, id);
  }

  getAllEmployeeReportsByOrgId(id): Observable<any> {
    return this.http.get(`${this.EmpDetailsUrl}getAllEmployeeReportsByOrgId/${id}`);
  }

  // created for onboard bulk user but not used
  
  // getAllEmployeeReportsByName(details): Observable<any> {
  //   return this.http.get(`${this.EmpDetailsUrl}getAllEmployeeReportsByName`, details);
  // }


  bulkdeleteDesignation(details): Observable<any> {
    return this.http.put(`${this.DesignationDetailsUrl}designationbulkdelete`, details);
  }

  // getDesignationByName(details): Observable<any> {
  //   return this.http.get(`${this.DesignationDetailsUrl}getDesignationByName`, details);
  // }
  getDesignationByName(details,id) {
    let bodydata: Object = {
      "designation" : details,
       "org_id" : id,
    };
    return this.http.post(`${this.DesignationDetailsUrl}getDesignationByName`, JSON.stringify(bodydata));
  }
  // For leave type details
  setLeaveTypeId(id) {
    localStorage.setItem("leavetypeId", id);
  }

  getLeaveTypeId() {
    return this.selectedLeaveTypeId;
  }

  getLeaveTypeById(id): Observable<any> {
    return this.http.get(`${this.LeaveTypeUrl}getLeaveTypeById/${id}`, id);
  }

  createLeaveTypeDetails(details): Observable<any> {
    return this.http.post(`${this.LeaveTypeUrl}create`, details);
  }

  getUndeletedLeaveTypesByOrgId(id): Observable<any> {
    return this.http.get(`${this.LeaveTypeUrl}getUndeletedLeaveTypesByOrgId/${id}`, id);
  }
  
  getActiveLeaveDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.LeaveTypeUrl}getActiveLeaveTypeByOrgId/${id}`, id);
  }

  getActiveLeaveTypeByOrgIdAndDates(details): Observable<any> {
    return this.http.put(`${this.LeaveTypeUrl}getActiveLeaveTypeByOrgIdAndDates`, details);
  }
  
  getInactiveLeaveDetailsByOrgId(id): Observable<any> {
    return this.http.get(`${this.LeaveTypeUrl}getInactiveLeaveTypeByOrgId/${id}`, id);
  }

  deleteLeaveType(details): Observable<any> {
    return this.http.put(`${this.LeaveTypeUrl}delete`, details);
  }

  bulkdeleteLeaveTypes(details): Observable<any> {
    return this.http.put(`${this.LeaveTypeUrl}leavetypesbulkdelete`, details);
  }

  updateLeaveType(details): Observable<any> {
    return this.http.put(`${this.LeaveTypeUrl}update`, details);
  }

  actDeactLeaveType(details): Observable<any> {
    return this.http.put(`${this.LeaveTypeUrl}changeActiveStatus`, details);
  }

    // For holiday details
    setHolidayId(id) {
      localStorage.setItem("holidayId", id);
    }
  
    getHolidayId() {
      return this.selectedHolidayId;
    }
  
    createHoliday(details): Observable<any> {
      return this.http.post(`${this.HolidayUrl}create`, details);
    }

    updateHoliday(details): Observable<any> {
      return this.http.put(`${this.HolidayUrl}update`, details);
    }

    getHolidayById(id): Observable<any> {
      return this.http.get(`${this.HolidayUrl}getHolidayById/${id}`, id);
    }
    
    getActiveHolidayByOrgId(id): Observable<any> {
      return this.http.get(`${this.HolidayUrl}getActiveHolidayByOrgId/${id}`, id);
    }

    getActiveHolidayByOrgIdAndDates(details): Observable<any> {
      return this.http.put(`${this.HolidayUrl}getActiveHolidayByOrgIdAndDates`, details);
    }
    deleteHoliday(details): Observable<any> {
      return this.http.put(`${this.HolidayUrl}delete`, details);
    }
    bulkDeleteHolidays(details):Observable<any>{
      return this.http.put(`${this.HolidayUrl}bulkdelete`,details);
    }

    //App integrations

    createSlackIntegration(details): Observable<any> {
      return this.http.post(`${this.AppIntegrationUrl}create`, details);

    }

    updateSlackIntegration(details): Observable<any> {
      return this.http.put(`${this.AppIntegrationUrl}update`, details);
    }

    getActiveIntegrationByOrgId(id): Observable<any> {
      return this.http.get(`${this.AppIntegrationUrl}getActiveIntegrationByOrgId/${id}`, id);
    }

    getActiveIntegrationByOrgIdAndModule(details): Observable<any> {
      return this.http.put(`${this.AppIntegrationUrl}getIntegrationByOrgIdAndModule`, details);
    }

    deleteIntegration(id): Observable<any> {
      return this.http.put(`${this.AppIntegrationUrl}delete/${id}`, id);
    }
    
    pauseResumeIntegration(details):Observable<any> {
      return this.http.put(`${this.AppIntegrationUrl}pauseOrResume`, details);
    }

    getIntegrationById(id): Observable<any> {
      return this.http.get(`${this.AppIntegrationUrl}getIntegrationById/${id}`, id);
    }

    updatereportingManager(details):Observable<any> {
      return this.http.put(`${this.EmpDetailsUrl}updatereportingmanager`, details);
    }

    getActiveSlackIntegrationByOrgId(id): Observable<any> {
      return this.http.get(`${this.AppIntegrationUrl}getActiveSlackIntegrationByOrgId/${id}`, id);
    }

    getActiveWhatsappIntegrationByOrgId(id): Observable<any> {
      return this.http.get(`${this.AppIntegrationUrl}getActiveWhatsappIntegrationByOrgId/${id}`, id);
    }

    getNewReleaseByEmpId(id): Observable<any> {
      return this.http.put(`${this.EmpDetailsUrl}getNewReleaseByEmpId/${encodeURIComponent(id)}`,id);
    }

    checkEmpDetailsUpdatedStatus(id): Observable<any> {
      return this.http.get(`${this.EmpDetailsUrl}checkdetailsupdatedstatus/${encodeURIComponent(id)}`,id);
    }
}
