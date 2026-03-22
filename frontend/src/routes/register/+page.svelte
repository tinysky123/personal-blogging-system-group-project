<script>
    // Import necessary dependencies and utilities
    import "$lib/css/app.css";
    import { goto } from '$app/navigation';
    import { PUBLIC_API_BASE_URL, PUBLIC_IMAGES_URL } from "$env/static/public";
    import { onMount } from 'svelte';
    import { apiGet, apiPost } from "$lib/api/api.js";
    import { checkUsername } from "$lib/api/user.js";

    // List of available avatars for selection
    let avatarList = [];
    
    /**
     * Registration form data object
     * Contains all fields required for user registration
     */
    let formData = {
        username: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        email: "",
        gender: "",
        dob: "",
        description: "",
        avatarId: null,
        avatarFilename: ""
    };

    /**
     * Component initialization
     * Loads available avatars when component mounts
     */
    onMount(async () => {
        try {
            // Fetch available avatars from API
            const data = await apiGet("/users/avatars");
            if (data.status === "success") {
                avatarList = data.data;
            }
        } catch (err) {
            console.error("Failed to load avatars:", err);
        }
    });

    // UI state variables
    let showAvatarModal = false; // Controls avatar selection modal visibility
    const today = new Date().toISOString().split('T')[0]; // Today's date for date input max value

    // Reactive validation statements
    $: passwordsMatch = formData.password === formData.confirmPassword;
    $: emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    /**
     * Validate field length constraints
     * @param {string} value - Value to validate
     * @param {number} max - Maximum allowed length
     * @returns {boolean} True if value length is within limit
     */
    function isValidLength(value, max) {
        return value.length <= max;
    }

    /**
     * Validate password length requirements
     * @param {string} value - Password to validate
     * @returns {boolean} True if password length is between 8-10 characters
     */
    function isValidPasswordLength(value) {
        return value.length >= 8 && value.length <= 10;
    }

    // Error message state
    let error = "";

    // Reactive validation for all form fields
    $: usernameValid = isValidLength(formData.username, 20);
    $: firstNameValid = isValidLength(formData.firstName, 20);
    $: lastNameValid = isValidLength(formData.lastName, 20);
    $: descriptionValid = isValidLength(formData.description, 200);
    $: passwordValid = isValidPasswordLength(formData.password);
    $: passwordStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/.test(formData.password);

    // Timeout for debounced username validation
    let usernameCheckTimeout;

    /**
     * Reactive statement for real-time username validation
     * Debounces API calls to check username availability
     */
    $: if (formData.username) {
        clearTimeout(usernameCheckTimeout);
        usernameCheckTimeout = setTimeout(async () => {
            try {
                const result = await checkUsername(formData.username);
                if (result > 0) {
                    error = "Username already exists";
                } else if (error === "Username already exists") {
                    error = "";
                }
            } catch (e) {
                console.error("Username check failed", e);
            }
        }, 400);
    }

    // Registration success state
    let success = false;
  
    /**
     * Handle user registration
     * Validates form data and submits registration request
     */
    async function register() {
        error = "";
        success = false;

        if (!usernameValid || !firstNameValid || !lastNameValid || !descriptionValid || !passwordValid) {
            error = "Please check field length limits.";
            return;
        }
        if (!formData.avatarId) {
            error = "Please select an avatar.";
            return;
        }

        if (!passwordStrong) {
            error = "Password must contain at least 1 uppercase, 1 lowercase, and 1 digit.";
            return;
        }

        if (!passwordsMatch) {
            error = "Passwords do not match.";
            return;
        }
        if (!emailValid) {
            error = "Invalid email format.";
            return;
        }

        try {
            const data = await apiPost("/users", {
                username: formData.username,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                gender: formData.gender,
                dob: formData.dob,
                description: formData.description,
                avatar_id: formData.avatarId
            });

            if (data.status === "success") {
                success = true;
                goto("/login");
            } else {
                error = data.message || "Registration failed.";
            }
        } catch (e) {
            error = e.message || "Network error";
        }
    }
</script>

<h1 class="register-title">Register</h1>

<form class="register-container register-form" on:submit|preventDefault={register}>

  <!-- Avatar Section -->
  <div class="avatar-section">
    <div class="avatar-circle"
      role="button" tabindex="0"
      on:click={() => showAvatarModal = true}
      on:keydown={(e) => e.key === 'Enter' && (showAvatarModal = true)}
    >
    {#if formData.avatarFilename}
    <img src={`${PUBLIC_IMAGES_URL}/avatars/${formData.avatarFilename}`} alt="Selected avatar"/>
  {:else}
    <span>Please select avatar</span>
  {/if}
    </div>

    <button type="button" class="edit-avatar-btn" on:click={() => showAvatarModal = true}>Edit Avatar</button>

    {#if showAvatarModal}
      <div class="avatar-modal">
        <div class="avatar-modal-content">
          <h3>Select your avatar</h3>
          <div class="avatar-grid">

            {#each avatarList as avatar}
            <button 
            class="avatar-option {formData.avatarId === avatar.avatar_id ? 'selected' : ''}"
            on:click={() => {
              formData.avatarId = avatar.avatar_id;
              formData.avatarFilename = avatar.filename;
              showAvatarModal = false;
              if (error === "Please select an avatar.") {
                error = "";
              }
            }}
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                formData.avatarId = avatar.avatar_id;
                formData.avatarFilename = avatar.filename;
                showAvatarModal = false;
                if (error === "Please select an avatar.") {
                  error = "";
                }
              }
            }}
          >
            <img 
              src={`${PUBLIC_IMAGES_URL}/avatars/${avatar.filename}`} 
              alt={`Avatar ${avatar.avatar_id}`}
            />
          </button>
          
