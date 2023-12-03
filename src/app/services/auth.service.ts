import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, UserCredential } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

constructor(private auth: Auth) { }

  public logOut = () => {
    return signOut(this.auth)
  }

  public loginWithGoogle = (): Promise<UserCredential> => {
    return signInWithPopup(this.auth, new GoogleAuthProvider())
  }

  public signInUser = (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(this.auth, email, password)
  }

  public signUpUser = (email: string, password: string): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(this.auth, email, password)
  }
}
