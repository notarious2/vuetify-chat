<template>
  <v-card
    class="mx-auto mt-10 py-5 px-5"
    color="teal-lighten-4"
    width="350px"
    rounded="lg"
  >
    <form @submit.prevent="submit">
      <v-text-field
        v-model="username.value.value"
        :counter="150"
        :error-messages="username.errorMessage.value"
        label="Username or Email"
        bg-color="teal-lighten-5"
      ></v-text-field>

      <v-text-field
        v-model="password.value.value"
        label="Password"
        :error-messages="password.errorMessage.value"
        bg-color="teal-lighten-5"
        type="password"
      ></v-text-field>
      <div class="text-center">Don't have an account yet? <a href="/register/" class="text-teal-lighten-2 text-decoration-none">Register</a> </div>
      <v-row justify="center" align="center">
      <v-col cols="auto">
        <v-btn class="my-3" type="submit"> Login </v-btn>
      </v-col>
    </v-row>


    </form>
    <div v-if="loginError" class="text-red text-center">{{ loginError }}</div>
  </v-card>
</template>
<script setup>
import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import useLogin from "@/composables/useLogin";
import { useRouter } from 'vue-router';
const router = useRouter();
const loginError = ref(null);

// Shared validation function for firstName, lastName, and username
function validateName(value) {
      if (value?.length >= 2 && value?.length <= 150) return true;
      if (!value) {
        return "Field cannot be blank"
      }
      else if (value?.length < 2) {
        return "Field needs to be at least 2 characters.";
      } else {
        return "Field cannot be longer than 150 characters.";
      }
    }


const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    username(value) {
      return validateName(value);
    },
    password(value) {
      if (value?.length >= 6) return true;

      return "Password needs to be at least 6 characters.";
    },
  },
});
const username = useField("username");
const password = useField("password");

const { login } = useLogin();

const submit = handleSubmit(async (values) => {
  console.log(values);
  // change camelCase to snake_case
  values.first_name = values.firstName;
  values.last_name = values.lastName;
  delete values.firstName;
  delete values.lastName;

  try {
    const response = await login(values);
    console.log("Response", response);
     // Redirect to the success page upon successful registration
     router.push('/chat3/');
  } catch (error) {
    console.error("Error", error);
    if (error.response?.data?.detail) {
      loginError.value = error.response.data.detail;
    } else {
      loginError.value = "An error occurred during login.";
    }
  }

  handleReset()
});
</script>
