import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GraphAlgorithmService {

  constructor(private http: HttpClient) {
  }

  public requestCommunityDetection(requestData: any) {
    return this.http.post('http://192.168.0.165:5000/community_detect', requestData, {
      headers: {'Content-Type': 'application/json'}
    })
      .toPromise()
      .then((responseData: any) => {
        return responseData;
      })
      .catch(err => {
        console.log(err);
      });
  }
}
