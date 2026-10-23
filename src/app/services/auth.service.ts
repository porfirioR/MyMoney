import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, UserCredential } from '@angular/fire/auth';
import { UserService } from './user.service';
import { UserDataModel } from '../models/user-data.model';
import { ConfigurationModel } from '../models/configuration.model';
import { LanguageType } from '../enums/language-type.enum';
import { NumberType } from '../enums/number-type.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

constructor(private auth: Auth, private readonly userService: UserService, private readonly router: Router) { }

  public logOut = (): Promise<void> => {
    return signOut(this.auth)
  }

  // Must be called from a click: browsers block popups that are not opened by the user,
  // and a page that opens Google's login by itself looks like phishing to Safe Browsing
  public loginWithGoogle = async (): Promise<void> => {
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider())
    this.openSession(credential)
  }

  public signInUser = async (email: string, password: string): Promise<void> => {
    const credential = await signInWithEmailAndPassword(this.auth, email, password)
    this.openSession(credential)
  }

  public signUpUser = (email: string, password: string): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(this.auth, email, password)
  }

  // The categories and configuration are loaded by UserGuard when the main screen opens
  private openSession = (credential: UserCredential): void => {
    const userData: UserDataModel = {
      email: credential.user.email!,
      activeCategories: [],
      allCategories: [],
      userCategories: [],
      photo: credential.user.photoURL,
      displayName: credential.user.displayName ?? '',
      userConfiguration: new ConfigurationModel(LanguageType.English, NumberType.English)
    }
    this.userService.setUser(userData)
    this.router.navigate([''])
  }
}
