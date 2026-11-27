// import { Injectable } from '@angular/core';
// import {
//   HttpInterceptor,
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpErrorResponse
// } from '@angular/common/http';
// import { Observable, throwError, BehaviorSubject } from 'rxjs';
// import { catchError, filter, switchMap, take } from 'rxjs/operators';
// import { Router } from '@angular/router';
// import { LoginService } from './service/login.service';
// import { RefreshResponse } from './classes/refresh-response.model';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   private isRefreshing = false;
//   private refreshTokenSubject = new BehaviorSubject<string | null>(null);

//   constructor(private router: Router, private loginService: LoginService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     // ✅ Skip token for login/captcha
//     if (req.url.includes('/auth/login') || req.url.includes('/auth/captcha')) {
//       return next.handle(req);
//     }

//     const token = this.getStoredToken();

//     let authReq = req;
//     if (token) {
//       authReq = this.addTokenHeader(req, token);
//     }

//     return next.handle(authReq).pipe(
//       catchError((error: HttpErrorResponse) => {
//         if (error.status === 401) {
//           // 🔄 Try to refresh token
//           return this.handle401Error(authReq, next);
//         }
//         return throwError(() => error);
//       })
//     );
//   }

//   private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     if (!this.isRefreshing) {
//       this.isRefreshing = true;
//       this.refreshTokenSubject.next(null);

//       return this.loginService.freshToken().pipe(
//         switchMap((res: RefreshResponse) => {
//           this.isRefreshing = false;

//           if (res.success && res.data?.token) {
//             const newToken = res.data.token;
//             sessionStorage.setItem('authToken', newToken);
//             this.refreshTokenSubject.next(newToken);

//             // 🔁 Retry original request
//             return next.handle(this.addTokenHeader(req, newToken));
//           } else {
//             this.logout();
//             return throwError(() => new Error('Refresh failed'));
//           }
//         }),
//         catchError(err => {
//           this.isRefreshing = false;
//           this.logout();
//           return throwError(() => err);
//         })
//       );
//     } else {
//       // ⏳ Wait until refresh is complete
//       return this.refreshTokenSubject.pipe(
//         filter(token => token != null),
//         take(1),
//         switchMap(token => next.handle(this.addTokenHeader(req, token!)))
//       );
//     }
//   }

//   private addTokenHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
//     return req.clone({
//       setHeaders: { Authorization: `Bearer ${token}` }
//     });
//   }

//   private getStoredToken(): string | null {
//     try {
//       if (typeof window !== 'undefined' && window.sessionStorage) {
//         return sessionStorage.getItem('authToken');
//       }
//     } catch {
//       return null;
//     }
//     return null;
//   }

//   private logout() {
//     try {
//       if (typeof window !== 'undefined' && window.sessionStorage) {
//         sessionStorage.removeItem('authToken');
//         sessionStorage.removeItem('bankTypes');
//         sessionStorage.removeItem('banks');
//       }
//     } catch {}
//     this.router.navigate(['/login']);
//   }
// }



import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { LoginService } from './service/login.service';
import { TokenService } from './service/TokenService';
import Swal from 'sweetalert2';  // Import SweetAlert

export interface RefreshResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    username?: string;
  } | null;
}



@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private tokenService: TokenService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // if (req.url.includes('/auth/login') || req.url.includes('/auth/captcha') ||  req.url.includes('/auth/forgotpasswordMail') ||  req.url.includes('/auth/forgotpassword')) {
    //   return next.handle(req);
    // }
        if (req.url.includes('/auth/login') || req.url.includes('/auth/captcha') || req.url.includes('/auth/forgotpasswordMail') || req.url.includes('/auth/forgotpassword')) {
      return next.handle(req);
    }

    const token = sessionStorage.getItem('authToken');
    if (!token) {
      this.showSessionTimeout();
      return throwError(() => new Error('No token found'));
    }

    // Check if token is expiring soon
    if (this.isTokenExpiringSoon(token) && !this.isRefreshing) {
      console.log('🔄 Token expiring soon — refreshing...');
      this.isRefreshing = true;

      this.loginService.freshToken().subscribe({
        next: (res: RefreshResponse) => {
          this.isRefreshing = false;
          if (res.success && res.data?.token) {
            console.log('Token refreshed successfully');
            sessionStorage.setItem('authToken', res.data.token);
            this.tokenService.startTokenTimer(res.data.token);
          } else {
            this.showSessionTimeout();
          }
        },
        error: (err) => {
          this.isRefreshing = false;
          console.error('Token refresh failed:', err);
          this.showSessionTimeout();
        }
      });
    }

    const authReq = this.addTokenHeader(req, token);
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('401 Unauthorized — Session expired');
          this.showSessionTimeout();
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const expiresAt = decoded.exp * 1000;
      const timeLeft = expiresAt - Date.now();
  
      console.log(`⏰ Token time left: ${Math.floor(timeLeft / 1000)}s`);
      if (timeLeft <= 0) {
        //  Token already expired
        this.showSessionTimeout();
        return true;
      }
      return timeLeft < 60000; // less than 10 minutes 600000
    } catch (err) {
      console.error('Failed to decode token:', err);
      this.showSessionTimeout();
      return true;
    }
  }

  private showSessionTimeout() {
    Swal.fire({
      title: 'Session Expired',
      text: 'Your session has timed out. Please log in again.',
      icon: 'warning',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false
    }).then(() => {
      this.forceLogout();
    });
  }

  private forceLogout() {
    console.warn('Logging out user...');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}

