<template>
  <v-card class="mx-auto my-10 py-5 px-5" color="teal-lighten-4" width="400px" rounded="lg">
    <v-card-text class="text-center text-h5 my-3">
      Create a New Account
    </v-card-text>

    <form @submit.prevent="submit">
      <v-text-field v-model="firstName.value.value" :counter="150" :error-messages="firstName.errorMessage.value"
        label="First Name" bg-color="teal-lighten-5"></v-text-field>

      <v-text-field v-model="lastName.value.value" :counter="10" :error-messages="lastName.errorMessage.value"
        label="Last Name" bg-color="teal-lighten-5"></v-text-field>

      <v-text-field v-model="username.value.value" :counter="10" :error-messages="username.errorMessage.value"
        label="Username" bg-color="teal-lighten-5"></v-text-field>

      <v-text-field v-model="email.value.value" :error-messages="email.errorMessage.value" label="E-mail"
        bg-color="teal-lighten-5"></v-text-field>
      <v-text-field v-model="password.value.value" label="Password" :error-messages="password.errorMessage.value"
        bg-color="teal-lighten-5" type="password"></v-text-field>

      <v-btn size="large" width="400px" type="submit"> Register </v-btn>

    </form>
    <div class="text-center my-3">
      Already have an account?
      <a href="/login/" class="text-teal-darken-1 text-decoration-none font-weight-medium">Login</a>
    </div>
    <div v-if="registrationError" class="text-red text-center mt-2">{{ registrationError }}</div>

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
import { useUserStore } from "@/store/userStore";

import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();
const registrationError = ref(null);

// Shared validation function for firstName, lastName, and username
function validateName(value) {
  if (value?.length >= 2 && value?.length <= 150) return true;
  if (!value) {
    return "Field cannot be blank";
  } else if (value?.length < 2) {
    return "Field needs to be at least 2 characters.";
  } else {
    return "Field cannot be longer than 150 characters.";
  }
}
const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    firstName(value) {
      return validateName(value);
    },
    lastName(value) {
      return validateName(value);
    },
    username(value) {
      return validateName(value);
    },
    email(value) {
      if (/^[a-z.-]+@[a-z.-]+\.[a-z]+$/i.test(value)) return true;

      return "Must be a valid e-mail.";
    },
    password(value) {
      if (value?.length >= 6) return true;

      return "Password needs to be at least 6 characters.";
    },
  },
});
const firstName = useField("firstName");
const lastName = useField("lastName");
const username = useField("username");
const email = useField("email");
const password = useField("password");

const submit = handleSubmit(async (data) => {
  let userData = {
    first_name: data.firstName,
    last_name: data.lastName,
    username: data.username,
    email: data.email,
    password: data.password
  }

  try {
    const response = await userStore.register(userData);
    console.log("Response", response);
    setTimeout(() => {
      router.push("/login/"), 50;
    });
  } catch (error) {
    console.error("Error", error);
    if (error.response?.data?.detail) {
      registrationError.value = error.response.data.detail;
    } else {
      registrationError.value = "An error occurred during registration.";
      handleReset()
    }
  }

});
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