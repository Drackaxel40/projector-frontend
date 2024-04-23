import Cookies from 'js-cookie';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function LoginForm({ onConnect }) {

  const navigate = useNavigate();
  const location = useLocation();
  const [newUserMsg, setNewUserMsg] = useState('');
  

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const registerSuccess = searchParams.get('success');
    if (registerSuccess) {
        setNewUserMsg('Inscription réussie, veuillez vous connecter');
        // Erase the message after 10 seconds
        setTimeout(() => {
        setNewUserMsg('');
        }, 10000);
    }
}, [location.search]);

  async function onLoginFormSubmitHandler(e) {
    e.preventDefault();

    const loginData = {
      username: document.getElementById('username').value,
      pwd: document.getElementById('pwd').value
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/login`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    if (response.status !== 200) {
      window.alert('Utilisateur ou mot de passe incorrects');
      return;
    }

    // Get the respose data and the token
    const responseData = await response.json();
    const responseJwt = responseData.token;

    // Save the token in a cookie and the data in the client cookie
    Cookies.set('jwt', responseJwt);
    Cookies.set('userData', JSON.stringify(responseData));

    // Update the state of the parent component
    onConnect(true);

    // Redirect to projects page  
    if (responseData) {
      window.location.href = '/';
    }
  }

  return (
    <div>
      { newUserMsg ? <div className='success'>{newUserMsg}</div> : null } 
      <form className="login-field" action="" method="post">
        <h1>Connexion</h1>
        <label htmlFor="username">Utilisateur:</label>
        <input type="text" id="username" name="username" />
        <label htmlFor="pwd">Mot de passe:</label>
        <input type="password" id="pwd" name="pwd" />
        <input type="email" id="login-mail" />
        <button type="submit" onClick={onLoginFormSubmitHandler}>Se Connecter</button>
        <Link className="sign-up-link" to="/inscription"><p>S'inscrire</p></Link>
      </form>
    </div>
  )
}

export default LoginForm;