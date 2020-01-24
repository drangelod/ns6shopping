<template>
    <Page backgroundSpanUnderStatusBar="true">
        <ActionBar>
            <Label text="Details"></Label>
        </ActionBar>
        <ScrollView>
            <StackLayout>
                <CardView class="card" margin="10" col="0" elevation="20">
                    <GridLayout class="card-layout" rows="400, auto,auto,auto,auto,auto" columns="*, *, *">
                        <Image :src="item.image" stretch="aspectFill" colSpan="3" row="0" />
                        <Label :text="item.name" class="item-name" row="1" colSpan="3" />
                        <Label :text="item.price| dollars" class="item-price" row="2" colSpan="3" />
                        <Button row="3" colSpan="2" text="Buy" @tap="buyItem(item)" class="btn btn-primary m-t-20 add-button" />
                        <StackLayout class="line" row="4" colSpan="3" />
                        <TextView editable="false" row="5" colSpan="3" class="item-desc" textWrap="true" :text="item.description" />
                    </GridLayout>
                </CardView>
            </StackLayout>
        </ScrollView>
    </Page>
</template>

<script>
import Payment from "./Payment";
export default {
    components: {},
    filters: {
        dollars: num => `$${num / 100}`
    },
    props: {
        item: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
        }
    },
    computed: {
    },
    methods: {
        buyItem(item) {
            this.$navigateTo(Payment, { props: { item: item } });
        }
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
    height: 1;
    margin: 0;
    padding: 4;
}

.item-name {
    font-size: 16;
    color: black;
}

.item-price {
    font-size: 14;
    color: rgb(54, 54, 54);
}

.item-desc {
    font-size: 16;
    color: black;
    padding-bottom: 10;
    background-color: transparent;
    border-color: transparent;
}

.add-button {
    height: 30;
    background-color: rgb(51, 51, 206);
    color: white;
    border-radius: 5;
    font-size: 20;
    font-weight: 600;
}
</style>