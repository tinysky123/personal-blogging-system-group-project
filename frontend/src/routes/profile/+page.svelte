<script>
  // Import necessary dependencies and utilities
  import "$lib/css/app.css";
  import { onMount } from 'svelte';
  import { userStore } from "$lib/store/user-store.js";
  import FollowList from "$lib/components/FollowOverview.svelte";
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  import { apiGet, apiPatch, apiDelete } from "$lib/api/api.js";
  import { checkUsername } from "$lib/api/user.js";

  // Component state variables
  let user = null; // Current user data from store
  let editableUser = null; // Editable copy of user data for form
  let error = ""; // Error message display
  let success = ""; // Success message display
  let isEditing = false; // Flag to toggle between view and edit mode
  let showAvatarModal = false; // Flag to show/hide avatar selection modal
  let selectedAvatarUrl = ""; // Currently selected avatar filename
  let avatarList = []; // List of available avatars
  let usernameCheckTimeout; // Timeout for debounced username validation
  
  /**
   * Component initialization
   * Loads user profile data and available avatars when component mounts
   */
  onMount(async () => {
    try {
      // Load available avatars for selection
      const avatarRes = await apiGet("/users/avatars");
      if (avatarRes.status === "success") {
        avatarList = avatarRes.data;
      }

      // Load current user profile data
      const res = await apiGet("/users/me");
      userStore.update(current => ({
        ...current,
        ...res.data
      }));
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  });

  /**
   * Subscribe to userStore changes to update local state
   * Updates user data and selected avatar when store changes
   */
  userStore.subscribe(value => {
    if (value && avatarList.length) {
      user = { ...value };
      editableUser = { ...value };
      const avatar = avatarList.find(av => av.avatar_id === value.avatarId);
      selectedAvatarUrl = avatar ? avatar.filename : "";
    }
  });

  /**
   * Enter edit mode
   * Creates editable copy of user data and enables form inputs
   */
  function handleEdit() {
    isEditing = true;
    editableUser = { ...user };
  }

  /**
   * Cancel edit mode
   * Reverts changes and returns to view mode
   */
  function handleCancel() {
    isEditing = false;
    editableUser = { ...user };
    error = "";
    success = "";
  }

  /**
   * Open avatar selection modal
   * Displays modal with available avatar options
   */
  function handleEditAvatar() {
    showAvatarModal = true;
  }

  /**
   * Handle avatar selection
   * Updates selected avatar and closes modal
   * @param {Object} avatar - Selected avatar object
   */
  function handleAvatarSelect(avatar) {
    editableUser.avatarId = avatar.avatar_id;
    selectedAvatarUrl = avatar.filename;
    showAvatarModal = false;
  }

  /**
   * Handle account deletion
   * Confirms deletion, removes account, clears cookies and redirects
   */
  async function handleDeleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await apiDelete("/users/me");

        alert("Account deleted successfully");
        // Clear authentication cookies
        document.cookie = "tokenId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        userStore.set(null);
        window.location.href = "/";
      } catch (err) {
        error = err.message || "Account deletion failed.";
        console.error("Delete failed:", err);
      }
    }
  }
  
  /**
   * Validate email format using regex
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email format is valid
   */
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  /**
   * Handle form submission and profile update
   * Validates form data, sends update request, and updates local state
   */
  async function handleSave() {
    error = "";
    success = "";

    // Frontend validation of form fields
    if (!editableUser.username.trim()) { error = "Username is required."; return; }
    
    // Check if username is changed and validate uniqueness
    if (editableUser.username !== user.username) {
      const result = await checkUsername(editableUser.username);
      if (result > 0) {
        error = "Username already exists.";
        return;
      }
    }

    if (!editableUser.firstName.trim()) { error = "First name is required."; return; }
    if (!editableUser.lastName.trim()) { error = "Last name is required."; return; }
    if (!editableUser.email.trim()) { error = "Email is required."; return; }
    if (!validateEmail(editableUser.email)) { error = "Invalid email format."; return; }
    if (!editableUser.dob.trim()) { error = "Date of birth is required."; return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(editableUser.dob)) { error = "Invalid date format (yyyy-mm-dd)."; return; }
    
    if (!editableUser.gender || editableUser.gender.trim() === "") {
      error = "Please select gender."; return;
    }
    
    if (!editableUser.avatarId || typeof editableUser.avatarId !== 'number') {
      error = "Invalid avatar selection."; return;
    }

    try {
      // Build payload with only changed fields
      const updatePayload = {};
      for (const key in editableUser) {
        if (editableUser[key] !== user[key]) {
          updatePayload[key] = editableUser[key];
        }
      }

      // Skip request if no changes detected
      if (Object.keys(updatePayload).length === 0) {
        isEditing = false;
        return;
      }

      // Send update request to backend
      await apiPatch("/users/me", updatePayload);

      // Update userStore with new data (preserve token and userId)
      userStore.update(current => ({
        ...current,
        ...updatePayload,
        token: current.token,
        userId: current.userId
      }));

      // Update local state
      user = { ...user, ...updatePayload };
      editableUser = { ...user };
      isEditing = false;
    } catch (err) {
      error = err.message || "Update failed.";
    }
  }

  /**
   * Reactive statement for real-time username validation
   * Debounces username check API calls to avoid excessive requests
   */
  $: if (isEditing && editableUser?.username) {
    clearTimeout(usernameCheckTimeout);
    usernameCheckTimeout = setTimeout(async () => {
      try {
        if (editableUser.username !== user.username) {
          const result = await checkUsername(editableUser.username);
          if (result > 0) {
            if (error === "Username already exists.") return;
            error = "Username already exists.";
          } else if (error === "Username already exists.") {
            error = "";
          }
        } else {
          if (error === "Username already exists.") {
            error = "";
          }
        }
      } catch (e) {
        console.error("Username check failed", e);
      }
    }, 400);
  }
