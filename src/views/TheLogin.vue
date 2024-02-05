<template>
  <v-card class="mx-auto mt-10 py-5 px-5" color="teal-lighten-4" width="400px" rounded="lg"
    style="font-family: Sriracha;">
    <v-card-text class="text-center text-h5" style="font-family: Sriracha !important;">
      Login to continue
    </v-card-text>
    <form @submit.prevent="submit">
      <v-text-field v-model="username.value.value" :error-messages="username.errorMessage.value" label="Username or Email"
        bg-color="teal-lighten-5" clearable class="my-3"></v-text-field>

      <v-text-field v-model="password.value.value" label="Password" :error-messages="password.errorMessage.value"
        bg-color="teal-lighten-5" counter :type="passwordType" :append-inner-icon="passwordIcon"
        @click:append-inner="toggleShow"></v-text-field>

      <v-row justify="center" align="center">
        <v-col cols="auto">
          <v-hover v-slot:default="{ isHovering, props }">
            <v-btn v-bind="props" :color="isHovering ? 'teal-lighten-3' : ''" class="my-3 rounded-lg" width="400px"
              size="large" type="submit">
              Login
            </v-btn>
          </v-hover>
        </v-col>
      </v-row>
    </form>
    <div class="text-center mt-3">
      Don't have an account yet?
      <a href="/register/" class="text-teal-darken-1 text-decoration-none font-weight-medium">Register</a>
    </div>
    <div v-if="loginError" class="text-red text-center">{{ loginError }}</div>

    <p class="decorated mt-5" style="user-select: none;"><span>or</span></p>

    <div class="bg-white rounded-lg py-2 my-3 d-flex" id="google" @click="userStore.googleAuthenticate">
      <v-icon class="ml-5" color="teal-darken-3" size="x-large">mdi-google</v-icon>
      <button class="mx-auto my-auto" style="user-select: none">Continue with
        Google
      </button>
    </div>

  </v-card>
</template>

<script setup>

import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useTheme } from 'vuetify'
import { storeToRefs } from "pinia";
import { event } from "vue-gtag";


const userStore = useUserStore();
const router = useRouter();
const loginError = ref(null);
const theme = useTheme();


const { currentTheme } = storeToRefs(userStore);


const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    username(value) {

      if (!value) {
        return "Field cannot be blank"
      } else if (value?.length < 2) {
        return "Field needs to be at least 2 characters";
      } else if (/\s/.test(value)) {
        return "Field cannot contain spaces";
      }
      return true;
    },
    password(value) {
      if (value?.length >= 6) return true;
      return "Password needs to be at least 6 characters";
    },
  },
});

const submit = handleSubmit(async (userData) => {
  try {
    handleReset();
    await userStore.login(userData);

    // set the theme
    theme.global.name.value = currentTheme.value;
    
    loginGA();

    setTimeout(() => {
      router.push("/chat/"), 50;
    });
  } catch (error) {
    console.log("ERROR", error);
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

const passwordIcon = ref("mdi-eye");
const showPassword = ref(false);
const passwordType = ref("password");

const toggleShow = () => {
  showPassword.value = !showPassword.value;
  if (showPassword.value) {
    passwordType.value = "text";
    passwordIcon.value = "mdi-eye-off"


  } else {
    passwordType.value = "password";
    passwordIcon.value = "mdi-eye"
  }
}

const loginGA = () => {
  event("user-logged-in", {
    event_category: "analytics",
    event_label: "User Logged In",
    value: 1,
  });
}

</script>

<style scoped>
/* change bg color on hover */
#google:hover {
  /* teal-lighten-3 */
  background-color: #80CBC4 !important;
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