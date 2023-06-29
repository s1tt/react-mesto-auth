import { useState } from 'react';
import { Link } from 'react-router-dom';

function Register({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleChangeEmail(e) {
    setEmail(e.target.value);
  }

  function handleChangePassword(e) {
    setPassword(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setEmail('');
    setPassword('');
    onRegister({ email, password });
  }

  return (
    <section className="auth">
      <h2 className="auth__title">Регистрация</h2>
      <form className="auth__form" onSubmit={handleSubmit}>
        <div className="auth__inputs">
          <label htmlFor="auth__email">
            <input id="auth__email" className="auth__input" value={email} type="email" placeholder="Email" onChange={handleChangeEmail} />
          </label>
          <label htmlFor="auth__password">
            <input id="auth__password" className="auth__input" value={password} type="password" placeholder="Пароль" onChange={handleChangePassword} />
          </label>
        </div>
        <button className="auth__btn" type="submit">
          Зарегистрироваться
        </button>
      </form>
      <p className="auth__text">
        Уже зарегистрированы?
        <Link className="auth__text-link" to={'/sign-in'}>
          Войти
        </Link>
      </p>
    </section>
  );
}

export default Register;