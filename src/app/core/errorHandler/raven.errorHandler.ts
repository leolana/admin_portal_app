import { ErrorHandler, Injectable } from '@angular/core';
import * as Raven from 'raven-js';

@Injectable()
export default class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err);
  }
}
