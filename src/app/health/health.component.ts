import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HealthService } from './health.service';

export enum healthCheckServicesEnum {
  postgres = 1,
  oracle = 2,
  keyCloak = 3,
}

@Component({ templateUrl: './health.component.html' })
export class HealthComponent implements OnInit {
  constructor(private service: HealthService) {}

  mobile: boolean;

  mainServices: any = { result: null };
  postgresConnection: any = { result: null };
  oracleConnection: any = { result: null };
  keyCloakAccess: any = { result: null };
  mailer: any = { result: 0 };
  credenciamentos: any = { result: null };
  fornecedores: any = { result: null };
  cessoes: any = { result: null };
  signins: any = { result: null };
  versionApi: any = { result: null };
  migrations: any[];
  to = new FormControl();
  formTestMailer = new FormGroup({ to: this.to });

  ngOnInit() {
    this.testMainServices();
    this.getStatusCredenciamentos();
    this.getStatusFornecedores();
    this.getStatusCessoes();
    this.getStatusSignins();
    this.getVersionAPI();
    this.getMigrations();
    this.solveLayout();
  }

  testMainServices() {
    this.mainServices.result = null;
    this.service.testMainServices().subscribe((result: any) => {
      this.postgresConnection.result = true;
      this.keyCloakAccess.result = true;
      this.oracleConnection.result = true;
      this.mainServices = result;
      this.mainServices.mensagem = '';

      if (result.errors) {
        this.mainServices.mensagem += this.mainServices.errors.map((error: any) => {
          if (error.serviceStatus === healthCheckServicesEnum.postgres) {
            this.postgresConnection.result = false;
            this.postgresConnection.error = error;
          } else if (error.serviceStatus === healthCheckServicesEnum.oracle) {
            this.oracleConnection.result = false;
            this.oracleConnection.error = error;
          } else {
            this.keyCloakAccess.result = false;
            this.keyCloakAccess.error = error;
          }
          return ` ${error.message}`;
        });
      } else {
        this.mainServices.mensagem = result.status;
      }
    });
  }

  testPostgresConnection() {
    this.postgresConnection.result = null;
    this.service.testPostgresConnection().subscribe(result => (this.postgresConnection = result));
  }

  testOracleConnection() {
    this.oracleConnection.result = null;
    this.service.testOracleConnection().subscribe(result => (this.oracleConnection = result));
  }

  testKeyCloakAccess() {
    this.keyCloakAccess.result = null;
    this.service.testKeyCloakAccess().subscribe(result => (this.keyCloakAccess = result));
  }

  testMailer() {
    this.mailer.result = null;
    this.service.testMailer(this.to.value).subscribe(result => (this.mailer = result));
  }

  getStatusCredenciamentos() {
    this.credenciamentos.result = null;
    this.service.getStatusCredenciamentos().subscribe(result => (this.credenciamentos = result));
  }

  getStatusFornecedores() {
    this.fornecedores.result = null;
    this.service.getStatusFornecedores().subscribe(result => (this.fornecedores = result));
  }

  getStatusCessoes() {
    this.cessoes.result = null;
    this.service.getStatusCessoes().subscribe(result => (this.cessoes = result));
  }

  getStatusSignins() {
    this.signins.result = null;
    this.service.getStatusSignins().subscribe(result => (this.signins = result));
  }

  getVersionAPI(): any {
    this.versionApi.result = null;
    this.service.getVersionAPI().subscribe(result => (this.versionApi = result));
  }

  getMigrations() {
    this.service.getMigrations().subscribe(result => (this.migrations = result));
  }

  solveLayout(): void {
    const checkScreenSize = () => {
      this.mobile = document.body.offsetWidth < 500;
    };

    window.onresize = checkScreenSize;
    checkScreenSize();
  }
}
