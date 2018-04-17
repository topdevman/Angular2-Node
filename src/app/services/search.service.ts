import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';

import { config } from './config';
import { Weapon } from '../interfaces';

@Injectable()
export class SearchService {
  private jobIds: string[];
  private requestId: string;
  weapons: Subject<Weapon[] | string> = new Subject<Weapon[]>();

  constructor(private http: HttpClient) {
  }

  createSearchJob(body: any): Promise<any> {
    return this.http.post(`${config.url}crawler-robots/createSearchJob`, body)
      .toPromise()
      .then((res: string[]) => {
        this.jobIds = res;
        this.requestId = body.requestId;
        return this.checkJobStatus();
      });
  }

  getJobStatus(): Promise<any> {
    const body = this.jobIds;
    return this.http.post(`${config.url}crawler-robots/getJobStatus`, body).toPromise();
  }

  getSearchResults(): Promise<any> {
    const body = [this.requestId];
    return this.http.post(`${config.url}lookuprequests/lookupdata`, body).toPromise();
  }

  checkJobStatus(): Promise<any> {
    let status = {};
    let finishedIds = [];
    let len = 0;

    // test data
    // return Promise.resolve(this.getSearchResultTestData());

    return new Promise((resolve, reject) => {
      const checkTime = () => {
        try {
          setTimeout(async () => {
            status = await this.getJobStatus();

            const isFinish = (s: string) => s === 'FINISHED';
            const isFinishedAll = () => (<any>Object).values(status).every(isFinish);
            const getFinishedIds = (items) =>
              Object.keys(items).filter((item) => items[item] === 'FINISHED');

            finishedIds = getFinishedIds(status);

            if (finishedIds.length && finishedIds.length > len) {
              len = finishedIds.length;
              const result = await this.getSearchResults();
              const mergedResult = [].concat.apply([], result);
              this.weapons.next(mergedResult);

              if (isFinishedAll()) {
                this.weapons.next('FINISHED');
                return resolve(mergedResult);
              }
              checkTime();
            } else {
              checkTime();
            }
          }, 5 * 1000);
        } catch (err) {
          reject(err);
        }
      };

      checkTime();
    });
  }

  private getSearchResultTestData() {
  }

}