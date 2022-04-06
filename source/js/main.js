'use strict';

const pageWidth = window.screen.width;
const body = document.querySelector('.body');
const DELAY = 100;


const onClickSpaceEnter = (element) => {
  element.addEventListener('keydown', evt => {
    if (evt.key === ' ' || evt.key === 'Enter') {
      evt.preventDefault();
      element.click();
    }
  });
}

const debounce = (cb, delay) => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(cb, delay);
  };
};

const clearForm = (form) => {
  form.addEventListener('submit', evt => {
    evt.preventDefault();
    const inputsArr = form.querySelectorAll('input');
    inputsArr.forEach(inputField => inputField.value = '');
  })
}

//Шапка
if (document.querySelector('.header')) {
  const header = document.querySelector('.header');

  //Закрытие шапки при загрузке JS
  const closeHeader = () => {
    header.classList.add('header--closed');
  }
  closeHeader();

  //Открытие - закрытие выпадающего меню в шапке
  if (document.querySelector('.header__menu-button')) {
    const menuButton = document.querySelector('.header__menu-button');

    const headerHandler = () => {
      const headerClosed = header.classList.contains('header--closed');
      header.classList.toggle('header--closed', !headerClosed);
      header.classList.toggle('header--opened', headerClosed);
      body.classList.toggle('body--disabled-scroll', headerClosed);
    }

    onClickSpaceEnter(menuButton);
    menuButton.addEventListener('click', evt => {
      evt.preventDefault();
      headerHandler();
    })


    //Работа окна логина
    if (document.querySelector('.login-window') && document.querySelector('.login-window__close-button') && document.querySelector('.header__login-link')) {
      const loginModal = document.querySelector('.login-window');
      const loginLinksArr = document.querySelectorAll('.header__login-link');
      const closeModalBtn = loginModal.querySelector('.login-window__close-button');
      const loginForm = loginModal.querySelector('.login-window__form');
      const emailInput = loginForm.querySelector('.login-window__input-field--email input');

      //закрытие окна по нажатию Esc
      const onEscClickModal = (evt) => {
        if (evt.key === 'Escape') {
          loginModal.classList.remove('login-window--opened');
          body.classList.remove('body--disabled-scroll');
          document.removeEventListener('keydown', onEscClickModal);
          loginModal.removeEventListener('keydown', focusTrap);
          menuButton.focus();
        }
      }

      //закрытие окна по клику на оверлей
      const onLeftClickModal = (evt) => {
        if (evt.target === loginModal) {
          loginModal.classList.remove('login-window--opened');
          body.classList.remove('body--disabled-scroll');
          loginModal.removeEventListener('click', onLeftClickModal);
          loginModal.removeEventListener('keydown', focusTrap);
          menuButton.focus();
        }
      }

      const focusTrap = (evt) => {
        const focusableElts = loginModal.querySelectorAll('a, input, button');

        if (evt.key === 'Tab' && evt.shiftKey) {
          evt.preventDefault();
          const currentEltIndex = Array.from(focusableElts).indexOf(document.activeElement);
          if (currentEltIndex !== 0) {
            focusableElts[currentEltIndex - 1].focus();
          } else {
            focusableElts[focusableElts.length - 1].focus();
          }
          return
        }

        if (evt.key === 'Tab') {
          evt.preventDefault();
          const currentEltIndex = Array.from(focusableElts).indexOf(document.activeElement);
          if (currentEltIndex !== focusableElts.length - 1) {
            focusableElts[currentEltIndex + 1].focus();
          } else {
            focusableElts[0].focus();
          }
        }
      }

      const loginModalHandler = () => {
        const modalOpened = loginModal.classList.contains('login-window--opened');
        loginModal.classList.toggle('login-window--opened', !modalOpened);
        body.classList.toggle('body--disabled-scroll', !modalOpened);
        if (!modalOpened) {
          emailInput.focus();
          header.classList.add('header--closed');
          header.classList.remove('header--opened');
          document.addEventListener('keydown', onEscClickModal);
          loginModal.addEventListener('click', onLeftClickModal);
          loginModal.addEventListener('keydown', focusTrap);
          clearForm(loginForm);
        }
      }

      const loginModalListener = () => {
        loginLinksArr.forEach(button => {
          onClickSpaceEnter(button);
          button.addEventListener('click', evt => {
            evt.preventDefault();
            loginModalHandler();
          })
        });

        onClickSpaceEnter(closeModalBtn);
        closeModalBtn.addEventListener('click', evt => {
          evt.preventDefault();
          loginModalHandler();
          loginModal.removeEventListener('keydown', focusTrap);
          menuButton.focus();
        })
      }

      loginModalListener();
    }
  }



  //Очистка поисковой строки при сабмите
  if (document.querySelector('.header__search-form')) {
    const headerSearchForm = document.querySelector('.header__search-form');
    clearForm(headerSearchForm);
  }
}

