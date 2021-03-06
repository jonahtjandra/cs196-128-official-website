import { Component, OnInit, ChangeDetectorRef, NgZone } from "@angular/core";
import { GradesService } from "src/app/services/grades.service";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-grades",
  templateUrl: "./grades.component.html",
  styleUrls: ["./grades.component.scss"]
})
export class GradesComponent implements OnInit {
  grades;
  final_grade;
  hw_grades = []
  mp_grades = []
  project_grades = []
  name;
  user: gapi.auth2.GoogleUser;
  flag: boolean = false;
  constructor(
    private GradesService: GradesService,
    private LoginService: LoginService,
    private ref: ChangeDetectorRef,
    private NgZone: NgZone
  ) {}
  isSignedIn: boolean = false;
  isIllini: boolean = true;
  ngOnInit() {
    this.LoginService.observable().subscribe(user => {
      this.user = user;
      this.ref.detectChanges();
      this.GradesService.getGrades().subscribe(data => {
        this.grades = data;
        if (this.grades) {
          this.NgZone.run(() => {
            this.displayGrades(this.grades);
          });
        }
      });
    });
  }

  displayGrades(data) {
    if (
      this.user
        .getBasicProfile()
        .getEmail()
        .match("(?:@)[^.]+(?=.)")[0]
        .substr(1) !== "illinois"
    ) {
      this.isIllini = false;
    }
    this.name = this.user.getBasicProfile().getGivenName();
    var grades = JSON.parse(JSON.stringify(data));
    var MPGradeTotal = 0;
    var MPGradeCount = 0;
    var HWGradeTotal = 0;
    var HWGradeCount = 0;
    var FinalProject = 0;
    console.log(grades.grades);
    for (var i = 0; i < grades.grades.length; ++i) {
      if (grades.grades[i]['assignment_name'].substring(0,2) == 'MP') {
        MPGradeTotal += grades.grades[i]['grades'];
        MPGradeCount++;
        this.mp_grades.push({'assignmentName': grades.grades[i]['assignment_name'], 'grade': grades.grades[i]['grades']})
      } else if (grades.grades[i]['assignment_name'].substring(0,2) == 'HW') {
        HWGradeTotal += grades.grades[i]['grades'];
        HWGradeCount++;
        this.hw_grades.push({'assignmentName': grades.grades[i]['assignment_name'], 'grade': grades.grades[i]['grades']})
      }
      console.log(this.mp_grades)
    }
    this.final_grade = Math.round(((MPGradeTotal/MPGradeCount)*0.55 + (HWGradeTotal/HWGradeCount)*0.15 + (FinalProject)*0.3) * 100)/100;
  }
}
