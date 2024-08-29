import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from '../../services/settings.service';
import { UtilService } from '../../services/util.service';
// import {} from '../../../assets/images/'

@Component({
    selector: 'app-update-profile-image',
    templateUrl: './update-profile-image.component.html',
    styleUrls: ['./update-profile-image.component.less']
})
export class UpdateProfileImageComponent implements OnInit {
    oldImage: any;
    profile: any;
    profileName: any;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    empId: any;
    imgAvailable: Boolean = false;
    selectNew: boolean = false;
    newProfileImage: any;
    dataGetted: Boolean = false;
    personImage = "../../../assets/images/user_person.png";
    resImagesSize: any;
    toasterService: any;
    resImages: any;
    msgSign: string;
    constructor(
        private settingsService: SettingsService,
        private domSanitizer: DomSanitizer,
        private spinner: NgxSpinnerService,
        private router : Router,
        public dialogRef: MatDialogRef<UpdateProfileImageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private utilsService: UtilService,

    ) {
        // console.log(data);
    }

    ngOnInit() {
        // console.log(this.data);
        this.empId = localStorage.getItem('Id');
        if (this.data == "yes") {
            this.imgAvailable = true;
            this.getEmpById();
        }else{
            this.dataGetted = true ; 
        }

        //   formData.append('action_img', file , file.name);
    }


    fileChangeEvent(event: any): void {

       
            if (event.target.files[0].size < 300000) {
                this.imageChangedEvent = event;
            } else {
                this.msgSign = "Image size must be below 300KB";
            }
    


        // console.log(this.imageChangedEvent);
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
        this.profileName = this.imageChangedEvent.target.files[0].name;
        const fileToReturn = this.base64ToFile(
            event.base64,
            this.imageChangedEvent.target.files[0].name,
        )
        this.newProfileImage = fileToReturn;
        return fileToReturn;
    }
    imageLoaded() {
        // show cropper
    }
    cropperReady() {
        // cropper ready
    }
    loadImageFailed() {
        // show message
    }

    cancel() {
        this.imageChangedEvent = null;
        this.croppedImage = null;
        this.profileName = null;
    }
    closeClick() {
        this.selectNew = true;
    }
    base64ToFile(data, filename) {

        const arr = data.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    }
    getEmpById() {
        // this.spinner.show();
        this.settingsService.getActiveEmpDetailsById(this.empId).subscribe(data => {
            if (data.map.statusMessage == "Success") {
                let res = JSON.parse(data.map.data);

                if (res.profile_image != undefined) {
                    let stringArray = new Uint8Array(res.profile_image);
                    const STRING_CHAR = stringArray.reduce((data, byte) => {
                        return data + String.fromCharCode(byte);
                    }, '');
                    let base64String = btoa(STRING_CHAR);
                    this.oldImage = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
                }
                this.dataGetted = true;
                // this.spinner.hide();
            }
        }, (error) => {
            this.router.navigate(["/404"]);
            this.spinner.hide();
        })
    }
    async removeProfilePic() {
        this.spinner.show();
        var file = await this.getFileFromUrl(this.personImage, 'image.png');
        //  console.log(file);
        let formData: any = new FormData();
        let data: Object = {
            "id": this.empId,
        }
        // console.log(data);
        formData.append("data", JSON.stringify(data));
        formData.append("employee_photo", file);
        // console.log(formData);
        this.settingsService.updateProfileImage(formData).subscribe(data => {
            if (data.map.statusMessage == "Success") {
                this.utilsService.openSnackBarAC("Profile picture removed successfully", "OK");
                setTimeout(() => {
                    this.dialogRef.close();
                }, 1000);
            }
            else {
                this.utilsService.openSnackBarMC("Failed to removed profile image", "OK");
            }
            this.spinner.hide();
        }, (error) => {
            this.router.navigate(["/404"]);
            this.spinner.hide();
            this.dialogRef.close();
        })
    }
    async getFileFromUrl(url, name, defaultType = 'image/png') {
        const response = await fetch(url);
        const data = await response.blob();
        return new File([data], name, {
            type: data.type || defaultType,
        });
    }

    updateProfilePic() {
        // console.log(this.newProfileImage);
        this.spinner.show();
        let formData: any = new FormData();
        let data: Object = {
            "id": this.empId,
        }
        formData.append("data", JSON.stringify(data));
        formData.append("employee_photo", this.newProfileImage);
        // console.log(formData);
        this.settingsService.updateProfileImage(formData).subscribe(data => {
            if (data.map.statusMessage == "Success") {
                this.utilsService.openSnackBarAC("Profile picture updated successfully", "OK");
                setTimeout(() => {
                    this.dialogRef.close();
                }, 1000);
            }
            else {
                this.utilsService.openSnackBarMC("Failed to update profile image", "OK");
            }
            this.spinner.hide();
        }, (error) => {
            this.router.navigate(["/404"]);
            this.spinner.hide();
            this.dialogRef.close();
        })

    }
}
