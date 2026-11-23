import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResponseApi } from '../classes/response-api.model';
import { ApiResponse } from '../classes/ApiResponse';



export interface GroupDTO {
  groupId: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataProviderService {

  constructor(private http: HttpClient) { }

//User Management

getUserManagementDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getUserManagementDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }

   getUserManagementDetailsById(id: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getUserManagementDetails/${id}`);
  }

  saveUserManagementDetailsDetail(userRequest: any) {
  return this.http.post<ResponseApi>(
    `${environment.apiBaseUrl}admin/saveUserDetail`,
    userRequest,
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
  );
}

  deleteUserManagement(id: number, createdBy: string): Observable<any> {
  const params = { userId: id, createdBy: createdBy };
  return this.http.post(`${environment.apiBaseUrl}admin/deleteUser`, null, { params });
}

    // Bank Type Module
    getBankType(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/bankType`);
    }

  // Bank Module
 getAllBank(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getAllBank`);
    }

  getBankDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getBankDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }
  getBankById(id: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/bank/${id}`);
  }
  updateBank(bank: any): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}admin/updateBankDetails`, bank);
  }
  saveBank(bank: any): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}admin/saveBankDetails`, bank);
  }
  deleteBank(bank: any): Observable<any> {
   return this.http.post<any>(`${environment.apiBaseUrl}admin/deleteBank`, bank);
}


  // Bank User Module
  getUserDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getUserDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }

  getUserById(id: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/${id}`);
  }
  updateBankUser(bankUser: any): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}admin/saveBankUserDetail`, bankUser);
  }
    deleteBankUser(bankUser: any): Observable<any> {
   return this.http.post<any>(`${environment.apiBaseUrl}admin/deleteBankUser`, bankUser);
}


//gallery

  getAllGalleries(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}gallery/getAllGalleries?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
    }

  uploadGallery(formData: FormData) {
  return this.http.post<{ message: string }>(`${environment.apiBaseUrl}gallery/addImgOrVideo`, formData);
  }
  getGalleryById(id: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}gallery/${id}`);
  }
  deleteGallery(galleryEntity: any): Observable<any> {
   return this.http.post<any>(`${environment.apiBaseUrl}gallery/deleteGallery`, galleryEntity);
}
updateGallery(formData: FormData) {
  return this.http.post<{ message: string }>(`${environment.apiBaseUrl}gallery/updateGallery`, formData);
}


  //Link
  getRegulatoryLinkDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getRegulatoryLinkDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }

addRegulatoryLink(link: any): Observable<any> {
  return this.http.post(`${environment.apiBaseUrl}admin/addRegulatoryLink`, link);
}
  deleteLink(linkEntity: any): Observable<any> {
   return this.http.post<any>(`${environment.apiBaseUrl}admin/deleteLinkById`, linkEntity);
}

  getRegulatoryLink(linkId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/regulatoryLink/${linkId}`);
  }
updateRegulatoryLink(link: any): Observable<any> {
  return this.http.post(`${environment.apiBaseUrl}admin/updateRegulatoryLink`, link);
}



//eventAndWebinar
getEventAndWebinar(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}eventWebinar/getEventAndWebinar?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
    }

//   addEventWebinar(formData: FormData) {
//   return this.http.post(`${environment.apiBaseUrl}eventWebinar/addEventWebinar`, formData, {
//     responseType: 'text' as 'json' // Angular expects type narrowing here
//   });
// }

addEventWebinar(formData: FormData) {
  return this.http.post<ApiResponse<any>>(
    `${environment.apiBaseUrl}eventWebinar/addEventWebinar`,
    formData
  );
}


 deleteEventWebinar(eventId: number, userId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}eventWebinar/deleteEventWebinar?eventId=${eventId}&userId=${userId}`, 
      {} // empty body, since backend only needs request params
    );
  }

  approveEventWebinar(eventId: number, userId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}eventWebinar/approveEventWebinar?eventId=${eventId}&userId=${userId}`, 
      {} // empty body, since backend only needs request params
    );
  }

  revertEventWebinar(eventId: number, userId: number) {
  return this.http.post<any>(
    `${environment.apiBaseUrl}eventWebinar/revertEventWebinar?eventId=${eventId}&userId=${userId}`,
    {}
  );
}




    getEventWebinar(eventId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}eventWebinar/getEventWebinar/${eventId}`);
  }

  getEventImageById(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}eventWebinar/getEventImageById/${id}`, { responseType: 'blob' });
  }

  //Event Gellry
  addImgOrVideo(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}eventGallery/addImgOrVideo`, formData);
  }
  getEventGalleyByAddedBy(userId: any,eventId:any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}eventGallery/listByUser/${userId}/${eventId}`);
  }

   getEventGalleryById(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}eventGallery/getEventGalleryById/${id}`, { responseType: 'blob' });
  }


  onApproveEventGallery(eventGalleryId: number, userId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}eventGallery/approveEventGallery?eventGalleryId=${eventGalleryId}&userId=${userId}`, 
      {} // empty body, since backend only needs request params
    );
  }

  onRevertEventGallery(eventGalleryId: number, userId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}eventGallery/revertEventWebinar?eventGalleryId=${eventGalleryId}&userId=${userId}`, 
      {} // empty body, since backend only needs request params
    );
  }

  // event-gallery.service.ts or your dataprovider service
deleteEventGallery(eventGalleryId: number): Observable<any> {
  return this.http.post<any>(
    `${environment.apiBaseUrl}eventGallery/deleteGallery/${eventGalleryId}`, 
    {} // empty body
  );
}


  // Update Event/Webinar
  updateEventWebinar(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}eventWebinar/updateEventWebinar`, formData);
  }