{/each}   
            </div>
          </div>
        </div>
      {/if}
      {#if error === "Please select an avatar."}
    <p style="color: red; text-align: center;">{error}</p>
  {/if}
    </div>
  
    <div>
      <label> Username <span class="required-star">*</span>  <input bind:value={formData.username} required /></label>
      {#if formData.username && !usernameValid}
        <p style="color: red;">Username must be ≤ 20 characters.</p>
      {/if}
      {#if error === "Username already exists"}
      <p style="color: red;">{error}</p>
    {/if}
    </div>
    <div>
      <label> First Name <span class="required-star">*</span> <input bind:value={formData.firstName} required /></label>
      {#if formData.firstName && !firstNameValid}
        <p style="color: red;">First name must be ≤ 20 characters.</p>
      {/if}
    </div>
    <div>
      <label> Last Name <span class="required-star">*</span> <input bind:value={formData.lastName} required /></label>
      {#if formData.lastName && !lastNameValid}
        <p style="color: red;">Last name must be ≤ 20 characters.</p>
      {/if}
    </div>
    <div>
      <label> Password <span class="required-star">*</span> <input type="password" bind:value={formData.password} required /></label>
      {#if formData.password && !passwordValid}
  <p style="color: red;">Password must be between 8 and 10 characters.</p>
{/if}

      {#if formData.password && !passwordStrong}
  <p style="color: red;">Password must contain upper, lower, and number.</p>
{/if}
  </div>
  <div>
    <label> Confirm Password <span class="required-star">*</span> <input type="password" bind:value={formData.confirmPassword} required /></label>
  </div>
  {#if formData.confirmPassword && !passwordsMatch}
    <p style="color: red;">Passwords do not match!</p>
  {/if}

  <div>
    <label> Email <span class="required-star">*</span> <input type="email" bind:value={formData.email} required /></label>
  </div>
  {#if formData.email && !emailValid}
    <p style="color: red;">Invalid email format</p>
  {/if}

  <div>
    <label>Gender 
      <span class="required-star">*</span>
      <select bind:value={formData.gender} required>
        <option value="">Select</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
        <option value="O">Other</option>
      </select>        
    </label>
  
    {#if error === "Please select gender."}
      <p style="color: red;">{error}</p>
    {/if}
  </div>
     
  <div>
    <label> Date of Birth <span class="required-star">*</span> <input type="date" bind:value={formData.dob} required max={today} /></label>
  </div>
  <div>
    <label>About Me: <textarea bind:value={formData.description}></textarea></label>
    {#if formData.description && !descriptionValid}
      <p style="color: red;">Description must be ≤ 200 characters.</p>
    {/if}
  </div>
  <div>
    <button type="submit">Register</button>
  </div>
</form>

{#if success}
<p class="success">Registration successful!</p>
{/if}

<style>
.register-title {
text-align: center;
margin: 50px 0 30px 0;
font-family: var(--heading-1-font-family);
font-size: 36px;
font-weight: bold;
}

.register-container {
max-width: 600px;
margin: 50px auto;
padding: 30px;
background-color:rgb(255,255,255,0.7);
border-radius: var(--radius);
box-shadow: var(--shadow);
font-family: var(--body-text-font-family);
}

.avatar-section {
text-align: center;
margin-bottom: 30px;
}

.avatar-circle {
width: 150px;
height: 150px;
border-radius: 50%;
background-color: var(--light-gray);
display: flex;
justify-content: center;
align-items: center;
overflow: hidden;
margin: auto;
box-shadow: var(--shadow);
cursor: pointer;
}

.avatar-circle img {
width: 100%;
height: 100%;
object-fit: cover;
}

.edit-avatar-btn {
margin-top: 20px;
background-color: var(--brand-primary-dark);
color: white;
padding: 10px 20px;
border: none;
border-radius: var(--radius);
cursor: pointer;
font-size: 16px;
font-weight: bold;
transition: background-color 0.3s ease;
}

.edit-avatar-btn:hover {
background-color: var(--brand-primary);
}

.register-form label {
display: block;
margin-bottom: 10px;
color: var(--primary-text);
font-weight: 600;
}

.register-form input,
.register-form select,
.register-form textarea {
width: 100%;
padding: 10px 15px;
border: 1px solid var(--icon);
border-radius: var(--radius);
font-family: var(--body-text-font-family);
margin-bottom: 20px;
resize: none;
box-sizing: border-box;
}

.register-form p {
margin: 5px 0 15px 0;
font-weight: 500;
}

p.success {
color: green;
}

.register-form button[type="submit"] {
background-color: var(--brand-primary-dark);
color: white;
padding: 12px 20px;
border: none;
border-radius: var(--radius);
cursor: pointer;
font-size: 16px;
font-weight: bold;
width: 100%;
transition: background-color 0.3s ease;
}

.register-form button[type="submit"]:hover {
background-color: var(--brand-primary);
}

.avatar-modal {
position: absolute;
top: 180px;
left: 50%;
transform: translateX(-50%);
background-color: white;
padding: 20px;
border-radius: var(--radius);
box-shadow: var(--shadow);
z-index: 1000;
}

.avatar-modal-content {
background-color: white;
padding: 20px;
border-radius: var(--radius);
width: 500px;
}

.avatar-grid {
display: grid;
grid-template-columns: repeat(5, 1fr);
gap: 10px;
margin: 20px 0;
}

.avatar-option {
cursor: pointer;
padding: 0;
border: none;
background: none;
}

.avatar-option.selected {
border-color: var(--brand-primary);
}

.avatar-option img {
width: 80px;
height: 80px;
border-radius: 50%;
}

.required-star {
  color: red;
  font-weight: bold;
  margin-left: 2px;
}
</style>  