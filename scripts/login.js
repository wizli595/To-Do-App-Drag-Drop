// Select switchers for Login and Signup toggle
const switchers = [...document.querySelectorAll(".switcher")];

switchers.forEach((item) => {
  item.addEventListener("click", function () {
    switchers.forEach((item) =>
      item.parentElement.classList.remove("is-active")
    );
    this.parentElement.classList.add("is-active");
  });
});

// SIGNUP FUNCTIONALITY
const signupForm = document.querySelector(".form-signup");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-password-confirm"
  ).value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (localStorage.getItem(email)) {
    alert("User already exists. Please log in.");
    return;
  }

  // Save user in localStorage
  localStorage.setItem(email, JSON.stringify({ email, password }));

  document.querySelector(".switcher-login").click();
});

const loginForm = document.querySelector(".form-login");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  // Retrieve user data
  const userData = JSON.parse(localStorage.getItem(email));

  if (!userData) {
    alert("User not found. Please sign up.");
    return;
  }

  if (userData.password === password) {
    // alert("Login successful! Redirecting...");

    localStorage.setItem("currentUser", email);
    // Redirect
    window.location.href = `./task.html`;
  } else {
    alert("Incorrect password. Please try again.");
  }
});
