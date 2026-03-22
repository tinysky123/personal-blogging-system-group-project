
<script>
  import "$lib/css/app.css";
  import { goto } from '$app/navigation';
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { userStore } from "$lib/store/user-store.js"; 
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let username;
  let password;
  let alertMessage = '';
  let showAlert = false;
  let alertTitle = "Login Failed"; 
  let additionalMessage = '';
  let redirectUrl = '/';

  onMount(() => {
    const { searchParams } = $page.url;
    redirectUrl = searchParams.get('redirect') || redirectUrl;
    const encodedData = searchParams.get('data');
    if (encodedData) {
      try {
        const jsonData = JSON.parse(decodeURIComponent(encodedData));
        additionalMessage = jsonData.message || '';
      } catch (error) {
        console.error('An error occurred in parsing the JSON data:', error);
      }
    }
    if(searchParams.get('reset')==1){
      userStore.set(null);
      const cookies = document.cookie.split("; ");
      for(let c of cookies) {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    }
  });

  const handleSubmit = async (event) => {
      event.preventDefault();
      try {
          const apiUrl = `${PUBLIC_API_BASE_URL}/auth`;
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  username: username,
                  password: password
              })
          });

          if (response.ok) {
              const data = await response.json();
              userStore.set(data); 
              document.cookie = `tokenId=${data.tokenId}; path=/`;
              document.cookie = `username=${data.username}; path=/`;
              document.cookie = `userId=${data.userId}; path=/`;
              goto(redirectUrl);
          } else {
              additionalMessage=JSON.parse(await response.text()).message;
          }
      } catch (error) {
          console.error('Request error:', error);
      }
  };

  const closeAlert = () => {
    showAlert = false;
  };
</script>

<style>

.form-log-in {
font-size: var(--body-bigger-font-size);
display: flex;
flex-direction: column;
justify-content: center;

width: 455px;
height: 278px;
align-items: flex-start;
gap: 50px;
padding: 50px;
position: relative;

border-radius: var(--radius);
border: 2px solid;
border-color: var(--light-gray);
margin-top:100px;

background-color: rgb(255, 255, 255,0.6);

}



 .input-field {
font-size: var(--body-bigger-font-size);
display: flex;
flex-direction:row;
justify-content: center;
align-items: flex-start;
align-items: center;
background-color: rgb(255,255,255,0.2);
color: var(--primary-text);
width: 100%;
margin-bottom: 1rem;
}


.input-field label {
  width: 120px;
  font-weight: 500;
  font-size: var(--body-bigger-font-size);
  color: var(--primary-text);
}


.form-log-in input {
font-size: var(--body-bigger-font-size);
display: flex;
min-width: 250px;
height: 30px;
align-items: center;
position: relative;
align-self: stretch;
width: 100%;
flex: 2;
margin-bottom: -1.00px;
margin-left: -1.00px;
margin-right: -1.00px;
border-radius: 5px;
overflow: hidden;
border: 2px solid;
border-color: var(--light-gray);
font-size: 18px;
}


.form-log-in .button-group {
color:white;
display: flex;
flex-direction: column;
position: relative;
align-self: stretch;
width: 100%;
flex: 0 0 auto;
}



.a-wrapper {
background-color: var(--brand-primary);
border-radius: 8px;
padding: 5px 10px;

}
a {
font-family: var(--heading-3-font-family);
color: white;
font-size: var(--body-bigger-font-size);
letter-spacing: 0.20px;
line-height: 24px;
white-space: nowrap;
cursor: pointer; 
}

.a-wrapper:hover {
background-color: var(--brand-primary-dark);
transition: background-color 0.3s ease;

}

a:hover {
color: white;
}


.additional-message {
  color: red;
  margin-top: 10px;
}

.sign-in-btn {
  background-color: var(--primary-text);
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: var(--body-bigger-font-size);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-family: var(--body-text-font-family);
}

.sign-in-btn:hover {
  background-color: var(--brand-primary-dark);
}


</style>

<center>
<div >
  <form class="form-log-in" on:submit={handleSubmit}>
      <div class="input-field">
      <label for="input-username">Username:</label>
      <input
      id="input-username"
      type="text"
      placeholder="username"
      name="username"
      required
      autocomplete="username"
      bind:value={username} 
      />
      </div>
      <div class="input-field">
      <label for="input-password">Password:</label>
      <input
      id="input-password"
      type="password"
      name="password"
      placeholder="password"
      required
      autocomplete="new-password"
      bind:value={password} 
      />
      </div>
      
      <div class="button-group">
        <button type="submit" class="sign-in-btn">Sign In</button>
      
        {#if additionalMessage}
          <div class="additional-message">{additionalMessage}</div>
        {/if}
      </div>
      

      <div >
      Don't have an account yet?  <span class="a-wrapper"><a href="/register">Register here</a></span></div>
  </form>
</div>
</center>

