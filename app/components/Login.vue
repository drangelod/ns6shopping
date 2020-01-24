<template>
    <Page actionBarHidden="true" backgroundSpanUnderStatusBar="true">
        <FlexboxLayout class="page">
            <StackLayout class="form">
                <Image class="logo" src="~/images/NativeScript-Vue.png" />
                <Label class="header" text="SHOPPER" />
                <StackLayout class="input-field" marginBottom="25">
                    <TextField class="input" hint="Email" keyboardType="email" autocorrect="false" autocapitalizationType="none" v-model="user.email" returnKeyType="next" @returnPress="focusPassword" fontSize="18" />
                    <StackLayout class="hr-light" />
                </StackLayout>
                <StackLayout class="input-field" marginBottom="25">
                    <TextField ref="password" class="input" hint="Password" secure="true" v-model="user.password" :returnKeyType="isLoggingIn ? 'done' : 'next'" @returnPress="focusConfirmPassword" fontSize="18" />
                    <StackLayout class="hr-light" />
                </StackLayout>
                <StackLayout v-show="!isLoggingIn" class="input-field">
                    <TextField ref="confirmPassword" class="input" hint="Confirm password" secure="true" v-model="user.confirmPassword" returnKeyType="done" fontSize="18" />
                    <StackLayout class="hr-light" />
                </StackLayout>
                <Button :text="isLoggingIn ? 'Log In' : 'Sign Up'" @tap="submit" class="btn btn-primary m-t-20" />
                <Label v-show="isLoggingIn" text="Forgot your password?" class="login-label" @tap="forgotPassword" />
                <Label class="login-label sign-up-label" @tap="toggleForm">
                                                                        <FormattedString>
                                                                        	<Span :text="isLoggingIn ? 'Don’t have an account? ' : 'Back to Login'" />
                                                                        	<Span :text="isLoggingIn ? 'Sign up' : ''" class="bold" />
                                                                        </FormattedString>
                                                                    </Label>
            </StackLayout>
        </FlexboxLayout>
    </Page>
</template>

<script>
import HomePage from "./Home";
var firebase = require("nativescript-plugin-firebase");
var LoadingIndicator = require("@nstudio/nativescript-loading-indicator")
    .LoadingIndicator;
var loader = new LoadingIndicator();
export default {
    data() {
        return {
            isLoggingIn: true,
            user: {
                email: "foo2@nerdaly.com",
                password: "fooster",
                confirmPassword: "fooster"
            },
            userService: {
                async register(user) {
                    return await firebase.createUser({
                        email: user.email,
                        password: user.password,
                    }).then(
                        function(response) {
                            firebase.sendEmailVerification().then(function() {
                                    alert("A verification email has been sent, click on the link to activate your account")
                                },
                                function(error) {
                                    console.error("Error sending email verification: ", error);
                                }
                            )
                        })
                },
                async login(user) {
                    return await firebase.login({
                        type: firebase.LoginType.PASSWORD,
                        passwordOptions: {
                            email: user.email,
                            password: user.password,
                        }
                    })
                },
                async resetPassword(email) {
                    return await firebase.sendPasswordResetEmail(email)
                }
            }
        };
    },
    mounted() {
        firebase
            .init({
                // Optionally pass in properties for database, authentication and cloud messaging,
                // see their respective docs.
            })
            .then(
                function(instance) {
                    console.log("firebase.init done");
                },
                function(error) {
                    console.log("firebase.init error: " + error);
                }
            );
    },
    methods: {
        toggleForm() {
            this.isLoggingIn = !this.isLoggingIn;
        },
        submit() {
            if (!this.user.email || !this.user.password) {
                this.alert("Please provide both an email address and password.");
                return;
            }
            if (this.isLoggingIn) {
                this.login();
            } else {
                this.register();
            }
        },
        login() {
            let that = this
            loader.show(global.loaderOptions);
            this.userService
                .login(this.user)
                .then((currentUser) => {
                    loader.hide()
                    if (!currentUser.emailVerified) {
                        this.alert("Please click on the link in the verification email sent during registration. Check your Spam folder for a new link we've just emailed.");
                        firebase.sendEmailVerification().then(function() { console.log("email sent") },
                            function(error) {
                                console.error("Error sending email verification: ", error);
                            }
                        )
                        return false;
                    }
                    this.$navigateTo(HomePage, { clearHistory: true });
                })
                .catch((err) => {
                    loader.hide()
                    console.log(err)
                    this.alert("Unfortunately we could not find your account.");
                });
        },
        register() {
            if (this.user.password != this.user.confirmPassword) {
                this.alert("Your passwords do not match.");
                return;
            }
            if (this.user.password.length < 6) {
                this.alert("Your password must be at least 6 characters.");
                return;
            }
            loader.show(global.loaderOptions);
            this.userService
                .register(this.user)
                .then(() => {
                    this.isLoggingIn = true;
                    loader.hide()
                })
                .catch((err) => {
                    loader.hide()
                    this.alert("Unfortunately we were unable to create your account:\n\n" + err);
                });
        },
        forgotPassword() {
            let that = this
            prompt({
                title: "Forgot Password",
                message: "Enter the email address you used to register for APP NAME to reset your password.",
                inputType: "email",
                defaultText: "",
                okButtonText: "Ok",
                cancelButtonText: "Cancel"
            }).then(data => {
                if (data.result) {
                    loader.show(global.loaderOptions);
                    that.userService
                        .resetPassword(data.text.trim())
                        .then(() => {
                            loader.hide()
                            that.alert(
                                "Your password was successfully reset. Please check your email for instructions on choosing a new password."
                            );
                        })
                        .catch((err) => {
                            loader.hide()
                            console.error(err)
                            that.alert(
                                "Unfortunately, an error occurred resetting your password."
                            );
                        });
                }
            });
        },
        focusPassword() {
            this.$refs.password.nativeView.focus();
        },
        focusConfirmPassword() {
            if (!this.isLoggingIn) {
                this.$refs.confirmPassword.nativeView.focus();
            }
        },
        alert(message) {
            return alert({
                title: "Shopper",
                okButtonText: "OK",
                message: message
            });
        }
    }
};
</script>

<style scoped>
.page {
    align-items: center;
    flex-direction: column;
}

.form {
    margin-left: 30;
    margin-right: 30;
    flex-grow: 2;
    vertical-align: middle;
}

.logo {
    margin-bottom: 12;
    height: 90;
    font-weight: bold;
}

.header {
    horizontal-align: center;
    font-size: 25;
    font-weight: 600;
    margin-bottom: 70;
    text-align: center;
    color: rgb(51, 51, 206);
}

.input-field {
    margin-bottom: 25;
}

.input {
    font-size: 18;
    placeholder-color: #A8A8A8;
}

.input-field .input {
    font-size: 54;
}

.btn-primary {
    height: 50;
    margin: 30 5 15 5;
    background-color: rgb(51, 51, 206);
    color: white;
    border-radius: 5;
    font-size: 20;
    font-weight: 600;
}

.login-label {
    horizontal-align: center;
    color: #A8A8A8;
    font-size: 16;
}

.sign-up-label {
    margin-bottom: 20;
}

.bold {
    color: #000000;
}
</style>