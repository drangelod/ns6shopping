<template>
    <Page backgroundSpanUnderStatusBar="true">
        <ActionBar>
            <Label text="Payment"></Label>
        </ActionBar>
        <ScrollView>
            <StackLayout>
                <CreditCardView ref="ccview"></CreditCardView>
                <GridLayout class="" rows="*,*,*,*,*,*" columns="100,*">
                    <Label ref="name" text="Name:" class="" row="0" col="0" />
                    <TextField class="input" row="0" col="1" hint="Joe Buyer" v-model="buyer.name" fontSize="18" />
                    <Label text="Email:" class="" row="1" col="0" />
                    <TextField ref="email" class="input" row="1" col="1" hint="joe@shopping.com" v-model="buyer.email" fontSize="18" />
                    <Label text="Address:" class="" row="2" col="0" />
                    <TextField ref="address" class="input" row="2" col="1" hint="2025 Thorntree Drive" v-model="buyer.address" fontSize="18" />
                    <Label text="City:" class="" row="3" col="0" />
                    <TextField ref="city" class="input" row="3" col="1" hint="Wallawalla" v-model="buyer.city" fontSize="18" />
                    <Label text="State:" class="" row="4" col="0" />
                    <TextField ref="state" class="input" row="4" col="1" hint="Washington" v-model="buyer.state" fontSize="18" />
                    <Label text="Postal Code:" textWrap="true" class="" row="5" col="0" />
                    <TextField ref="postalcode" class="input" row="5" col="1" hint="38291" v-model="buyer.postalcode" fontSize="18" />
                </GridLayout>
                <GridLayout rows="*" columns="*, *">
                    <Button row="0" col="0" text="Cancel" @tap="$navigateBack()" class="btn cancel-button m-t-20 " />
                    <Button row="0" col="1" text="Submit" @tap="submitPayment()" class="btn buy-button m-t-20" />
                </GridLayout>
                <CardView class="card" margin="10" elevation="20" @tap="seeDetails(item)">
                    <GridLayout class="card-layout" rows="50" columns="50, *,*,*">
                        <Image :src="item.image" stretch="aspectFill" col="0" row="0" />
                        <Label :text="item.name" class="" row="0" col="1" />
                        <Label :text="item.price | dollars" class="" row="0" col="2" />
                    </GridLayout>
                </CardView>
                <StackLayout class="line" />
                <CardView class="card" margin="10" elevation="20">
                    <GridLayout class="card-layout" rows="50" columns="50, *,*">
                        <Label text="Total:" class="" row="0" col="1" />
                        <Label :text="total | dollars" class="" row="0" col="2" />
                    </GridLayout>
                </CardView>
            </StackLayout>
        </ScrollView>
    </Page>
</template>

<script>
import firebase from "nativescript-plugin-firebase";
import ItemDetail from "./ItemDetail";
import { Stripe, Card } from 'nativescript-stripe';
import { isAndroid, isIOS } from "tns-core-modules/platform";
export default {
    components: {},
    filters: {
        dollars: num => `$${num / 100}`
    },
    data() {
        return {
            buyer: {},
            stripeObj: null,
        };
    },
    props: {
        item: {
            type: Object,
            required: true
        }
    },
    computed: {
        total() {
            return this.item.price
        },
    },
    methods: {
        seeDetails(item) {
            this.$navigateTo(ItemDetail, { props: { item: item } });
        },
        submitPayment() {
            let that = this
            let cardobj
            let ccview = this.$refs.ccview.nativeView
            let myCallback = function getPaymentMethod(err, pm) {
                if (pm) {
                    return that.submitStripePayment(pm.id, that.buyer.email, that.total);
                } else if (err) {
                    console.log(err);
                }
            }
            if (isAndroid) {
                let newcard = ccview.android.getCard() //null if invalid
                if (newcard && newcard.validateCard()) {
                    cardobj = new Card(newcard.getNumber().toString(), Number(newcard.getExpMonth()), Number(newcard.getExpYear()), newcard.getCVC().toString())
                    this.stripeObj.createToken(cardobj, (error, token) => {
                        if (!error) {
                            that.submitStripePayment(token.id, that.buyer.email, that.total).then(() => {
                                alert("Payment sent").then(() => {
                                    that.$navigateBack()
                                })
                            }).catch(err => {
                                alert("Sorry, we were unable to reach our payment server. Try again later")
                            })
                        } else {
                            console.log("Error creating token!")
                            console.log(error);
                            alert("Sorry, we were unable to reach our payment server. Try again later")
                        }
                    })
                } else {
                    console.log("INVALID card")
                    alert("Sorry, credit card is not valid")
                }
            } else if ((isIOS && ccview.ios && ccview.ios.isValid)) {
                cardobj = new Card(ccview.ios.cardNumber.toString(), ccview.ios.expirationMonth, ccview.ios.expirationYear, ccview.ios.cvc.toString())
                this.stripeObj.createToken(cardobj, (error, token) => {
                    if (!error) {
                        that.submitStripePayment(token.id, that.buyer.email, that.total).then(() => {
                            alert("Payment sent").then(() => {
                                that.$navigateBack()
                            })
                        }).catch(err => {
                            alert("Sorry, we were unable to reach our payment server. Try again later")
                        })
                    } else {
                        console.log("Error creating token!")
                        console.log(error);
                        alert("Sorry, we were unable to reach our payment server. Try again later")
                    }
                })
            } else {
                alert("Sorry, credit card is not valid")
            }
        },
        submitStripePayment(token, email, amount) {
            let charge = {};
            return firebase.firestore.collection("Payments").add({
                email: email,
                amount: amount,
                token: token,
                charge: charge,
                createDate: new Date()
            }).then(documentRef => {
                console.log(`Payment Token added with auto-generated ID: ${documentRef.id}`);
                return Promise.resolve(documentRef);
            }).catch(
                err => {
                    return Promise.reject(err);
                });
        },
    },
    created() {
        this.stripeObj = new Stripe('REPLACE_WITH_STRIPE_TEST_PUBLIC_KEY'); //public test key
    }
};
</script>

<style scoped>
.card {
    background-color: #fff;
    color: #4d4d4d;
    margin: 15;
}

.card-layout {
    padding: 20;
}

.line {
    background-color: #cecece;
    height: 2;
    margin: 0;
    padding: 4;
}

.input {
    font-size: 18;
    placeholder-color: #a8a8a8;
}

.buy-button {
    height: 30;
    background-color: rgb(51, 51, 206);
    color: white;
    border-radius: 5;
    font-size: 20;
    font-weight: 600;
}

.cancel-button {
    height: 30;
    background-color: rgb(179, 31, 31);
    color: white;
    border-radius: 5;
    font-size: 20;
    font-weight: 600;
}
</style>