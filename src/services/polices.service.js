export const b2cPolicies = {
    names: {
        signUpSignIn: "B2C_1_signupsignin",
        forgotPassword: "b2c_1_reset",
        editProfile: "b2c_1_edit_profile"
    },
    authorities: {
        signUpSignIn: {
            authority: "https://omnipipead.b2clogin.com/omnipipead.onmicrosoft.com/B2C_1_signupsignin",
        },
        forgotPassword: {
            authority: "https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/b2c_1_reset",
        },
        editProfile: {
            authority: "https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/b2c_1_edit_profile"
        }
    },
    authorityDomain: "omnipipead.b2clogin.com"
}