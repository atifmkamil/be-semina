## API Specification

| Name                   | Routes                               | HTTP     | Deskripsi                     | Middleware Auth |
| ---------------------- | ------------------------------------ | -------- | ----------------------------- | --------------- |
| **CMS**                |                                      |          |                               |                 |
| **Categories**         |                                      |          |                               |                 |
|                        | `/api/v1/cms/categories`             | `GET`    | Get all categories            | Ya              |
|                        | `/api/v1/cms/categories`             | `POST`   | Create categories             | Ya              |
|                        | `/api/v1/cms/categories/:id`         | `GET`    | Get one category by ID        | Ya              |
|                        | `/api/v1/cms/categories/:id`         | `PUT`    | Update category               | Ya              |
|                        | `/api/v1/cms/categories/:id`         | `DELETE` | Delete category               | Ya              |
| **Talents**            |                                      |          |                               |                 |
|                        | `/api/v1/cms/talents`                | `GET`    | Get all talents               | Ya              |
|                        | `/api/v1/cms/talents`                | `POST`   | Create talents                | Ya              |
|                        | `/api/v1/cms/talents/:id`            | `GET`    | Get one talent by ID          | Ya              |
|                        | `/api/v1/cms/talents/:id`            | `PUT`    | Update talent                 | Ya              |
|                        | `/api/v1/cms/talents/:id`            | `DELETE` | Delete talent                 | Ya              |
| **Images**             |                                      |          |                               |                 |
|                        | `/api/v1/cms/images`                 | `POST`   | Create images                 | Ya              |
| **Events**             |                                      |          |                               |                 |
|                        | `/api/v1/cms/events`                 | `GET`    | Get all events                | Ya              |
|                        | `/api/v1/cms/events`                 | `POST`   | Create events                 | Ya              |
|                        | `/api/v1/cms/events/:id`             | `GET`    | Get one event by ID           | Ya              |
|                        | `/api/v1/cms/events/:id`             | `PUT`    | Update event                  | Ya              |
|                        | `/api/v1/cms/events/:id`             | `DELETE` | Delete event                  | Ya              |
|                        | `/api/v1/cms/events/:id/status`      | `PUT`    | Update event status           | Ya              |
| **Payments**           |                                      |          |                               |                 |
|                        | `/api/v1/cms/payments`               | `GET`    | Get all payments              | Ya              |
|                        | `/api/v1/cms/payments`               | `POST`   | Create payments               | Ya              |
|                        | `/api/v1/cms/payments/:id`           | `GET`    | Get one payment by ID         | Ya              |
|                        | `/api/v1/cms/payments/:id`           | `PUT`    | Update payment                | Ya              |
|                        | `/api/v1/cms/payments/:id`           | `DELETE` | Delete payment                | Ya              |
| **Tickets Categories** |                                      |          |                               |                 |
|                        | `/api/v1/cms/tickets-categories`     | `GET`    | Get all ticket categories     | Ya              |
|                        | `/api/v1/cms/tickets-categories`     | `POST`   | Create ticket categories      | Ya              |
|                        | `/api/v1/cms/tickets-categories/:id` | `GET`    | Get one ticket category by ID | Ya              |
|                        | `/api/v1/cms/tickets-categories/:id` | `PUT`    | Update ticket category        | Ya              |
|                        | `/api/v1/cms/tickets-categories/:id` | `DELETE` | Delete ticket category        | Ya              |
| **Order**              |                                      |          |                               |                 |
|                        | `/api/v1/orders`                     | `GET`    | Get all orders                | Ya              |
|                        | `/api/v1/orders/:id`                 | `GET`    | Get one order by ID           | Ya              |
| **Auth**               |                                      |          |                               |                 |
|                        | `/api/v1/auth/signin`                | `POST`   | Sign in                       | Tidak           |
|                        | `/api/v1/cms/organizers`             | `POST`   | Create admin / organizer      | Ya              |
| **Landing Page**       |                                      |          |                               |                 |
| **Participants**       |                                      |          |                               |                 |
|                        | `/api/v1/events`                     | `GET`    | Get all events                | Tidak           |
|                        | `/api/v1/events/:id`                 | `GET`    | Get event details by ID       | Tidak           |
|                        | `/api/v1/events/:id/checkout`        | `POST`   | Checkout event                | Ya              |
|                        | `/api/v1/dashboard`                  | `GET`    | Get dashboard                 | Ya              |
|                        | `/api/v1/dashboard/:id`              | `GET`    | Get dashboard details by ID   | Ya              |
|                        | `/api/v1/participants/auth/signin`   | `POST`   | Sign in                       | Tidak           |
|                        | `/api/v1/participants/auth/signup`   | `POST`   | Sign up                       | Tidak           |

## Link API

- [x] https://documenter.getpostman.com/view/21258031/2sBYAysogy
