import Vue from "nativescript-vue";
import Login from "./components/Login";
const application = require("tns-core-modules/application");

Vue.config.silent = false;
global.loaderOptions = {
    android: {
        margin: 100,
        dimBackground: true,
        color: "#4B9ED6",
        hideBezel: true,
        mode: 3
    },
    ios: {
        dimBackground: true,
        color: "#FFFFFF",
        hideBezel: true,
        mode: 3
    }
};
Vue.registerElement(
    "CardView",
    () => require("@nstudio/nativescript-cardview").CardView
);
Vue.registerElement(
    "CreditCardView",
    () => require("nativescript-stripe").CreditCardView
);
application.on(application.launchEvent, args => {
    if (args.ios) {
        STPPaymentConfiguration.sharedConfiguration().publishableKey = "REPLACE_WITH_STRIPE_TEST_PUBLIC_KEY";
    }
});
new Vue({
    template: `
        <Frame>
            <Login />
        </Frame>`,
    components: {
        Login
    }
}).$start();
