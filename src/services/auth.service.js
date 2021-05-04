/* eslint-disable default-case */
import { apiConfig } from './apiConfig.service';
import { b2cPolicies } from './polices.service.js';

export const msalConfig = {
    auth: {
      clientId: "71c21cba-9a58-4415-86b4-a75a1e2ab641",
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      knownAuthorities: [b2cPolicies.authorityDomain],
      redirectUri: "http://localhost:3000",
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false,
    },
  };
  

 export const loginRequest = {
  scopes: ["openid", ...apiConfig.b2cScopes],
};

 export const tokenRequest = {
  scopes: [...apiConfig.b2cScopes],
  forceRefresh: false
};