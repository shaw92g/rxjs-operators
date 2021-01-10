# rxjs-operators
Custom rxjs-operators that I commonly used

* cacheOnComplete [Demo link](https://stackblitz.com/edit/rxjs-playground-test-yap2g4?file=index.ts)
  * Usecase: You have a shared service like ``UserService`` in your application. You want to call ``getConfig(): Observable<UserConfig>`` from different parts of the application. 
    ```
    class UserConfigService {
      constructor(private httpClient: HttpClient) { }

      getUserConfig(): Observable<UserConfig> {
        return this.httpClient.get<UserConfig>('/user-config');
      }
    }
    ```
    * Problem: Every subscription ``userservice.getConfig().subscribe()`` makes a network call. You also donot want to use muticasting operators like ``share`` as it will not make a fresh network call on new subscription if the first call has failed.
    * Solution: Pipe the operator ``cacheOnComplete``. Now for every new subscription, it will check 
      * if the any previous network call is in progress (not complete), if yes it will subscribe the destination to that ongoing observable. 
      * if no previous call is in progress then
        * has the last call failed: 
          * if yes then make a fresh call 
          * if no then send the last emitted value
    ``` 
    class UserConfigService {
      constructor(private httpClient: HttpClient) { }

      getUserConfig(): Observable<UserConfig> {
        return this.httpClient.get<UserConfig>('/user-config').pipe(cacheOnComplete());
      }
    }
    ```
