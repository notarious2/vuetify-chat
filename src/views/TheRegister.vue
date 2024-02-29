<template>
  <v-card class="mx-auto my-10 py-5 px-5" color="teal-lighten-4" width="400px" rounded="lg"
    style="font-family: Sriracha;">
    <v-card-text class="text-center text-h5 my-3" style="font-family: Sriracha !important;">
      Create an Account
    </v-card-text>

    <form @submit.prevent="submit">
      <v-text-field v-model="firstName.value.value" :counter="20" :error-messages="firstName.errorMessage.value"
        label="First Name" bg-color="teal-lighten-5" clearable class="mb-1"></v-text-field>

      <v-text-field v-model="lastName.value.value" :counter="20" :error-messages="lastName.errorMessage.value"
        label="Last Name" bg-color="teal-lighten-5" clearable class="mb-1"></v-text-field>

      <v-text-field v-model="username.value.value" :counter="20" :error-messages="username.errorMessage.value"
        label="Username" bg-color="teal-lighten-5" clearable class="mb-1"></v-text-field>

      <v-text-field v-model="email.value.value" :error-messages="email.errorMessage.value" label="E-mail"
        bg-color="teal-lighten-5" clearable class="mb-1"></v-text-field>

      <v-text-field v-model="password.value.value" counter label="Password" :error-messages="password.errorMessage.value"
        bg-color="teal-lighten-5" :type="passwordType" :append-inner-icon="passwordIcon" @click:append-inner="toggleShow"
        class="mb-1" autocomplete="on"></v-text-field>

      <v-file-input v-model="profileImage.value.value" :error-messages="profileImage.errorMessage.value"
        bg-color="teal-lighten-5" clearable show-size :prepend-icon="null" prepend-inner-icon="mdi-camera"
        @click:clear="profileImage.handleReset()"
        accept="image/*" text-align: center label="Profile image [Optional]" class="mb-1"></v-file-input>

      <v-hover v-slot:default="{ isHovering, props }">
        <v-btn v-bind="props" :color="isHovering ? 'teal-lighten-3' : ''" class="rounded-lg" size="large" width="400px"
          type="submit">
          Register </v-btn>
      </v-hover>

    </form>
    <div class="text-center my-3">
      Already have an account?
      <a href="/login/" class="text-teal-darken-1 text-decoration-none font-weight-medium">Login</a>
    </div>
    <div v-if="registrationError" class="text-red text-center mt-2">
      {{ registrationError }}
    </div>

    <p class="decorated mt-5" style="user-select: none"><span>or</span></p>

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
import { useUserStore } from "@/store/userStore";

import { useRouter } from "vue-router";


const userStore = useUserStore();
const router = useRouter();
const registrationError = ref(null);

const supportedImageFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']


// Shared validation function for firstName, lastName, and username
function validateName(value) {
  if (!value) {
    return "Field cannot be blank"
  } else if (value?.length < 2) {
    return "Field needs to be at least 2 characters.";
  } else {
    return true;
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
      if (!value) {
        return "Field cannot be blank"
      } else if (value?.length < 2) {
        return "Field needs to be at least 2 characters";
      } else if (/\s/.test(value)) {
        return "Username cannot contain spaces";
      }
      return true;
    },
    // shorter regex alternative: /[^\s@]+@[^\s@]+\.[^\s@]+/
    email(value) {
      // fully compliant with the RFC-2822 spec for email addresses.
      if (/\s/.test(value)) {
        return "Email cannot contain spaces";
      }
      if (/(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i.test(value)) return true;
      return "Must be a valid e-mail";
    },
    password(value) {
      if (value?.length >= 6) return true;

      return "Password needs to be at least 6 characters";
    },

    profileImage(value) {
      if (value?.[0]?.size > (20 * 1024 * 1024)) {
        return "Image size should be less than 20 MBs!";
      }
      if (value && !supportedImageFormats.includes(value?.[0]?.type)) {
        return "Image format is not supported!";
      }
      return true;
    },
  },
});
const firstName = useField("firstName");
const lastName = useField("lastName");
const username = useField("username");
const email = useField("email");
const password = useField("password");
const profileImage = useField("profileImage");

const passwordIcon = ref("mdi-eye");
const showPassword = ref(false);
const passwordType = ref("password");

const toggleShow = () => {
  showPassword.value = !showPassword.value;
  if (showPassword.value) {
    passwordType.value = "text";
    passwordIcon.value = "mdi-eye-off";
  } else {
    passwordType.value = "password";
    passwordIcon.value = "mdi-eye";
  }
};

const submit = handleSubmit(async (data) => {
  let userData = {
    first_name: data.firstName,
    last_name: data.lastName,
    username: data.username,
    email: data.email,
    password: data.password,
    uploaded_image: data.profileImage?.[0]
  };

  try {
    const response = await userStore.register(userData);
    setTimeout(() => {
      router.push("/login/"), 50;
    });
  } catch (error) {
    console.error("Error", error);
    if (error.response?.data?.detail) {
      registrationError.value = error.response.data.detail;
    } else {
      registrationError.value = "An error occurred during registration.";
      handleReset();
    }
  }
});
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
  content: "";
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