//Работа блока FAQ
if (document.querySelector('.faq__list')) {
  const faqList = document.querySelector('.faq__list');
  const faqQuestionsArr = faqList.querySelectorAll('.faq__question');

  const faqHandler = (element) => {
    const elementOpened = element.classList.contains('faq__item--opened');
    element.classList.toggle('faq__item--opened', !elementOpened);
  }


  faqQuestionsArr.forEach(question => {
    onClickSpaceEnter(question);
    question.addEventListener('click', evt => {
      evt.preventDefault();
      faqHandler(question.parentNode);
    })
  });
}

//Работа окна слайдера новых продуктов
if (document.querySelector('.new-products__list') && document.querySelector('.new-products__nav-list')) {
  const productList = document.querySelector('.new-products__list');
  const navList = document.querySelector('.new-products__nav-list');
  const previousPageButton = document.querySelector('.new-products__nav-previous-page');
  const nextPageButton = document.querySelector('.new-products__nav-next-page');

  //Получение обновлённых массивов с количеством продуктов и страниц
  const getNavPagesArr = () => Array.from(navList.querySelectorAll('.new-products__nav-item'));
  const getProductsArr = () => Array.from(productList.querySelectorAll('.new-products__product-card'));

  //Поиск текущих элементов
  const getShownElements = () => {
    const shownElements = getProductsArr().filter(element => window.getComputedStyle(element).getPropertyValue('display') !== 'none');
    const firstActiveElementIndex = getProductsArr().indexOf(shownElements[0]);
    const lastActiveElementIndex = getProductsArr().lastIndexOf(shownElements.pop());
    const numberOfElements = document.body.clientWidth > 1023 ? 4 : 2;

    return [firstActiveElementIndex, lastActiveElementIndex, numberOfElements];
  }

  //Определение текущей активной страницы
  const navActivePageHandler = () => {
    const [firstActiveElementIndex, lastActiveElementIndex, numberOfElements] = getShownElements();
    const activePageIndex = firstActiveElementIndex / numberOfElements;
    getNavPagesArr().forEach(page => {
      page.classList.remove('new-products__nav-item--current');
    })
    getNavPagesArr()[activePageIndex].classList.add('new-products__nav-item--current');
  }

  //Листание вправо
  const flipPageRight = () => {
    const [firstActiveElementIndex, lastActiveElementIndex, numberOfElements] = getShownElements();
    if (lastActiveElementIndex !== getProductsArr().length - 1) {
      getProductsArr().forEach(element => {
        element.style.display = 'none';
      })
      for (let i = lastActiveElementIndex + 1; i <= lastActiveElementIndex + numberOfElements && i < getProductsArr().length; i++) {
        getProductsArr()[i].style.display = 'initial';
      }
    }
  }

  //Листание влево
  const flipPageLeft = () => {
    const [firstActiveElementIndex, lastActiveElementIndex, numberOfElements] = getShownElements();
    if (firstActiveElementIndex !== 0) {
      getProductsArr().forEach(element => {
        element.style.display = 'none';
      });
      for (let i = firstActiveElementIndex - 1; i >= firstActiveElementIndex - numberOfElements && i >= 0; i--) {
        getProductsArr()[i].style.display = 'initial';
      }
    }
  }

  //Обработчик на ссылки на след и пред страницы
  const nextPrevPageHandler = () => {
    onClickSpaceEnter(nextPageButton);
    nextPageButton.addEventListener('click', evt => {
      evt.preventDefault();
      flipPageRight();
      navActivePageHandler();
    });

    onClickSpaceEnter(previousPageButton);
    previousPageButton.addEventListener('click', evt => {
      evt.preventDefault();
      flipPageLeft();
      navActivePageHandler();
    });
  }

  //Обработка свайпов
  let touchstartX = 0;
  let touchendX = 0;

  const handleGesture = () => {
    if (touchendX < touchstartX) {
      flipPageRight();
      navActivePageHandler();
    };
    if (touchendX > touchstartX) {
      flipPageLeft();
      navActivePageHandler();
    };
  }

  const handleStart = (evt) => {
    evt.preventDefault();
    touchstartX = evt.changedTouches[0].screenX;
  }

  const handleEnd = (evt) => {
    evt.preventDefault();
    touchendX = evt.changedTouches[0].screenX;
    handleGesture();
  }

  const swipeHandler = () => {
    productList.addEventListener('touchstart', handleStart, false);
    productList.addEventListener('touchend', handleEnd, false);
  }

  //Количество страниц в навигации
  const defineNumOfPages = () => {
    let numOfPages = document.body.clientWidth > 1023 ? getProductsArr().length / 4 : getProductsArr().length / 2;
    const currentPages = getNavPagesArr();
    const neededPages = numOfPages - currentPages.length;
    return neededPages;
  }

  //Добавляет и убирает страницы
  const navPageLinksHandler = () => {
    const neededPages = defineNumOfPages();
    if (neededPages > 0) {
      for (let i = neededPages; i > 0; i--) {
        const pageTemplate = document.querySelector('#nav-page').content.querySelector('.new-products__nav-item');
        const newPage = pageTemplate.cloneNode(true);
        newPage.querySelector('.new-products__nav-page').textContent = getNavPagesArr().length + 1;
        navList.appendChild(newPage);
      }
      navPageHandler();
    } else if (neededPages < 0) {
      const elementsToDelete = getNavPagesArr().slice(neededPages);
      elementsToDelete.forEach(element => {
        element.remove();
      });
      navPageHandler();
      navActivePageHandler();
    }
  }

  //Переход по номерам страниц
  const navPageHandler = () => {
    getNavPagesArr().forEach(page => {
      onClickSpaceEnter(page);
      page.addEventListener('click', evt => {
        evt.preventDefault();
        if (document.body.clientWidth > 768) {
          const pageIndex = getNavPagesArr().indexOf(page);
          const [firstActiveElementIndex, lastActiveElementIndex, numberOfElements] = getShownElements();
          const lastElementIndex = (numberOfElements * (pageIndex + 1)) - 1;
          if (lastActiveElementIndex !== lastElementIndex) {
            getProductsArr().forEach(element => {
              element.style.display = 'none';
            });
            const activeElementsArr = getProductsArr().slice((lastElementIndex + 1 - numberOfElements), (lastElementIndex + 1));
            activeElementsArr.forEach(element => {
              element.style.display = 'initial';
            });
          }
        }
        navActivePageHandler();
      });
    });
  }

  //Убирает лишние элементы при переключении разрешения
  const activeProductsHandler = () => {
    const [firstActiveElementIndex, lastActiveElementIndex, numberOfElements] = getShownElements();
    if (document.body.clientWidth > 1023 && lastActiveElementIndex === firstActiveElementIndex + 1) {
      let inactiveElementsArr;
      if ((lastActiveElementIndex + 1) % 4 === 0) {

        inactiveElementsArr = getProductsArr().slice((firstActiveElementIndex - 2), firstActiveElementIndex);

      } else {
        inactiveElementsArr = getProductsArr().slice((lastActiveElementIndex + 1), (lastActiveElementIndex + 3));
      }
      inactiveElementsArr.forEach(element => {
        element.style.display = 'initial';
      });
    } else if (document.body.clientWidth < 1024) {

      let extraActiveElementsArr = getProductsArr().slice((firstActiveElementIndex + 2), (firstActiveElementIndex + 5));

      extraActiveElementsArr.forEach(element => {
        element.style.display = 'none';
      });
    }
    navActivePageHandler();
  }

  const windowResizeHandler = () => {
    window.addEventListener('resize', debounce(() => {
      navPageLinksHandler();
      activeProductsHandler();
      navActivePageHandler();
    }, DELAY));
  }

  swipeHandler();
  nextPrevPageHandler();
  navPageHandler();
  navPageLinksHandler();
  windowResizeHandler();
}

