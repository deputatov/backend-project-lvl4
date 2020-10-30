module.exports = {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удалён',
        },
        update: {
          error: 'Не удалось изменить пользователя',
          success: 'Пользователь успешно изменён',
        },
        authorizationError: 'Доступ запрещён! Пожалуйста, авторизируйтесь',
        accessError: 'Вы не можете редактировать или удалять другого пользователя',
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удалён',
        },
        update: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменён',
        },
      },
      labels: {
        create: {
          error: 'Не удалось создать метку',
          success: 'Метка успешно создана',
        },
        delete: {
          error: 'Не удалось удалить метку',
          success: 'Метка успешно удалена',
        },
        update: {
          error: 'Не удалось изменить метку',
          success: 'Метка успешно изменена',
        },
      },
      tasks: {
        accessError: 'Удалять задачи может только создатель',
      },
    },
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
        labels: 'Метки',
        tasks: 'Задачи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        email: 'Email',
        password: 'Пароль',
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        firstName: 'Имя',
        lastName: 'Фимилия',
        fullName: 'Полное имя',
        email: 'Email',
        password: 'Пароль',
        createdAt: 'Дата создания',
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
        update: {
          submit: 'Изменить',
          title: 'Изменение пользователя',
        },
        delete: {
          submit: 'Удалить',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        new: {
          submit: 'Сохранить',
          title: 'Создание статуса',
          create: 'Создать статус',
        },
        update: {
          submit: 'Изменить',
          title: 'Изменение статуса',
        },
        delete: {
          submit: 'Удалить',
        },
      },
      labels: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        new: {
          submit: 'Сохранить',
          title: 'Создание метки',
          create: 'Создать метку',
        },
        update: {
          submit: 'Изменить',
          title: 'Изменение метки',
        },
        delete: {
          submit: 'Удалить',
        },
      },
      tasks: {
        id: 'ID',
        name: 'Наименование',
        description: 'Описание',
        status: 'Статус',
        creator: 'Автор',
        executor: 'Исполнитель',
        label: 'Метка',
        labels: 'Метки',
        myTasks: 'Только мои задачи',
        createdAt: 'Дата создания',
        new: {
          submit: 'Создать',
          title: 'Создание задачи',
          create: 'Создать задачу',
        },
        update: {
          submit: 'Изменить',
          title: 'Изменение задачи',
        },
        delete: {
          submit: 'Удалить',
        },
        filter: {
          submit: 'Показать',
        },
      },
      welcome: {
        index: {
          hello: 'Проект "Менеджер задач!"',
          description: 'Простой Task Manager, системa управления задачами',
          more: 'Подробнее',
        },
      },
    },
  },
};