</script>

<!-- Main profile card container -->
<div class="profile-card">
  <h1>My Profile</h1>
  {#if user && avatarList.length > 0}
    <div class="profile-container">
      <!-- Left side: Avatar section with following list -->
      <div class="avatar-section">
        {#if user && avatarList.length}
          <img src={`${PUBLIC_IMAGES_URL}/avatars/${selectedAvatarUrl}`} alt="Avatar" />
        {/if}
        
        <!-- Avatar edit button (only shown in edit mode) -->
        <div class="action-buttons">
          {#if isEditing}
            <button class="edit-avatar-btn" on:click={handleEditAvatar}>Edit Avatar</button>
          {/if}
        </div>

        <!-- Following list component embedded in avatar section -->
        <div class="follow-in-avatar">
          <h2>My Following List</h2>
          <FollowList />
        </div>
      </div>

      <!-- Avatar selection modal -->
      {#if showAvatarModal}
        <div class="avatar-modal">
          <div class="avatar-modal-content">
            <h3>Select your avatar</h3>
            <div class="avatar-grid">
              {#each avatarList as avatar}
                <button 
                  class="avatar-option {editableUser.avatarId === avatar.avatar_id ? 'selected' : ''}"
                  on:click={() => {
                    editableUser.avatarId = avatar.avatar_id; 
                    selectedAvatarUrl = avatar.filename;
                    showAvatarModal = false;
                  }}
                  on:keydown={(e) => e.key === 'Enter' && (
                    editableUser.avatarId = avatar.avatar_id,
                    selectedAvatarUrl = avatar.filename,
                    showAvatarModal = false
                  )}
                >
                  <img 
                    src={`${PUBLIC_IMAGES_URL}/avatars/${avatar.filename}`} 
                    alt={avatar.filename}
                  />
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- Right side: User information form -->
      <div class="info-section">
        <!-- Edit button (shown only in view mode) -->
        {#if !isEditing}
          <div class="edit-button-top-right">
            <button class="edit-style-btn" on:click={handleEdit}>Edit</button>
          </div>
        {/if}

        <!-- Delete account button (shown only in edit mode) -->
        {#if isEditing}
          <div class="delete-buttons">
            <button class="delete-account-btn" on:click={handleDeleteAccount}>Delete Account</button>
          </div>
        {/if}

        <!-- Username field -->
        <div>
          <strong>Username:</strong>
          {#if isEditing}
            <input bind:value={editableUser.username} />
          {:else}
            <p class="info-display">{user.username}</p>
          {/if}
        </div>

        <!-- Username validation error display -->
        {#if error === "Username already exists."}
          <p style="color: red;">{error}</p>
        {/if}

        <!-- Gender field -->
        <div>
          <strong>Gender:</strong>
          {#if isEditing}
            <select bind:value={editableUser.gender}>
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          {:else}
            <p class="info-display">{user.gender}</p>
          {/if}
        </div>

        <!-- First Name field -->
        <div>
          <strong>First Name:</strong>
          {#if isEditing}
            <input bind:value={editableUser.firstName} />
          {:else}
            <p class="info-display">{user.firstName}</p>
          {/if}
        </div>

        <!-- Date of Birth field -->
        <div>
          <strong>Date of Birth:</strong>
          {#if isEditing}
            <input type="date" bind:value={editableUser.dob} />
          {:else}
            <p class="info-display">{user.dob}</p>
          {/if}
        </div>

        <!-- Last Name field -->
        <div>
          <strong>Last Name:</strong>
          {#if isEditing}
            <input bind:value={editableUser.lastName} />
          {:else}
            <p class="info-display">{user.lastName}</p>
          {/if}
        </div>

        <!-- Email field -->
        <div>
          <strong>Email:</strong>
          {#if isEditing}
            <input bind:value={editableUser.email} />
          {:else}
            <p class="info-display">{user.email}</p>
          {/if}
        </div>

        <!-- About Me field (spans full width) -->
        <div class="full-width">
          <strong>About Me:</strong>
          {#if isEditing}
            <textarea bind:value={editableUser.description}></textarea>
          {:else}
            <div class="info-display">{user.description}</div>
          {/if}
        </div>

        <!-- Action buttons for edit mode -->
        {#if isEditing}
          <div class="edit-buttons">
            <button on:click={handleCancel} class="return-btn">Return</button>
            <button on:click={handleSave} class="save-btn">Save</button>
          </div>
        {/if}

        <!-- Error message display (excluding username error) -->
        {#if error && error !== "Username already exists."}
          <p style="color: red;">{error}</p>
        {/if}

        <!-- Success message display -->
        {#if success}
          <p style="color: green;">{success}</p>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style> 
  /* Main profile card styling */
  .profile-card{
    background-color: rgb(255,255,255,0.5);
    border-radius: var(--radius);
    padding-bottom: 2rem;
  }

  /* Container with left-right layout for avatar and form */
  .profile-container {
    display: flex;
    align-items: flex-start;
    gap: 60px;
    width: 80%;
    max-width: 1600px;
    margin: auto;
    padding: 40px;
    background-color: rgb(255,255,255,0.3);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }

  /* Left side avatar section styling */
  .avatar-section {
    flex: 0 0 300px;
    text-align: center;
    margin: auto 0;
  }

  /* Avatar image styling */
  .profile-container img {
    width: 250px;
    height: 250px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 20px;
    box-shadow: var(--shadow);
  }

  /* Avatar selection modal overlay */
  .avatar-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  /* Avatar modal content container */
  .avatar-modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
  }

  /* Grid layout for avatar options */
  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin: 20px 0;
  }

  /* Individual avatar option button */
  .avatar-option {
    cursor: pointer;
    padding: 0;
    border: none;
    background: none;
  }

  /* Selected avatar styling */
  .avatar-option.selected img {
    border: 3px solid var(--brand-primary);
  }

  /* Avatar option image styling */
  .avatar-option img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
  }

  /* Right side form section with grid layout */
  .profile-container > div:nth-child(2) {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 40px;
  }

  /* Form field labels */
  .profile-container strong {
    display: block;
    margin-bottom: 5px;
    color: var(--primary-text);
    font-weight: bold;
  }

  /* Form input styling */
  .profile-container input,
  .profile-container textarea,
  .profile-container select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--icon);
    border-radius: var(--radius);
    font-family: var(--body-text-font-family);
    resize: none;
    overflow-y: auto;
    max-height: 200px;
  }

  /* Edit button styling */
  .edit-style-btn {
    width: 120px;
    padding: 8px 12px;
    font-size: var(--body-bigger-font-size);
    border-radius: var(--radius);
    border: none;
    background-color: var(--brand-primary);
    color: white;
    cursor: pointer;
  }

  /* Edit button container positioning */
  .edit-button-top-right {
    display: flex;
    justify-content: flex-end; 
    grid-column: 1 / -1;      
    margin-bottom: 10px;
  }

  /* Save button styling */
  .save-btn{
    background-color: var(--brand-primary);
    color: white;
    font-size: var(--body-bigger-font-size);
    padding:1rem;
  }

  /* Return/Cancel button styling */
  .return-btn{
    background-color: gray;
    color: white;
    font-size: var(--body-bigger-font-size);
  }

  /* Edit button hover effect */
  .edit-style-btn:hover {
    background-color: var(--brand-primary-dark);
  }

  /* Edit mode action buttons container */
  .edit-buttons {
    display: flex;
    justify-content: flex-end; 
    gap: 1rem; 
    margin-top: 2rem;
  }

  /* Delete account button styling */
  .delete-account-btn {
    background-color: rgb(180, 69, 69);
    font-size: var(--body-bigger-font-size);
    color: white;
    margin-left: auto;
    border-radius: var(--radius);
  }

  /* Delete button hover effect */
  .delete-account-btn:hover{
    background-color: red;
  }

  /* Page title styling */
  h1 {
    text-align: center;
    padding-top: 1rem;
    margin:3rem;
  }

  /* Following list section within avatar area */
  .follow-in-avatar {
    margin-top: 40px;
    text-align: left;
    background-color:rgb(255,255,255,0.5);
    border-radius: var(--radius);
    padding: 10px 5px;
    text-align: center;
    box-shadow: none; 
  }

  /* Following list heading */
  .follow-in-avatar h2 {
    font-size: var(--heading-3-font-size);
    margin-bottom: 10px;
  }

  /* Full width fields (like About Me) */
  .full-width {
    grid-column: 1 / -1;
  }

  /* Display-only field styling */
  .info-display{
    background-color: rgba(44, 62, 80, 0.5);
    font-size: var(--body-bigger-font-size);
    color: white;
    padding-left: 1rem;
    border-radius: var(--radius);
    padding: 0.8rem;
  }
</style>
  