//Фильтр в каталоге
if (document.querySelector('.catalog-filter')) {
  const catalogFilterForm = document.querySelector('.catalog-filter__form');
  const catalogSectionsArr = catalogFilterForm.querySelectorAll('.catalog-filter__section-title');
  const filterClearBtn = catalogFilterForm.querySelector('.catalog-filter__button--clear');
  const catalogFilter = catalogFilterForm.querySelectorAll('.catalog-filter__filter-item input');

  //Работа аккордеона
  const filterSectionHandler = () => {
    catalogSectionsArr.forEach(section => {
      onClickSpaceEnter(section);
      section.addEventListener('click', evt => {
        evt.preventDefault();
        const filterSectionIsClosed = section.parentNode.classList.contains('catalog-filter__section--closed');
        section.parentNode.classList.toggle('catalog-filter__section--closed', !filterSectionIsClosed);
      })
    });
  }

  //Сброс фильтров
  const clearFilterHandler = () => {
    onClickSpaceEnter(filterClearBtn);
    filterClearBtn.addEventListener('click', evt => {
      evt.preventDefault();
      catalogFilter.forEach(filter => {
        filter.checked = false;
      });
    });
  }

  filterSectionHandler();
  clearFilterHandler();

  //Появление фильтра в планшетной версии и мобильной
  if (document.body.clientWidth < 1024 && document.querySelector('.catalog-filter__button--show-filter')) {
    const filterShowBtn = document.querySelector('.catalog-filter__button--show-filter');
    const filterCloseBtn = document.querySelector('.catalog-filter__close-button');

    const filterHandler = () => {
      const filterIsOpened = catalogFilterForm.classList.contains('catalog-filter__form--opened');
      catalogFilterForm.classList.toggle('catalog-filter__form--opened', !filterIsOpened);
      filterShowBtn.classList.toggle('catalog-filter__button--show-filter-opened', !filterIsOpened);
    }

    filterShowBtn.addEventListener('click', evt => {
      evt.preventDefault();
      filterHandler()
    });

    filterCloseBtn.addEventListener('click', evt => {
      evt.preventDefault();
      filterHandler()
    });
  }
}

//Очистка формы подписки в футере при сабмите
if (document.querySelector('.footer__sign-up')) {
  const footerForm = document.querySelector('.footer__sign-up-form');
  clearForm(footerForm);
}
