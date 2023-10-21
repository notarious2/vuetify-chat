<template>
  <v-card class="mx-auto mt-10 py-5 px-5" color="teal-lighten-4" width="400px" rounded="lg">
    <v-card-text class="text-center text-h5">
      Login to ChatApp
    </v-card-text>
    <form @submit.prevent="submit">
      <v-text-field v-model="username.value.value" :error-messages="username.errorMessage.value" label="Username or Email"
        bg-color="teal-lighten-5" clearable class="my-3"></v-text-field>

      <v-text-field v-model="password.value.value" label="Password" :error-messages="password.errorMessage.value"
        bg-color="teal-lighten-5" type="password" clearable></v-text-field>

      <v-row justify="center" align="center">
        <v-col cols="auto">
          <v-btn class="my-3 rounded-lg" width="400px" size="large" type="submit">
            Login
          </v-btn>
        </v-col>
      </v-row>
    </form>
    <div class="text-center mt-3">
      Don't have an account yet?
      <a href="/register/" class="text-teal-darken-1 text-decoration-none font-weight-medium">Register</a>
    </div>
    <div v-if="loginError" class="text-red text-center">{{ loginError }}</div>

    <p class="decorated mt-5" style="user-select: none;"><span>or</span></p>
    <div class="bg-white rounded-lg py-2 my-3 d-flex space-around" id="google">
      <v-icon class="ml-5" color="teal-darken-3" size="x-large">mdi-google</v-icon>
      <p class="mx-auto my-auto" style="user-select: none;"> Continue with Google</p>

    </div>

  </v-card>
</template>

<script setup>

import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const router = useRouter();

const loginError = ref(null);

const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    username(value) {
      if (!value) {
        return "Field cannot be blank";
      }
      return true;
    },
    password(value) {
      if (value?.length >= 6) return true;
      return "Password needs to be at least 6 characters.";
    },
  },
});

const submit = handleSubmit(async (userData) => {
  try {
    handleReset();
    await userStore.login(userData);

    setTimeout(() => {
      router.push("/chat/"), 50;
    });
  } catch (error) {
    if (error.message === "Network Error") {
      loginError.value = "Network error";
    } else if (error.response?.data?.detail) {
      loginError.value = error.response.data.detail;
    } else {
      loginError.value = "An error occurred during login";
    }
  }
});

const username = useField("username");
const password = useField("password");


</script>

<style scoped>
/* change bg color on hover */
#google:hover {
  background-color: rgb(190, 190, 190) !important;
  cursor: pointer;
}

/* headlines with lines */
.decorated {
  overflow: hidden;
  text-align: center;
}

.decorated>span {
  position: relative;
  display: inline-block;
}

.decorated>span:before,
.decorated>span:after {
  content: '';
  position: absolute;
  top: 50%;
  border-bottom: 1px solid;
  width: 100vw;
  margin: 0 20px;
}

.decorated>span:before {
  right: 100%;
}

.decorated>span:after {
  left: 100%;
}
</style>