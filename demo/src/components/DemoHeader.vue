<template>
    <v-row>
        <v-col :md="2">
            <v-img :width="300" :src="logo" cover />
        </v-col>
        <v-col :md="10">
            <div
                class="d-flex justify-space-evenly align-center flex-column flex-sm-row fill-height"
            >
                <v-btn :flat="true" rounded="lg" color="secondary" to="/">Home</v-btn>
                <v-btn
                    :flat="true"
                    rounded="lg"
                    color="secondary"
                    to="/utm?utm_source=buffer&utm_medium=blog&utm_campaign=2-social-strategies&utm_term=term1&utm_content=blogpost"
                >
                    UTM
                </v-btn>
            </div>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import logo from '@/assets/logo.svg';
</script>
