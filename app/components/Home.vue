<template>
    <Page>
        <ActionBar>
            <Label text="Shop"></Label>
        </ActionBar>
        <ScrollView>
            <StackLayout>
                <GridLayout rows="*" columns="*, *" v-if="rowCount>0" v-for="i in rowCount" :key="i">
                    <CardView class="card" margin="10" col="0" radius="6" elevation="20" v-if="Items[(i - 1) * itemsPerRow] && Items[(i - 1) * itemsPerRow ].name" @tap="seeDetails(Items[(i - 1) * itemsPerRow])">
                        <GridLayout class="card-layout" rows="120, auto,auto,auto" columns="*, *, *">
                            <Image v-if="Items[(i - 1) * itemsPerRow].image" :src="Items[(i - 1) * itemsPerRow].image" stretch="aspectFill" colSpan="3" row="0" />
                            <Label :text="Items[(i - 1) * itemsPerRow].name" class="" row="1" colSpan="3" />
                            <Label :text="Items[(i - 1) * itemsPerRow].price | dollars" class="" row="2" colSpan="3" />
                            <Button row="3" colSpan="3" text="Buy" @tap="addItem(Items[(i - 1) * itemsPerRow])" class="btn m-t-20 add-button" />
                        </GridLayout>
                    </CardView>
                    <CardView class="card" margin="10" col="1" elevation="20" v-if="Items[(i - 1) * itemsPerRow +1] && Items[(i - 1) * itemsPerRow +1].name" @tap="seeDetails(Items[(i - 1) * itemsPerRow +1])">
                        <GridLayout class="card-layout" rows="120, auto,auto,auto" columns="*, *, *">
                            <Image v-if="Items[(i - 1) * itemsPerRow+1].image" :src="Items[(i - 1) * itemsPerRow + 1].image" stretch="aspectFill" colSpan="3" row="0" />
                            <Label :text="Items[(i - 1) * itemsPerRow + 1].name" class="" row="1" colSpan="3" />
                            <Label :text="Items[(i - 1) * itemsPerRow +1].price | dollars" class="" row="2" colSpan="3" />
                            <Button row="3" colSpan="3" text="Buy" @tap="addItem(Items[(i - 1) * itemsPerRow +1])" class="btn m-t-20 add-button" />
                        </GridLayout>
                    </CardView>
                </GridLayout>
            </StackLayout>
        </ScrollView>
    </Page>
</template>

<script>
import firebase from "nativescript-plugin-firebase";
import ItemDetail from "./ItemDetail";
import Payment from "./Payment";
export default {
    data() {
        return {
            Items: [
                // { invId: 1, name: "An Item", image: "https://picsum.photos/300/200", price: 999, description: "This round bottle is made of opaque bright rose glass.  It has a mid-length neck, stands about seven inches tall, and the ink on its label has been washed off." },
                // { invId: 2, name: "Thing", image: "https://picsum.photos/300/200", price: 1499, description: "This round bottle is made of opaque chartreuse glass.  It has a mid-length neck, stands about six inches tall, and the ink on its label has been washed off." },
                // { invId: 3, name: "Doo-dad", image: "https://picsum.photos/300/200", price: 499, description: "This coffin-shaped bottle is made of opaque lilac glass.  It has a long neck, stands about five inches tall, and it has no label." },
                // { invId: 4, name: "Other thing", image: "https://picsum.photos/300/200", price: 299, description: "This cylindrical bottle is made of transparent bright turquoise glass.  It has a mid-length neck, stands about twelve inches tall, and it has a simple printed label." },
                // { invId: 5, name: "Last One", image: "https://picsum.photos/300/200", price: 899, description: "This teardrop-shaped bottle is made of translucent bright purple glass.  It has a mid-length neck, stands about eleven inches tall, and most of its label has been torn off." }
            ],
            itemsPerRow: 2
        }
    },
    created() {
        let that = this
        firebase.firestore
            .collection("Items")
            .get()
            .then(snapshot => {
                let itemArr = [];
                snapshot.forEach(document => {
                    itemArr.push(document.data());
                });
                that.Items = itemArr
            });
    },
    computed: {
        rowCount: function() {
            return Math.ceil(this.Items.length / this.itemsPerRow);
        },
    },
    filters: {
        dollars: num => `$${num / 100}`
    },
    methods: {
        seeDetails(item) {
            this.$navigateTo(ItemDetail, { props: { item: item } });
        },
        addItem(item) {
            // console.log("Adding item:");
            // console.dir(item);
            this.$navigateTo(Payment, { props: { item: item } });
        }
    },
};
</script>

<style scoped lang="scss">
@import '~@nativescript/theme/scss/variables/blue';
.add-button {
    height: 30;
    background-color: rgb(51, 51, 206);
    color: white;
    border-radius: 5;
    font-size: 20;
    font-weight: 600;
}

.card {
    background-color: #fff;
    color: #4d4d4d;
    margin: 15;
}

.card-layout {
    padding: 20;
}
</style>
