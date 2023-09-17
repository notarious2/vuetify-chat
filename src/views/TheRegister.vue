<template>
  <v-card
    class="mx-auto mt-10 py-5 px-5"
    color="teal-lighten-5"
    width="450px"
    rounded="lg"
  >
    <form @submit.prevent="submit">
      <v-text-field
        v-model="firstName.value.value"
        :counter="150"
        :error-messages="firstName.errorMessage.value"
        label="First Name"
        bg-color="teal-lighten-4"
      ></v-text-field>

      <v-text-field
        v-model="lastName.value.value"
        :counter="10"
        :error-messages="lastName.errorMessage.value"
        label="Last Name"
        bg-color="teal-lighten-4"
      ></v-text-field>

      <v-text-field
        v-model="username.value.value"
        :counter="10"
        :error-messages="username.errorMessage.value"
        label="Username"
        bg-color="teal-lighten-4"
      ></v-text-field>

      <v-text-field
        v-model="email.value.value"
        :error-messages="email.errorMessage.value"
        label="E-mail"
        bg-color="teal-lighten-4"
      ></v-text-field>
      <v-text-field
        v-model="password.value.value"
        label="Password"
        :error-messages="password.errorMessage.value"
        bg-color="teal-lighten-4"
        type="password"
      ></v-text-field>
      <v-btn class="me-4 my-2" type="submit"> Register </v-btn>

      <v-btn @click="handleReset" class="my-2"> clear </v-btn>
    </form>
    <div v-if="registrationError" class="text-red">{{ registrationError }}</div>
  </v-card>
</template>
<script setup>
import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import useRegistration from "@/composables/useRegister";
import { useRouter } from 'vue-router';
const router = useRouter();
const registrationError = ref(null);

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

const { register } = useRegistration();

const submit = handleSubmit(async (values) => {
  console.log(values);
  // change camelCase to snake_case
  values.first_name = values.firstName;
  values.last_name = values.lastName;
  delete values.firstName;
  delete values.lastName;

  try {
    const response = await register(values);
    console.log("Response", response);
     // Redirect to the success page upon successful registration
     router.push('/chat3/');
  } catch (error) {
    console.error("Error", error);
    if (error.response?.data?.detail) {
      registrationError.value = error.response.data.detail;
    } else {
      registrationError.value = "An error occurred during registration.";
    }
  }

  // alert(JSON.stringify(values, null, 2))
  // handleReset()
});
</script>
