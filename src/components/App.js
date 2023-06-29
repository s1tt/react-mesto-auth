import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { auth } from '../utils/Auth';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import InfoTooltip from './InfoTooltip';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';

import authImageOk from '../images/authImageOk.png';
import authImageError from '../images/authImageError.png';

import { CurrentUserContext } from '../contexts/CurrentUserContext';

function App() {
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const [currentUser, setCurrentUser] = useState({});

  const [loggedIn, setLoggedIn] = useState(false);

  const [email, setEmail] = useState('');
  const [isAuthPopupOpen, setAuthPopupOpen] = useState(false);
  const [authPopupInfo, setAuthPopupInfo] = useState({ img: '', text: '' });

  useEffect(() => {
    api
      .getUserInfo()
      .then(res => {
        setCurrentUser(res);
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    api
      .getInitialCards()
      .then(res => {
        setCards(res);
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      auth
        .tokenCheck(jwt)
        .then(res => {
          setLoggedIn(true);
          navigate('/');
          setEmail(res.data.email);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [navigate]);

  function handleEditAvatarClick() {
    setEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setAddPlacePopupOpen(true);
  }

  function closeAllPopups() {
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setEditAvatarPopupOpen(false);
    setSelectedCard(null);
    setAuthPopupOpen(false);
  }

  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    // Отправляем запрос в API и получаем обновлённые данные карточки
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then(newCard => {
        setCards(state => state.map(c => (c._id === card._id ? newCard : c)));
      })
      .catch(err => console.log(err));
  }

  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then(() => {
        setCards(state => state.filter(c => c._id !== card._id && c));
      })
      .catch(err => console.log(err));
  }

  function handleUpdateUser(user) {
    api
      .setUserInfo(user.name, user.about)
      .then(res => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch(err => console.log(err));
  }

  function handleUpdateAvatar(user) {
    api
      .changeUserAvatar(user.avatar)
      .then(res => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch(err => console.log(err));
  }

  function handleAddPlaceSubmit(name, link) {
    api
      .addNewCard(name, link)
      .then(newCard => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch(err => console.log(err));
  }

  function popupInfoSelector(popupInfo) {
    setAuthPopupInfo({ img: popupInfo.img, text: popupInfo.text });
  }

  function registration({ email, password }) {
    auth
      .registration(email, password)
      .then(() => {
        setAuthPopupOpen(true);
        popupInfoSelector({
          img: authImageOk,
          text: 'Вы успешно зарегистрировались'
        });
        setTimeout(() => {
          navigate('/sign-in');
          closeAllPopups();
        }, 3000);
        setEmail(email); // TODO
      })
      .catch(err => {
        setAuthPopupOpen(true);

        let text = '';
        switch (Number(err.split(' ')[1])) {
          case 400:
            text = 'Некорректно заполнено одно из полей ';
            break;
          default:
            text = 'Что-то пошло не так! Попробуйте еще раз!';
        }
        popupInfoSelector({
          img: authImageError,
          text
        });
      });
  }

  function authorization({ email, password }) {
    auth
      .authorization(email, password)
      .then(res => {
        localStorage.setItem('jwt', res.token);
        setEmail(email);
        setLoggedIn(authImageError);
        navigate('/');
      })
      .catch(err => {
        console.log(err.split(' ')[1]);
        setLoggedIn(false);
        setAuthPopupOpen(true);

        let text = '';
        switch (Number(err.split(' ')[1])) {
          case 400:
            text = 'Не передано одно из полей';
            break;
          case 401:
            text = 'Пользователь с таким e-mail не найден';
            break;
          default:
            text = 'Что-то пошло не так! Попробуйте еще раз!';
        }
        popupInfoSelector({
          img: authImageError,
          text
        });
      });
  }

  function signOut() {
    localStorage.removeItem('jwt');
    setLoggedIn(false);
  }

  return (
    <div className="page">
      <CurrentUserContext.Provider value={currentUser}>
        <Header loggedIn={loggedIn} email={email} onSignOut={signOut} />
        <Routes>
          <Route exact path="/sign-up" element={<Register onRegister={registration} />} />
          <Route exact path="/sign-in" element={<Login onLogin={authorization} />} />
          <Route path="*" element={<Navigate to="/"></Navigate>} />
          <Route exact path="/" element={<ProtectedRoute element={Main} loggedIn={loggedIn} onEditProfile={handleEditProfileClick} onAddPlace={handleAddPlaceClick} onEditAvatar={handleEditAvatarClick} onCardClick={setSelectedCard} onCardLike={handleCardLike} onCardDelete={handleCardDelete} cards={cards} setCards={setCards} />} />
        </Routes>
        <Footer />
        <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
        <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} />
        <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        <InfoTooltip isOpen={isAuthPopupOpen} onClose={closeAllPopups} authPopupInfo={authPopupInfo} />
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
