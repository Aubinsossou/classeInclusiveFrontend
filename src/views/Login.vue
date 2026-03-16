<script setup></script>

<template>
  <body>
    <div class="container">
      <div class="header">
        <h1>Classe inclusive</h1>
        <p>Espace Administrateur</p>
      </div>
      <div class="trait"></div>
      <form action="" class="form-box">
        <label for="">Email</label>
        <input type="text" />
        <label for="">Mot de passe</label>
        <input type="text" />
        <button>Se connecter</button>
      </form>
    </div>
  </body>
</template>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  color: #1a2b7e;
  height: 100vh;
  background: linear-gradient(160deg, #0f1b3e 0%, #1a2b5e 50%, #2e1a5e 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  font-family: Nunito, sans-serif;
  display: flex;
  flex-direction: column;
  padding: 40px 35px;
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 40px;
}

.header {
  margin-bottom: 25px;
  text-align: center;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 10px;
}

p {
  background: #ede5ff;
  color: #6278A8;
  border-radius: 12px;
  padding: 6px 14px;
  display: inline-block;
  font-size: 1rem;
}

.trait {
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, transparent, #ede5ff, transparent);
  border-radius: 20px;
  margin-bottom: 25px;
}

.form-box {
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  width: 100%;
  gap: 8px;
}

label {
  align-self: flex-start;
  font-weight: 500;
  margin-top: 10px;
}

input {
  border-radius: 12px;
  border: 2px solid #d4e2ff;
  width: 100%;
  height: 44px;
  padding: 0 15px;
  font-size: 1rem;
  transition: 0.3s ease;
  border-radius: 20px;
}

input:focus {
  outline: none;
  border-color: #4bbfed;
  box-shadow: 0 0 0 3px rgba(75, 191, 237, 0.2);
}

button {
  margin-top: 20px;
  border-radius: 12px;
  background: linear-gradient(160deg, #0f1b3e 0%, #1a2b5e 50%, #2e1a5e 100%);
  color: white;
  border: none;
  height: 44px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s ease;
  box-shadow: 0 6px 20px rgba(26, 43, 94, 0.4);
}

button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(26, 43, 94, 0.5);
}

</style>

<!-- <style scoped>
* {
  margin: 0;
  padding: 0;
}

body {
  color: #1a2b7e;
  height: 100vh;
  background: linear-gradient(160deg, #0f1b3e 0%, #1a2b5e 50%, #2e1a5e 100%);
  display: flex;
  justify-content: center;
}

.header {
  margin-bottom: 20px;
}

h1 {
  font-size: 2.5rem;
}

p {
  background: #ede5ff;
  border-radius: 8px;
  padding: 3px 10px;
  display: inline-block;
  font-size: 1.9rem;
}

.trait {
  height: 2px;
  width: 80%;
  background: linear-gradient(90deg, transparent, #ede5ff, transparent);
  border-radius: 20px;
  margin-bottom: 20px;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 10px 10px;
  height: 500px;
  width:100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 52px;
  margin: auto;
}

.form-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  font-size: 1.3rem;
  width: 60%;
}

button {
  border-radius: 20px;
  background: linear-gradient(160deg, #0f1b3e 0%, #1a2b5e 50%, #2e1a5e 100%);
  color: white;
  border: none;
  padding: 10px;
  transition: 1s;
  box-shadow: 0 6px 20px rgba(26, 43, 94, 0.4);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(26, 43, 94, 0.5);
}

input {
  border-radius: 20px;
  border: 2px solid #d4e2ff;
  margin-bottom: 10px;
  transition: 0.6s;
  width: 100%;
  height: 10px;
  padding: 5px;
}

input:focus {
  outline: none;
  border: 2px solid #4bbfed;
  box-shadow: 0 0 0 3px rgba(75, 191, 237, 0.2);
}

label {
  display: flex;
  align-self: flex-start;
}

</style> -->