//knowledgeSharing

getKnowledgeSharingDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}knowledgeSharing/getKnowledgeSharingDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
    }

    addKnowledgeSharing(formData: FormData) {
  return this.http.post(`${environment.apiBaseUrl}knowledgeSharing/addKnowledgeSharing`, formData, {
    responseType: 'text' as 'json' // Angular expects type narrowing here
  });
}

updateKnowledgeSharing(formData: FormData) {
  return this.http.post(`${environment.apiBaseUrl}knowledgeSharing/updateKnowledgeSharing`, formData, {
    responseType: 'text' as 'json' // Angular expects type narrowing here
  });
}

getKnowledgeSharing(id: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}knowledgeSharing/getKnowledgeSharing/${id}`);
  }


getKnowledgeSharingDocById(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}knowledgeSharing/getKnowledgeSharingDocById/${id}`, { responseType: 'blob' });
  }

   approveKnowledge(knowledgeId: number, userId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}knowledgeSharing/approveKnowledge?knowledgeId=${knowledgeId}&userId=${userId}`, 
      {} // empty body, since backend only needs request params
    );
  }

    revertKnowledge(knowledgeId: number, userId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}knowledgeSharing/revertKnowledge?knowledgeId=${knowledgeId}&userId=${userId}`, 
      {} // empty body, since backend only needs request params
    );
  }

  deleteKnowledge(knowledgeId: number, userId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}knowledgeSharing/deleteKnowledge?knowledgeId=${knowledgeId}&userId=${userId}`, 
      {} // empty body, since backend only needs request params
    );
  }


   // Fetch image blob
  getGalleryImage(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}gallery/image/${id}`, { responseType: 'blob' });
  }





//Reports mail
getMailLogDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}mailLog/getMailLogDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
    }

    // data-provider.service.ts
getMailLogHtml(mailLogId: number): Observable<any> {
  return this.http.get(`${environment.apiBaseUrl}mailLog/getMailLogHtml?mailLogId=${mailLogId}`);
}

getUserAccessDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}useraccesslog/getUserAccessDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
    }


  
  deleteUser(id: number, createdBy: string): Observable<any> {
  const params = { userId: id, createdBy: createdBy };
  return this.http.post(`${environment.apiBaseUrl}api/deleteUser`, null, { params });
}
saveUserDetail(userRequest: any) {
  return this.http.post<ResponseApi>(
    `${environment.apiBaseUrl}api/saveUserDetail`,
    userRequest,
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
  );

}
getRightsAndPermission(id: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}api/${id}`);
  }


//Committee Members
  getCommitteeDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getCommitteeDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }

  getCommitteeDetailById(committeeId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getCommitteeDetailById/${committeeId}`);
  }

  // Save committee
saveCommittee(committee: any): Observable<any> {
  return this.http.post<any>(`${environment.apiBaseUrl}admin/saveCommittee`, committee);
}

// Update committee
updateCommittee(committee: any): Observable<any> {
  return this.http.post<any>(`${environment.apiBaseUrl}admin/updateCommittee`, committee);
}


 deleteCommittee(committee: any): Observable<any> {
   return this.http.post<any>(`${environment.apiBaseUrl}admin/deleteCommittee`, committee);
}

//GalleryGroupDetails
 getGalleryGroupDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getGalleryGroupDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }


getGroupById(id: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/group/${id}`);
  }

saveGroup(data: any) {
  return this.http.post<any>(`${environment.apiBaseUrl}admin/save`, data);
}

getGroupDetailById(groupId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/groupdetails/${groupId}`);
  }

  deleteGroup(group: any): Observable<any> {
   return this.http.post<any>(`${environment.apiBaseUrl}admin/deleteGroup`, group);
}

 /** Get ACTIVE groups only */
  getActiveGroups(): Observable<GroupDTO[]> {
    return this.http.get<GroupDTO[]>(`${environment.apiBaseUrl}admin/activeGroup`);
  }

  getBankUsersByBankId(bankId: number) {
  return this.http.get<any[]>(`${environment.apiBaseUrl}admin/getBankUsersByBankId`, {
    params: { bankId }
  });
}

//Data
// getDataDetails(page: number, size: number, statusIndex: number, search: string) {
//   return this.http.get<any>(`${environment.apiBaseUrl}/getDataDetails`, {
//     params: { page, size, statusIndex, search }
//   });
// }

getDataDetails(page: number, size: number, statusIndex: number, search: string) {
  return this.http.get<any>(`${environment.apiBaseUrl}data/getDataDetails`, {
    params: { page, size, statusIndex, search }
  });
}

deleteData(payload: any) {
  return this.http.post<any>(`${environment.apiBaseUrl}/deleteData`, payload);
}

saveData(payload: any) {
  return this.http.post<any>(`${environment.apiBaseUrl}/saveData`, payload);
}

getDataById(dataId: number) {
  return this.http.get<any>(`${environment.apiBaseUrl}/getDataById/${dataId}`);
}
}
