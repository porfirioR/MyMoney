import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, UserCredential } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

constructor(private auth: Auth) { }

  public register = ({ email, password}: any) => {
    createUserWithEmailAndPassword(this.auth, email, password)
  }

  public logOut = () => {
    return signOut(this.auth)
  }

  public loginWithGoogle = (): Promise<UserCredential> => {
    return signInWithPopup(this.auth, new GoogleAuthProvider())
  }
}
