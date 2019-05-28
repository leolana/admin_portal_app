import { Injectable, EventEmitter } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { LoaderState } from './loader';
import { HttpRequest } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {

    subject = new Subject<any>();

    /**
     * Stores all currently active requests
     */
    private requests: HttpRequest<any>[] = [];

    /**
     * Adds request to the storage and notifies observers
     */
    onStarted(req: HttpRequest<any>): void {
      this.requests.push(req);
      this.notify();
    }

    /**
     * Removes request from the storage and notifies observers
     */
    onFinished(req: HttpRequest<any>): void {
        for (let index = 0; index < this.requests.length; index++) {
            const element = this.requests[index];

            if (req.urlWithParams === element.urlWithParams) {
                this.requests.splice(index, 1);
                break;
            }
        }

        this.notify();
    }

    /**
     * Notifies observers about whether there are any requests on fly
     */
    private notify(): void {
        this.subject.next(this.requests.length !== 0);
    }

    onLoadingChanged(): Observable<any> {
        return this.subject.asObservable();
    }
  }
