<template>
  <v-card
    class="mx-auto mt-10 py-5 px-5"
    color="teal-lighten-4"
    width="400px"
    rounded="lg"
  >
    <form @submit.prevent="submit">
      <v-text-field
        v-model="username.value.value"
        :error-messages="username.errorMessage.value"
        label="Username or Email"
        bg-color="teal-lighten-5"
        clearable
        class="my-3"
      ></v-text-field>

      <v-text-field
        v-model="password.value.value"
        label="Password"
        :error-messages="password.errorMessage.value"
        bg-color="teal-lighten-5"
        type="password"
        clearable
        class="mb-2"
      ></v-text-field>

      <div class="text-center mt-10">
        Don't have an account yet?
        <a href="/register/" class="text-teal-darken-1 text-decoration-none"
          >Register</a
        >
      </div>
      <v-row justify="center" align="center">
        <v-col cols="auto">
          <v-btn class="my-3" width="200px" size="large" type="submit">
            Login
          </v-btn>
        </v-col>
      </v-row>
    </form>
    <div v-if="loginError" class="text-red text-center">{{ loginError }}</div>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const router = useRouter();

const username = useField("username");
const password = useField("password");

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
</script>
