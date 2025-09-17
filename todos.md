### TODOs
| Filename | line # | TODO |
|:------|:------:|:------|
| [src/main.ts](src/main.ts#L13) | 13 | разобратсья как правильно настроить/подключать микросервисы |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L1) | 1 | убрать JwtPayload - вместо него юзать нужный дто, JwtPayload тольо в оркестраторе. Все запросы через микросервис gateway |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L2) | 2 | удалить коммиты |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L71) | 71 | статус может тут выкидывать, а вот специализация должна быть отдельно, так же пароль для роли user нужно тоже чтобы возращался в своем месте (мб отдельный ендпоинт) |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L332) | 332 | добавить обновление имени/email и тд |
| [src/modules/user/dto/authUser.dto.ts](src/modules/user/dto/authUser.dto.ts#L13) | 13 | вынести в оркестратор на едпоинт регистрации/логина |
| [src/modules/user/dto/createUser.dto.ts](src/modules/user/dto/createUser.dto.ts#L29) | 29 | мб потом надо |
| [src/modules/user/dto/createUser.dto.ts](src/modules/user/dto/createUser.dto.ts#L38) | 38 | вынести в оркестратор на едпоинт регистрации |
| [src/modules/user/dto/resetPassword.dto.ts](src/modules/user/dto/resetPassword.dto.ts#L1) | 1 | данный ДТО должен быть в оркестраторе и в микросервисе auth |
| [src/modules/user/dto/userListItem.dto.ts](src/modules/user/dto/userListItem.dto.ts#L1) | 1 | удалить password из dto и юзать только в сервисе auth |

### FIXMEs
| Filename | line # | FIXME |
|:------|:------:|:------|
| [src/modules/user/user.controller.ts](src/modules/user/user.controller.ts#L34) | 34 | добавить пагинацию и исправить getAllUsers |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L60) | 60 | исправить костыль - id в JwtPayload на number (библиотека @fra1m-dev) |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L90) | 90 | исправить удаление пользователя - сейчас удаляется только из этой БД, а в других микросервисах остаются данные |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L93) | 93 | удалить лишние связи, при удалении пользователя в других микросервиса тоже удалять связанные данные (курсы, попытки и тд) |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L141) | 141 | все что связано со статистикой юзера перенести в отдельный микросервис по статистике |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L175) | 175 | оставить только нужную логику для этого микросервиса, пароль храниться в микросервисе auth |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L186) | 186 | добавить в микросервис статистики юзера "пустую статискику" при регистрации пользователя |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L190) | 190 | (РЕГИСТРАЦИЯ): убрать генерацию токена и хеширование пароля - это в микросервис auth |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L208) | 208 | костыль, правильное решение ниже |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L210) | 210 | (АВТОРИЗАЦИЯ): убрать генерацию токена и проверку пароля - это в микросервис auth |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L219) | 219 | удалить логику выхода - это в микросервисе auth |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L226) | 226 | удалить логику обновления токена - это в микросервисе auth |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L260) | 260 | удалить логику смены пароля - это в микросервисе auth |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L317) | 317 | исправить костыль - id в JwtPayload на number (библиотека @fra1m-dev) |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L357) | 357 | удалить логику смены пароля - это в микросервисе auth |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L385) | 385 | удалить специализацию - это в микросервисе специализаций |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L405) | 405 | удалить нотификации - это в микросервисе веб сокета (нотификаций) |
| [src/modules/user/user.service.ts](src/modules/user/user.service.ts#L412) | 412 | удалить статистику юзера - это в отдельном микросервисе статистики |
