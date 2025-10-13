# 3APIS - FOOD EXPRESS 
# Installation 
```
npm install
```
Api disponible par défault sur http://localhost:3000 
# Script
Pour lancer en DEV (avec Nodemon)
```
npm run dev
```
#Pour lancer officiellement 
```
npm start
```
# Instructions Postman
(importer le foodexpress.postman_collections.json)<br>
Explications des Endpoints
## Users
| Méthode  | Route             | Accès                | Description                                                                |
| -------- | ----------------- | -------------------- | -------------------------------------------------------------------------- |
| `GET`    | `/users`          | Admin                | Récupère **tous les utilisateurs**                                         |
| `GET`    | `/users/me`       | Utilisateur connecté | Affiche **le profil** du compte actuel                                     |
| `POST`   | `/users/register` | Public               | Crée un **nouvel utilisateur** (`{ name, email, password }`)               |
| `POST`   | `/users/login`    | Public               | Connecte un utilisateur et renvoie un **token JWT**                        |
| `PUT`    | `/users/me`       | Utilisateur connecté | Modifie les infos de **son propre compte** et renvoie un **nouveau token** |
| `PUT`    | `/users/:id`      | Admin                | Modifie un utilisateur spécifique                                          |
| `DELETE` | `/users/me`       | Utilisateur connecté | Supprime **son propre compte**                                             |
| `DELETE` | `/users/:id`      | Admin                | Supprime un **utilisateur spécifique**                                     |
| `DELETE` | `/users`          | Admin                | Supprime **tous les utilisateurs**                                         |

Exemple de connection <br>
`POST /users/login`<br>
```
{
  "email": "admin@admin.com",
  "password": "password"
}
```

## Restaurants
| Méthode  | Route                 | Accès  | Description                                                          |
| -------- | --------------------- | ------ | -------------------------------------------------------------------- |
| `GET`    | `/restaurants`        | Public | Liste **tous les restaurants** avec **pagination et tri** facultatif |
| `GET`    | `/restaurants/all`    | Admin  | Liste **tous les restaurants** sans limite                           |
| `GET`    | `/restaurants/:id`    | Admin  | Affiche un **restaurant spécifique**                                 |
| `POST`   | `/restaurants/create` | Admin  | Crée un **restaurant** (`{ name, address, phone, opening_hours }`)   |
| `PUT`    | `/restaurants/:id`    | Admin  | Met à jour un **restaurant**                                         |
| `DELETE` | `/restaurants/:id`    | Admin  | Supprime un **restaurant spécifique**                                |
| `DELETE` | `/restaurants`        | Admin  | Supprime **tous les restaurants**                                    |

Exemple de de tri et pagination <br>
`GET /restaurants?sort=name&limit=5&offset=10`<br>
- **sort** : tri possible par **name** ou **address**
- **limit** : nombre de résultats par page (défaut = 10)
- **offset** : décalage des résultats (pour paginer)

Réponse
```
{
  "total": 25,
  "limit": 5,
  "offset": 10,
  "data": [
    { "id": 5, "name": "Supinfo Glouton", "address": "rue Daniel Mayer", "phone": "+33 3 33 33 33 33", "opening_hours": "19:00-22:00" }
  ]
}
```
## Menus
| Méthode  | Route                              | Accès  | Description                                                                |
| -------- | ---------------------------------- | ------ | -------------------------------------------------------------------------- |
| `GET`    | `/menus`                           | Public | Liste **tous les menus** avec **pagination et tri**                        |
| `GET`    | `/menus/all`                       | Admin  | Récupère **tous les menus** sans limite                                    |
| `GET`    | `/menus/:id`                       | Admin  | Récupère un **menu spécifique**                                            |
| `GET`    | `/menus/restaurant/:restaurant_id` | Public | Récupère **tous les menus d’un restaurant** donné                          |
| `POST`   | `/menus/create`                    | Admin  | Crée un **menu** (`{ restaurant_id, name, description, price, category }`) |
| `PUT`    | `/menus/:id`                       | Admin  | Modifie un **menu existant**                                               |
| `DELETE` | `/menus/:id`                       | Admin  | Supprime un **menu spécifique**                                            |
| `DELETE` | `/menus`                           | Admin  | Supprime **tous les menus**                                                |

Exemple de de tri et pagination <br>
`GET /menus?sort=name&limit=10&offset=0`<br>
- **sort** : tri possible par **name** ou **price**
- **limit** : nombre de résultats par page (défaut = 10)
- **offset** : décalage des résultats (pour paginer)

Réponse
```
{
  "total": 45,
  "limit": 10,
  "offset": 0,
  "data": [
    { "id": 1, "restaurant_id": 3, "name": "Lasagnes Bolognaise", "price": 12.5, "category": "Plat" }
  ]
}
```
> [!CAUTION]
> Nous avons mis un fichier `.env` dans notre GitHub pour le bon déroulé de ce projet, en situation réelle ça ne serait pas le cas.
